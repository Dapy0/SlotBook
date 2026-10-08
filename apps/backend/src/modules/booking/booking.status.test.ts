import {
  BOOKING_STATUSES,
  checkTransition,
  type Actors,
  type BookingStatus,
  type TransitionCheck,
} from "@slotbook/shared";
import { describe, expect, test } from "vitest";
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
function expected(from: BookingStatus, to: BookingStatus, actors: Actors[]): TransitionCheck {
  const legal = ["pending-confirmed", "pending-canceled", "confirmed-canceled"];
  if (!legal.includes(`${from}-${to}`)) {
    return "invalid";
  }
  if (to === "confirmed") {
    return actors.some((actor) => actor == "owner" || actor == "staff") ? "ok" : "forbidden";
  }
  return actors.length > 0 ? "ok" : "forbidden";
}
describe("checkTransition", () => {
  test("check all 72 combinations", () => {
    expect(cases).toHaveLength(72);
  });

  test.each(cases)("%s → %s, roles %o", (from, to, actors) => {
    expect(checkTransition(from, to, [...actors])).toBe(expected(from, to, actors));
  });
});
