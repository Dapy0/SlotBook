import { describe, test, expect } from "vitest";
import { addDaysToString, todayInTimeZone } from "./dates";
describe("addDaysToIso", () => {
  const DATE = `2026-10-26`;
  test("return same date when adding 0 days", () => {
    expect(addDaysToString(DATE, 0)).toBe(DATE);
  });
  test("return date + adding days", () => {
    expect(addDaysToString(DATE, 10)).toBe(`2026-11-05`);
  });
  test("throws when date does not math YYYY-mm-dd", () => {
    expect(() => addDaysToString(`12-10-26`, 10)).toThrow(`Wrong format. Need to be YYYY-mm-dd`);
  });
  test("throws when given negative amount", () => {
    expect(() => addDaysToString(DATE, -1)).toThrow(`Amount of adding days must be positive`);
  });
});
describe("todayInTimeZone", () => {
  test("return YYYY-mm-dd format of date in timezone", () => {
    const date = new Date("2026-11-02T00:00:00Z");
    expect(todayInTimeZone("Europe/Warsaw", date)).toBe("2026-11-02");
  });
  test("return YYYY-mm-dd format of date in Europe/Warsaw timezone", () => {
    const date = new Date("2026-11-02T00:00:00Z");
    expect(todayInTimeZone("Europe/Warsaw", date)).toBe("2026-11-02");
  });
  test("return YYYY-mm-dd format of date in America/New_York timezone", () => {
    const date = new Date("2026-11-02T00:00:00Z");
    expect(todayInTimeZone("America/New_York", date)).toBe("2026-11-01");
  });
  test("throws error when given non-existing timezone", () => {
    const date = new Date("2026-11-02T00:00:00Z");
    expect(() => todayInTimeZone("America/erq", date)).toThrow("No such America/erq was found");
  });
});
