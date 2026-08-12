import {
  uuid,
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  index,
} from 'drizzle-orm/pg-core';
import { facilities } from './facility.ts';

export const services = pgTable(
  'services',
  {
    id: uuid().defaultRandom().primaryKey(),
    facilityId: uuid('facility_id')
      .notNull()
      .references(() => facilities.id, { onDelete: 'cascade' }),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    category: varchar({ length: 255 }).notNull(),

    durationMinutes: integer('duration_minutes').notNull(),
    priceCents: integer('price_cents').notNull(),
    currency: varchar({ length: 3 }).notNull().default('PLN'),

    isActive: boolean('is_active').notNull().default(true),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    // telegram_chat_id
  },
  (table) => [index('services_facility_idx').on(table.facilityId)],
);
export type ServiceSchemaType = typeof facilities.$inferSelect;
