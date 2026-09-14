import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import bcrypt from "bcrypt";

import { users } from "./schema/user.ts";
import { facilities } from "./schema/facility.ts";
import { facilitySchedules, type NewFacilityScheduleEntity } from "./schema/facilitySchedule.ts";
import { services, type NewServiceEntity } from "./schema/service.ts";
import { staffMembers, type StaffMemberEntity } from "./schema/staffMember.ts";
import { staffServices } from "./schema/staffService.ts";
import type { CreateFacilityRequest, FacilityCategory } from "@slotbook/shared/facility";
import type { CreateServiceRequest } from "@slotbook/shared/service";
import type { DayOfTheWeek } from "@slotbook/shared/facilitySchedule";

const OWNER_ID = "11111111-1111-4111-a111-111111111111";
const facilitySeeds: Array<CreateFacilityRequest & { id: string }> = [
  {
    id: "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa",
    name: "Test Barbershop",
    currency: "PLN",
    slug: "test-barbershop",
    description: "A test barbershop for SlotBook",
    category: "BEAUTY",
    city: "Warsaw",
    country: "PL",
    address: "Test street 1",
    phone: "+48000000000",
    email: "shop@test.com",
    timezoneIANA: "Europe/Warsaw",
    images: [],
    isPublished: true,
    latitude: 52.2297,
    longitude: 21.0122,
  },
  {
    id: "bbbbbbbb-bbbb-4bbb-abbb-bbbbbbbbbbbb",
    name: "Wawel Nails Studio",
    currency: "PLN",
    slug: "wawel-nails-studio",
    description: "Manicure, pedicure and nail art in the Old Town",
    category: "BEAUTY",
    city: "Krakow",
    country: "PL",
    address: "Grodzka 12",
    phone: "+48111222333",
    email: "hello@wawelnails.pl",
    timezoneIANA: "Europe/Warsaw",
    images: [],
    isPublished: true,
    latitude: 50.0568,
    longitude: 19.9376,
  },
  {
    id: "cccccccc-cccc-4ccc-accc-cccccccccccc",
    name: "Vltava Dental Clinic",
    currency: "CZK",
    slug: "vltava-dental-clinic",
    description: "Dentistry and hygiene appointments near the river",
    category: "MEDICAL",
    city: "Prague",
    country: "CZ",
    address: "Karlova 8",
    phone: "+420601234567",
    email: "info@vltavadental.cz",
    timezoneIANA: "Europe/Prague",
    images: [],
    isPublished: true,
    latitude: 50.0862,
    longitude: 14.4184,
  },
  {
    id: "dddddddd-dddd-4ddd-addd-dddddddddddd",
    name: "Camden Strength Gym",
    currency: "GBP",
    slug: "camden-strength-gym",
    description: "Personal training and small group fitness sessions",
    category: "SPORT_FITNESS",
    city: "London",
    country: "GB",
    address: "Kentish Town Road 44",
    phone: "+442079460000",
    email: "train@camdenstrength.co.uk",
    timezoneIANA: "Europe/London",
    images: [],
    isPublished: true,
    latitude: 51.539,
    longitude: -0.1426,
  },
  {
    id: "eeeeeeee-eeee-4eee-aeee-eeeeeeeeeeee",
    name: "Podil Language Lab",
    currency: "UAH",
    slug: "podil-language-lab",
    description: "Private English and German lessons, online and offline",
    category: "EDUCATION",
    city: "Kyiv",
    country: "UA",
    address: "Naberezhno-Khreshchatytska 5",
    phone: "+380441234567",
    email: "study@podillab.ua",
    timezoneIANA: "Europe/Kyiv",
    images: [],
    isPublished: true,
    latitude: 50.466,
    longitude: 30.519,
  },
  {
    id: "ffffffff-ffff-4fff-afff-ffffffffffff",
    name: "Brooklyn Auto Detailing",
    currency: "USD",
    slug: "brooklyn-auto-detailing",
    description: "Ceramic coating, polishing and interior detailing",
    category: "AUTO",
    city: "New York",
    country: "US",
    address: "Bedford Ave 301",
    phone: "+12125550147",
    email: "book@bkdetailing.com",
    timezoneIANA: "America/New_York",
    images: [],
    isPublished: true,
    latitude: 40.7108,
    longitude: -73.963,
  },
  {
    id: "22222222-2222-4222-a222-222222222222",
    name: "Shibuya Hair Atelier",
    currency: "JPY",
    slug: "shibuya-hair-atelier",
    description: "Cuts, colour and head spa treatments",
    category: "BEAUTY",
    city: "Tokyo",
    country: "JP",
    address: "Jinnan 1-14-5",
    phone: "+81355551234",
    email: "yoyaku@shibuyahair.jp",
    timezoneIANA: "Asia/Tokyo",
    images: [],
    isPublished: true,
    latitude: 35.6627,
    longitude: 139.6982,
  },
  {
    id: "33333333-3333-4333-a333-333333333333",
    name: "Bandra Yoga Space",
    currency: "INR",
    slug: "bandra-yoga-space",
    description: "Hatha and vinyasa classes, draft listing",
    category: "OTHER",
    city: "Mumbai",
    country: "IN",
    address: "Hill Road 27",
    phone: "+912226001234",
    email: "namaste@bandrayoga.in",
    timezoneIANA: "Asia/Kolkata",
    images: [],
    isPublished: false,
    latitude: 19.0544,
    longitude: 72.8402,
  },
];
function seedId(kind: number, index: number): string {
  const k = kind.toString(16).padStart(4, "0");
  const i = index.toString(16).padStart(12, "0");
  return `0000${k}-0000-4000-a000-${i}`;
}
const KIND = { SERVICE: 1, STAFF_USER: 2, STAFF_MEMBER: 3 } as const;

const SERVICE_TEMPLATES: Record<FacilityCategory, CreateServiceRequest[]> = {
  BEAUTY: [
    {
      name: "Men's haircut",
      description: "Classic cut with styling",
      category: "haircut",
      durationMinutes: 45,
      priceCents: 80,
      isActive: true,
    },
    {
      name: "Beard trim",
      description: "Shaping and hot towel finish",
      category: "beard",
      durationMinutes: 30,
      priceCents: 50,
      isActive: true,
    },
    {
      name: "Women's haircut",
      description: "Cut, wash and blow dry",
      category: "haircut",
      durationMinutes: 60,
      priceCents: 120,
      isActive: true,
    },
    {
      name: "Colouring",
      description: "Full colour with care treatment",
      category: "colour",
      durationMinutes: 120,
      priceCents: 250,
      isActive: true,
    },
  ],
  SPORT_FITNESS: [
    {
      name: "Personal training",
      description: "One-on-one session with a coach",
      category: "training",
      durationMinutes: 60,
      priceCents: 150,
      isActive: true,
    },
    {
      name: "Group class",
      description: "Small group functional workout",
      category: "training",
      durationMinutes: 45,
      priceCents: 60,
      isActive: true,
    },
    {
      name: "Fitness assessment",
      description: "Body composition and plan",
      category: "consultation",
      durationMinutes: 30,
      priceCents: 90,
      isActive: true,
    },
  ],
  MEDICAL: [
    {
      name: "Consultation",
      description: "Initial specialist consultation",
      category: "consultation",
      durationMinutes: 30,
      priceCents: 200,
      isActive: true,
    },
    {
      name: "Dental hygiene",
      description: "Scaling, polishing and fluoride",
      category: "hygiene",
      durationMinutes: 45,
      priceCents: 123,
      isActive: true,
    },
    {
      name: "Annual check-up",
      description: "Full examination with report",
      category: "checkup",
      durationMinutes: 60,
      priceCents: 50,
      isActive: true,
    },
  ],
  AUTO: [
    {
      name: "Interior detailing",
      description: "Deep clean of the cabin",
      category: "detailing",
      durationMinutes: 180,
      priceCents: 555,
      isActive: true,
    },
    {
      name: "Paint polishing",
      description: "Single stage machine polish",
      category: "detailing",
      durationMinutes: 240,
      priceCents: 123,
      isActive: true,
    },
    {
      name: "Ceramic coating",
      description: "Two layer coating with cure",
      category: "coating",
      durationMinutes: 300,
      priceCents: 1234,
      isActive: true,
    },
  ],
  EDUCATION: [
    {
      name: "Trial lesson",
      description: "Level check and study plan",
      category: "lesson",
      durationMinutes: 30,
      priceCents: 50,
      isActive: true,
    },
    {
      name: "Individual lesson",
      description: "One-on-one lesson with a tutor",
      category: "lesson",
      durationMinutes: 60,
      priceCents: 124,
      isActive: true,
    },
    {
      name: "Exam preparation",
      description: "Focused prep with mock test",
      category: "exam",
      durationMinutes: 90,
      priceCents: 546,
      isActive: true,
    },
  ],
  OTHER: [
    {
      name: "Hatha class",
      description: "Slow paced group practice",
      category: "class",
      durationMinutes: 60,
      priceCents: 777,
      isActive: true,
    },
    {
      name: "Vinyasa class",
      description: "Dynamic flow for all levels",
      category: "class",
      durationMinutes: 75,
      priceCents: 222,
      isActive: true,
    },
    {
      name: "Private session",
      description: "Individual practice with a teacher",
      category: "private",
      durationMinutes: 60,
      priceCents: 123,
      isActive: true,
    },
  ],
};

const PRICE_SCALE: Record<string, number> = {
  PLN: 1,
  CZK: 6,
  UAH: 10,
  EUR: 0.23,
  GBP: 0.2,
  USD: 0.25,
  JPY: 37,
  INR: 21,
};

// ─── расписания ───────────────────────────────────────────────────────

const WEEKDAYS = [1, 2, 3, 4, 5] as const;
const DEFAULT_HOURS = { days: WEEKDAYS, startTime: "09:00:00", endTime: "18:00:00" };

const SCHEDULE_OVERRIDES: Record<
  string,
  { days: readonly number[]; startTime: string; endTime: string }
> = {
  "test-barbershop": { days: [1, 2, 3, 4, 5, 6], startTime: "09:00:00", endTime: "18:00:00" },
  "shibuya-hair-atelier": { days: [2, 3, 4, 5, 6, 7], startTime: "11:00:00", endTime: "20:00:00" },
  "brooklyn-auto-detailing": {
    days: [1, 2, 3, 4, 5, 6],
    startTime: "08:00:00",
    endTime: "17:00:00",
  },
  "camden-strength-gym": {
    days: [1, 2, 3, 4, 5, 6, 7],
    startTime: "06:00:00",
    endTime: "22:00:00",
  },
};

// ─── сотрудники ───────────────────────────────────────────────────────

const STAFF_NAMES: Record<string, string[]> = {
  "test-barbershop": ["Marek Nowak", "Piotr Zielinski"],
  "wawel-nails-studio": ["Anna Kowalska", "Julia Wojcik"],
  "vltava-dental-clinic": ["Tomas Novak", "Petra Svobodova"],
  "camden-strength-gym": ["James Carter", "Olivia Bennett"],
  "podil-language-lab": ["Oksana Tkachenko", "Dmytro Bondar"],
  "brooklyn-auto-detailing": ["Mike Rodriguez", "Chris Walker"],
  "shibuya-hair-atelier": ["Yuki Tanaka", "Haruto Sato"],
  "bandra-yoga-space": ["Priya Sharma", "Arjun Mehta"],
};

// ─── сборка строк ─────────────────────────────────────────────────────

function buildRows() {
  const serviceRows: Array<typeof services.$inferInsert> = [];
  const scheduleRows: Array<typeof facilitySchedules.$inferInsert> = [];
  const staffUserRows: Array<{ id: string; name: string; email: string }> = [];
  const staffMemberRows: Array<typeof staffMembers.$inferInsert> = [];
  const staffServiceRows: Array<typeof staffServices.$inferInsert> = [];

  let serviceIndex = 0;
  let staffIndex = 0;

  for (const facility of facilitySeeds) {
    const currency = facility.currency;
    const scale = PRICE_SCALE[currency] ?? 1;

    // расписание
    const hours = SCHEDULE_OVERRIDES[facility.slug] ?? DEFAULT_HOURS;
    for (const day of hours.days) {
      scheduleRows.push({
        facilityId: facility.id,
        dayOfTheWeek: day as DayOfTheWeek,
        startTime: hours.startTime,
        endTime: hours.endTime,
      });
    }

    // услуги
    const facilityServiceIds: string[] = [];
    for (const template of SERVICE_TEMPLATES[facility.category]) {
      const id = seedId(KIND.SERVICE, serviceIndex++);
      facilityServiceIds.push(id);
      serviceRows.push({
        id,
        facilityId: facility.id,
        name: template.name,
        description: template.description,
        category: template.category,
        durationMinutes: template.durationMinutes,
        priceCents: Math.round(template.priceCents * scale),
        isActive: true,
      });
    }

    // сотрудники + их услуги
    const names = STAFF_NAMES[facility.slug] ?? [];
    names.forEach((fullName, positionInFacility) => {
      const userId = seedId(KIND.STAFF_USER, staffIndex);
      const staffMemberId = seedId(KIND.STAFF_MEMBER, staffIndex);
      staffIndex++;

      staffUserRows.push({
        id: userId,
        name: fullName,
        email: `${facility.slug}-staff-${positionInFacility + 1}@slotbook.test`,
      });
      staffMemberRows.push({ id: staffMemberId, userId, facilityId: facility.id, isActive: true });

      // первый мастер умеет всё, второй — через одну услугу
      const assigned =
        positionInFacility === 0
          ? facilityServiceIds
          : facilityServiceIds.filter((_, i) => i % 2 === 0);

      for (const serviceId of assigned) {
        staffServiceRows.push({ staffMemberId, serviceId });
      }
    });
  }

  return { serviceRows, scheduleRows, staffUserRows, staffMemberRows, staffServiceRows };
}

// ─── сид ──────────────────────────────────────────────────────────────

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool });

  // хешируем один раз: bcrypt намеренно медленный, 17 вызовов — это секунды впустую
  const passwordHash = await bcrypt.hash("password123", 10);
  const { serviceRows, scheduleRows, staffUserRows, staffMemberRows, staffServiceRows } =
    buildRows();

  try {
    await db.transaction(async (tx) => {
      await tx
        .insert(users)
        .values([
          { id: OWNER_ID, name: "Test Owner", email: "owner@test.com", passwordHash },
          ...staffUserRows.map((u) => ({ ...u, passwordHash })),
        ])
        .onConflictDoNothing();

      await tx
        .insert(facilities)
        .values(facilitySeeds.map((f) => ({ ...f, ownerId: OWNER_ID })))
        .onConflictDoNothing();

      await tx.insert(facilitySchedules).values(scheduleRows).onConflictDoNothing();
      await tx.insert(services).values(serviceRows).onConflictDoNothing();
      await tx.insert(staffMembers).values(staffMemberRows).onConflictDoNothing();
      await tx.insert(staffServices).values(staffServiceRows).onConflictDoNothing();
    });
  } finally {
    await pool.end();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
