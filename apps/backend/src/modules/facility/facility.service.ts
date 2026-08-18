import type { CreateFacilityRequest, UpdateFacilityRequest } from '@slotbook/shared/facilities';
import type { DB } from '../../db/drizzlePlugin.ts';
import {
  findAllFacilities,
  findFacilitiesByOwnerId,
  findFacilityById,
  insertFacility,
  updateFacilityById,
   deleteFacilityById,
} from './facility.repository.ts';
import {
  ConflictError,
  CRUDOperationFailed,
  ForbiddenError,
  NotFoundError,
} from '../../lib/errors.ts';

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
export async function getAllPublicFacilities(db: DB) {
  return findAllFacilities(db);
}
export async function getFacilityDetails(db: DB, facilityId: string) {
  const facility = findFacilityById(db, facilityId);
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
    if ((e as Error).message?.includes('unique')) {
      throw new ConflictError('Slug already taken');
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
  // try{

  // }catch(e){

  // }

  const updatedFacility = await updateFacilityById(db, facilityId, data);

  if (!updatedFacility) {
    throw new NotFoundError('Facility not found');
  }
  return updatedFacility;
}

export async function removeOwnedFacilityById(db: DB, facilityId: string, userId: string){
  await checkFacilityOwnership(db, facilityId, userId)

  const deletedFacility = await deleteFacilityById(db, facilityId)
  if (!deletedFacility) {
    throw new NotFoundError('Facility not found');
  }
  return deletedFacility;
};
