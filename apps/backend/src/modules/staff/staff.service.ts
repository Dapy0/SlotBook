import type {
  CreateStaffMemberRequest,
  FacilityBookingResponse,
  ManagedStaffMemberResponse,
  StaffBookingQuery,
  StaffMemberResponse,
  StaffMeResponse,
} from "@slotbook/shared";
import type { DB } from "../../db/drizzlePlugin.ts";
import { ConflictError, ForbiddenError, NotFoundError } from "../../lib/errors.ts";
import { findUserByEmail } from "../auth/auth.repository.ts";
import {
  findServiceByServiceIdAndMemberId,
  findServicesByStaffMemberId,
  findStaffMemberById,
  findStaffMembersForOwner,
  insertStaffMemberById,
} from "./staff.repository.ts";
import { getPgErrorCode, PG } from "../../lib/pgErrors";
import { assertFacilityOwner, requireStaffMember } from "../../lib/authz";
import { findFacilityById } from "../facility/facility.repository";
import { findScheduleByStaffId } from "../schedule/schedule.repository";
import { findFacilitySchedule } from "../facility/facilitySchedule.repository";
import { resolveDateRange } from "../../lib/scheduleHelpers";
import { getFacilityByIdOrThrow } from "../facility/facility.service";
import { findBookingsWithDetails } from "../booking/booking.repository";
import { mapBookingToContractFormat } from "../../lib/utils";

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

export async function getStaffMe(db: DB, userId: string): Promise<StaffMeResponse> {
  const staffMember = await requireStaffMember(db, userId);
  const [facility, staffServices, staffSchedule, facilitySchedule] = await Promise.all([
    findFacilityById(db, staffMember.facilityId),
    findServicesByStaffMemberId(db, staffMember.staffMemberId),
    findScheduleByStaffId(db, staffMember.staffMemberId),
    findFacilitySchedule(db, staffMember.facilityId),
  ]);
  if (!facility) {
    throw new Error("Facility doesn't exists");
  }
  return {
    staffMemberId: staffMember.staffMemberId,

    isActive: staffMember.isActive,

    facility: {
      currency: facility.currency,
      id: facility.id,
      name: facility.name,
      slug: facility.slug,
      timezone: facility.timezone,
    },
    facilitySchedule: facilitySchedule,
    schedule: staffSchedule,
    services: staffServices,
  };
}
export async function getStaffBookings(
  db: DB,
  userId: string,
  query: StaffBookingQuery,
): Promise<FacilityBookingResponse[]> {
  const staffMember = await requireStaffMember(db, userId);
  const facilityData = await getFacilityByIdOrThrow(db, staffMember.facilityId);
  const overlaps = resolveDateRange(facilityData, query);

  const facilityBookings = await findBookingsWithDetails(db, {
    order: "asc",
    staffMemberId: staffMember.staffMemberId,
    statuses: query.status ? [query.status] : undefined,
    overlaps,
  });

  return facilityBookings.map(mapBookingToContractFormat);
}
