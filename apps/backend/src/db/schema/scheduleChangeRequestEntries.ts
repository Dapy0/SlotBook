import { pgTable, smallint, time, unique, uuid } from "drizzle-orm/pg-core";
import type { Weekday } from "@slotbook/shared";
import { scheduleChangeRequests } from './scheduleChangeRequests';

export const scheduleChangeRequestEntries = pgTable(
  "schedule_change_request_entries",
  {
    id: uuid().defaultRandom().primaryKey(),
    requestId: uuid("request_id").references(() => scheduleChangeRequests.id),
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
export type ScheduleChangeRequestEntity = typeof scheduleChangeRequests.$inferSelect;
export type NewScheduleChangeRequestEntity = typeof scheduleChangeRequests.$inferInsert;
