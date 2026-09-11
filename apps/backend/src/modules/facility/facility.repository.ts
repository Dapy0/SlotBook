import { and, asc, avg, count, desc, eq, exists, gte, ilike, lte, or, sql } from 'drizzle-orm';
import type { DB } from '../../db/drizzlePlugin.ts';
import {
  facilities,
  type FacilityEntity,
  type NewFacilityEntity,
} from '../../db/schema/facility.ts';
import type { FacilityCategory, UpdateFacilityRequest } from '@slotbook/shared/facility';
import { FACILITY_CATEGORIES } from '@slotbook/shared/facility';
import { reviews } from '../../db/schema/reviews.ts';
import { bookings } from '../../db/schema/booking.ts';
import type { FacilityListQuery } from './facility.schema.ts';
import { services } from '../../db/schema/service.ts';

export async function findAllFacilities(
  db: DB,
  params: FacilityListQuery,
): Promise<Array<FacilityEntity>> {
  const { country, category, rating, priceMax, q, sort, limit } = params;

  const filters = [eq(facilities.isPublished, true), eq(facilities.country, country)];

  if (category !== undefined) filters.push(eq(facilities.category, category));
  if (rating !== undefined) filters.push(gte(facilities.score, rating));
  if (q !== undefined && q !== '') {
    filters.push(or(ilike(facilities.name, `%${q}%`), ilike(facilities.description, `%${q}%`))!);
  }
  if (priceMax !== undefined) {
    filters.push(
      exists(
        db
          .select({ one: sql`1` })
          .from(services)
          .where(
            and(
              eq(services.facilityId, facilities.id),
              eq(services.isActive, true),
              lte(services.priceCents, priceMax * 100),
            ),
          ),
      ),
    );
  }

  const query = db
    .select()
    .from(facilities)
    .where(and(...filters))
    .$dynamic();

  if (sort === 'rating') query.orderBy(sql`${facilities.score} DESC NULLS LAST`);
  else query.orderBy(asc(facilities.name));

  if (limit !== undefined) query.limit(limit);

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
  country: string,
  limit?: number,
): Promise<
  Array<{
    categoryName: (typeof FACILITY_CATEGORIES)[number];
    count: number;
  }>
> {
  const filters = [eq(facilities.isPublished, true), eq(facilities.country, country)];

  const query = db
    .select({ categoryName: facilities.category, count: count() })
    .from(facilities)
    .where(and(...filters))
    .groupBy(facilities.category)
    .orderBy(desc(count()))
    .$dynamic();

  if (limit !== undefined) {
    query.limit(limit);
  }

  return await query;
}

export async function recalculateFacilityScore(db: DB, facilityId: string) {
  const [result] = await db
    .select({
      avgRating: avg(reviews.rating),
      count: count(reviews.id),
    })
    .from(reviews)
    .innerJoin(bookings, eq(bookings.id, reviews.bookingId))
    .where(eq(bookings.facilityId, facilityId));

  const updatedFacility = await db
    .update(facilities)
    .set({
      reviewsCount: result?.count ?? 0,
      score: result?.avgRating ? Number(result.avgRating) : null,
    })
    .returning();
  return updatedFacility;
}
