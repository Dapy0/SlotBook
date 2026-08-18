import type { CreateServiceRequest } from '@slotbook/shared/service';
import type { DB } from '../../db/drizzlePlugin.ts';
import { ConflictError, NotFoundError } from '../../lib/errors.ts';
import { findFacilityById } from '../facility/facility.repository.ts';
import { checkFacilityOwnership } from '../facility/facility.service.ts';
import { getServicesByFacilityId, insertService } from './service.repository.ts';

async function checkIfFacilityWithIdExists(db: DB, facilityId: string) {
  const facility = await findFacilityById(db, facilityId);
  if (!facility) {
    throw new NotFoundError('Facility with this id not found');
  }
}
export async function getFacilityServicesById(db: DB, facilityId: string) {
  await checkIfFacilityWithIdExists(db, facilityId);
  const services = await getServicesByFacilityId(db, facilityId);
  return services;
}

export async function createServiceByFacilityId(
  db: DB,
  data: CreateServiceRequest,
  facilityId: string,
  userId: string,
) {
  await checkFacilityOwnership(db, facilityId, userId);

  const newServiceData = {
    ...data,
    facilityId,
  };

  return await insertService(db, newServiceData);
}
