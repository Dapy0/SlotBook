import z from "zod";
import { describe, expect, test } from "vitest";
import { reviewRequestSchema, reviewResponseSchema, type ReviewResponse } from "./reviews";

describe("Review Request", () => {
  const fixture = { rating: 5, comment: "Great service" };

  test("accepts review with comment", () => {
    expect(reviewRequestSchema.safeParse(fixture).success).toBe(true);
  });
  test("accepts review without comment", () => {
    expect(reviewRequestSchema.safeParse({ rating: 5 }).success).toBe(true);
  });
  test.each([1, 5])("accepts boundary rating %i", (rating) => {
    expect(reviewRequestSchema.safeParse({ rating }).success).toBe(true);
  });
});

describe("Review Response", () => {
  const fixture: z.input<typeof reviewResponseSchema> = {
    id: "dc752901-46a1-4727-b0d1-1952550ef1f1",
    staffMemberName: "Anna",
    serviceName: "Haircut",
    rating: 5,
    comment: "Great service",
    createdAt: "2026-08-12T12:29:59.998Z",
  };

  test("decodes createdAt into Date", () => {
    const r = reviewResponseSchema.parse(fixture);
    expect(r.createdAt).toBeInstanceOf(Date);
    expect(r.createdAt.toISOString()).toBe(fixture.createdAt);
  });

  test("encodes back to the exact wire format", () => {
    const decoded = reviewResponseSchema.parse(fixture);
    expect(z.encode(reviewResponseSchema, decoded)).toEqual(fixture);
  });

  test("rejects comment: null", () => {
    const r = reviewResponseSchema.safeParse({ ...fixture, comment: null });
    expect(r.success).toBe(false);
  });

 
});
