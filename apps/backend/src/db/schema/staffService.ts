import { boolean, pgTable, timestamp, uuid, primaryKey } from 'drizzle-orm/pg-core';
import { staffMembers } from './staffMember.ts';
import { services } from './service.ts';

export const staffServices = pgTable(
  'staff_services',
  {
    staffMemberId: uuid('staff_member_id')
      .notNull()
      .references(() => staffMembers.id, { onDelete: 'cascade' }),
    serviceId: uuid('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.staffMemberId, table.serviceId] })],
);

export type StaffServiceEntity = typeof staffServices.$inferSelect;
export type NewStaffServiceEntity = typeof staffServices.$inferInsert;
