import { durationFormatter, moneyFormatterFromCents } from "@/lib/format";
import { describe, expect, test } from "vitest";

describe("moneyFormatterFromCents", () => {
  test("converts minor units to major: 12345 PLN → 123,45 zł", () => {
    const result = moneyFormatterFromCents(12345, "PLN", "pl");
    const normalizedResult = result.replace(/\s/g, " ");

    expect(normalizedResult).toBe("123,45 zł");
  });

  test("throws RangeError for unknown currency code", () => {
    expect(() => {
      moneyFormatterFromCents(100, "EU", "pl");
    }).toThrow(RangeError);
  });
  test("throws when given non existing locale", () => {
    expect(() => moneyFormatterFromCents(100, "PLN", "EUSD")).toThrow(RangeError);
  });
});
describe("durationFormatter", () => {
  test.each([
    { minutes: 45, expected: "45m" },
    { minutes: 60, expected: "60m" },
    { minutes: 90, expected: "90m" },
    { minutes: 0, expected: "" },
  ])("$minutes min → $expected", ({ minutes, expected }) => {
    expect(
      durationFormatter.format({
        minutes,
      }),
    ).toBe(expected);
  });
});
