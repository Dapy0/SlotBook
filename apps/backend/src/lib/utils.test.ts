import { describe, expect, test } from "vitest";
import { addDaysToIso, getIsoWeekDay, getLocalDayOfWeek, getLocalWallTime } from "./utils";

describe("getLocalWallTime", () => {
  test("return HH:MM format in timezone", () => {
    expect(getLocalWallTime(new Date("2026-10-28T10:00:00Z"), "Europe/Warsaw")).toBe("11:00");
  });
  test("return 24 hours format in timezone", () => {
    expect(getLocalWallTime(new Date("2026-10-28T14:00:00Z"), "Europe/Warsaw")).toBe("15:00");
  });
  test("return next day hours when late at night", () => {
    expect(getLocalWallTime(new Date("2026-10-28T23:00:00Z"), "Europe/Warsaw")).toBe("00:00");
  });
  test("work with changing DST", () => {
    expect(getLocalWallTime(new Date("2026-10-25T00:00:00Z"), "Europe/Warsaw")).toBe("02:00");
    expect(getLocalWallTime(new Date("2026-10-25T01:00:00Z"), "Europe/Warsaw")).toBe("02:00");
  });
});
describe("addDaysToIso", () => {
  test("throws Error when given wrong format", () => {
    expect(() => addDaysToIso("2026", 10)).toThrow("Invalid time value");
    expect(() => addDaysToIso("2026-10", 10)).toThrow("Invalid time value");
    expect(() => addDaysToIso("10-10", 10)).toThrow("Invalid time value");
    expect(() => addDaysToIso("10-10-2026", 10)).toThrow("Invalid time value");
    expect(() => addDaysToIso("10-10-1010", 10)).toThrow("Invalid time value");
  });
  test("add days to isoDate", () => {
    expect(addDaysToIso("2026-10-28", 2)).toBe("2026-10-30");
  });
  test("goes to next month when exceeding days in month", () => {
    expect(addDaysToIso("2026-10-28", 4)).toBe("2026-11-01");
  });
  test("goes to next year when exceeding days in December", () => {
    expect(addDaysToIso("2026-12-28", 4)).toBe("2027-01-01");
  });
});
describe("getLocalDayOfWeek", () => {
  test("get day of the week in Europe/Warsaw", () => {
    expect(getLocalDayOfWeek(new Date("2026-10-28T00:00:00Z"), "Europe/Warsaw")).toBe(3);
  });
  test("get day of the week in America/New_York", () => {
    expect(getLocalDayOfWeek(new Date("2026-10-28T00:00:00Z"), "America/New_York")).toBe(2);
  });
});

describe("getIsoWeekDay", () => {
  test("throws Error when given wrong format", () => {
    expect(() => getIsoWeekDay("2026")).toThrow("Invalid time value");
    expect(() => getIsoWeekDay("2026-10")).toThrow("Invalid time value");
    expect(() => getIsoWeekDay("10-10")).toThrow("Invalid time value");
    expect(() => getIsoWeekDay("10-10-2026")).toThrow("Invalid time value");
    expect(() => getIsoWeekDay("10-10-1010")).toThrow("Invalid time value");
  });
  test("get day of the week in Europe/Warsaw", () => {
    expect(getLocalDayOfWeek(new Date("2026-10-28"), "Europe/Warsaw")).toBe(3);
  });
  test("get day of the week in America/New_York", () => {
    expect(getLocalDayOfWeek(new Date("2026-10-28"), "America/New_York")).toBe(2);
  });
  test("return 7 for Sunday", () => {
    expect(getLocalDayOfWeek(new Date("2026-11-01"), "Europe/Warsaw")).toBe(7);
  });
  test("return 1 for Monday", () => {
    expect(getLocalDayOfWeek(new Date("2026-10-26"), "Europe/Warsaw")).toBe(1);
  });
});
