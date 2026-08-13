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
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-orm/zod';
import z from 'zod';
import type { Json } from 'drizzle-orm';

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
    description: text().notNull(),
    category: facilityCategoryEnum('category').notNull(),
    city: varchar({ length: 120 }).notNull(),
    address: varchar({ length: 255 }).notNull(),
    latitude: numeric({ precision: 9, scale: 6 }),
    longitude: numeric({ precision: 9, scale: 6 }),
    phone: varchar({ length: 32 }).notNull(),
    email: varchar({ length: 255 }).notNull(),
    images: jsonb().$type<Json>().notNull(),
    workingHours: jsonb('working_hours').$type<WorkingHours>().notNull(),
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
const dayScheduleSchema = z
  .object({
    open: z.string(),
    close: z.string(),
  })
  .nullable();
const weekScheduleSchema = z.object({
  mon: dayScheduleSchema,
  tue: dayScheduleSchema,
  wed: dayScheduleSchema,
  thu: dayScheduleSchema,
  fri: dayScheduleSchema,
  sat: dayScheduleSchema,
  sun: dayScheduleSchema,
});
export const insertFacilitySchema = createInsertSchema(facilities, {
  name: z.string().min(2).max(255),
  slug: z
    .string()
    .min(2)
    .max(255)
    .regex(/^[a-z0-9-]+$/),
  city: z.string().min(1),
  address: z.string().min(1),
  phone: z.string(),
  email: z.email(),
  workingHours: weekScheduleSchema,
}).omit({
  id: true,
  ownerId: true,
  isPublished: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateFacilityBody = z.infer<typeof insertFacilitySchema>;
export type FacilitySchemaType = typeof facilities.$inferSelect;
export type FacilitySchema = z.infer<typeof selectFacilitySchema>;
export const selectFacilitySchema = createSelectSchema(facilities);

export const updateFacilitySchema = insertFacilitySchema.partial();
export type UpdateFacilityBody = z.infer<typeof updateFacilitySchema>;
