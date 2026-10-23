import { describe, test, expect } from "vitest";
import {
  BOOKING_STATUSES,
  canClientCancel,
  checkTransition,
  type Actors,
  type BookingStatus,
} from "./bookings";
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

const ACTORS = ["client", "staff", "owner"] as const;
function subsets<T>(arr: readonly T[]): T[][] {
  return arr.reduce<T[][]>(
    (prev, current) => {
      const withCurrent = prev.map((set) => [...set, current]);
      return [...prev, ...withCurrent];
    },
    [[]],
  );
}
const cases = BOOKING_STATUSES.flatMap((from) =>
  BOOKING_STATUSES.flatMap((to) =>
    subsets<Actors>(ACTORS).map((actors) => [from, to, actors] as const),
  ),
);

describe("checkTransition", () => {
  test.each([
    ["pending", "confirmed", ["staff"], "ok"],
    ["pending", "confirmed", ["owner"], "ok"],
    ["pending", "confirmed", ["client"], "forbidden"],

    ["pending", "canceled", ["client"], "ok"],
    ["pending", "canceled", [], "forbidden"],

    ["confirmed", "canceled", ["client"], "ok"],
    ["confirmed", "canceled", ["staff"], "ok"],
    ["confirmed", "canceled", [], "forbidden"],

    ["confirmed", "pending", ["owner"], "invalid"],
    ["canceled", "confirmed", ["owner"], "invalid"],
    ["pending", "pending", ["owner"], "invalid"],

    ["pending", "confirmed", ["client", "staff"], "ok"],
  ] as const)("%s → %s by %j = %s", (from, to, actors, expected) => {
     expect(checkTransition(from, to, [...actors])).toBe(expected);
  });
});
