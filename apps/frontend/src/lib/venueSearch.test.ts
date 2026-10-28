import { describe, expect, test } from "vitest";
import { SEARCH_PAGE_SIZE } from "@slotbook/shared";
import { parseVenueSearch, toVenuesHref } from "@/lib/venueSearch";

const DEFAULTS = { page: 1, pageSize: SEARCH_PAGE_SIZE, sort: "recommended" } as const;

describe("parseVenueSearch", () => {
  test("coerces URL strings into typed values", () => {
    expect(
      parseVenueSearch({ page: "3", pageSize: "10", q: "barber", city: "Warsaw", sort: "newest" }),
    ).toEqual({ page: 3, pageSize: 10, q: "barber", city: "Warsaw", sort: "newest" });
  });

  test("applies defaults when params are missing", () => {
    expect(parseVenueSearch({})).toEqual(DEFAULTS);
  });

  test("invalid value falls back to default, other params survive", () => {
    expect(parseVenueSearch({ page: "-1", city: "Warsaw" })).toEqual({
      ...DEFAULTS,
      city: "Warsaw",
    });
  });

  test("invalid optional value is dropped", () => {
    expect(parseVenueSearch({ rating: "abc" })).toEqual(DEFAULTS);
  });

  test("unknown keys are dropped", () => {
    expect(parseVenueSearch({ utm_source: "google" })).toEqual(DEFAULTS);
  });

  test("repeated param takes the first value", () => {
    expect(parseVenueSearch({ city: ["Warsaw", "Krakow"] }).city).toBe("Warsaw");
  });

  test("empty string is treated as missing", () => {
    expect(parseVenueSearch({ q: "" })).toEqual(DEFAULTS);
  });

  test("category slug is mapped to enum value", () => {
    expect(parseVenueSearch({ category: "sport-fitness" }).category).toBe("SPORT_FITNESS");
  });

  test("unknown category slug is dropped", () => {
    expect(parseVenueSearch({ category: "pizza" })).toEqual(DEFAULTS);
  });
});

describe("toVenuesHref", () => {
  test("no filters → bare /venues", () => {
    expect(toVenuesHref({})).toBe("/venues");
  });

  test("puts filters into query string", () => {
    expect(toVenuesHref({ city: "Warsaw", pageSize: 10 })).toBe("/venues?city=Warsaw&pageSize=10");
  });

  test("omits default values", () => {
    expect(toVenuesHref({ city: "Warsaw", ...DEFAULTS })).toBe("/venues?city=Warsaw");
  });

  test("category enum is written as slug", () => {
    expect(toVenuesHref({ category: "SPORT_FITNESS" })).toBe("/venues?category=sport-fitness");
  });

  test("round-trip: parse(href(search)) returns the same search", () => {
    const search = parseVenueSearch({
      q: "cut",
      city: "Krakow",
      category: "beauty",
      rating: "4",
      priceMax: "8000",
      sort: "priceAsc",
      page: "2",
      pageSize: "24",
    });
    const query = toVenuesHref(search).split("?")[1];
    const raw = Object.fromEntries(new URLSearchParams(query));

    expect(parseVenueSearch(raw)).toEqual(search);
  });
});
