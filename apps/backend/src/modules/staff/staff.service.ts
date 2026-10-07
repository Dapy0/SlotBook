import type {
  CreateStaffMemberRequest,
  ManagedStaffMemberResponse,
  StaffMemberResponse,
} from "@slotbook/shared";
import type { DB } from "../../db/drizzlePlugin.ts";
import { ConflictError, ForbiddenError, NotFoundError } from "../../lib/errors.ts";
import { findUserByEmail } from "../auth/auth.repository.ts";
import {
  findServiceByServiceIdAndMemberId,
  findStaffMemberById,
  findStaffMembersForOwner,
  insertStaffMemberById,
} from "./staff.repository.ts";
import { getPgErrorCode, PG } from "../../lib/pgErrors";
import { assertFacilityOwner } from "../../lib/authz";

export async function addNewStaffMembersToFacilityById(
  db: DB,
  data: CreateStaffMemberRequest,
  facilityId: string,
  userId: string,
): Promise<ManagedStaffMemberResponse> {
  await assertFacilityOwner(db, facilityId, userId);
  const user = await findUserByEmail(db, data.email);
  if (!user) {
    throw new NotFoundError("User with this email not found");
  }
  if (user.deletedAt != null) {
    throw new NotFoundError("User with this email not found");
  }
  if (userId === user.id) {
    throw new ForbiddenError("Owner can not add them selfs as a worker");
  }
  await insertStaffMemberById(db, user.id, facilityId).catch((e) => {
    if (getPgErrorCode(e) === PG.UNIQUE) {
      throw new ConflictError("User already working here");
    }
    throw e;
  });

  const [staff] = await findStaffMembersForOwner(db, facilityId);
  return staff;
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
