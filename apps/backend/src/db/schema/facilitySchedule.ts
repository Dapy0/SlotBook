import { pgTable, smallint, time, timestamp, uuid } from 'drizzle-orm/pg-core';
import { facilities } from './facility.ts';
import type {DayOfTheWeek} from '@slotbook/shared/facilitySchedule';

export const facilitySchedules = pgTable('facility_schedule', {
  id: uuid().defaultRandom().primaryKey(),
  facilityId: uuid('facility_id')
    .notNull()
    .references(() => facilities.id, { onDelete: 'cascade' }),
  dayOfTheWeek: smallint().$type<DayOfTheWeek>().notNull(),
  startTime: time().notNull(),
  endTime: time().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
export type FacilityScheduleEntity = typeof facilitySchedules.$inferSelect;
export type NewFacilityScheduleEntity = typeof facilitySchedules.$inferInsert;
