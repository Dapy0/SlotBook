import { describe, expect, test } from "vitest";
import { createStaffServiceSchema } from "./staffServices";

describe("StaffServiceResponse DTO", () => {
  test("accepts staff service", () => {
    const fixture = {
      staffMemberId: "ee752901-46a1-4727-b0d1-1952550ef1f1",
      serviceId: "cc752901-46a1-4727-b0d1-1952550ef1f1",
    };

    expect(createStaffServiceSchema.safeParse(fixture).success).toBe(true);
  });
});
