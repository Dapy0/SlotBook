import type { CreateServiceRequest, ServiceResponse } from "@slotbook/shared";
import type { DB } from "../../db/drizzlePlugin.ts";
import { NotFoundError } from "../../lib/errors.ts";
import { checkFacilityOwnership, getFacilityByIdOrThrow } from "../facility/facility.service.ts";
import {
  getServiceByFacilityIdAndServiceId,
  getServiceByServiceIdAndStaffMemberId,
  getServicesByFacilityId,
  insertService,
} from "./service.repository.ts";

export async function getFacilityServicesById(
  db: DB,
  facilityId: string,
): Promise<ServiceResponse[]> {
  await getFacilityByIdOrThrow(db, facilityId);
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
): Promise<Omit<ServiceResponse, "currency">> {
  await checkFacilityOwnership(db, facilityId, userId);

  const newServiceData = {
    ...data,
    facilityId,
  };

  return await insertService(db, newServiceData);
}
