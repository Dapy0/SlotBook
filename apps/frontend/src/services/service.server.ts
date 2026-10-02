import { api } from "@/lib/api";
import { apiWithAuth } from "@/lib/api.server";
import { serviceResponseSchema, type CreateServiceRequest } from "@slotbook/shared";

export async function getFacilityServicesForOwner(id: string) {
  return await apiWithAuth(`/facilities/${id}/services/manage`, serviceResponseSchema.array());
}
