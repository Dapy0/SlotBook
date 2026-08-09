import { uuid, pgTable, varchar, pgEnum, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/zod';
import z from 'zod';
const roleEnums = ['CLIENT', 'OWNER', 'ADMIN'] as const;
export const pgRoleEnums = pgEnum('role', roleEnums);

export const users = pgTable('users', {
  id: uuid().defaultRandom().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: pgRoleEnums('role').default('CLIENT'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  // telegram_chat_id
});

export const selectUserSchema = createSelectSchema(users);
export const registerUserSchema = createInsertSchema(users, {
  name: z.string().min(1).max(255),
  email: z.email('Not an email address!'),
  passwordHash: z.string(),
  role: z.enum(roleEnums),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

