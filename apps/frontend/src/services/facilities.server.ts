import { apiWithAuth } from "@/lib/api.server";
import { facilityReadinessResponseSchema, facilityResponseSchema } from "@slotbook/shared";

export async function getManagedFacility(id: string) {
  return await apiWithAuth(`/facilities/${id}/manage`, facilityResponseSchema);
}

export async function getFacilityReadiness(id: string) {
  return await apiWithAuth(`/facilities/${id}/readiness`, facilityReadinessResponseSchema);
}
// export async function getManagedFacilitySchedule(id: string) {
//   return await apiWithAuth(`/facilities/${id}/readiness`, facilityReadinessResponseSchema);
// }
