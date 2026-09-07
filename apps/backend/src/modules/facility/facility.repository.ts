import { and, asc, count, desc, eq } from 'drizzle-orm';
import type { DB } from '../../db/drizzlePlugin.ts';
import {
  facilities,
  type FacilityEntity,
  type NewFacilityEntity,
} from '../../db/schema/facility.ts';
import type { UpdateFacilityRequest } from '@slotbook/shared/facility';
import { FACILITY_CATEGORIES } from '@slotbook/shared/facility';

export async function findAllFacilities(
  db: DB,
  city: string,
  limit?: number,
): Promise<Array<FacilityEntity>> {
  const query = db
    .select()
    .from(facilities)
    .where(and(eq(facilities.isPublished, true), eq(facilities.city, city)))
    .$dynamic();
  if (limit !== undefined) {
    query.limit(limit);
  }
  return await query;
}

export async function findFacilityById(db: DB, id: string): Promise<FacilityEntity | null> {
  const [facility] = await db.select().from(facilities).where(eq(facilities.id, id));
  return facility ?? null;
}
export async function findFacilitiesByOwnerId(
  db: DB,
  ownerId: string,
): Promise<Array<FacilityEntity>> {
  return db.select().from(facilities).where(eq(facilities.ownerId, ownerId));
}

export async function insertFacility(db: DB, data: NewFacilityEntity): Promise<FacilityEntity> {
  const [facility] = await db
    .insert(facilities)
    .values({ ...data })
    .returning();
  if (!facility) {
    throw new Error('Failed to insert facility');
  }
  return facility;
}

export async function updateFacilityById(
  db: DB,
  id: string,
  data: UpdateFacilityRequest,
): Promise<FacilityEntity | null> {
  const [facility] = await db
    .update(facilities)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(facilities.id, id))
    .returning();

  return facility ?? null;
}
export async function deleteFacilityById(db: DB, id: string): Promise<FacilityEntity | null> {
  const [deletedFacility] = await db.delete(facilities).where(eq(facilities.id, id)).returning();
  return deletedFacility ?? null;
}

export async function getAllCategories(
  db: DB,
  limit?: number,
): Promise<
  Array<{
    categoryName: (typeof FACILITY_CATEGORIES)[number];
    count: number;
  }>
> {
  const query = db
    .select({ categoryName: facilities.category, count: count() })
    .from(facilities)
    .groupBy(facilities.category)
    .orderBy(desc(count()))
    .$dynamic();

  if (limit !== undefined) {
    query.limit(limit);
  }

  return await query;
}
