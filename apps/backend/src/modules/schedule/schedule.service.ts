import type { DB } from "../../db/drizzlePlugin.ts";
import { NotFoundError } from "../../lib/errors.ts";
import { findFacilityById } from "../facility/facility.repository.ts";

import {
  deleteScheduleByStaffId,
  findScheduleByStaffId,
  insertScheduleByStaffId,
} from "./schedule.repository.ts";
import type { ScheduleBody } from "./schedule.schema.ts";
import { findStaffMemberById } from "../staff/staff.repository.ts";
import {
  checkNoOverlapWithinSchedule,
  checkStaffScheduleFitsFacility,
} from "../../lib/scheduleHelpers.ts";
import { findFacilitySchedule } from "../facility/facilitySchedule.repository.ts";
import type { StaffScheduleEntryResponse } from "@slotbook/shared";
import { assertFacilityOwner } from "../../lib/authz";

export async function receiveStaffSchedule(
  db: DB,
  facilityID: string,
  staffId: string,
): Promise<StaffScheduleEntryResponse[]> {
  const staffMemberFacility = await findStaffMemberById(db, staffId);
  if (!staffMemberFacility) {
    throw new NotFoundError("No such worker found in facilities");
  }
  if (staffMemberFacility.facilityId !== facilityID) {
    throw new NotFoundError("No such worker found in this facility");
  }
  const staffSchedule = await findScheduleByStaffId(db, staffId);

  return staffSchedule;
}
export async function changeWeekSchedule(
  db: DB,
  requestedUserId: string,
  facilityID: string,
  staffId: string,
  data: ScheduleBody,
): Promise<StaffScheduleEntryResponse[]> {
  await assertFacilityOwner(db, facilityID, requestedUserId);

  const facility = await findFacilityById(db, facilityID);
  if (!facility) {
    throw new NotFoundError("No such facility found");
  }
  const facilitySchedule = (await findFacilitySchedule(db, facility.id)) as ScheduleBody;
  const staffMemberFacility = await findStaffMemberById(db, staffId);
  if (!staffMemberFacility) {
    throw new NotFoundError("No such worker found in facilities");
  }
  if (staffMemberFacility.facilityId !== facility.id) {
    throw new NotFoundError("No such worker found in this facility");
  }

  checkNoOverlapWithinSchedule(data);
  checkStaffScheduleFitsFacility(data, facilitySchedule);
  const transaction = await db.transaction(async (tx) => {
    await deleteScheduleByStaffId(tx, staffId);
    const inserted = await insertScheduleByStaffId(tx, staffId, data);
    return inserted;
  });
  if (!transaction) {
    throw new Error("Something in transaction went wrong");
  }
  return transaction;
}
