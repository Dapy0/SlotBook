import "dotenv/config";
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

// ─── типы ─────────────────────────────────────────────────────────────

type ScheduleRow = { dayOfTheWeek: Weekday; startTime: string; endTime: string };
type HoursBlock = { days: Weekday[]; startTime: string; endTime: string };
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
const KIND = { USER: 1, SERVICE: 2, STAFF_MEMBER: 3, BOOKING: 4, REVIEW: 5 } as const;

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

// ─── заведения ────────────────────────────────────────────────────────

const FACILITIES: FacilityRow[] = [
  {
    id: "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa",
    ownerId: OWNER_ID,
    name: "Test Barbershop",
    slug: "test-barbershop",
    description: "A test barbershop for SlotBook",
    category: "BEAUTY",
    city: "Warsaw",
    country: "PL",
    currency: "PLN",
    address: "Test street 1",
    phone: "+48000000000",
    email: "shop@test.com",
    timezone: "Europe/Warsaw",
    images: [],
    isPublished: true,
    latitude: 52.2297,
    longitude: 21.0122,
  },
  {
    id: "bbbbbbbb-bbbb-4bbb-abbb-bbbbbbbbbbbb",
    ownerId: OWNER_ID,
    name: "Wawel Nails Studio",
    slug: "wawel-nails-studio",
    description: "Manicure, pedicure and nail art in the Old Town",
    category: "BEAUTY",
    city: "Krakow",
    country: "PL",
    currency: "PLN",
    address: "Grodzka 12",
    phone: "+48111222333",
    email: "hello@wawelnails.pl",
    timezone: "Europe/Warsaw",
    images: [],
    isPublished: true,
    latitude: 50.0568,
    longitude: 19.9376,
  },
  {
    id: "cccccccc-cccc-4ccc-accc-cccccccccccc",
    ownerId: OWNER_ID,
    name: "Vltava Dental Clinic",
    slug: "vltava-dental-clinic",
    description: "Dentistry and hygiene appointments near the river",
    category: "MEDICAL",
    city: "Prague",
    country: "CZ",
    currency: "CZK",
    address: "Karlova 8",
    phone: "+420601234567",
    email: "info@vltavadental.cz",
    timezone: "Europe/Prague",
    images: [],
    isPublished: true,
    latitude: 50.0862,
    longitude: 14.4184,
  },
  {
    id: "dddddddd-dddd-4ddd-addd-dddddddddddd",
    ownerId: OWNER_ID,
    name: "Camden Strength Gym",
    slug: "camden-strength-gym",
    description: "Personal training and small group fitness sessions",
    category: "SPORT_FITNESS",
    city: "London",
    country: "GB",
    currency: "GBP",
    address: "Kentish Town Road 44",
    phone: "+442079460000",
    email: "train@camdenstrength.co.uk",
    timezone: "Europe/London",
    images: [],
    isPublished: true,
    latitude: 51.539,
    longitude: -0.1426,
  },
  {
    id: "eeeeeeee-eeee-4eee-aeee-eeeeeeeeeeee",
    ownerId: OWNER_ID,
    name: "Podil Language Lab",
    slug: "podil-language-lab",
    description: "Private English and German lessons, online and offline",
    category: "EDUCATION",
    city: "Kyiv",
    country: "UA",
    currency: "UAH",
    address: "Naberezhno-Khreshchatytska 5",
    phone: "+380441234567",
    email: "study@podillab.ua",
    timezone: "Europe/Kyiv",
    images: [],
    isPublished: true,
    latitude: 50.466,
    longitude: 30.519,
  },
  {
    id: "ffffffff-ffff-4fff-afff-ffffffffffff",
    ownerId: OWNER2_ID, // чужой владелец — для проверок IDOR
    name: "Brooklyn Auto Detailing",
    slug: "brooklyn-auto-detailing",
    description: "Ceramic coating, polishing and interior detailing",
    category: "AUTO",
    city: "New York",
    country: "US",
    currency: "USD",
    address: "Bedford Ave 301",
    phone: "+12125550147",
    email: "book@bkdetailing.com",
    timezone: "America/New_York",
    images: [],
    isPublished: true,
    latitude: 40.7108,
    longitude: -73.963,
  },
  {
    id: "22222222-2222-4222-a222-222222222222",
    ownerId: OWNER_ID,
    name: "Shibuya Hair Atelier",
    slug: "shibuya-hair-atelier",
    description: "Cuts, colour and head spa treatments",
    category: "BEAUTY",
    city: "Tokyo",
    country: "JP",
    currency: "JPY",
    address: "Jinnan 1-14-5",
    phone: "+81355551234",
    email: "yoyaku@shibuyahair.jp",
    timezone: "Asia/Tokyo",
    images: [],
    isPublished: true,
    latitude: 35.6627,
    longitude: 139.6982,
  },
  {
    id: "33333333-3333-4333-a333-333333333333",
    ownerId: OWNER_ID,
    name: "Bandra Yoga Space",
    slug: "bandra-yoga-space",
    description: "Hatha and vinyasa classes, draft listing",
    category: "OTHER",
    city: "Mumbai",
    country: "IN",
    currency: "INR",
    address: "Hill Road 27",
    phone: "+912226001234",
    email: "namaste@bandrayoga.in",
    timezone: "Asia/Kolkata",
    images: [],
    isPublished: false, // черновик — не должен быть виден публично (S10)
    latitude: 19.0544,
    longitude: 72.8402,
  },
];

// ─── часы работы заведений ────────────────────────────────────────────

const MON_FRI: Weekday[] = [1, 2, 3, 4, 5];
const MON_SAT: Weekday[] = [1, 2, 3, 4, 5, 6];
const ALL_WEEK: Weekday[] = [1, 2, 3, 4, 5, 6, 7];

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

// ─── услуги (цены в PLN, конвертируются в валюту заведения) ──────────

type ServiceTemplate = {
  name: string;
  description: string;
  category: string;
  durationMinutes: number;
  pricePln: number;
  isActive?: boolean;
};

const SERVICE_TEMPLATES: Record<FacilityCategory, ServiceTemplate[]> = {
  BEAUTY: [
    {
      name: "Men's haircut",
      description: "Classic cut with styling",
      category: "haircut",
      durationMinutes: 45,
      pricePln: 80,
    },
    {
      name: "Beard trim",
      description: "Shaping and hot towel finish",
      category: "beard",
      durationMinutes: 30,
      pricePln: 50,
    },
    {
      name: "Women's haircut",
      description: "Cut, wash and blow dry",
      category: "haircut",
      durationMinutes: 60,
      pricePln: 120,
    },
    {
      name: "Colouring",
      description: "Full colour with care treatment",
      category: "colour",
      durationMinutes: 120,
      pricePln: 250,
    },
  ],
  SPORT_FITNESS: [
    {
      name: "Personal training",
      description: "One-on-one session with a coach",
      category: "training",
      durationMinutes: 60,
      pricePln: 150,
    },
    {
      name: "Group class",
      description: "Small group functional workout",
      category: "training",
      durationMinutes: 45,
      pricePln: 60,
    },
    {
      name: "Fitness assessment",
      description: "Body composition and plan",
      category: "consultation",
      durationMinutes: 30,
      pricePln: 90,
    },
  ],
  MEDICAL: [
    {
      name: "Consultation",
      description: "Initial specialist consultation",
      category: "consultation",
      durationMinutes: 30,
      pricePln: 200,
    },
    {
      name: "Dental hygiene",
      description: "Scaling, polishing and fluoride",
      category: "hygiene",
      durationMinutes: 45,
      pricePln: 300,
    },
    {
      name: "Annual check-up",
      description: "Full examination with report",
      category: "checkup",
      durationMinutes: 60,
      pricePln: 250,
    },
  ],
  AUTO: [
    {
      name: "Interior detailing",
      description: "Deep clean of the cabin",
      category: "detailing",
      durationMinutes: 180,
      pricePln: 400,
    },
    {
      name: "Paint polishing",
      description: "Single stage machine polish",
      category: "detailing",
      durationMinutes: 240,
      pricePln: 800,
    },
    {
      name: "Ceramic coating",
      description: "Two layer coating with cure",
      category: "coating",
      durationMinutes: 300,
      pricePln: 2000,
    },
  ],
  EDUCATION: [
    {
      name: "Trial lesson",
      description: "Level check and study plan",
      category: "lesson",
      durationMinutes: 30,
      pricePln: 30,
    },
    {
      name: "Individual lesson",
      description: "One-on-one lesson with a tutor",
      category: "lesson",
      durationMinutes: 60,
      pricePln: 100,
    },
    {
      name: "Exam preparation",
      description: "Focused prep with mock test",
      category: "exam",
      durationMinutes: 90,
      pricePln: 150,
    },
  ],
  OTHER: [
    {
      name: "Hatha class",
      description: "Slow paced group practice",
      category: "class",
      durationMinutes: 60,
      pricePln: 50,
    },
    {
      name: "Vinyasa class",
      description: "Dynamic flow for all levels",
      category: "class",
      durationMinutes: 75,
      pricePln: 60,
    },
    {
      name: "Private session",
      description: "Individual practice with a teacher",
      category: "private",
      durationMinutes: 60,
      pricePln: 200,
    },
  ],
};

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
  const userRows: Array<Omit<UserRow, "passwordHash">> = [...BASE_USERS];
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

  for (const facility of FACILITIES) {
    // часы заведения
    const facilityRows = expandHours(
      FACILITY_HOURS[facility.slug] ?? [
        { days: MON_FRI, startTime: "09:00:00", endTime: "18:00:00" },
      ],
    );
    for (const row of facilityRows) facilityScheduleRows.push({ facilityId: facility.id, ...row });

    // услуги
    const templates = [
      ...SERVICE_TEMPLATES[facility.category],
      ...(EXTRA_SERVICES[facility.slug] ?? []),
    ];
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
    (STAFF[facility.slug] ?? []).forEach((person, position) => {
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

  for (const slug of BOOKED_FACILITIES) {
    const facility = FACILITIES.find((f) => f.slug === slug)!;
    const workingStaff = (staffBySlug.get(slug) ?? []).filter(
      (s) => s.rows.length > 0 && s.serviceIds.length > 0,
    );
    if (workingStaff.length === 0) continue;

    BOOKING_PLAN.forEach((plan, i) => {
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
        // после миграции снимка цены (S1):
        priceCents: service.priceCents,
        currency: facility.currency!,
      });

      if (plan.review) {
        reviewRows.push({ id: seedId(KIND.REVIEW, bookingIndex), bookingId: id, ...plan.review });
      }
    });
  }

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

  try {
    await db.transaction(async (tx) => {
      await tx
        .insert(users)
        .values(data.userRows.map((u) => ({ ...u, passwordHash })))
        .onConflictDoNothing();
      await tx.insert(facilities).values(FACILITIES).onConflictDoNothing();
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

  console.log(
    `Seeded: ${data.userRows.length} users, ${FACILITIES.length} facilities, ` +
      `${data.serviceRows.length} services, ${data.staffMemberRows.length} staff, ` +
      `${data.staffScheduleRows.length} staff schedule rows, ${data.bookingRows.length} bookings, ` +
      `${data.reviewRows.length} reviews`,
  );
  console.table([
    { role: "owner", email: "owner@slotbook.test" },
    { role: "owner (Brooklyn)", email: "owner2@slotbook.test" },
    { role: "client", email: "client@slotbook.test" },
    { role: "client", email: "client2@slotbook.test" },
    { role: "staff (full)", email: "staff1@slotbook.test" },
    { role: "staff (split)", email: "staff2@slotbook.test" },
    { role: "staff (no schedule)", email: "staff3@slotbook.test" },
  ]);
  console.log(`Password for all: ${PASSWORD}`);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
