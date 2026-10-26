import { describe, test, expect } from "vitest";
import { slugifyStr } from "./slug";
describe("slugifyStr", () => {
  test("return empty string when given empty string", () => {
    expect(slugifyStr("")).toBe("");
  });
  test("return empty string when given string of characters", () => {
    expect(slugifyStr("-/.:,[]()")).toBe("");
  });
  test("lower case input string", () => {
    expect(slugifyStr("HELLOSALON")).toBe("hellosalon");
  });
  test("replaces spaces with dash", () => {
    expect(slugifyStr("Fancy Barbershop in Mokotów")).toBe("fancy-barbershop-in-mokotow");
  });
  test("resplaces special local letter with english", () => {
    expect(slugifyStr("Mokotów")).toBe("mokotow");
  });
});
