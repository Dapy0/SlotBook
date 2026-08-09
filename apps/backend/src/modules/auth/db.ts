import type { DB } from '../../db/drizzlePlugin.ts';

export const registerUser = async (db: DB) => {
  const result = await db.select();
};
