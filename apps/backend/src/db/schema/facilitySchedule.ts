import { pgTable, smallint, time, timestamp, uuid } from 'drizzle-orm/pg-core';
import { facilities } from './facility.ts';

export const facilitySchedules = pgTable('facility_schedule', {
  id: uuid().defaultRandom().primaryKey(),
  facilityId: uuid('facility_id')
    .notNull()
    .references(() => facilities.id, { onDelete: 'cascade' }),
  dayOfTheWeek: smallint().notNull(),
  startTime: time().notNull(),
  endTime: time().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
export type FacilityScheduleEntity = typeof facilitySchedules.$inferSelect;
export type NewFacilityScheduleEntity = typeof facilitySchedules.$inferInsert;
