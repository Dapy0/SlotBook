import type { DB } from '../../db/drizzlePlugin.ts';
import { BadRequestError, ConflictError, NotFoundError } from '../../lib/errors.ts';
import { findFacilityById } from '../facility/facility.repository.ts';

import {
  deleteScheduleByStaffId,
  findScheduleByStaffId,
  insertScheduleByStaffId,
} from './schedule.repository.ts';
import type { ScheduleBody } from './schedule.schema.ts';
import { checkFacilityOwnership } from '../facility/facility.service.ts';
import { findStaffMemberById } from '../staff/staff.repository.ts';
import {
  checkNoOverlapWithinSchedule,
  checkStaffScheduleFitsFacility,
} from '../../lib/scheduleHelpers.ts';
import { findFacilitySchedule } from '../facility/facilitySchedule.repository.ts';

export async function receiveStaffSchedule(db: DB, facilityID: string, staffId: string) {
  const facility = await findFacilityById(db, facilityID);
  if (!facility) {
    throw new NotFoundError('No such facility found');
  }
  const staffMemberFacility = await findStaffMemberById(db, staffId);
  if (!staffMemberFacility) {
    throw new NotFoundError('No such worker found in facilities');
  }
  if (staffMemberFacility.facilityId !== facility.id) {
    throw new NotFoundError('No such worker found in this facility');
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
) {
  await checkFacilityOwnership(db, facilityID, requestedUserId);

  const facility = await findFacilityById(db, facilityID);
  if (!facility) {
    throw new NotFoundError('No such facility found');
  }
  const facilitySchedule = await findFacilitySchedule(db, facility.id);
  const staffMemberFacility = await findStaffMemberById(db, staffId);
  if (!staffMemberFacility) {
    throw new NotFoundError('No such worker found in facilities');
  }
  if (staffMemberFacility.facilityId !== facility.id) {
    throw new NotFoundError('No such worker found in this facility');
  }

  checkNoOverlapWithinSchedule(data);
  checkStaffScheduleFitsFacility(data, facilitySchedule);
  // add AsyncLocalStorage
  const transaction = await db.transaction(async (tx) => {
    await deleteScheduleByStaffId(tx, staffId);
    const inserted = await insertScheduleByStaffId(tx, staffId, data);
    return inserted;
  });
  if (!transaction) {
    throw new Error('Something in transaction went wrong');
  }
  return transaction;
}
