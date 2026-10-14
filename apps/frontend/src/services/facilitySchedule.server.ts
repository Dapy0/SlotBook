import { apiWithAuth } from "@/lib/api.server";
import { changeWeekScheduleRequestSchema, facilityScheduleEntryResponseSchema } from '@slotbook/shared';

export async function getFacilityScheduleByFacilityId(facilityId: string) {
  return await apiWithAuth(`/facilities/${facilityId}/schedule`, changeWeekScheduleRequestSchema);
}
