import { api } from "@/lib/api";
import {
  serviceResponseSchema,
  type CreateServiceRequest,
} from "@slotbook/shared";

export async function getServicesByFacilityId(id: string) {
  return await api(`/facilities/${id}/services`, serviceResponseSchema.array());
}
export async function getServiceByFacilityIdServiceId(facilityId: string, serviceId: string) {

  return await api(
    `/facilities/${facilityId}/services/${serviceId}`,
    serviceResponseSchema
  );
}
export async function createService(facilityId: string, payload: CreateServiceRequest) {
  return await api(`/facilities/${facilityId}/services`, serviceResponseSchema, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
