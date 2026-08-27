import { eq, and, isNull } from 'drizzle-orm';
import type { DB } from '../../db/drizzlePlugin.ts';
import { users, type UserEntity } from '../../db/schema/index.ts';

type RegisterDbParams = {
  name: string;
  email: string;
  passwordHash: string;
};
export const registerUser = async (db: DB, userData: RegisterDbParams): Promise<UserEntity> => {
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
    throw new Error('Failed to insert user');
  }
  return newUser;
};

export const findUserByEmail = async (db: DB, email: string): Promise<UserEntity | null> => {
  const [newUser] = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email), isNull(users.deletedAt)));
  return newUser ?? null;
};
export const findUserById = async (db: DB, id: string): Promise<UserEntity | null> => {
  const [newUser] = await db.select().from(users).where(eq(users.id, id));
  return newUser ?? null;
};

export async function deleteUserDate(db: DB, userId: string) {
  const [deletedUser] = await db
    .update(users)
    .set({
      email: `deleted-${userId}@deleted.local`,
      name: 'Deleted User',
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
  if (!deletedUser) {
    throw new Error('Failed to delete user');
  }
}
