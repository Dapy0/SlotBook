import { uuid, pgTable, varchar, pgEnum, text, timestamp } from 'drizzle-orm/pg-core';

export const roleEnums = ['CLIENT', 'OWNER', 'ADMIN'] as const;
const pgRoleEnums = pgEnum('role', roleEnums);

export const users = pgTable('users', {
  id: uuid().defaultRandom().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: pgRoleEnums('role').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  // telegram_chat_id
});
