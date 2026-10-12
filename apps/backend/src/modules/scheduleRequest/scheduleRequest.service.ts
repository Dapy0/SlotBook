import type {
  CreateScheduleRequest,
  RejectScheduleRequest,
  ScheduleEntryInput,
  ScheduleRequestDetailResponse,
  ScheduleRequestListQuery,
  ScheduleRequestResponse,
} from "@slotbook/shared";
import { assertFacilityOwner, requireStaffMember } from "../../lib/authz";
import { ConflictError, ForbiddenError, NotFoundError } from "../../lib/errors";
import { findFacilitySchedule } from "../facility/facilitySchedule.repository";
import type { DB } from "../../db/drizzlePlugin";
import { checkStaffScheduleFitsFacility } from "../../lib/scheduleHelpers";
import {
  findScheduleRequestById,
  findScheduleRequestEntries,
  findScheduleRequestEntriesByRequestIds,
  findScheduleRequestsByFacilityId,
  findScheduleRequestsByStaffMemberId,
  insertScheduleRequest,
  insertScheduleRequestEntries,
  transitionPendingScheduleRequest,
} from "./scheduleRequest.repository";
import { getPgErrorCode, PG } from "../../lib/pgErrors";
import { toScheduleRequestResponse } from "./scheduleRequest.mapper";
import { applyStaffWeekSchedule } from "../schedule/schedule.service";
import { findScheduleByStaffId } from "../schedule/schedule.repository";
import { findStaffMemberName } from "../staff/staff.repository";

// helpers

async function assertScheduleFitsFacilityHours(
  db: DB,
  facilityId: string,
  entries: readonly ScheduleEntryInput[],
): Promise<void> {
  const facilitySchedule = await findFacilitySchedule(db, facilityId);
  await checkStaffScheduleFitsFacility(entries, facilitySchedule);
}
async function throwTransitionFailure(
  db: DB,
  requestId: string,
  scope: { facilityId: string } | { staffMemberId: string },
): Promise<never> {
  const request = await findScheduleRequestById(db, requestId);
  const isInScope =
    request != null &&
    ("facilityId" in scope
      ? request.facilityId === scope.facilityId
      : request.staffMemberId === scope.staffMemberId);

  if (!request || !isInScope) {
    throw new NotFoundError("Schedule request not found");
  }
  if (request.status !== "pending") {
    throw new ConflictError(`Request is already ${request.status}`);
  }
  throw new Error(`Transition of pending request ${requestId} failed unexpectedly`);
}
// Main
export async function submitScheduleRequest(
  db: DB,
  userId: string,
  body: CreateScheduleRequest,
): Promise<ScheduleRequestResponse> {
  const staffMember = await requireStaffMember(db, userId);
  if (!staffMember.isActive) throw new ForbiddenError("Staff profile is inactive.");
  await assertScheduleFitsFacilityHours(db, staffMember.facilityId, body.entries);
  const { request, entries } = await db
    .transaction(async (tx) => {
      const request = await insertScheduleRequest(tx, {
        facilityId: staffMember.facilityId,
        staffMemberId: staffMember.staffMemberId,
        staffNote: body.note,
        status: "pending",
      });
      const entries = await insertScheduleRequestEntries(tx, request.id, body.entries);
      return { request, entries };
    })
    .catch((e) => {
      if (getPgErrorCode(e) === PG.UNIQUE) {
        throw new ConflictError("You already have an open schedule request");
      }
      throw e;
    });

  return toScheduleRequestResponse(request, entries);
}

export async function withdrawScheduleRequest(
  db: DB,
  userId: string,
  requestId: string,
): Promise<ScheduleRequestResponse> {
  const staffMember = await requireStaffMember(db, userId);
  if (!staffMember.isActive) throw new ForbiddenError("Staff profile is inactive.");
  const scope = { staffMemberId: staffMember.staffMemberId };
  const res = await transitionPendingScheduleRequest(db, requestId, scope, {
    status: "withdrawn",
  });
  if (res == null) {
    return await throwTransitionFailure(db, requestId, scope);
  }
  const entries = await findScheduleRequestEntries(db, requestId);
  return toScheduleRequestResponse(res, entries);
}
export async function approveScheduleRequest(
  db: DB,
  ownerUserId: string,
  facilityId: string,
  requestId: string,
): Promise<ScheduleRequestResponse> {
  await assertFacilityOwner(db, facilityId, ownerUserId);
  const scope = { facilityId };
  const { request, entries } = await db.transaction(async (tx) => {
    const request = await transitionPendingScheduleRequest(tx, requestId, scope, {
      status: "approved",
      decidedByUserId: ownerUserId,
    });

    if (request == null) {
      return await throwTransitionFailure(tx, requestId, scope);
    }
    const entries = await findScheduleRequestEntries(tx, requestId);

    await assertScheduleFitsFacilityHours(tx, facilityId, entries);
    // TODO: решить, что делать с будущими бронями вне нового расписания
    await applyStaffWeekSchedule(tx, request.staffMemberId, entries);

    return { request, entries };
  });

  return toScheduleRequestResponse(request, entries);
}
export async function rejectScheduleRequest(
  db: DB,
  ownerUserId: string,
  facilityId: string,
  requestId: string,
  body: RejectScheduleRequest,
): Promise<ScheduleRequestResponse> {
  await assertFacilityOwner(db, facilityId, ownerUserId);
  const scope = { facilityId };

  const res = await transitionPendingScheduleRequest(db, requestId, scope, {
    status: "rejected",
    ownerComment: body.comment,
    decidedByUserId: ownerUserId,
  });
  if (res == null) {
    return await throwTransitionFailure(db, requestId, scope);
  }
  const entries = await findScheduleRequestEntries(db, requestId);
  return toScheduleRequestResponse(res, entries);
}
export async function getFacilityScheduleRequest(
  db: DB,
  ownerUserId: string,
  facilityId: string,
  requestId: string,
): Promise<ScheduleRequestDetailResponse> {
  await assertFacilityOwner(db, facilityId, ownerUserId);
  const request = await findScheduleRequestById(db, requestId);
  if (!request || request.facilityId !== facilityId) {
    throw new NotFoundError("No such request");
  }
  const entries = await findScheduleRequestEntries(db, requestId);
  const currentSchedule = await findScheduleByStaffId(db, request.staffMemberId);
  const { name: staffName } = await findStaffMemberName(db, request.staffMemberId);
  return {
    ...toScheduleRequestResponse(request, entries),
    currentSchedule,
    staffName,
  };
}

export async function listMyScheduleRequests(
  db: DB,
  userId: string,
  query: ScheduleRequestListQuery,
): Promise<ScheduleRequestResponse[]> {
  const staffMember = await requireStaffMember(db, userId);
  if (!staffMember.isActive) throw new ForbiddenError("Staff profile is inactive.");
  const requests = await findScheduleRequestsByStaffMemberId(
    db,
    staffMember.staffMemberId,
    query.status,
  );
  if (requests.length === 0) return [];

  const entries = await findScheduleRequestEntriesByRequestIds(
    db,
    requests.map((r) => r.id),
  );
  const entriesByRequestId = Object.groupBy(entries, (e) => e.requestId);

  return requests.map((request) =>
    toScheduleRequestResponse(request, entriesByRequestId[request.id] ?? []),
  );
}
export async function listFacilityScheduleRequests(
  db: DB,
  ownerUserId: string,
  facilityId: string,
  query: ScheduleRequestListQuery,
): Promise<ScheduleRequestResponse[]> {
  await assertFacilityOwner(db, facilityId, ownerUserId);

  const requests = await findScheduleRequestsByFacilityId(db, facilityId, query.status);
  if (requests.length === 0) return [];

  const entries = await findScheduleRequestEntriesByRequestIds(
    db,
    requests.map((r) => r.id),
  );
  const entriesByRequestId = Object.groupBy(entries, (e) => e.requestId);

  return requests.map((request) =>
    toScheduleRequestResponse(request, entriesByRequestId[request.id] ?? []),
  );
}
