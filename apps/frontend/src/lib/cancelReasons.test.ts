import { formatCancelReason } from "@/lib/cancelReasons";
import { describe, expect, test } from "vitest";

describe("formatCancelReason", () => {

  test.each([
    { reason: null, expected: null },
    { reason: "", expected: null },
    { reason: "NON_EXISTING", expected: "NON_EXISTING" },
    { reason: "STAFF_UNAVAILABLE", expected: "Staff is unavailable" },
    { reason: "VENUE_CLOSED", expected: "Venue is closed" },
    { reason: "DOUBLE_BOOKING", expected: "Double booking" },
    { reason: "CLIENT_REQUEST", expected: "Client asked to cancel" },
  ])("$reason → $expected", ({ reason, expected }) => {
    expect(formatCancelReason(reason)).toBe(expected);
  });
});
