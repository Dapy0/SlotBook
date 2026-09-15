import { pgTable, smallint, time, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { facilities } from "./facility.ts";
import type { DayOfTheWeek } from "@slotbook/shared/facilitySchedule";

export const facilitySchedules = pgTable(
  "facility_schedule",
  {
    id: uuid().defaultRandom().primaryKey(),
    facilityId: uuid("facility_id")
      .notNull()
      .references(() => facilities.id, { onDelete: "cascade" }),
    dayOfTheWeek: smallint("day_of_the_week").$type<DayOfTheWeek>().notNull(),
    startTime: time("start_time", { precision: 0 }).notNull(),
    endTime: time("end_time", { precision: 0 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    unique("facility_schedules_unique_slot").on(
      table.facilityId,
      table.dayOfTheWeek,
      table.startTime,
      table.endTime,
    ),
  ],
);
export type FacilityScheduleEntity = typeof facilitySchedules.$inferSelect;
export type NewFacilityScheduleEntity = typeof facilitySchedules.$inferInsert;
