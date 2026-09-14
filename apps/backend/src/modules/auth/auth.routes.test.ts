import { startTestDatabase, stopTestDatabase } from "../../test/setup.ts";
import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { createServer } from "../../app.ts";
import { afterEach } from "vitest";
import { users } from "../../db/schema/user.ts";

let app: FastifyInstance;

beforeAll(async () => {
  await startTestDatabase();
  app = await createServer();
});
afterEach(async () => {
  await app.drizzle.delete(users);
});

afterAll(async () => {
  await app.close();
  await stopTestDatabase();
});


describe("POST auth/register", () => {
  test("create users and returns status code 201 and set httOnly cookie with token", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: { name: "Test", email: "test@test.com", password: "password123" },
    });
    expect(response.statusCode).toBe(201);

    const body = response.json();

    expect(body.user).toMatchObject({
      id: expect.any(String),
      email: "test@test.com",
      name: "Test",
    });
    expect(body.user).not.toHaveProperty(["passwordHash", "password"]);

    const setCookie = response.headers["set-cookie"]?.toString() ?? "";
    expect(setCookie).toContain("token=");
    expect(setCookie).toContain("HttpOnly");
  });
  test("rejects second registration with same email and returns 409", async () => {
    await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: { name: "Test", email: "test@test.com", password: "password123" },
    });
    const response = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: { name: "Test", email: "test@test.com", password: "password123" },
    });
    expect(response.statusCode).toBe(409);
  });
  test("rejects invalid email", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: { name: "Test", email: "test", password: "password123" },
    });

    expect(response.statusCode).toBe(400);
  });
});

describe("POST auth/login", () => {
  const credentials = { email: "test@test.com", password: "password123" };

  beforeAll(async () => {
    await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: { name: "Test", ...credentials },
    });
  });

  test("login with valid data", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: credentials,
    });
    expect(response.statusCode).toBe(200);

    const body = response.json();

    expect(body.user).toMatchObject({
      id: expect.any(String),
      email: "test@test.com",
      name: "Test",
    });
    expect(body.user).not.toHaveProperty(["passwordHash", "password"]);

    expect(response.headers["set-cookie"]).toBeDefined();
  });
  test("rejects wrong password and returns 401", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { ...credentials, password: "Wrongpassword" },
    });

    expect(response.statusCode).toBe(401);
  });
  test("rejects user that doesn't exists with 404", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: "test@gmail.com", password: "password123" },
    });

    expect(response.statusCode).toBe(404);
  });
});
describe("GET /auth/me", () => {
  test("returns 401 without cookie", async () => {
    const response = await app.inject({ method: "GET", url: "/auth/me" });
    expect(response.statusCode).toBe(401);
  });
  test("returns users data with valid cookies", async () => {
    const credentials = { email: "test@test.com", password: "password123" };
    const registerResponse = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: { name: "Test", ...credentials },
    });
    const loginResponse = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: credentials,
    });
    expect(loginResponse.statusCode).toBe(200);
    const body = loginResponse.json();
    expect(body.user).toMatchObject({
      id: expect.any(String),
      email: "test@test.com",
    });
    expect(body.user).not.toHaveProperty(["passwordHash", "password"]);
  });
});
