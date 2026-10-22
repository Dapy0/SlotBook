import {
  and,
  asc,
  avg,
  count,
  exists,
  desc,
  eq,
  gte,
  ilike,
  lte,
  or,
  sql,
  getColumns,
  type SQL,
} from "drizzle-orm";
import type { DB } from "../../db/drizzlePlugin.ts";

import {
  facilities,
  type FacilityEntity,
  type NewFacilityEntity,
} from "../../db/schema/facility.ts";
import type {
  BookingPolicyResponse,
  FacilityCategoryCountResponse,
  FacilityFacetsResponse,
  FacilitySearchQuery,
  GeoCountryResponse,
  UpdateBookingPolicyRequest,
  UpdateFacilityRequest,
} from "@slotbook/shared";
import { reviews } from "../../db/schema/reviews.ts";
import { bookings } from "../../db/schema/booking.ts";
import {
  facilitySchedules,
  services,
  staffMembers,
  staffSchedules,
  staffServices,
} from "../../db/schema";
import { containsPattern } from "../../lib/sql.ts";
import { minPriceCents, ORDER_BY } from "./facility.search.ts";

type SearchFilterKey = "q" | "city" | "category" | "rating" | "priceMax";

function hasActiveService(db: DB, condition: SQL) {
  return exists(
    db
      .select({ one: sql`1` })
      .from(services)
      .where(and(eq(services.facilityId, facilities.id), eq(services.isActive, true), condition)),
  );
}

export function buildSearchWhere(
  db: DB,
  query: FacilitySearchQuery,
  options: { except?: SearchFilterKey } = {},
): SQL[] {
  const use = (key: SearchFilterKey) => options.except !== key;

  const filters: SQL[] = [eq(facilities.isPublished, true), eq(facilities.country, query.country)];

  if (query.q && use("q")) {
    const pattern = containsPattern(query.q);
    filters.push(
      or(
        ilike(facilities.name, pattern),
        ilike(facilities.description, pattern),
        ilike(facilities.city, pattern),
        hasActiveService(db, ilike(services.name, pattern)),
      )!,
    );
  }
  if (query.category !== undefined && use("category")) {
    filters.push(eq(facilities.category, query.category));
  }
  if (query.city !== undefined && use("city")) {
    filters.push(eq(facilities.city, query.city));
  }
  if (query.rating !== undefined && use("rating")) {
    filters.push(gte(facilities.score, query.rating));
  }
  if (query.priceMax !== undefined && use("priceMax")) {
    filters.push(hasActiveService(db, lte(services.priceCents, query.priceMax)));
  }

  return filters;
}

export type FacilitySearchRow = FacilityEntity & { minPriceCents: number | null };

export async function searchFacilities(
  db: DB,
  query: FacilitySearchQuery,
): Promise<{ rows: FacilitySearchRow[]; total: number }> {
  const where = and(...buildSearchWhere(db, query));

  const [rows, [counted]] = await Promise.all([
    db
      .select({ ...getColumns(facilities), minPriceCents })
      .from(facilities)
      .where(where)
      .orderBy(...ORDER_BY[query.sort])
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize),
    db.select({ total: count() }).from(facilities).where(where),
  ]);

  return { rows, total: counted?.total ?? 0 };
}

export async function getSearchFacets(
  db: DB,
  query: FacilitySearchQuery,
): Promise<FacilityFacetsResponse> {
  const [categories, cities, [price]] = await Promise.all([
    db
      .select({ categoryName: facilities.category, count: count() })
      .from(facilities)
      .where(and(...buildSearchWhere(db, query, { except: "category" })))
      .groupBy(facilities.category)
      .orderBy(desc(count())),

    db
      .select({ city: facilities.city, facilitiesCount: count() })
      .from(facilities)
      .where(and(...buildSearchWhere(db, query, { except: "city" })))
      .groupBy(facilities.city)
      .orderBy(desc(count()), asc(facilities.city)),

    db
      .select({
        minCents: sql<number | null>`min(${services.priceCents})`,
        maxCents: sql<number | null>`max(${services.priceCents})`,
        currency: sql<string | null>`mode() within group (order by ${facilities.currency})`,
      })
      .from(services)
      .innerJoin(facilities, eq(facilities.id, services.facilityId))
      .where(
        and(eq(services.isActive, true), ...buildSearchWhere(db, query, { except: "priceMax" })),
      ),
  ]);

  return {
    categories,
    cities,
    price:
      price?.minCents != null && price.maxCents != null && price.currency
        ? { minCents: price.minCents, maxCents: price.maxCents, currency: price.currency }
        : null,
  };
}

export async function findFacilityBySlug(db: DB, slug: string): Promise<FacilityEntity | null> {
  const [facility] = await db.select().from(facilities).where(eq(facilities.slug, slug));
  return facility ?? null;
}
export async function findFacilityById(db: DB, id: string): Promise<FacilityEntity | null> {
  const [facility] = await db.select().from(facilities).where(eq(facilities.id, id));
  return facility ?? null;
}
export async function findFacilitiesByOwnerId(db: DB, ownerId: string): Promise<FacilityEntity[]> {
  return db.select().from(facilities).where(eq(facilities.ownerId, ownerId));
}

export async function insertFacility(db: DB, data: NewFacilityEntity): Promise<FacilityEntity> {
  const [facility] = await db
    .insert(facilities)
    .values({ ...data })
    .returning();
  if (!facility) {
    throw new Error("Failed to insert facility");
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
): Promise<FacilityCategoryCountResponse[]> {
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

export async function updateFacilityScore(db: DB, facilityId: string): Promise<FacilityEntity> {
  const [result] = await db
    .select({
      avgRating: avg(reviews.rating),
      count: count(reviews.id),
    })
    .from(reviews)
    .innerJoin(bookings, eq(bookings.id, reviews.bookingId))
    .where(eq(bookings.facilityId, facilityId));

  const [updatedFacility] = await db
    .update(facilities)
    .set({
      reviewsCount: result?.count ?? 0,
      score: result?.avgRating ? Number(result.avgRating) : null,
    })
    .where(eq(facilities.id, facilityId))
    .returning();
  return updatedFacility;
}
export async function findCountriesWithFacilities(db: DB): Promise<GeoCountryResponse[]> {
  return db
    .select({ country: facilities.country, facilitiesCount: count() })
    .from(facilities)
    .where(eq(facilities.isPublished, true))
    .groupBy(facilities.country)
    .orderBy(desc(count()));
}
export async function findCitiesByCountry(
  db: DB,
  country: string,
): Promise<
  {
    city: string;
    facilitiesCount: number;
  }[]
> {
  return db
    .select({ city: facilities.city, facilitiesCount: count() })
    .from(facilities)
    .where(and(eq(facilities.isPublished, true), eq(facilities.country, country)))
    .groupBy(facilities.city)
    .orderBy(desc(count()));
}

export async function countReadinessFacts(
  db: DB,
  facilityId: string,
): Promise<{ hours: number; activeServices: number; bookableStaff: number }> {
  const [[hours], [activeServices], [bookableStaff]] = await Promise.all([
    db
      .select({ count: count() })
      .from(facilitySchedules)
      .where(eq(facilitySchedules.facilityId, facilityId)),
    db
      .select({ count: count() })
      .from(services)
      .where(and(eq(services.facilityId, facilityId), eq(services.isActive, true))),
    db
      .select({ count: count() })
      .from(staffMembers)
      .where(
        and(
          eq(staffMembers.facilityId, facilityId),
          eq(staffMembers.isActive, true),
          exists(
            db
              .select({ one: sql`1` })
              .from(staffServices)
              .where(eq(staffServices.staffMemberId, staffMembers.id)),
          ),
          exists(
            db
              .select({ one: sql`1` })
              .from(staffSchedules)
              .where(eq(staffSchedules.staffMemberId, staffMembers.id)),
          ),
        ),
      ),
  ]);

  return {
    hours: hours?.count ?? 0,
    activeServices: activeServices?.count ?? 0,
    bookableStaff: bookableStaff?.count ?? 0,
  };
}
export async function setFacilityPublished(
  db: DB,
  facilityId: string,
  isPublished: boolean,
): Promise<FacilityEntity | null> {
  const [res] =
    (await db
      .update(facilities)
      .set({
        isPublished: isPublished,
      })
      .where(eq(facilities.id, facilityId))
      .returning()) ?? null;
  return res;
}
export async function findFacilityBookingsPolicy(
  db: DB,
  facilityId: string,
): Promise<BookingPolicyResponse | null> {
  const [res] = await db
    .select({
      confirmationMode: facilities.confirmationMode,
      clientCancelCutoffMinutes: facilities.clientCancelCutoffMinutes,
      bookingLeadMinutes: facilities.bookingLeadMinutes,
      bookingHorizonDays: facilities.bookingHorizonDays,
    })
    .from(facilities)
    .where(eq(facilities.id, facilityId));
  return res ?? null;
}

export async function updateFacilityBookingsPolicy(
  db: DB,
  facilityId: string,
  payload: UpdateBookingPolicyRequest,
): Promise<BookingPolicyResponse | null> {
  const [res] = await db
    .update(facilities)
    .set(payload)
    .where(eq(facilities.id, facilityId))
    .returning();
  return res
    ? {
        confirmationMode: res.confirmationMode,
        clientCancelCutoffMinutes: res.clientCancelCutoffMinutes,
        bookingLeadMinutes: res.bookingLeadMinutes,
        bookingHorizonDays: res.bookingHorizonDays,
      }
    : null;
}
