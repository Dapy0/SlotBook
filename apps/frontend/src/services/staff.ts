import { api } from "@/lib/api";
import {
  staffMemberResponseSchema,
  type StaffMemberResponseDTO,
} from "@slotbook/shared/staffMembers";

export async function getStaffMembersByFacilityId(
  facilityId: string,
): Promise<StaffMemberResponseDTO[]> {
  return staffMemberResponseSchema.array().parse(
    await api<StaffMemberResponseDTO>(`/facilities/${facilityId}/staff`, {
      method: "GET",
    }),
  );
}
