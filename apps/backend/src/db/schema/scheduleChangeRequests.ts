import { check, pgTable, smallint, text, time, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { facilities } from "./facility.ts";
import { staffMembers } from "./staffMember";
import { sql } from "drizzle-orm";
import { users } from "./user";
import type { Weekday } from "@slotbook/shared";

export const scheduleChangeRequests = pgTable(
  "schedule_change_requests",
  {
    id: uuid().defaultRandom().primaryKey(),
    staffMemberId: uuid("staff_member_id")
      .notNull()
      .references(() => staffMembers.id, { onDelete: "cascade" }),
    facilityId: uuid("facility_id")
      .notNull()
      .references(() => facilities.id, { onDelete: "cascade" }),
    status: text("status", { enum: ["pending", "approved", "rejected", "withdrawn"] })
      .notNull()
      .default("pending"),
    staffNote: text("staff_note"),
    ownerComment: text("owner_comment"),
    decidedByUserId: uuid("decided_by_user_id").references(() => users.id),
    decidedAt: timestamp("decided_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    check(
      "schedule_change_request_status_check",
      sql`${table.status} IN ('pending', 'approved', 'rejected', 'withdrawn')`,
    ),
  ],
);
export type ScheduleChangeRequestEntity = typeof scheduleChangeRequests.$inferSelect;
export type NewScheduleChangeRequestEntity = typeof scheduleChangeRequests.$inferInsert;

// Entity

export const scheduleChangeRequestEntries = pgTable(
  "schedule_change_request_entries",
  {
    id: uuid().defaultRandom().primaryKey(),
    requestId: uuid("request_id")
      .references(() => scheduleChangeRequests.id, { onDelete: "cascade" })
      .notNull(),
    dayOfTheWeek: smallint("day_of_the_week").$type<Weekday>().notNull(),
    startTime: time("start_time", { precision: 0 }).notNull(),
    endTime: time("end_time", { precision: 0 }).notNull(),
  },
  (table) => [
    unique("schedule_change_request_entries_unique_slot").on(
      table.requestId,
      table.dayOfTheWeek,
      table.startTime,
      table.endTime,
    ),
  ],
);
export type ScheduleChangeRequestEntryEntity = typeof scheduleChangeRequestEntries.$inferSelect;
export type NewScheduleChangeRequestEntryEntity = typeof scheduleChangeRequestEntries.$inferInsert;
