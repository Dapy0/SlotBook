import type { CreateFacilityRequest, UpdateFacilityRequest } from '@slotbook/shared/facility';
import type { DB } from '../../db/drizzlePlugin.ts';
import {
  findAllFacilities,
  findFacilitiesByOwnerId,
  findFacilityById,
  insertFacility,
  updateFacilityById,
  deleteFacilityById,
} from './facility.repository.ts';
import { ConflictError, ForbiddenError, NotFoundError } from '../../lib/errors.ts';
import {
  deleteFacilityScheduleByFacilityId,
  findFacilitySchedule,
  findFacilityScheduleByDay,
  insertFacilityScheduleByFacilityId,
} from './facilitySchedule.repository.ts';
import type { CreateFacilitySchedule, DayOfTheWeek } from '@slotbook/shared/facilitySchedule';
import { deleteScheduleByStaffId } from '../schedule/schedule.repository.ts';
import { checkNoOverlapWithinSchedule } from '../../lib/scheduleHelpers.ts';
import { string } from 'zod';

export async function checkFacilityOwnership(db: DB, facilityId: string, userId: string) {
  const facility = await findFacilityById(db, facilityId);

  if (!facility) {
    throw new NotFoundError('Facility not found');
  }

  if (userId !== facility.ownerId) {
    throw new ForbiddenError('Not owned facility');
  }
  return facility;
}
export async function getAllPublicFacilities(db: DB, country: string, limit?: number) {
  return findAllFacilities(db, country, limit)
}
export async function getFacilityDetails(db: DB, facilityId: string) {
  const facility = await findFacilityById(db, facilityId);
  if (!facility) {
    throw new NotFoundError('Facility not found');
  }
  return facility;
}
export async function getOwnFacilitiesByUserId(db: DB, userId: string) {
  return findFacilitiesByOwnerId(db, userId);
}
export async function createFacilityByUserId(db: DB, data: CreateFacilityRequest, userId: string) {
  try {
    return await insertFacility(db, {
      ...data,
      ownerId: userId,
    });
  } catch (e) {
    const pgError = (e as any)?.cause ?? e;
    if (pgError?.code === '23505') {
      throw new ConflictError('Slug already exists');
    }

    throw e;
  }
}

export async function updateOwnedFacility(
  db: DB,
  facilityId: string,
  userId: string,
  data: UpdateFacilityRequest,
) {
  await checkFacilityOwnership(db, facilityId, userId);

  const updatedFacility = await updateFacilityById(db, facilityId, data);

  if (!updatedFacility) {
    throw new NotFoundError('Facility not found');
  }
  return updatedFacility;
}

export async function removeOwnedFacilityById(db: DB, facilityId: string, userId: string) {
  await checkFacilityOwnership(db, facilityId, userId);

  const deletedFacility = await deleteFacilityById(db, facilityId);
  if (!deletedFacility) {
    throw new NotFoundError('Facility not found');
  }
  return deletedFacility;
}
export async function getFacilityScheduleById(
  db: DB,
  facilityId: string,
) {
  const schedule = findFacilitySchedule(db, facilityId);
  if (!schedule) {
    throw new NotFoundError('No schedule for this facility');
  }
  return schedule;
}
export async function changeFacilityWeekSchedule(
  db: DB,
  facilityId: string,
  requestedUserId: string,
  newSchedule: CreateFacilitySchedule[],
) {
  console.log(newSchedule);
  await checkFacilityOwnership(db, facilityId, requestedUserId);
  await checkNoOverlapWithinSchedule(newSchedule);
  console.log('passed checks');
  const transaction = await db.transaction(async (tx) => {
    await deleteFacilityScheduleByFacilityId(tx, facilityId);
    const inserted = await insertFacilityScheduleByFacilityId(tx, facilityId, newSchedule);
    return inserted;
  });
  if (!transaction) {
    throw new Error('Something in transaction went wrong');
  }
  return transaction;
}
