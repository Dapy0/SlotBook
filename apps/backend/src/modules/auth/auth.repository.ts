import { eq } from 'drizzle-orm';
import type { DB } from '../../db/drizzlePlugin.ts';
import { users, type UserEntity } from '../../db/schema/index.ts';

type RegisterDbParams = {
  name: string;
  email: string;
  passwordHash: string;
};
export const registerUser = async (
  db: DB,
  userData: RegisterDbParams,
): Promise<UserEntity > => {
  const { email, name, passwordHash } = userData;
  const [newUser] = await db
    .insert(users)
    .values({
      email,
      name,
      passwordHash,
    })
    .returning();
  if (!newUser) {
    throw new Error('Failed to insert user: no record returned');
  }
  return newUser;
};

export const findUserByEmail = async (db: DB, email: string): Promise<UserEntity | undefined> => {
  const [newUser] = await db.select().from(users).where(eq(users.email, email));
  return newUser;
};
export const findUserById = async (db: DB, id: string): Promise<UserEntity | undefined> => {
  const [newUser] = await db.select().from(users).where(eq(users.id, id));
  return newUser;
};
