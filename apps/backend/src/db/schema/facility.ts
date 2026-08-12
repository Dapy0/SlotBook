import { facilityCategories } from '@slotbook/shared/facilities';
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
} from 'drizzle-orm/pg-core';
import { users } from './user.ts';

export const facilityCategoryEnum = pgEnum('facility_category', facilityCategories);
export type WorkingHours = Record<
  'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun',
  { open: string; close: string } | null
>;

export const facilities = pgTable(
  'facilities',
  {
    id: uuid().defaultRandom().primaryKey(),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    name: varchar({ length: 255 }).notNull(),
    slug: varchar({ length: 255 }).notNull().unique(),
    description: text(),
    category: facilityCategoryEnum('category').notNull(),
    city: varchar({ length: 120 }).notNull(),
    address: varchar({ length: 255 }).notNull(),
    latitude: numeric({ precision: 9, scale: 6 }),
    longitude: numeric({ precision: 9, scale: 6 }),
    phone: varchar({ length: 32 }).notNull(),
    email: varchar({ length: 255 }).notNull(),
    images: jsonb().$type<string[]>().notNull().default([]),
    workingHours: jsonb('working_hours').$type<WorkingHours>(),
    isPublished: boolean('is_published').notNull().default(false),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    // telegram_chat_id
  },
  (table) => [
    index('facilities_city_idx').on(table.city),
    index('facilities_owner_idx').on(table.ownerId),
  ],
);
export type FacilitySchemaType = typeof facilities.$inferSelect;
