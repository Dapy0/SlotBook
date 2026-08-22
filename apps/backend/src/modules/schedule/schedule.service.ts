import type { WeekSchedule } from '@slotbook/shared/facilities';
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
  const staffMemberFacility = await findStaffMemberById(db, staffId);
  if (!staffMemberFacility) {
    throw new NotFoundError('No such worker found in facilities');
  }
  if (staffMemberFacility.facilityId !== facility.id) {
    throw new NotFoundError('No such worker found in this facility');
  }

  const facilityGeneralWorkingSchedule: WeekSchedule = facility.workingHours;

  const groupedByDay = Object.groupBy(data, ({ dayOfTheWeek }) => dayOfTheWeek);

  for (const [key, schedules] of Object.entries(groupedByDay)) {
    if (!schedules) continue;

    const day = Number(key) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
    const facilitySchedule = facilityGeneralWorkingSchedule[day];
    console.log(facilitySchedule);
    if (facilitySchedule === null) {
      throw new ConflictError(`Facility is closed on day ${day}`);
    }

    const sorted = [...schedules].sort((a, b) => a.startTime.localeCompare(b.startTime));

    let previous: (typeof sorted)[number] | undefined;

    for (const current of sorted) {
      if (current.startTime >= current.endTime) {
        throw new BadRequestError(`Start time must be before end time on day ${day}`);
      }

      if (current.startTime < facilitySchedule.open) {
        throw new ConflictError(`No working before facility open time on day ${day}`);
      }

      if (current.endTime > facilitySchedule.close) {
        throw new ConflictError(`No working after facility close time on day ${day}`);
      }

      if (previous && current.startTime < previous.endTime) {
        throw new ConflictError(`Overlapping schedules for day ${day}`);
      }

      previous = current;
    }
  }

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
