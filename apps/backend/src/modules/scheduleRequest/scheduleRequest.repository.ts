import { type ChangeWeekScheduleRequest, type ScheduleRequestStatus } from "@slotbook/shared";
import type { DB } from "../../db/drizzlePlugin";
import {
  scheduleChangeRequestEntries,
  scheduleChangeRequests,
  type NewScheduleChangeRequestEntity,
  type ScheduleChangeRequestEntity,
  type ScheduleChangeRequestEntryEntity,
} from "../../db/schema/scheduleChangeRequests";
import { and, eq, inArray } from "drizzle-orm";

export async function insertScheduleRequest(
  db: DB,
  data: NewScheduleChangeRequestEntity,
): Promise<ScheduleChangeRequestEntity> {
  const [inserted] = await db.insert(scheduleChangeRequests).values(data).returning();
  return inserted;
}

export async function insertScheduleRequestEntries(
  db: DB,
  requestId: string,
  entries: ChangeWeekScheduleRequest,
): Promise<ScheduleChangeRequestEntryEntity[]> {
  const transformed = entries.map((entry) => ({
    ...entry,
    requestId,
  }));
  const inserted = await db.insert(scheduleChangeRequestEntries).values(transformed).returning();
  return inserted;
}

export async function findScheduleRequestById(
  db: DB,
  requestId: string,
): Promise<ScheduleChangeRequestEntity | null> {
  const [res] = await db
    .select()
    .from(scheduleChangeRequests)
    .where(eq(scheduleChangeRequests.id, requestId));
  return res ?? null;
}
export async function findScheduleRequestEntries(
  db: DB,
  requestId: string,
): Promise<ScheduleChangeRequestEntryEntity[]> {
  const res = await db
    .select()
    .from(scheduleChangeRequestEntries)
    .where(eq(scheduleChangeRequestEntries.requestId, requestId));
  return res;
}
export async function findScheduleRequestEntriesByRequestIds(
  db: DB,
  requestIds: string[],
): Promise<ScheduleChangeRequestEntryEntity[]> {
  const res = await db
    .select()
    .from(scheduleChangeRequestEntries)
    .where(inArray(scheduleChangeRequestEntries.requestId, requestIds));
  return res;
}

export async function findScheduleRequestsByStaffMemberId(
  db: DB,
  staffMemberId: string,
  status?: ScheduleRequestStatus,
): Promise<ScheduleChangeRequestEntity[]> {
  const res = await db
    .select()
    .from(scheduleChangeRequests)
    .where(
      and(
        eq(scheduleChangeRequests.staffMemberId, staffMemberId),
        status ? eq(scheduleChangeRequests.status, status) : undefined,
      ),
    );
  return res;
}
export async function findScheduleRequestsByFacilityId(
  db: DB,
  facilityId: string,
  status?: ScheduleRequestStatus,
): Promise<ScheduleChangeRequestEntity[]> {
  const res = await db
    .select()
    .from(scheduleChangeRequests)
    .where(
      and(
        eq(scheduleChangeRequests.facilityId, facilityId),
        status ? eq(scheduleChangeRequests.status, status) : undefined,
      ),
    );
  return res;
}

export async function transitionPendingScheduleRequest(
  db: DB,
  requestId: string,
  scope: { facilityId: string } | { staffMemberId: string },
  patch: {
    status: Exclude<ScheduleRequestStatus, "pending">;
    ownerComment?: string;
    decidedByUserId?: string;
  },
): Promise<ScheduleChangeRequestEntity | null> {
  const scopeCondition =
    "staffMemberId" in scope
      ? eq(scheduleChangeRequests.staffMemberId, scope.staffMemberId)
      : eq(scheduleChangeRequests.facilityId, scope.facilityId);
  const now = new Date();
  const [updated] = await db
    .update(scheduleChangeRequests)
    .set({
      ...patch,
      updatedAt: now,
      decidedAt: now,
    })
    .where(
      and(
        eq(scheduleChangeRequests.id, requestId),
        eq(scheduleChangeRequests.status, "pending"),
        scopeCondition,
      ),
    )
    .returning();
  return updated ?? null;
}
