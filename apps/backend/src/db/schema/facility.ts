import {
  varchar,
  numeric,
  jsonb,
  timestamp,
  index,
  uuid,
  boolean,
  text,
  pgEnum,
  pgTable,
  integer,
  check,
} from "drizzle-orm/pg-core";
import { users } from "./user.ts";
import { FACILITY_CATEGORIES } from "@slotbook/shared";
import { sql } from "drizzle-orm";
import { CONFIRMATION_MODES } from "@slotbook/shared";

export const facilityCategoryEnum = pgEnum("facility_category", FACILITY_CATEGORIES);
export const facilityConfirmationMode = pgEnum("confirmation_mode", CONFIRMATION_MODES);
export const facilities = pgTable(
  "facilities",
  {
    id: uuid().defaultRandom().primaryKey(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    name: varchar({ length: 255 }).notNull(),
    slug: varchar({ length: 255 }).notNull().unique(),
    description: text().notNull(),
    category: facilityCategoryEnum("category").notNull(),
    city: varchar({ length: 120 }).notNull(),
    country: varchar({ length: 2 }).notNull(),
    currency: varchar({ length: 3 }).notNull().default("EUR"),
    address: varchar({ length: 255 }).notNull(),
    latitude: numeric({ precision: 9, scale: 6, mode: "number" }).notNull(),
    longitude: numeric({ precision: 9, scale: 6, mode: "number" }).notNull(),
    phone: varchar({ length: 32 }).notNull(),
    email: varchar({ length: 255 }).notNull(),
    images: jsonb()
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    score: numeric({ precision: 3, scale: 1, mode: "number" }),
    reviewsCount: integer("reviews_count").notNull().default(0),
    isPublished: boolean("is_published").notNull().default(false),
    timezone: text("timezone").notNull().default("Europe/Warsaw"),
    confirmationMode: facilityConfirmationMode("confirmation_mode").default("manual").notNull(),
    clientCancelCutoffMinutes: integer("client_cancel_cutoff_minutes").default(0).notNull(),
    bookingLeadMinutes: integer("booking_lead_minutes").default(60).notNull(),
    bookingHorizonDays: integer("booking_horizon_days").default(30).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    // telegram_chat_id
  },
  (table) => [
    index("facilities_city_idx").on(table.city),
    index("facilities_owner_idx").on(table.ownerId),
    index("facilities_category_idx").on(table.category),
    check(
      "facilities_confirmation_mode_check",
      sql`${table.confirmationMode} IN ('auto', 'manual')`,
    ),
    check(
      "client_cancel_cutoff_minutes_check",
      sql`${table.clientCancelCutoffMinutes} BETWEEN 0 AND 10080 `,
    ),
    check(
      "facilities_booking_lead_minutes_check",
      sql`${table.bookingLeadMinutes} BETWEEN 0 AND 10080 `,
    ),
    check(
      "facilities_booking_horizon_days_check",
      sql`${table.bookingHorizonDays} BETWEEN 1 AND 365 `,
    ),
    check("facilities_images_max_check", sql`jsonb_array_length(${table.images}) <= 10`),
  ],
);
export type FacilityEntity = typeof facilities.$inferSelect;
export type NewFacilityEntity = typeof facilities.$inferInsert;
