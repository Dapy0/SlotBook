import type { CreateServiceRequest, ServiceResponse, UpdateServiceRequest } from "@slotbook/shared";
import type { DB } from "../../db/drizzlePlugin.ts";
import { NotFoundError } from "../../lib/errors.ts";
import { getFacilityByIdOrThrow } from "../facility/facility.service.ts";
import {
  getServiceByFacilityIdAndServiceId,
  getServiceByServiceIdAndStaffMemberId,
  getServicesByFacilityId,
  insertService,
  updateServiceById,
} from "./service.repository.ts";
import { assertFacilityOwner } from "../../lib/authz";
import { sql } from "drizzle-orm";
import { services } from "../../db/schema";

export async function getFacilityPublicServicesById(
  db: DB,
  facilityId: string,
): Promise<ServiceResponse[]> {
  await getFacilityByIdOrThrow(db, facilityId);
  const servicesRes = await getServicesByFacilityId(
    db,
    facilityId,
    sql`${services.isActive} = true`,
  );
  return servicesRes;
}
export async function getFacilityServicesForOwner(
  db: DB,
  facilityId: string,
  userId: string,
): Promise<ServiceResponse[]> {
  await assertFacilityOwner(db, facilityId, userId);

  const services = await getServicesByFacilityId(db, facilityId);
  return services;
}
export async function getServiceForStaffMember(
  db: DB,
  serviceId: string,
  staffMemberId: string,
): Promise<ServiceResponse> {
  const service = await getServiceByServiceIdAndStaffMemberId(db, serviceId, staffMemberId);
  if (!service) {
    throw new NotFoundError("No such service found");
  }
  return service;
}

export async function getFacilityServiceById(
  db: DB,
  serviceId: string,
  facilityId: string,
): Promise<ServiceResponse> {
  const service = await getServiceByFacilityIdAndServiceId(db, facilityId, serviceId);
  if (!service) {
    throw new NotFoundError("No such service found");
  }
  return service;
}

export async function createServiceByFacilityId(
  db: DB,
  data: CreateServiceRequest,
  facilityId: string,
  userId: string,
): Promise<ServiceResponse> {
  const facility = await assertFacilityOwner(db, facilityId, userId);

  const newServiceData = {
    ...data,
    facilityId,
  };

  return { ...(await insertService(db, newServiceData)), currency: facility.currency };
}

export async function patchService(
  db: DB,
  facilityId: string,
  serviceId: string,
  userId: string,
  data: UpdateServiceRequest,
): Promise<ServiceResponse> {
  const facility = await assertFacilityOwner(db, facilityId, userId);

  return { ...(await updateServiceById(db, serviceId, data)), currency: facility.currency };
}

export async function ownerSoftDeleteService(
  db: DB,
  facilityId: string,
  serviceId: string,
  userId: string,
) {
  await assertFacilityOwner(db, facilityId, userId);
  return await updateServiceById(db, serviceId, { isActive: false });
}
