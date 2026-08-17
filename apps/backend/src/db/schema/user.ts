import { pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const roleEnums = ['CLIENT', 'OWNER', 'ADMIN'] as const;
export const pgRoleEnums = pgEnum('role', roleEnums);

export const users = pgTable('users', {
  id: uuid().defaultRandom().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: pgRoleEnums('role').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  // telegram_chat_id
});
export type UserEntity = typeof users.$inferSelect;
