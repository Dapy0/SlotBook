export const PG = {
  UNIQUE: "23505",
  FK: "23503",
  EXCLUSION: "23P01",
  CHECK: "23514",
} as const;

export function getPgErrorCode(e: unknown): string | undefined {
  const err = e as { code?: unknown; cause?: { code?: unknown } } | null;
  const code = err?.cause?.code ?? err?.code;
  return typeof code === "string" ? code : undefined;
}
