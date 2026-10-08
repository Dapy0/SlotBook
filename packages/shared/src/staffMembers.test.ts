import { describe, expect, test } from "vitest";
import { staffMemberResponseSchema } from "./staffMembers";

describe("StaffMemberResponse DTO", () => {
  const fixture = {
    id: "aa752901-46a1-4727-b0d1-1952550ef1f1",
    facilityId: "cc752901-46a1-4727-b0d1-1952550ef1f1",
    isActive: true,
    createdAt: "2026-08-12T12:29:59.998Z",
    updatedAt: "2026-08-12T12:29:59.998Z",
  };

  test("accepts staff member", () => {
    expect(staffMemberResponseSchema.safeParse(fixture).success).toBe(true);
  });
  test("rejects staff member without isActive", () => {
    const { isActive: _isActive, ...withoutIsActive } = fixture;
    expect(staffMemberResponseSchema.safeParse(withoutIsActive).success).toBe(false);
  });
});
