import { asc, desc, sql, type SQL } from "drizzle-orm";
import { facilities, services } from "../../db/schema";
import type { FacilitySort } from "@slotbook/shared";

export const minPriceCents = sql<number | null>`(
  select min(${services.priceCents})
  from ${services}
  where ${services.facilityId} = ${facilities.id}
    and ${services.isActive} = true
)`;

const BAYES_M = 5;
const BAYES_C = 4.0;

const bayesianScore = sql<number>`(
  coalesce(${facilities.score}, 0) * ${facilities.reviewsCount}
  + ${BAYES_C}::numeric * ${BAYES_M}::int
) / (${facilities.reviewsCount} + ${BAYES_M}::int)`;

const scoreDescNullsLast = sql`${facilities.score} desc nulls last`;

export const ORDER_BY: Record<FacilitySort, SQL[]> = {
  recommended: [sql`${bayesianScore} desc`, desc(facilities.reviewsCount), asc(facilities.id)],
  rating: [scoreDescNullsLast, desc(facilities.reviewsCount), asc(facilities.id)],
  reviews: [desc(facilities.reviewsCount), scoreDescNullsLast, asc(facilities.id)],
  priceAsc: [sql`${minPriceCents} asc nulls last`, asc(facilities.id)],
  priceDesc: [sql`${minPriceCents} desc nulls last`, asc(facilities.id)],
  newest: [desc(facilities.createdAt), desc(facilities.id)],
};
