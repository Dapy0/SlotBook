import { describe, expect, test } from "vitest";
import { createStaffMemberRequestSchema } from './staffMembers';

describe("StaffMemberResponse DTO", () => {
  test("accepts staff member", () => {
    const fixture = {
      userId: "ee752901-46a1-4727-b0d1-1952550ef1f1",
      facilityId: "cc752901-46a1-4727-b0d1-1952550ef1f1",
      id: "pp752901-46a1-4727-b0d1-1952550ef1f1",
      createdAt: "2026-08-12T12:29:59.998Z",
      updatedAt: "2026-08-12T12:29:59.998Z",
      isActive: true,
    };

    expect(createStaffMemberRequestSchema.safeParse(fixture).success).toBe(true);
  });
  test("accepts staff member without isActive", () => {
    const fixture = {
      userId: "ee752901-46a1-4727-b0d1-1952550ef1f1",
      facilityId: "cc752901-46a1-4727-b0d1-1952550ef1f1",
      id: "pp752901-46a1-4727-b0d1-1952550ef1f1",
      createdAt: "2026-08-12T12:29:59.998Z",
      updatedAt: "2026-08-12T12:29:59.998Z",
    };

    expect(createStaffMemberRequestSchema.safeParse(fixture).success).toBe(true);
  });
});
