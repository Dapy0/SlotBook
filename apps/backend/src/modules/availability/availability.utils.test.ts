import { describe, expect, test } from "vitest";
import { overlaps } from "./availability.utils";
const at = (hhmm: string) => new Date(`2026-11-02T${hhmm}:00Z`);
const interval = (from: string, to: string) => ({ start: at(from), end: at(to) });

describe("overlaps", () => {
  test("half intersection", () => {
    expect(overlaps(interval("10:00", "11:00"), interval("10:30", "11:30"))).toBe(true);
  });
  test("one into another", () => {
    expect(overlaps(interval("10:00", "11:00"), interval("10:30", "10:40"))).toBe(true);
  });
  test("no overlaps on boundaries", () => {
    expect(overlaps(interval("10:00", "11:00"), interval("11:00", "12:00"))).toBe(false);
  });
  test("no overlaps", () => {
    expect(overlaps(interval("10:00", "11:00"), interval("12:00", "13:00"))).toBe(false);
  });
});
