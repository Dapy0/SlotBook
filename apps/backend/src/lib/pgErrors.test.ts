import { expect, it } from "vitest";
import { getPgErrorCode } from "./pgErrors";

it.each([
  [{ code: "23505" }, "23505"],
  [{ cause: { code: "23P01" } }, "23P01"],
  [new Error("x"), undefined],
  [null, undefined],
])("getPgErrorCode(%o) → %s", (input, expected) => {
  expect(getPgErrorCode(input)).toBe(expected);
});
