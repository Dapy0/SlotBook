import { pgTable, smallint, time, timestamp, uuid } from 'drizzle-orm/pg-core';
import { staffMembers } from './staffMember.ts';
import type { DayOfTheWeek } from '@slotbook/shared/facilitySchedule';

export const staffSchedules = pgTable('staff_schedule', {
  id: uuid().defaultRandom().primaryKey(),
  staffMemberId: uuid('staff_member_id')
    .notNull()
    .references(() => staffMembers.id, { onDelete: 'cascade' }),
  dayOfTheWeek: smallint().$type<DayOfTheWeek>().notNull(),
  startTime: time({ precision: 0 }).notNull(),
  endTime: time({ precision: 0 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
export type StaffScheduleEntity = typeof staffSchedules.$inferSelect;
export type NewStaffScheduleEntity = typeof staffSchedules.$inferInsert;
