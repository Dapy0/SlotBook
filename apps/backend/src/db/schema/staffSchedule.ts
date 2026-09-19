import { index, pgTable, smallint, time, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { staffMembers } from "./staffMember.ts";
import type { DayOfTheWeek } from "@slotbook/shared/facilitySchedule";

export const staffSchedules = pgTable(
  "staff_schedule",
  {
    id: uuid().defaultRandom().primaryKey(),
    staffMemberId: uuid("staff_member_id")
      .notNull()
      .references(() => staffMembers.id, { onDelete: "cascade" }),
    dayOfTheWeek: smallint("day_of_the_week").$type<DayOfTheWeek>().notNull(),
    startTime: time("start_time", { precision: 0 }).notNull(),
    endTime: time("end_time", { precision: 0 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("staff_schedule_member_idx").on(table.staffMemberId),
    unique("staff_schedule_unique_slot").on(
      table.staffMemberId,
      table.dayOfTheWeek,
      table.startTime,
      table.endTime,
    ),
  ],
);
export type StaffScheduleEntity = typeof staffSchedules.$inferSelect;
export type NewStaffScheduleEntity = typeof staffSchedules.$inferInsert;
