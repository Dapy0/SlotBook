import type { PoolConfig } from "pg";

export function sslFromUrl(url: string): PoolConfig["ssl"] {
  return url.includes("sslmode=require") ? { rejectUnauthorized: true } : false;
}
