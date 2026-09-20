import { api } from "@/lib/api";
import { staffMemberPublicResponseSchema } from "@slotbook/shared";

export async function getStaffMembersByFacilityId(facilityId: string) {

  return await api(
    `/facilities/${facilityId}/staff`,
    staffMemberPublicResponseSchema.array()
  );
}
