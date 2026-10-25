import { describe, expect, test } from "vitest";
import { intersectIntervals, overlaps, type Interval } from "./availability.utils";
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
    // Arrange
    const a: Interval[] = [interval("10:00", "11:00")];
    const b: Interval[] = [interval("10:30", "11:30")];
    // Act
    const result = intersectIntervals(a, b);
    // Assert
    expect(result).toEqual([interval("10:30", "11:00")]);
  });
  test("returns empty array for disjoint intervals", () => {
    // Arrange
    const a: Interval[] = [interval("10:00", "11:00")];
    const b: Interval[] = [interval("12:00", "12:30")];
    // Act
    const result = intersectIntervals(a, b);
    // Assert
    expect(result).toEqual([]);
  });

  test("returns empty array when intervals only touch (A ends where B starts)", () => {
    // Arrange
    const a: Interval[] = [interval("10:00", "11:00")];
    const b: Interval[] = [interval("11:00", "12:00")];
    // Act
    const result = intersectIntervals(a, b);
    // Assert
    expect(result).toEqual([]);
  });
  test("returns empty array when intervals only touch (B ends where A starts)", () => {
    // Arrange
    const a: Interval[] = [interval("11:00", "12:00")];
    const b: Interval[] = [interval("10:00", "11:00")];
    // Act
    const result = intersectIntervals(a, b);
    // Assert
    expect(result).toEqual([]);
  });
  test("returns the inner interval when it lies inside the other", () => {
    // Arrange
    const a: Interval[] = [interval("10:00", "11:00")];
    const b: Interval[] = [interval("10:30", "10:40")];
    // Act
    const result = intersectIntervals(a, b);
    // Assert
    expect(result).toEqual([interval("10:30", "10:40")]);
  });
  test("returns the same interval for two identical intervals", () => {
    // Arrange
    const a: Interval[] = [interval("10:00", "11:00")];
    const b: Interval[] = [interval("10:00", "11:00")];
    // Act
    const result = intersectIntervals(a, b);
    // Assert
    expect(result).toEqual([interval("10:00", "11:00")]);
  });
  test("returns the same result regardless of argument order", () => {
    // Arrange
    const a: Interval[] = [interval("10:00", "11:00")];
    const b: Interval[] = [interval("10:00", "11:00")];
    // Act
    const result1 = intersectIntervals(a, b);
    const result2 = intersectIntervals(b, a);
    // Assert
    expect(result1).toEqual(result2);
  });
  test("returns empty array when given empty arrays", () => {
    // Arrange
    const a: Interval[] = [];
    const b: Interval[] = [];
    // Act
    const result = intersectIntervals(a, b);
    // Assert
    expect(result).toEqual([]);
  });
  test("returns each overlapping part when one interval in A covers several in B", () => {
    // Arrange
    const a: Interval[] = [interval("10:00", "12:00")];
    const b: Interval[] = [
      interval("10:00", "10:30"),
      interval("11:00", "11:30"),
      interval("12:00", "12:30"),
    ];
    // Act
    const result = intersectIntervals(a, b);
    // Assert
    expect(result).toEqual([interval("10:00", "10:30"), interval("11:00", "11:30")]);
  });
  test("removes duplicate intervals when input contains duplicates", () => {
    // Arrange
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
    // Act
    const result = intersectIntervals(a, b);
    // Assert
    expect(result).toEqual([
      interval("10:00", "10:30"),
      interval("11:00", "11:30"),
      interval("12:20", "12:30"),
    ]);
  });
  test("keeps adjacent result pieces separate (does not merge them)", () => {
    // Arrange
    const a: Interval[] = [interval("10:00", "12:00")];
    const b: Interval[] = [interval("10:30", "11:00"), interval("11:00", "11:30")];
    // Act
    const result = intersectIntervals(a, b);
    // Assert
    expect(result).toEqual([interval("10:30", "11:00"), interval("11:00", "11:30")]);
  });
});
