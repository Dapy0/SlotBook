import { boolean, index, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './user.ts';
import { facilities } from './facility.ts';

export const staffMembers = pgTable(
  'staff_members',
  {
    id: uuid().defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
      .unique(),

    facilityId: uuid('facility_id')
      .notNull()
      .references(() => facilities.id, { onDelete: 'cascade' }),

    isActive: boolean('is_active').notNull().default(true),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('staff_members_facility_idx').on(table.facilityId)],
);
export type StaffMemberEntity = typeof staffMembers.$inferSelect;
export type NewStaffMemberEntity = typeof staffMembers.$inferInsert;
