import { eq } from 'drizzle-orm';
import type { DB } from '../../db/drizzlePlugin.ts';
import { facilities, type FacilityEntity } from '../../db/schema/facility.ts';
import type {
  CreateFacilityRequest,
  FacilityResponseDTO,
  UpdateFacilityRequest,
} from '@slotbook/shared/facilities';

export async function findAllFacilities(db: DB): Promise<Array<FacilityEntity>> {
  return db.select().from(facilities).where(eq(facilities.isPublished, true));
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

export async function insertFacility(
  db: DB,
  data: CreateFacilityRequest,
  ownerId: string,
): Promise<FacilityEntity> {
  const [facility] = await db
    .insert(facilities)
    .values({ ...data, ownerId })
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
