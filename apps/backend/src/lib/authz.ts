import type {
  AddServiceToStaffMemberRequest,
  FacilityResponse,
  StaffMemberResponse,
  StaffMembership,
} from "@slotbook/shared";
import type { DB } from "../db/drizzlePlugin";
import { BadRequestError, ForbiddenError } from "./errors";
import { assertFound } from "../modules/utils";
import { findFacilityById } from "../modules/facility/facility.repository";
import {
  findStaffMemberById,
  findStaffMemberByUserIdWithFacilityData,
} from "../modules/staff/staff.repository";
import { findServicesIds } from "../modules/service/service.repository";

export async function assertFacilityOwner(
  db: DB,
  facilityId: string,
  userId: string,
): Promise<FacilityResponse> {
  const facility = await findFacilityById(db, facilityId);
  assertFound(facility, "Facility not found");
  if (userId !== facility.ownerId) {
    throw new ForbiddenError("Not owned facility");
  }
  return facility;
}

export async function assertFacilityStaffMember(
  db: DB,
  facilityId: string,
  staffMemberId: string,
): Promise<StaffMemberResponse> {
  const staffMember = await findStaffMemberById(db, staffMemberId);
  assertFound(staffMember, "Staff Member not found");
  if (staffMember.facilityId !== facilityId) {
    throw new ForbiddenError("Not member of facility");
  }
  return staffMember;
}
export async function assertFacilityServices(
  db: DB,
  facilityId: string,
  servicesIds: AddServiceToStaffMemberRequest,
): Promise<AddServiceToStaffMemberRequest> {
  const facilityServicesIds = await findServicesIds(db, facilityId);
  if (servicesIds.serviceIds.every((service) => facilityServicesIds.includes({ id: service }))) {
    throw new BadRequestError("Not all services match provided by facilities services");
  }
  return servicesIds;
}
export async function requireStaffMember(db: DB, userId: string): Promise<StaffMembership> {
  const staff = await findStaffMemberByUserIdWithFacilityData(db, userId);
  if (!staff) {
    throw new ForbiddenError("You are not a staff member");
  }
  return staff;
}
