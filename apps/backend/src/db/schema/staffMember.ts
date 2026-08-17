import { boolean, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { facilities } from './facility.ts';
import { users } from './user.ts';

export const staffMembers = pgTable('staff_members', {
  id: uuid().defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),

  facilityId: uuid('facility_id')
    .notNull()
    .references(() => facilities.id, {onDelete: "cascade"}),

  isActive: boolean('is_active').notNull().default(true),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
