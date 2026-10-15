import {
  check,
  customType,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./user.ts";
import { facilities } from "./facility.ts";
import { staffMembers } from "./staffMember.ts";
import { services } from "./service.ts";
import { sql } from "drizzle-orm";
import { CANCEL_ACTORS } from "@slotbook/shared";

type TimeRange = {
  start: Date;
  end: Date;
};
function parseRange(value: string): TimeRange {
  const match = value.match(/^(\[|\()(.*),(.*)(\]|\))$/);

  if (!match) {
    throw new Error(`Invalid tstzrange: ${value}`);
  }
  const [, , startValue, endValue] = match;
  const start = new Date(startValue.replace(/^"|"$/g, ""));
  const end = new Date(endValue.replace(/^"|"$/g, ""));

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error(`Invalid timestamp in tstzrange: ${value}`);
  }

  return {
    start,
    end,
  };
}

export const tstzrange = customType<{
  data: TimeRange;
  driverData: string;
}>({
  dataType() {
    return "tstzrange";
  },
  fromDriver(value: string): TimeRange {
    return parseRange(value);
  },
  toDriver(value: TimeRange): string {
    return `[${value.start.toISOString()},${value.end.toISOString()})`;
  },
});

export const bookings = pgTable(
  "bookings",
  {
    id: uuid().defaultRandom().primaryKey(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => users.id),
    facilityId: uuid("facility_id")
      .notNull()
      .references(() => facilities.id, { onDelete: "cascade" }),
    staffMemberId: uuid("staff_member_id")
      .notNull()
      .references(() => staffMembers.id),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id),
    timeRange: tstzrange("time_range").notNull(),
    priceCents: integer("price_cents").notNull(),
    currency: varchar({ length: 3 }).notNull(),
    status: text("status", { enum: ["pending", "confirmed", "canceled"] })
      .notNull()
      .default("pending"),
    cancelableUntil: timestamp("cancelable_until", { withTimezone: true, mode: "date" }).notNull(),
    canceledAt: timestamp("canceled_at", { withTimezone: true, mode: "date" }),
    canceledBy: text("canceled_by", { enum: CANCEL_ACTORS }),
    cancelReason: text("cancel_reason"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("bookings_facilities_idx").on(table.facilityId),
    index("bookings_clients_idx").on(table.clientId),
    index("bookings_staff_members_idx").on(table.staffMemberId),
    check("booking_status_check", sql`${table.status} IN ('pending','confirmed', 'canceled')`),
    check(
      "booking_cancellation_check",
      sql`${table.status} = 'canceled' OR (${table.canceledAt} IS NULL AND ${table.canceledBy} IS NULL AND ${table.cancelReason} IS NULL)`,
    ),
    check(
      "booking_canceled_by_check",
      sql`${table.canceledBy} IS NULL OR ${table.canceledBy} IN ('client', 'staff', 'owner', 'system')`,
    ),
    check(
      "booking_cancelable_until_before_start_check",
      sql`${table.cancelableUntil} <= lower(${table.timeRange})`,
    ),
  ],
);

export type BookingEntity = typeof bookings.$inferSelect;
export type NewBookingEntity = typeof bookings.$inferInsert;
/*
MANUALLY ADDED TO MIGRATION FILE

--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS btree_gist;
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "no_overlapping_bookings"
EXCLUDE USING GIST ("staff_member_id" WITH =, "time_range" WITH &&);
WHERE (status <> 'canceled')
*/
