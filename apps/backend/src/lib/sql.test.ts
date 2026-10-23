import { describe, expect, test } from "vitest";
import { escapeLike, containsPattern } from "./sql";

describe("escapeLike", () => {
  test("normal text does not change", () => {
    const input = "barber";
    const result = escapeLike(input);
    expect(result).toBe("barber");
  });

  test("wraps special characters", () => {
    expect(escapeLike("50%")).toBe("50\\%");
  });

 test("wraps underscore character", () => {
   expect(escapeLike("a_b")).toBe("a\\_b");
 });
});

describe("containsPattern", () => {
  test("wraps into % from two sides", () => {
    expect(containsPattern("cut")).toBe("%cut%");
  });
  test("wraps into % and wraps special characters from two sides", () => {
    expect(containsPattern("a_b")).toBe("%a\\_b%");
  });
});
