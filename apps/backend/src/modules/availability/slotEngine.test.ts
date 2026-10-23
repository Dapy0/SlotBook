import { describe, expect, test } from "vitest";
import { getBookingWindow } from "./slotEngine";
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
