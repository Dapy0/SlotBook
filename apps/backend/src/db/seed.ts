import "dotenv/config";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import bcrypt from "bcrypt";
import { fromZonedTime } from "date-fns-tz";

import { users } from "./schema/user.ts";
import { facilities } from "./schema/facility.ts";
import { facilitySchedules } from "./schema/facilitySchedule.ts";
import { services } from "./schema/service.ts";
import { staffMembers } from "./schema/staffMember.ts";
import { staffServices } from "./schema/staffService.ts";
import { staffSchedules } from "./schema/staffSchedule.ts";
import { bookings } from "./schema/booking.ts";
import { reviews } from "./schema/reviews.ts";
import { addDaysToIso, getIsoWeekDay, todayInTimeZone } from "../lib/utils.ts";
import type { FacilityCategory, Weekday } from "@slotbook/shared";
import {
  COUNTRIES,
  FACILITY_SEEDS,
  type CountryCode,
  type FacilitySeed,
} from "./seed-data/facilities.ts";
import {
  KIND_CATEGORY,
  KIND_HOURS,
  MON_FRI,
  MON_SAT,
  ALL_WEEK,
  SERVICE_TEMPLATES,
  type HoursBlock,
  type ServiceTemplate,
} from "./seed-data/kinds.ts";
import { REVIEW_COUNTS, REVIEW_POOL, REVIEWERS } from "./seed-data/reviews.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── типы ─────────────────────────────────────────────────────────────

type ScheduleRow = { dayOfTheWeek: Weekday; startTime: string; endTime: string };
type StaffPattern = "full" | "split" | "none";
type Interval = { start: Date; end: Date };
type BookingStatus = "pending" | "confirmed" | "canceled";

type UserRow = typeof users.$inferInsert & { id: string };
type FacilityRow = typeof facilities.$inferInsert & { id: string; category: FacilityCategory };
type ServiceRow = typeof services.$inferInsert & { id: string };
type StaffMemberRow = typeof staffMembers.$inferInsert & { id: string };
type BookingRow = typeof bookings.$inferInsert & { id: string };
type ReviewRow = typeof reviews.$inferInsert;

// ─── id ───────────────────────────────────────────────────────────────

// Детерминированные uuid v4-формата: при повторном запуске onConflictDoNothing ничего не дублирует
const KIND = { USER: 1, SERVICE: 2, STAFF_MEMBER: 3, BOOKING: 4, REVIEW: 5, FACILITY: 6 } as const;

function seedId(kind: number, index: number): string {
  const k = kind.toString(16).padStart(4, "0");
  const i = index.toString(16).padStart(12, "0");
  return `0000${k}-0000-4000-a000-${i}`;
}

// ─── пользователи ─────────────────────────────────────────────────────

const PASSWORD = "password123";

const OWNER_ID = seedId(KIND.USER, 1);
const OWNER2_ID = seedId(KIND.USER, 2);
const CLIENT_ID = seedId(KIND.USER, 3);
const CLIENT2_ID = seedId(KIND.USER, 4);

const BASE_USERS: Array<Omit<UserRow, "passwordHash">> = [
  { id: OWNER_ID, name: "Olena Owner", email: "owner@slotbook.test", timezone: "Europe/Warsaw" },
  {
    id: OWNER2_ID,
    name: "Oscar Owner",
    email: "owner2@slotbook.test",
    timezone: "America/New_York",
  },
  { id: CLIENT_ID, name: "Clara Client", email: "client@slotbook.test", timezone: "Europe/Warsaw" },
  {
    id: CLIENT2_ID,
    name: "Colin Client",
    email: "client2@slotbook.test",
    timezone: "Europe/London",
  },
];

const COUNTRY_CODES = Object.keys(COUNTRIES) as CountryCode[];

// Новые заведения каждой страны принадлежат своему владельцу, чтобы дашборд Olena не разрастался
const COUNTRY_OWNER_ID = Object.fromEntries(
  COUNTRY_CODES.map((code, i) => [code, seedId(KIND.USER, 10 + i)]),
) as Record<CountryCode, string>;

const COUNTRY_OWNERS: Array<Omit<UserRow, "passwordHash">> = COUNTRY_CODES.map((code) => ({
  id: COUNTRY_OWNER_ID[code],
  name: COUNTRIES[code].owner.name,
  email: COUNTRIES[code].owner.email,
  timezone: COUNTRIES[code].timezone,
}));

const REVIEWER_IDS = REVIEWERS.map((_, i) => seedId(KIND.USER, 30 + i));
const REVIEWER_USERS: Array<Omit<UserRow, "passwordHash">> = REVIEWERS.map((r, i) => ({
  id: REVIEWER_IDS[i],
  ...r,
}));

// ─── заведения ────────────────────────────────────────────────────────

// Телефон из индекса: детерминированно и без совпадений между заведениями
function fakePhone(prefix: string, digits: number, index: number): string {
  const first = 10 ** (digits - 1);
  return `${prefix}${first + ((index * 7_919_993) % (9 * first))}`;
}

function toFacilityRow(seed: FacilitySeed, index: number): FacilityRow {
  const country = COUNTRIES[seed.country];
  const legacy = seed.legacy;
  return {
    id: legacy?.id ?? seedId(KIND.FACILITY, index + 1),
    ownerId: legacy
      ? legacy.owner === "main"
        ? OWNER_ID
        : OWNER2_ID
      : COUNTRY_OWNER_ID[seed.country],
    name: seed.name,
    slug: seed.slug,
    description: seed.description,
    category: KIND_CATEGORY[seed.kind],
    city: seed.city,
    country: seed.country,
    currency: country.currency,
    address: seed.address,
    phone: legacy?.phone ?? fakePhone(country.phonePrefix, country.phoneDigits, index + 1),
    email: legacy?.email ?? `${seed.slug}@slotbook.test`,
    timezone: seed.timezone ?? country.timezone,
    images: [],
    isPublished: seed.isPublished ?? true,
    latitude: seed.latitude,
    longitude: seed.longitude,
  };
}

const FACILITIES: FacilityRow[] = FACILITY_SEEDS.map(toFacilityRow);
const SEED_BY_SLUG = new Map(FACILITY_SEEDS.map((f) => [f.slug, f]));

// ─── картинки (S12) ───────────────────────────────────────────────────

// Готовые превью лежат рядом с seed: seed-data/images/<slug>.webp
const SEED_IMAGES_DIR = path.join(__dirname, "seed-data", "images");

// uuid из slug: при повторном запуске ключ тот же, файл просто перезапишется
function stableUuid(text: string): string {
  const h = createHash("sha1").update(text).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

type SeedImage = { facilityId: string; key: string; source: string };

function collectSeedImages(): SeedImage[] {
  return FACILITIES.flatMap((f) => {
    const source = path.join(SEED_IMAGES_DIR, `${f.slug}.webp`);
    if (!existsSync(source)) return [];
    return [{ facilityId: f.id, key: `facilities/${f.id}/${stableUuid(f.slug)}.webp`, source }];
  });
}

// Тот же корень, что у storage-плагина: apps/backend/<UPLOAD_DIR>
async function copySeedImages(images: SeedImage[]): Promise<void> {
  const uploadDir = process.env.UPLOAD_DIR;
  if (!uploadDir) throw new Error("UPLOAD_DIR is not set");
  const root = path.resolve(__dirname, "../..", uploadDir);
  for (const image of images) {
    const target = path.join(root, image.key);
    await mkdir(path.dirname(target), { recursive: true });
    await copyFile(image.source, target);
  }
}

// ─── часы работы заведений ────────────────────────────────────────────

// Особые часы первых заведений; остальные берут часы своего вида (KIND_HOURS)
const FACILITY_HOURS: Record<string, HoursBlock[]> = {
  "test-barbershop": [
    { days: MON_FRI, startTime: "09:00:00", endTime: "19:00:00" },
    { days: [6], startTime: "10:00:00", endTime: "15:00:00" }, // в субботу короткий день
  ],
  "wawel-nails-studio": [{ days: [2, 3, 4, 5, 6], startTime: "10:00:00", endTime: "18:00:00" }],
  "vltava-dental-clinic": [
    // две строки на день = обед 12–13 на уровне заведения
    { days: MON_FRI, startTime: "08:00:00", endTime: "12:00:00" },
    { days: MON_FRI, startTime: "13:00:00", endTime: "17:00:00" },
  ],
  "camden-strength-gym": [{ days: ALL_WEEK, startTime: "06:00:00", endTime: "22:00:00" }],
  "podil-language-lab": [{ days: MON_FRI, startTime: "09:00:00", endTime: "20:00:00" }],
  "brooklyn-auto-detailing": [{ days: MON_SAT, startTime: "08:00:00", endTime: "18:00:00" }],
  "shibuya-hair-atelier": [
    { days: [2, 3, 4, 5, 6, 7], startTime: "11:00:00", endTime: "20:00:00" },
  ],
  "bandra-yoga-space": [
    { days: MON_SAT, startTime: "07:00:00", endTime: "12:00:00" },
    { days: MON_SAT, startTime: "17:00:00", endTime: "21:00:00" },
  ],
};

// ─── услуги (шаблоны по видам — в seed-data/kinds.ts) ─────────────────

// Неактивная услуга — чтобы проверять, что публичные списки её прячут (S6)
const EXTRA_SERVICES: Record<string, ServiceTemplate[]> = {
  "test-barbershop": [
    {
      name: "Royal shave (archived)",
      description: "No longer offered",
      category: "beard",
      durationMinutes: 45,
      pricePln: 90,
      isActive: false,
    },
  ],
};

// Примерный курс: сколько единиц валюты за 1 PLN
const PLN_RATE: Record<string, number> = {
  PLN: 1,
  CZK: 6,
  UAH: 10,
  EUR: 0.23,
  GBP: 0.2,
  USD: 0.25,
  JPY: 37,
  INR: 21,
};

function fractionDigits(currency: string): number {
  return (
    new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions()
      .maximumFractionDigits ?? 2
  );
}

// 80 PLN → EUR: 18.4 → 18 → 1800;  JPY: 2960 → 3000 → 3000 (у иены нет «центов»)
function toMinor(pricePln: number, currency: string): number {
  const rate = PLN_RATE[currency];
  if (rate === undefined) throw new Error(`No PLN rate for ${currency}`);
  const major = pricePln * rate;
  const step = major >= 1000 ? 100 : major >= 100 ? 10 : major >= 20 ? 5 : 1;
  const nice = Math.max(step, Math.round(major / step) * step);
  return nice * 10 ** fractionDigits(currency);
}

// ─── мастера ──────────────────────────────────────────────────────────

type StaffSeed = { name: string; email?: string; pattern: StaffPattern };

const STAFF: Record<string, StaffSeed[]> = {
  "test-barbershop": [
    { name: "Marek Nowak", email: "staff1@slotbook.test", pattern: "full" },
    { name: "Piotr Zielinski", email: "staff2@slotbook.test", pattern: "split" },
    { name: "Kacper Lis", email: "staff3@slotbook.test", pattern: "none" }, // без расписания → 0 слотов
  ],
  "wawel-nails-studio": [
    { name: "Anna Kowalska", pattern: "full" },
    { name: "Julia Wojcik", pattern: "split" },
  ],
  "vltava-dental-clinic": [
    { name: "Tomas Novak", pattern: "full" },
    { name: "Petra Svobodova", pattern: "split" },
  ],
  "camden-strength-gym": [
    { name: "James Carter", pattern: "full" },
    { name: "Olivia Bennett", pattern: "split" },
  ],
  "podil-language-lab": [
    { name: "Oksana Tkachenko", pattern: "full" },
    { name: "Dmytro Bondar", pattern: "split" },
  ],
  "brooklyn-auto-detailing": [
    { name: "Mike Rodriguez", pattern: "full" },
    { name: "Chris Walker", pattern: "split" },
  ],
  "shibuya-hair-atelier": [
    { name: "Yuki Tanaka", pattern: "full" },
    { name: "Haruto Sato", pattern: "split" },
  ],
  "bandra-yoga-space": [
    { name: "Priya Sharma", pattern: "full" },
    { name: "Arjun Mehta", pattern: "split" },
  ],
};

// Новым заведениям — два мастера из списка имён их страны: один на полный день, второй «split»
function staffFor(seed: FacilitySeed, usedNames: Map<CountryCode, number>): StaffSeed[] {
  const fixed = STAFF[seed.slug];
  if (fixed) return fixed;
  const names = COUNTRIES[seed.country].staffNames;
  const used = usedNames.get(seed.country) ?? 0;
  usedNames.set(seed.country, used + 2);
  return [
    { name: names[used % names.length], pattern: "full" },
    { name: names[(used + 1) % names.length], pattern: "split" },
  ];
}

// ─── время ────────────────────────────────────────────────────────────

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function toTime(minutes: number): string {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}:00`;
}

function expandHours(blocks: HoursBlock[]): ScheduleRow[] {
  return blocks.flatMap((b) =>
    b.days.map((day) => ({ dayOfTheWeek: day, startTime: b.startTime, endTime: b.endTime })),
  );
}

// Расписание мастера всегда строится ИЗ строк заведения, поэтому гарантированно в них помещается
function buildStaffRows(facilityRows: ScheduleRow[], pattern: StaffPattern): ScheduleRow[] {
  if (pattern === "none") return [];
  if (pattern === "full") return facilityRows.map((r) => ({ ...r }));

  // split: первый рабочий день недели — выходной; приходит на час позже; длинные смены — с обедом 1 ч
  const dayOff = Math.min(...facilityRows.map((r) => r.dayOfTheWeek));
  return facilityRows
    .filter((r) => r.dayOfTheWeek !== dayOff)
    .flatMap((r): ScheduleRow[] => {
      const start = toMinutes(r.startTime) + 60;
      const end = toMinutes(r.endTime);
      if (end - start >= 6 * 60) {
        const lunch = start + Math.round((end - start - 60) / 2 / 30) * 30;
        return [
          { dayOfTheWeek: r.dayOfTheWeek, startTime: toTime(start), endTime: toTime(lunch) },
          { dayOfTheWeek: r.dayOfTheWeek, startTime: toTime(lunch + 60), endTime: toTime(end) },
        ];
      }
      if (end - start >= 60) {
        return [{ dayOfTheWeek: r.dayOfTheWeek, startTime: toTime(start), endTime: toTime(end) }];
      }
      return [];
    });
}

function longestShiftMinutes(rows: ScheduleRow[]): number {
  return Math.max(0, ...rows.map((r) => toMinutes(r.endTime) - toMinutes(r.startTime)));
}

// ─── брони ────────────────────────────────────────────────────────────

type BookingPlan = {
  dayOffset: number; // относительно «сегодня» в зоне заведения
  status: BookingStatus;
  clientId: string;
  review?: { rating: number; comment: string | null };
};

const BOOKING_PLAN: BookingPlan[] = [
  {
    dayOffset: -14,
    status: "confirmed",
    clientId: CLIENT_ID,
    review: { rating: 5, comment: "Great service, will come back!" },
  },
  {
    dayOffset: -7,
    status: "confirmed",
    clientId: CLIENT2_ID,
    review: { rating: 4, comment: null },
  },
  { dayOffset: -3, status: "confirmed", clientId: CLIENT_ID }, // прошла, отзыва ещё нет → можно оставить (S12)
  { dayOffset: -2, status: "canceled", clientId: CLIENT_ID },
  { dayOffset: 1, status: "pending", clientId: CLIENT_ID },
  { dayOffset: 2, status: "confirmed", clientId: CLIENT_ID },
  { dayOffset: 3, status: "pending", clientId: CLIENT2_ID },
  { dayOffset: 4, status: "canceled", clientId: CLIENT2_ID },
];

const BOOKED_FACILITIES = ["test-barbershop", "shibuya-hair-atelier", "vltava-dental-clinic"];

// Остальным опубликованным заведениям — только прошедшие брони с отзывами, чтобы у карточек был рейтинг
function reviewPlan(facilityIndex: number): BookingPlan[] {
  const count = REVIEW_COUNTS[facilityIndex % REVIEW_COUNTS.length];
  return Array.from({ length: count }, (_, j) => ({
    dayOffset: -4 - 3 * j,
    status: "confirmed",
    clientId: REVIEWER_IDS[(facilityIndex + j) % REVIEWER_IDS.length],
    review: REVIEW_POOL[(facilityIndex * 3 + j) % REVIEW_POOL.length],
  }));
}

// Ближайшая к today+offset дата (в сторону от сегодня), в которую мастер работает
function findWorkingDate(timeZone: string, offset: number, rows: ScheduleRow[]): string | null {
  const today = todayInTimeZone(timeZone);
  const direction = offset < 0 ? -1 : 1;
  for (let k = 0; k < 7; k++) {
    const date = addDaysToIso(today, offset + direction * k);
    if (rows.some((r) => r.dayOfTheWeek === getIsoWeekDay(date))) return date;
  }
  return null;
}

// Первый свободный старт на сетке 30 мин внутри смены мастера
function pickInterval(
  date: string,
  timeZone: string,
  rows: ScheduleRow[],
  durationMinutes: number,
  taken: Interval[],
): Interval | null {
  const weekday = getIsoWeekDay(date);
  for (const row of rows.filter((r) => r.dayOfTheWeek === weekday)) {
    const rowEnd = toMinutes(row.endTime);
    for (let m = toMinutes(row.startTime); m + durationMinutes <= rowEnd; m += 30) {
      const start = fromZonedTime(`${date}T${toTime(m)}`, timeZone);
      const end = new Date(start.getTime() + durationMinutes * 60_000);
      if (!taken.some((t) => start < t.end && t.start < end)) return { start, end };
    }
  }
  return null;
}

// ─── сборка всех строк ────────────────────────────────────────────────

type StaffContext = { id: string; rows: ScheduleRow[]; serviceIds: string[] };

function buildSeedData() {
  const userRows: Array<Omit<UserRow, "passwordHash">> = [
    ...BASE_USERS,
    ...COUNTRY_OWNERS,
    ...REVIEWER_USERS,
  ];
  const facilityScheduleRows: Array<typeof facilitySchedules.$inferInsert> = [];
  const serviceRows: ServiceRow[] = [];
  const staffMemberRows: StaffMemberRow[] = [];
  const staffServiceRows: Array<typeof staffServices.$inferInsert> = [];
  const staffScheduleRows: Array<typeof staffSchedules.$inferInsert> = [];
  const bookingRows: BookingRow[] = [];
  const reviewRows: ReviewRow[] = [];

  const staffBySlug = new Map<string, StaffContext[]>();
  const servicesById = new Map<string, ServiceRow>();

  let serviceIndex = 0;
  let staffIndex = 0;
  const usedStaffNames = new Map<CountryCode, number>();

  for (const facility of FACILITIES) {
    const seed = SEED_BY_SLUG.get(facility.slug)!;

    // часы заведения
    const facilityRows = expandHours(FACILITY_HOURS[facility.slug] ?? KIND_HOURS[seed.kind]);
    for (const row of facilityRows) facilityScheduleRows.push({ facilityId: facility.id, ...row });

    // услуги
    const templates = [...SERVICE_TEMPLATES[seed.kind], ...(EXTRA_SERVICES[facility.slug] ?? [])];
    const facilityServices = templates.map((t): ServiceRow => ({
      id: seedId(KIND.SERVICE, ++serviceIndex),
      facilityId: facility.id,
      name: t.name,
      description: t.description,
      category: t.category,
      durationMinutes: t.durationMinutes,
      priceCents: toMinor(t.pricePln, facility.currency!),
      isActive: t.isActive ?? true,
    }));
    for (const s of facilityServices) {
      serviceRows.push(s);
      servicesById.set(s.id, s);
    }
    const activeServices = facilityServices.filter((s) => s.isActive);

    // мастера
    const staffContexts: StaffContext[] = [];
    staffFor(seed, usedStaffNames).forEach((person, position) => {
      staffIndex++;
      const userId = seedId(KIND.USER, 100 + staffIndex);
      const staffMemberId = seedId(KIND.STAFF_MEMBER, staffIndex);

      userRows.push({
        id: userId,
        name: person.name,
        email: person.email ?? `${facility.slug}-staff-${position + 1}@slotbook.test`,
        timezone: facility.timezone!,
      });
      staffMemberRows.push({ id: staffMemberId, userId, facilityId: facility.id, isActive: true });

      const rows = buildStaffRows(facilityRows, person.pattern);
      for (const row of rows) staffScheduleRows.push({ staffMemberId, ...row });

      // первый мастер делает всё; остальные — каждую вторую услугу, которая влезает в их самую длинную смену
      const longest = person.pattern === "none" ? Infinity : longestShiftMinutes(rows);
      const assigned =
        position === 0
          ? activeServices
          : activeServices.filter((s, i) => i % 2 === 0 && s.durationMinutes <= longest);
      for (const s of assigned) staffServiceRows.push({ staffMemberId, serviceId: s.id });

      staffContexts.push({ id: staffMemberId, rows, serviceIds: assigned.map((s) => s.id) });
    });
    staffBySlug.set(facility.slug, staffContexts);
  }

  // брони
  const takenByStaff = new Map<string, Interval[]>();
  let bookingIndex = 0;

  function addBookings(facility: FacilityRow, plans: BookingPlan[]) {
    const workingStaff = (staffBySlug.get(facility.slug) ?? []).filter(
      (s) => s.rows.length > 0 && s.serviceIds.length > 0,
    );
    if (workingStaff.length === 0) return;

    plans.forEach((plan, i) => {
      const staff = workingStaff[i % workingStaff.length];
      const service = servicesById.get(staff.serviceIds[i % staff.serviceIds.length])!;
      const date = findWorkingDate(facility.timezone!, plan.dayOffset, staff.rows);
      if (!date) return;

      const taken = takenByStaff.get(staff.id) ?? [];
      const range = pickInterval(
        date,
        facility.timezone!,
        staff.rows,
        service.durationMinutes,
        taken,
      );
      if (!range) return;
      taken.push(range);
      takenByStaff.set(staff.id, taken);

      const id = seedId(KIND.BOOKING, ++bookingIndex);
      bookingRows.push({
        id,
        clientId: plan.clientId,
        facilityId: facility.id,
        staffMemberId: staff.id,
        serviceId: service.id,
        timeRange: range,
        status: plan.status,
        cancelableUntil: range.start,
        priceCents: service.priceCents,
        currency: facility.currency!,
      });

      if (plan.review) {
        reviewRows.push({ id: seedId(KIND.REVIEW, bookingIndex), bookingId: id, ...plan.review });
      }
    });
  }

  FACILITIES.forEach((facility, index) => {
    if (BOOKED_FACILITIES.includes(facility.slug)) addBookings(facility, BOOKING_PLAN);
    else if (facility.isPublished) addBookings(facility, reviewPlan(index));
  });

  return {
    userRows,
    facilityScheduleRows,
    serviceRows,
    staffMemberRows,
    staffServiceRows,
    staffScheduleRows,
    bookingRows,
    reviewRows,
  };
}

// ─── запуск ───────────────────────────────────────────────────────────

async function seed() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Seed is for development only");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool });

  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const data = buildSeedData();

  // сначала файлы, потом ключи в БД — чтобы в базе не оказалось ключа без файла
  const images = collectSeedImages();
  await copySeedImages(images);
  const imageKeys = new Map(images.map((img) => [img.facilityId, [img.key]]));
  const facilityRows = FACILITIES.map((f) => ({ ...f, images: imageKeys.get(f.id) ?? [] }));

  try {
    await db.transaction(async (tx) => {
      await tx
        .insert(users)
        .values(data.userRows.map((u) => ({ ...u, passwordHash })))
        .onConflictDoNothing();
      // Повторный запуск дописывает превью только тем, у кого фото ещё нет: загруженные руками не трогаем
      await tx
        .insert(facilities)
        .values(facilityRows)
        .onConflictDoUpdate({
          target: facilities.id,
          set: { images: sql`excluded.images` },
          setWhere: sql`${facilities.images} = '[]'::jsonb`,
        });
      await tx.insert(facilitySchedules).values(data.facilityScheduleRows).onConflictDoNothing();
      await tx.insert(services).values(data.serviceRows).onConflictDoNothing();
      await tx.insert(staffMembers).values(data.staffMemberRows).onConflictDoNothing();
      await tx.insert(staffServices).values(data.staffServiceRows).onConflictDoNothing();
      if (data.staffScheduleRows.length) {
        await tx.insert(staffSchedules).values(data.staffScheduleRows).onConflictDoNothing();
      }
      if (data.bookingRows.length) {
        await tx.insert(bookings).values(data.bookingRows).onConflictDoNothing();
      }
      if (data.reviewRows.length) {
        await tx.insert(reviews).values(data.reviewRows).onConflictDoNothing();
      }

      // рейтинг и число отзывов считаем из реальных отзывов, а не пишем руками
      await tx.execute(sql`
        UPDATE facilities f
        SET score = s.avg_rating, reviews_count = s.cnt
        FROM (
          SELECT b.facility_id, round(avg(r.rating)::numeric, 1) AS avg_rating, count(*)::int AS cnt
          FROM reviews r
          JOIN bookings b ON b.id = r.booking_id
          GROUP BY b.facility_id
        ) s
        WHERE f.id = s.facility_id
      `);
    });
  } finally {
    await pool.end();
  }

  // eslint-disable-next-line no-console
  console.log(
    `Seeded: ${data.userRows.length} users, ${FACILITIES.length} facilities, ` +
      `${data.serviceRows.length} services, ${data.staffMemberRows.length} staff, ` +
      `${data.staffScheduleRows.length} staff schedule rows, ${data.bookingRows.length} bookings, ` +
      `${data.reviewRows.length} reviews, ${images.length} images`,
  );
  // eslint-disable-next-line no-console
  console.table([
    { role: "owner", email: "owner@slotbook.test" },
    { role: "owner (Brooklyn)", email: "owner2@slotbook.test" },
    ...COUNTRY_OWNERS.map((o) => ({
      role: `owner (${o.email.slice(6, 8).toUpperCase()})`,
      email: o.email,
    })),
    { role: "client", email: "client@slotbook.test" },
    { role: "client", email: "client2@slotbook.test" },
    { role: "staff (full)", email: "staff1@slotbook.test" },
    { role: "staff (split)", email: "staff2@slotbook.test" },
    { role: "staff (no schedule)", email: "staff3@slotbook.test" },
  ]);
  // eslint-disable-next-line no-console
  console.log(`Password for all: ${PASSWORD}`);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
