import { describe, expect, test } from "vitest";
import { getPageWindow } from "./pagination";

describe("getPageWindow", () => {
  describe("few pages: shows all, no ellipsis", () => {
    test("returns empty array when there are no pages", () => {
      expect(getPageWindow(1, 0)).toEqual([]);
    });
    test("single page", () => {
      expect(getPageWindow(1, 1)).toEqual([1]);
    });
    test("BOUNDARY: exactly 7 pages still shows all", () => {
      expect(getPageWindow(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });
  });

  describe("many pages: window with ellipsis", () => {
    test("BOUNDARY: 8 pages switches to ellipsis", () => {
      expect(getPageWindow(1, 8)).toEqual([1, 2, 3, 4, 5, "…", 8]);
    });

    test("BOUNDARY: current = 4 is still the 'start' window", () => {
      expect(getPageWindow(4, 12)).toEqual([1, 2, 3, 4, 5, "…", 12]);
    });
    test("BOUNDARY: current = 5 moves to the 'middle' window", () => {
      expect(getPageWindow(5, 12)).toEqual([1, "…", 4, 5, 6, "…", 12]);
    });

    test("middle: neighbors on both sides", () => {
      expect(getPageWindow(6, 12)).toEqual([1, "…", 5, 6, 7, "…", 12]);
    });

    test("BOUNDARY: current = total - 4 is still 'middle'", () => {
      expect(getPageWindow(8, 12)).toEqual([1, "…", 7, 8, 9, "…", 12]);
    });
    test("BOUNDARY: current = total - 3 moves to the 'end' window", () => {
      expect(getPageWindow(9, 12)).toEqual([1, "…", 8, 9, 10, 11, 12]);
    });
    test("last page", () => {
      expect(getPageWindow(12, 12)).toEqual([1, "…", 8, 9, 10, 11, 12]);
    });
  });

  describe("unexpected input", () => {
    test("current beyond totalPages behaves like the last page", () => {
      expect(getPageWindow(50, 12)).toEqual([1, "…", 8, 9, 10, 11, 12]);
    });
  });
});
