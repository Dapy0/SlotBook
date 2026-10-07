import { api } from "@/lib/api";
import {
  managedStaffMemberResponseSchema,
  staffMemberPublicResponseSchema,
  type AddServiceToStaffMemberRequest,
  type CreateStaffMemberRequest,
  type UpdateStaffMemberRequest,
} from "@slotbook/shared";

export async function getStaffMembersByFacilityId(facilityId: string) {
  return await api(`/facilities/${facilityId}/staff`, staffMemberPublicResponseSchema.array());
}
export async function addStaffMembersForOwner(
  facilityId: string,
  payload: CreateStaffMemberRequest,
) {
  return await api(`/facilities/${facilityId}/staff`, managedStaffMemberResponseSchema, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
export async function patchStaffMembersForOwner(
  facilityId: string,
  staffId: string,
  payload: UpdateStaffMemberRequest,
) {
  return await api(`/facilities/${facilityId}/staff/${staffId}`, managedStaffMemberResponseSchema, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function setStaffServices(
  facilityId: string,
  staffId: string,
  payload: AddServiceToStaffMemberRequest,
) {
  return await api(
    `/facilities/${facilityId}/staff/${staffId}/services`,
    managedStaffMemberResponseSchema,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}
