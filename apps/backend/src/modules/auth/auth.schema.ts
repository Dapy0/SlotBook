import { createInsertSchema, createSelectSchema } from 'drizzle-orm/zod';
import { users } from '../../db/schema.ts';
import z from 'zod';

export const selectUserSchema = createSelectSchema(users);
export const registerUserSchema = createInsertSchema(users, {
  email: z.email('Not an email address!'),
  name: z.string().min(1, 'Name must contain min 1 character').max(255),
})
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    passwordHash: true,
    role: true,
  })
  .extend({
    password: z.string().min(6),
  });
export const signInUserSchema = createInsertSchema(users, {
  email: z.email('Not an email address!'),
})
  .omit({
    passwordHash: true,
    role: true,
    name: true,
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    password: z.string().min(6),
  });
export const authResponseSchema = selectUserSchema.omit({ passwordHash: true }).extend({
  token: z.string(),
});
