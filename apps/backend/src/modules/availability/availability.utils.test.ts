import { describe, expect, test } from "vitest";
import {
  intersectIntervals,
  mergeIntervals,
  overlaps,
  sliceIntoSlots,
  type Interval,
} from "./availability.utils";
const at = (hhmm: string) => new Date(`2026-11-02T${hhmm}:00Z`);
const interval = (from: string, to: string) => ({ start: at(from), end: at(to) });

describe("overlaps", () => {
  test("returns true for partially overlapping intervals", () => {
    expect(overlaps(interval("10:00", "11:00"), interval("10:30", "11:30"))).toBe(true);
  });
  test("returns true when one interval lies inside another", () => {
    expect(overlaps(interval("10:00", "11:00"), interval("10:30", "10:40"))).toBe(true);
  });
  test("returns false when intervals only touch", () => {
    expect(overlaps(interval("10:00", "11:00"), interval("11:00", "12:00"))).toBe(false);
  });
  test("returns false for disjoint intervals", () => {
    expect(overlaps(interval("10:00", "11:00"), interval("12:00", "13:00"))).toBe(false);
  });
  test("returns the same result regardless of argument order", () => {
    expect(overlaps(interval("10:00", "11:00"), interval("12:00", "13:00"))).toBe(
      overlaps(interval("12:00", "13:00"), interval("10:00", "11:00")),
    );
  });
  test("returns false when intervals touch with (B end and A start)", () => {
    expect(overlaps(interval("11:00", "12:00"), interval("10:00", "11:00"))).toBe(false);
  });
  test("returns true when given two identical intervals", () => {
    expect(overlaps(interval("11:00", "12:00"), interval("11:00", "12:00"))).toBe(true);
  });
});

describe("intersectIntervals", () => {
  test("returns the overlapping part of two partially overlapping intervals", () => {
    const a: Interval[] = [interval("10:00", "11:00")];
    const b: Interval[] = [interval("10:30", "11:30")];

    const result = intersectIntervals(a, b);

    expect(result).toEqual([interval("10:30", "11:00")]);
  });
  test("returns empty array for disjoint intervals", () => {
    const a: Interval[] = [interval("10:00", "11:00")];
    const b: Interval[] = [interval("12:00", "12:30")];

    const result = intersectIntervals(a, b);

    expect(result).toEqual([]);
  });

  test("returns empty array when intervals only touch (A ends where B starts)", () => {
    const a: Interval[] = [interval("10:00", "11:00")];
    const b: Interval[] = [interval("11:00", "12:00")];

    const result = intersectIntervals(a, b);

    expect(result).toEqual([]);
  });
  test("returns empty array when intervals only touch (B ends where A starts)", () => {
    const a: Interval[] = [interval("11:00", "12:00")];
    const b: Interval[] = [interval("10:00", "11:00")];

    const result = intersectIntervals(a, b);

    expect(result).toEqual([]);
  });
  test("returns the inner interval when it lies inside the other", () => {
    const a: Interval[] = [interval("10:00", "11:00")];
    const b: Interval[] = [interval("10:30", "10:40")];

    const result = intersectIntervals(a, b);

    expect(result).toEqual([interval("10:30", "10:40")]);
  });
  test("returns the same interval for two identical intervals", () => {
    const a: Interval[] = [interval("10:00", "11:00")];
    const b: Interval[] = [interval("10:00", "11:00")];

    const result = intersectIntervals(a, b);

    expect(result).toEqual([interval("10:00", "11:00")]);
  });
  test("returns the same result regardless of argument order", () => {
    const a: Interval[] = [interval("10:00", "11:00")];
    const b: Interval[] = [interval("10:00", "11:00")];

    const result1 = intersectIntervals(a, b);
    const result2 = intersectIntervals(b, a);

    expect(result1).toEqual(result2);
  });
  test("returns empty array when given empty arrays", () => {
    const a: Interval[] = [];
    const b: Interval[] = [];

    const result = intersectIntervals(a, b);

    expect(result).toEqual([]);
  });
  test("returns each overlapping part when one interval in A covers several in B", () => {
    const a: Interval[] = [interval("10:00", "12:00")];
    const b: Interval[] = [
      interval("10:00", "10:30"),
      interval("11:00", "11:30"),
      interval("12:00", "12:30"),
    ];

    const result = intersectIntervals(a, b);

    expect(result).toEqual([interval("10:00", "10:30"), interval("11:00", "11:30")]);
  });
  test("removes duplicate intervals when input contains duplicates", () => {
    const a: Interval[] = [
      interval("10:00", "12:00"),
      interval("11:00", "11:30"),
      interval("12:20", "14:00"),
    ];
    const b: Interval[] = [
      interval("10:00", "10:30"),
      interval("11:00", "11:30"),
      interval("12:00", "12:30"),
    ];

    const result = intersectIntervals(a, b);

    expect(result).toEqual([
      interval("10:00", "10:30"),
      interval("11:00", "11:30"),
      interval("12:20", "12:30"),
    ]);
  });
  test("keeps adjacent result pieces separate (does not merge them)", () => {
    const a: Interval[] = [interval("10:00", "12:00")];
    const b: Interval[] = [interval("10:30", "11:00"), interval("11:00", "11:30")];

    const result = intersectIntervals(a, b);

    expect(result).toEqual([interval("10:30", "11:00"), interval("11:00", "11:30")]);
  });
});
describe("mergeIntervals", () => {
  test("returns a single interval when intervals overlap", () => {
    const a: Interval[] = [interval("10:00", "12:00"), interval("11:59", "13:00")];

    const result = mergeIntervals(a);

    expect(result).toEqual([interval("10:00", "13:00")]);
  });
  test("keeps touching intervals separate", () => {
    const a: Interval[] = [interval("10:00", "12:00"), interval("12:00", "13:00")];

    const result = mergeIntervals(a);

    expect(result).toEqual([interval("10:00", "12:00"), interval("12:00", "13:00")]);
  });
  test("keeps disjoint intervals unchanged", () => {
    const a: Interval[] = [interval("10:00", "12:00"), interval("12:30", "13:00")];

    const result = mergeIntervals(a);

    expect(result).toEqual([interval("10:00", "12:00"), interval("12:30", "13:00")]);
  });
  test("returns empty array when given empty array", () => {
    const a: Interval[] = [];

    const result = mergeIntervals(a);

    expect(result).toEqual([]);
  });
  test("returns the outer interval when one contains another", () => {
    const a: Interval[] = [interval("10:00", "12:00"), interval("10:30", "11:00")];

    const result = mergeIntervals(a);

    expect(result).toEqual([interval("10:00", "12:00")]);
  });
  test("sorts intervals by start time", () => {
    const a: Interval[] = [interval("10:30", "14:00"), interval("10:00", "10:30")];

    const result = mergeIntervals(a);

    expect(result).toEqual([interval("10:00", "10:30"), interval("10:30", "14:00")]);
  });
  test("merges a chain where each interval overlaps the previously merged one", () => {
    const a: Interval[] = [
      interval("10:00", "13:00"),
      interval("09:30", "13:30"),
      interval("09:00", "15:00"),
    ];

    const result = mergeIntervals(a);

    expect(result).toEqual([interval("09:00", "15:00")]);
  });
  test("ignores intervals with start after end and keeps valid ones", () => {
    const a: Interval[] = [interval("14:00", "10:00"), interval("09:00", "15:00")];

    const result = mergeIntervals(a);

    expect(result).toEqual([interval("09:00", "15:00")]);
  });
  test("returns a single interval for identical intervals", () => {
    const a: Interval[] = [interval("09:00", "15:00"), interval("09:00", "15:00")];

    const result = mergeIntervals(a);

    expect(result).toEqual([interval("09:00", "15:00")]);
  });
  test("ignores intervals with start equal to end", () => {
    const a: Interval[] = [interval("09:00", "09:00")];

    const result = mergeIntervals(a);

    expect(result).toEqual([]);
  });
});
describe("sliceIntoSlots", () => {
  test("returns slots when given 30-min duration and step → back-to-back slots", () => {
    const result = sliceIntoSlots(interval("09:00", "10:00"), 30, 30);
    expect(result).toEqual([interval("09:00", "09:30"), interval("09:30", "10:00")]);
  });

  test("returns empty array when interval does not fit durationMinutes", () => {
    const result = sliceIntoSlots(interval("09:00", "09:30"), 31, 30);
    expect(result).toEqual([]);
  });
  test("returns exactly one slot when given 30 min duration out of 30 minutes gap", () => {
    const result = sliceIntoSlots(interval("09:00", "09:30"), 30, 30);
    expect(result).toEqual([interval("09:00", "09:30")]);
  });
  test("returns slots when step longer than duration → gaps between slots", () => {
    const result = sliceIntoSlots(interval("09:00", "11:30"), 30, 45);
    expect(result).toEqual([
      interval("09:00", "09:30"),
      interval("09:45", "10:15"),

      interval("10:30", "11:00"),
    ]);
  });
  test("returns slots when duration longer than step → overlapping slots", () => {
    const result = sliceIntoSlots(interval("09:00", "11:00"), 30, 15);
    expect(result).toEqual([
      interval("09:00", "09:30"),
      interval("09:15", "09:45"),
      interval("09:30", "10:00"),
      interval("09:45", "10:15"),
      interval("10:00", "10:30"),
      interval("10:15", "10:45"),
      interval("10:30", "11:00"),
    ]);
  });
});
