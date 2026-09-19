import {
  uuid,
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { facilities } from "./facility.ts";

export const services = pgTable(
  "services",
  {
    id: uuid().defaultRandom().primaryKey(),
    facilityId: uuid("facility_id")
      .notNull()
      .references(() => facilities.id, { onDelete: "cascade" }),
    name: varchar({ length: 255 }).notNull(),
    description: text().notNull(),
    category: varchar({ length: 255 }).notNull(),

    durationMinutes: integer("duration_minutes").notNull(),
    priceCents: integer("price_cents").notNull(),

    isActive: boolean("is_active").notNull().default(true),

    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("services_facility_idx").on(table.facilityId)],
);

export type ServiceEntity = typeof services.$inferSelect;
export type NewServiceEntity = typeof services.$inferInsert;
