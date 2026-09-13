import { describe, expect, test } from "vitest";
import { authResponseSchema, loginSchema, registerSchema } from "@slotbook/shared/auth";

const validPayload = {
  name: "Test",
  email: "test@test.com",
  password: "Testpassword1",
};

describe("RegisterRequest", () => {
  test("accepts valid data", () => {
    expect(registerSchema.safeParse(validPayload).success).toBe(true);
  });
});

describe("LoginRequest", () => {
  test("accepts valid data", () => {
    expect(
      loginSchema.safeParse({ email: validPayload.email, password: validPayload.password }).success,
    ).toBe(true);
  });
  test("rejects invalid data", () => {
    expect(loginSchema.safeParse({ password: validPayload.password }).success).toBe(false);
  });
});
describe("AuthResponseDTO", () => {
  test("accepts server auth response", () => {
    const fixture = {
      user: {
        id: "dc752901-46a1-4727-b0d1-1952550ef1f1",
        name: "Test",
        email: "test@test.test",

        createdAt: "2026-08-12T12:29:59.998Z",
        updatedAt: "2026-08-12T12:29:59.998Z",
      },
    };
    expect(authResponseSchema.safeParse(fixture).success).toBe(true);
  });
});
