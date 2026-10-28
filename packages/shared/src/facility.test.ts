import { describe, test, expect } from "vitest";
import * as z from "zod";
import {
  facilityCategoryQuerySchema,
  facilitySearchQuerySchema,
  SEARCH_MAX_PAGE_SIZE,
  SEARCH_PAGE_SIZE,
} from "./facility";

describe("facilityCategoryQuerySchema", () => {
  test("accepts country without limit", () => {
    const facilityCategoryQueryMock: z.input<typeof facilityCategoryQuerySchema> = {
      country: "MD",
    };
    const r = facilityCategoryQuerySchema.safeParse(facilityCategoryQueryMock);
    expect(r.success).toBe(true);
  });
  test("coerce limit from URL string to number", () => {
    const facilityCategoryQueryMock: z.input<typeof facilityCategoryQuerySchema> = {
      country: "MD",
      limit: "10",
    };
    const r = facilityCategoryQuerySchema.parse(facilityCategoryQueryMock);
    expect(r).toEqual({
      country: "MD",
      limit: 10,
    });
  });
  test("BOUNDARY: limit = 0 is allowed", () => {
    expect(facilityCategoryQuerySchema.safeParse({ country: "MD", limit: "0" }).success).toBe(true);
  });

  test("rejects negative limit", () => {
    const facilityCategoryQueryMock: z.input<typeof facilityCategoryQuerySchema> = {
      country: "MD",
      limit: "-10",
    };
    const r = facilityCategoryQuerySchema.safeParse(facilityCategoryQueryMock);
    expect(r.success).toBe(false);
  });
});
describe("facilitySearchQuerySchema", () => {
  const parse = (query: Record<string, string>) =>
    facilitySearchQuerySchema.parse({ country: "MD", ...query });

  const isValid = (query: Record<string, string>) =>
    facilitySearchQuerySchema.safeParse({ country: "PL", ...query }).success;

  test("coerces every URL string into its real type", () => {
    expect(
      parse({
        category: "AUTO",
        city: "Chisinau",
        page: "1",
        pageSize: "20",
        priceMax: "120",
        q: "machines",
        rating: "4",
        sort: "newest",
      }),
    ).toEqual({
      country: "MD",
      category: "AUTO",
      city: "Chisinau",
      page: 1,
      pageSize: 20,
      priceMax: 120,
      q: "machines",
      rating: 4,
      sort: "newest",
    });
  });
  test("applies defaults when only country is given", () => {
    expect(facilitySearchQuerySchema.parse({ country: "MD" })).toEqual({
      country: "MD",
      page: 1,
      pageSize: SEARCH_PAGE_SIZE,
      sort: "recommended",
    });
  });

  test("trims q", () => {
    expect(parse({ q: "  barber  " }).q).toBe("barber");
  });

  test("rejects non-numeric rating", () => {
    expect(isValid({ rating: "abc" })).toBe(false);
  });

  test("rejects rating above 5", () => {
    expect(isValid({ rating: "5.1" })).toBe(false);
  });

  test("BOUNDARY: pageSize = max is allowed", () => {
    expect(isValid({ pageSize: String(SEARCH_MAX_PAGE_SIZE) })).toBe(true);
  });

  test("BOUNDARY: pageSize = max + 1 is rejected", () => {
    expect(isValid({ pageSize: String(SEARCH_MAX_PAGE_SIZE + 1) })).toBe(false);
  });

  test("rejects unknown sort", () => {
    expect(isValid({ sort: "cheapest" })).toBe(false);
  });
});
