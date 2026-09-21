import { describe, expect, test } from "vitest";
import { authResponseSchema, loginRequestSchema, registerRequestSchema } from "@slotbook/shared";
import * as z from "zod";

const validPayload = {
  name: "Test",
  email: "test@test.com",
  password: "Testpassword1",
};

describe("RegisterRequest", () => {
  test("accepts valid data", () => {
    expect(registerRequestSchema.safeParse(validPayload).success).toBe(true);
  });
});

describe("LoginRequest", () => {
  test("accepts valid data", () => {
    expect(
      loginRequestSchema.safeParse({ email: validPayload.email, password: validPayload.password }).success,
    ).toBe(true);
  });
  test("rejects invalid data", () => {
    expect(loginRequestSchema.safeParse({ password: validPayload.password }).success).toBe(false);
  });
});
type AuthWire = z.input<typeof authResponseSchema>;
type AuthDomain = z.output<typeof authResponseSchema>;

describe("AuthResponse", () => {
  const fixture: AuthWire = {
    user: {
      id: "dc752901-46a1-4727-b0d1-1952550ef1f1",
      name: "Test",
      email: "test@test.test",
      timezone: "Europe/Warsaw",
      createdAt: "2026-08-12T12:29:59.998Z",
      updatedAt: "2026-08-12T12:29:59.998Z",
    },
  };
  test("decodes ISO string into date", () => {
    const result = authResponseSchema.safeParse(fixture);
    expect(result.success).toBe(true);
    if (!result.success) return; // сужение типа

    const { user } = result.data;
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.createdAt.getTime()).toBe(Date.parse("2026-08-12T12:29:59.998Z"));
    expect(user.updatedAt.getTime()).toBe(Date.parse("2026-08-12T12:29:59.998Z"));
  });
  test("encodes back to exact wire format", () => {
    const decoded: AuthDomain = authResponseSchema.parse(fixture);
    const encoded = z.encode(authResponseSchema, decoded);
    expect(encoded).toEqual(fixture);
  });
  test("rejects non ISO date string", () => {
    const bad = { user: { ...fixture.user, createdAt: "12/08/2026" } };
    expect(authResponseSchema.safeParse(bad).success).toBe(false);
  });
  test("rejects a Date object on the wire side", () => {
    const bad = { user: { ...fixture.user, createdAt: new Date() } };
    expect(authResponseSchema.safeParse(bad).success).toBe(false);
  });
});
