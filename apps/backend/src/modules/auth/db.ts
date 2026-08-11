import { eq } from 'drizzle-orm';
import type { DB } from '../../db/drizzlePlugin.ts';
import { roleEnums, users, type UserSchemaType } from '../../db/schema.ts';
type RegisterDbParams = {
  name: string;
  email: string;
  passwordHash: string;
  role: (typeof roleEnums)[number];
};
export const registerUser = async (db: DB, userData: RegisterDbParams) => {
  const { email, name, passwordHash, role } = userData;
  const [newUser] = await db
    .insert(users)
    .values({
      email,
      name,
      passwordHash,
      role,
    })
    .returning();
  return newUser;
};

export const findUserByEmail = async (db: DB, email: string): Promise<UserSchemaType | undefined> => {
  const [newUser] = await db.select().from(users).where(eq(users.email, email));
  return newUser;
};
export const findUserById = async (db: DB, id: string): Promise<UserSchemaType | undefined> => {
  const [newUser] = await db.select().from(users).where(eq(users.id, id));
  return newUser;
};
