import type { FacilitySeed } from "./seed-data/facilities.ts";

export const KIND = {
  USER: 1,
  SERVICE: 2,
  STAFF_MEMBER: 3,
  BOOKING: 4,
  REVIEW: 5,
  FACILITY: 6,
} as const;

export function seedId(kind: number, index: number): string {
  const k = kind.toString(16).padStart(4, "0");
  const i = index.toString(16).padStart(12, "0");
  return `0000${k}-0000-4000-a000-${i}`;
}

export function facilityIdFor(seed: FacilitySeed, index: number): string {
  return seed.legacy?.id ?? seedId(KIND.FACILITY, index + 1);
}
