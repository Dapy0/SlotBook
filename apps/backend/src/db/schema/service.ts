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
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/zod';
import z from 'zod';

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

export const insertServiceSchema = createInsertSchema(services, {
  name: z.string().min(2).max(255),
  durationMinutes: z
    .number()
    .int()
    .positive()
    .max(24 * 60),
  priceCents: z.number().int().nonnegative(),
  currency: z.string().length(3).default('PLN'),
}).omit({
  id: true,
  facilityId: true,
  createdAt: true,
  updatedAt: true,
});
export const selectServiceSchema = createSelectSchema(services);
export type CreateServiceBody = z.infer<typeof insertServiceSchema>;
export type ServiceSchemaType = z.infer<typeof selectServiceSchema>;
