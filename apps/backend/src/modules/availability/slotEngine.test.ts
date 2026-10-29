import { describe, expect, test } from "vitest";
import { computeDaySlots, getBookingWindow } from "./slotEngine";
const interval = (from: string, to: string) => ({
  start: new Date(`2026-11-02T${from}:00Z`),
  end: new Date(`2026-11-02T${to}:00Z`),
});
describe("getBookingWindow", () => {
  const NOW = new Date("2026-11-02T23:30:00Z");
  const WARSAW = "Europe/Warsaw";
  const HORIZON = 30;
  const LEAD = 60;
  test("firstDate is today in facility timezone (Warsaw is already Nov 3)", () => {
    expect(getBookingWindow(WARSAW, NOW, HORIZON, LEAD).firstDate).toBe("2026-11-03");
  });

  test("firstDate is today in facility timezone (New York is still Nov 2)", () => {
    expect(getBookingWindow("America/New_York", NOW, HORIZON, LEAD).firstDate).toBe("2026-11-02");
  });

  test("horizonDays = 1 → window is a single day", () => {
    const window = getBookingWindow(WARSAW, NOW, 1, LEAD);
    expect(window.firstDate).toBe("2026-11-03");
    expect(window.lastDate).toBe("2026-11-03");
  });

  test("horizonDays = 30 → lastDate is 29 days after firstDate, across month end", () => {
    expect(getBookingWindow(WARSAW, NOW, 30, LEAD).lastDate).toBe("2026-12-02");
  });

  test("earliestStart is exactly leadMinutes after now", () => {
    const window = getBookingWindow(WARSAW, NOW, HORIZON, 90);
    expect(window.earliestStart).toEqual(new Date("2026-11-03T01:00:00Z"));
  });
});
describe("computeDaySlots", () => {
  const base = {
    localDate: "2026-11-02",
    timeZone: "UTC",
    facilityRows: [{ dayOfTheWeek: 1, startTime: "10:00", endTime: "20:00" }],
    staffRows: [{ dayOfTheWeek: 1, startTime: "12:00", endTime: "14:00" }],
    busy: [],
    durationMinutes: 30,
    stepMinutes: 30,
    earliestStart: new Date("2026-11-02T00:00:00Z"),
  };

  test("slots come only from facility ∩ staff hours", () => {
    expect(computeDaySlots(base)).toEqual([
      interval("12:00", "12:30"),
      interval("12:30", "13:00"),
      interval("13:00", "13:30"),
      interval("13:30", "14:00"),
    ]);
  });

  test("earliestStart cuts earlier slots, a slot starting exactly at it stays", () => {
    const result = computeDaySlots({ ...base, earliestStart: new Date("2026-11-02T13:00:00Z") });
    expect(result).toEqual([interval("13:00", "13:30"), interval("13:30", "14:00")]);
  });

  test("service longer than working window → no slots", () => {
    const result = computeDaySlots({ ...base, durationMinutes: 121 });
    expect(result).toEqual([]);
  });

  test("busy booking removes the slots it overlaps", () => {
    const result = computeDaySlots({ ...base, busy: [interval("12:30", "13:00")] });
    expect(result).toEqual([
      interval("12:00", "12:30"),
      interval("13:00", "13:30"),
      interval("13:30", "14:00"),
    ]);
  });

  test("busy booking blocks every overlapping slot, but a slot that only touches it stays", () => {
    const result = computeDaySlots({
      ...base,
      durationMinutes: 60,
      busy: [interval("13:00", "13:30")],
    });
    expect(result).toEqual([interval("12:00", "13:00")]);
  });

  test("staff lunch break: two intervals on the same day, result sorted", () => {
    const result = computeDaySlots({
      ...base,
      staffRows: [
        { dayOfTheWeek: 1, startTime: "15:00", endTime: "16:00" },
        { dayOfTheWeek: 1, startTime: "10:00", endTime: "11:00" },
      ],
    });
    expect(result).toEqual([
      interval("10:00", "10:30"),
      interval("10:30", "11:00"),
      interval("15:00", "15:30"),
      interval("15:30", "16:00"),
    ]);
  });

  test("staff works on another weekday → no slots", () => {
    const result = computeDaySlots({
      ...base,
      staffRows: [{ dayOfTheWeek: 2, startTime: "12:00", endTime: "14:00" }],
    });
    expect(result).toEqual([]);
  });

  test("facility closed that day → no slots even if staff has hours", () => {
    expect(computeDaySlots({ ...base, facilityRows: [] })).toEqual([]);
  });

  test("staff hours outside facility hours are cut by facility", () => {
    const result = computeDaySlots({
      ...base,
      staffRows: [{ dayOfTheWeek: 1, startTime: "19:00", endTime: "22:00" }],
    });
    expect(result).toEqual([interval("19:00", "19:30"), interval("19:30", "20:00")]);
  });

  test("Warsaw: local wall time is converted to UTC (+1 in November)", () => {
    const result = computeDaySlots({
      ...base,
      timeZone: "Europe/Warsaw",
      facilityRows: [{ dayOfTheWeek: 1, startTime: "12:00", endTime: "13:00" }],
      staffRows: [{ dayOfTheWeek: 1, startTime: "12:00", endTime: "13:00" }],
    });
    expect(result).toEqual([interval("11:00", "11:30"), interval("11:30", "12:00")]);
  });

  test("DST end in Warsaw (25 Oct 2026): 01:00–05:00 local is 5 real hours", () => {
    const result = computeDaySlots({
      ...base,
      localDate: "2026-10-25",
      timeZone: "Europe/Warsaw",
      facilityRows: [{ dayOfTheWeek: 7, startTime: "01:00", endTime: "05:00" }],
      staffRows: [{ dayOfTheWeek: 7, startTime: "01:00", endTime: "05:00" }],
      durationMinutes: 60,
      stepMinutes: 60,
      earliestStart: new Date("2026-10-24T00:00:00Z"),
    });
    expect(result.map((s) => s.start.toISOString())).toEqual([
      "2026-10-24T23:00:00.000Z",
      "2026-10-25T00:00:00.000Z",
      "2026-10-25T01:00:00.000Z",
      "2026-10-25T02:00:00.000Z",
      "2026-10-25T03:00:00.000Z",
    ]);
  });
});
