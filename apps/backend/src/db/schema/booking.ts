import { customType, index, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./user.ts";
import { facilities } from "./facility.ts";
import { staffMembers } from "./staffMember.ts";
import { services } from "./service.ts";

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
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("bookings_facilities_idx").on(table.facilityId),
    index("bookings_clients_idx").on(table.clientId),
    index("bookings_staff_members_idx").on(table.staffMemberId),
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
