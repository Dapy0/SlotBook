import { customType, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './user.ts';
import { facilities } from './facility.ts';
import { staffMembers } from './staffMember.ts';
import { services } from './service.ts';

export const tstzrange = customType<{
  data: string;
  driverData: string;
}>({
  dataType() {
    return 'tstzrange';
  },
});

export const bookings = pgTable(
  'bookings',
  {
    id: uuid().defaultRandom().primaryKey(),
    clientId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    facilityId: uuid('facility_id')
      .notNull()
      .references(() => facilities.id, { onDelete: 'cascade' }),
    staffMemberId: uuid('staff_member_id')
      .notNull()
      .references(() => staffMembers.id),
    serviceId: uuid('service_id')
      .notNull()
      .references(() => services.id),
    timeRange: tstzrange('time_range').notNull(),
    status: text('status', { enum: ['pending', 'confirmed', 'canceled'] })
      .notNull()
      .default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('bookings_facilities_idx').on(table.facilityId)],
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
