import type { StaffMemberResponse } from "@slotbook/shared";
import type { DB } from "../../db/drizzlePlugin.ts";
import { ConflictError, NotFoundError } from "../../lib/errors.ts";
import { findUserByEmail } from "../auth/auth.repository.ts";
import { checkFacilityOwnership } from "../facility/facility.service.ts";
import {
  findServiceByServiceIdAndMemberId,
  findStaffMemberById,
  insertStaffMemberById,
} from "./staff.repository.ts";
import type { StaffBody } from "./staff.schema.ts";
import { getPgErrorCode, PG } from "../../lib/pgErrors";

export async function addNewStaffMembersToFacilityById(
  db: DB,
  data: StaffBody,
  facilityId: string,
  userId: string,
): Promise<StaffMemberResponse> {
  await checkFacilityOwnership(db, facilityId, userId);
  const user = await findUserByEmail(db, data.email);

  if (!user) {
    throw new NotFoundError("User with this email not found");
  }

  const newStaff = await insertStaffMemberById(db, user.id, facilityId).catch((e) => {
    if (getPgErrorCode(e) === PG.UNIQUE) {
      throw new ConflictError("User already working here");
    }
    throw e;
  });

  return newStaff;
}
export async function checkIfStaffIsFacilityWorker(
  db: DB,
  facilityId: string,
  staffId: string,
): Promise<StaffMemberResponse> {
  const staffMember = await findStaffMemberById(db, staffId);
  if (!staffMember) {
    throw new NotFoundError("No such staff member");
  }
  if (staffMember.facilityId !== facilityId) {
    throw new ConflictError("No such staff member working in this facility");
  }
  if (staffMember.isActive === false) {
    throw new ConflictError("Cant make a booking to a fired member");
  }
  return staffMember;
}

export async function checkIfStaffMemberIsDoingService(db: DB, staffId: string, serviceId: string) {
  const service = await findServiceByServiceIdAndMemberId(db, staffId, serviceId);
  if (!service) {
    throw new NotFoundError("No such member found doing this service");
  }
  return service;
}
