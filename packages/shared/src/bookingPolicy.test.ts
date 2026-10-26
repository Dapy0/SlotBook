import { describe, expect, test } from "vitest";
import { isLeadWithinHorizon } from "./bookingPolicy";

describe("isLeadWithinHorizon", () => {
  test.each([
    { lead: 60, horizon: 1, expected: true },
    { lead: 1439, horizon: 1, expected: true },
    { lead: 1440, horizon: 1, expected: false },
    { lead: 4320, horizon: 1, expected: false },
    { lead: 4320, horizon: 30, expected: true },
    { lead: 0, horizon: 1, expected: true },
  ])("lead $lead min, horizon $horizon d → $expected", ({ lead, horizon, expected }) => {
    expect(isLeadWithinHorizon(lead, horizon)).toBe(expected);
  });
});
