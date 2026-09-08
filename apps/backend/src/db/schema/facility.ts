import {
  varchar,
  numeric,
  jsonb,
  timestamp,
  index,
  uuid,
  boolean,
  text,
  pgEnum,
  pgTable,
  integer,
} from 'drizzle-orm/pg-core';
import { users } from './user.ts';
import { FACILITY_CATEGORIES } from '@slotbook/shared/facility';

export const facilityCategoryEnum = pgEnum('facility_category', FACILITY_CATEGORIES);

export const facilities = pgTable(
  'facilities',
  {
    id: uuid().defaultRandom().primaryKey(),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    name: varchar({ length: 255 }).notNull(),
    slug: varchar({ length: 255 }).notNull().unique(),
    description: text().notNull(),
    category: facilityCategoryEnum('category').notNull(),
    city: varchar({ length: 120 }).notNull(),
    country: varchar({ length: 2 }).notNull(),
    address: varchar({ length: 255 }).notNull(),
    latitude: numeric({ precision: 9, scale: 6, mode: 'number' }),
    longitude: numeric({ precision: 9, scale: 6, mode: 'number' }),
    phone: varchar({ length: 32 }).notNull(),
    email: varchar({ length: 255 }).notNull(),
    images: jsonb().$type<string[]>().notNull(),
    score: numeric({ precision: 3, scale: 1, mode: 'number' }),
    reviewsCount: integer().notNull().default(0),
    isPublished: boolean('is_published').notNull().default(false),
    timezoneIANA: text('timezone_IANA').notNull().default('Europe/Warsaw'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    // telegram_chat_id
  },
  (table) => [
    index('facilities_city_idx').on(table.city),
    index('facilities_owner_idx').on(table.ownerId),
    index('facilities_category_idx').on(table.category),
  ],
);
export type FacilityEntity = typeof facilities.$inferSelect;
export type NewFacilityEntity = typeof facilities.$inferInsert;
