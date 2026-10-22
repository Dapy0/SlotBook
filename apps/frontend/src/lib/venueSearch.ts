import {
  facilitySearchQuerySchema,
  SEARCH_PAGE_SIZE,
  type FacilitySearchQuery,
} from "@slotbook/shared";
import { CATEGORY_BY_SLUG, CATEGORY_METADATA } from "@/app/(main)/_common/types";
import { createParams } from "@/lib/queryStrings";

const venueSearchSchema = facilitySearchQuerySchema.omit({ country: true });
export type VenueSearch = Omit<FacilitySearchQuery, "country">;
type RawSearchParams = Record<string, string | string[] | undefined>;

export function parseVenueSearch(raw: RawSearchParams): VenueSearch {
  const flat: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined && first !== "") flat[key] = first;
  }
  if (flat.category !== undefined) {
    const name = CATEGORY_BY_SLUG[flat.category];
    if (name) flat.category = name;
    else delete flat.category;
  }

  const result = venueSearchSchema.safeParse(flat);
  if (result.success) return result.data;

  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string") delete flat[key];
  }
  return venueSearchSchema.parse(flat);
}

export function toVenuesHref(search: Partial<VenueSearch>): string {
  const qs = createParams({
    q: search.q,
    city: search.city,
    category: search.category ? CATEGORY_METADATA[search.category].slug : undefined,
    rating: search.rating,
    priceMax: search.priceMax,
    sort: search.sort === "recommended" ? undefined : search.sort,
    page: search.page === 1 ? undefined : search.page,
    pageSize: search.pageSize === SEARCH_PAGE_SIZE ? undefined : search.pageSize,
  });
  return qs ? `/venues?${qs}` : "/venues";
}

const PRICE_STEP_CANDIDATES = [2000, 3000, 5000, 8000, 10000, 15000, 20000, 30000, 50000, 100000];

export function priceSteps(minCents: number, maxCents: number, limit = 4): number[] {
  const inside = PRICE_STEP_CANDIDATES.filter((step) => step > minCents && step < maxCents);
  if (inside.length <= limit) return inside;
  return Array.from(
    { length: limit },
    (_, i) => inside[Math.round((i * (inside.length - 1)) / (limit - 1))]!,
  );
}
