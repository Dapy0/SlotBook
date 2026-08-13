import { eq } from 'drizzle-orm';
import type { DB } from '../../db/drizzlePlugin.ts';
import {
  facilities,
  type CreateFacilityBody,
  type FacilitySchema,
  type UpdateFacilityBody,
} from '../../db/schema/facility.ts';

export async function findAllFacilities(db: DB) {
  return db.select().from(facilities).where(eq(facilities.isPublished, true));
}

export async function findFacilityById(db: DB, id: string) {
  const [facility] = await db.select().from(facilities).where(eq(facilities.id, id));
  return facility ?? null;
}
export async function findFacilitiesByOwnerId(db: DB, ownerId: string) {
  return db.select().from(facilities).where(eq(facilities.ownerId, ownerId));
}

export async function insertFacility(
  db: DB,
  data: CreateFacilityBody & { ownerId: string },
): Promise<FacilitySchema> {
  const [facility] = await db.insert(facilities).values(data).returning();
  if (!facility) {
    throw new Error('Failed to insert facility');
  }
  return facility;
}

export async function updateFacilityById(db: DB, id: string, data: UpdateFacilityBody) {
  const [facility] = await db
    .update(facilities)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(facilities.id, id))
    .returning();

  return facility ?? null;
}
