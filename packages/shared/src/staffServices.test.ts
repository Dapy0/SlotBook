import { describe, expect, test } from "vitest";
import { setStaffMemberServicesRequestSchema } from "./staffServices";

describe("SetStaffMemberServicesRequest", () => {
  const serviceId = "dc752901-46a1-4727-b0d1-1952550ef1f1";

  test("accepts unique service ids", () => {
    const r = setStaffMemberServicesRequestSchema.safeParse({ serviceIds: [serviceId] });
    expect(r.success).toBe(true);
  });
  test("accepts an empty list (staff member with no services)", () => {
    const r = setStaffMemberServicesRequestSchema.safeParse({ serviceIds: [] });
    expect(r.success).toBe(true);
  });
  test("rejects duplicate service ids", () => {
    const r = setStaffMemberServicesRequestSchema.safeParse({ serviceIds: [serviceId, serviceId] });
    expect(r.success).toBe(false);
  });
});
