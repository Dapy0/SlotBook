import { describe, test, expect } from "vitest";
import { canClientCancel, type BookingStatus } from "./bookings";
const booking = (status: BookingStatus, cancelableUntil: Date) => ({ status, cancelableUntil });
const DEADLINE = new Date("2026-11-02T10:00:00Z");
const MINUTE = 60_000;
const at = (minutesFromDeadline: number) =>
  new Date(DEADLINE.getTime() + minutesFromDeadline * MINUTE);

describe("canClientCancel", () => {
  test("confirmed, one hour before deadline → can cancel", () => {
    expect(canClientCancel(booking("confirmed", DEADLINE), at(-60))).toBe(true);
  });

  test("BOUNDARY: exactly at deadline → cannot cancel", () => {
    expect(canClientCancel(booking("confirmed", DEADLINE), at(0))).toBe(false);
  });

  test("BOUNDARY: one minute after deadline → cannot cancel", () => {
    expect(canClientCancel(booking("confirmed", DEADLINE), at(1))).toBe(false);
  });

  test("confirmed, one hour after deadline → cannot cancel", () => {
    expect(canClientCancel(booking("confirmed", DEADLINE), at(60))).toBe(false);
  });

  test("already canceled, deadline still ahead → cannot cancel again", () => {
    expect(canClientCancel(booking("canceled", DEADLINE), at(-60))).toBe(false);
  });
   test("pending, one hour before deadline → can cancel", () => {
     expect(canClientCancel(booking("pending", DEADLINE), at(-60))).toBe(true);
   });

});
