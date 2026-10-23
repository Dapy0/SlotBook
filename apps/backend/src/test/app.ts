import type { FastifyInstance } from "fastify";
import { createServer } from "../app";
import type { FileStorage } from "../lib/storage/FileStorage";

export class InMemoryStorage implements FileStorage {
  files = new Map<string, { data: Buffer; contentType: string }>();
  async save(key: string, data: Buffer, contentType: string) {
    this.files.set(key, { data, contentType });
  }
  async delete(key: string) {
    this.files.delete(key);
  }
}

export async function buildTestApp() {
  const storage = new InMemoryStorage();
  const app = await createServer({ storage });
  await app.ready();
  return { app, storage };
}

export async function registerAndLogin(
  app: FastifyInstance,
  overrides: Partial<{ name: string; email: string; password: string }> = {},
) {
  const payload = {
    name: "Test User",
    email: `user-${crypto.randomUUID()}@test.com`,
    password: "password123",
    ...overrides,
  };
  const res = await app.inject({ method: "POST", url: "/auth/register", payload });
  if (res.statusCode !== 201) throw new Error(`register failed: ${res.body}`);
  const token = res.cookies.find((c) => c.name === "token")!.value;
  return { user: res.json().user as { id: string; email: string }, cookies: { token } };
}
