import { apiWithAuth } from "@/lib/api.server";
import {
  managedStaffMemberResponseSchema,

} from "@slotbook/shared";

export async function getStaffMembersForOwner(facilityId: string) {
  return await apiWithAuth(
    `/facilities/${facilityId}/staff/manage`,
    managedStaffMemberResponseSchema.array(),
  );
}