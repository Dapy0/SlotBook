import { api } from "@/lib/api";
import type { ChangeWeekScheduleRequest, FacilityScheduleEntryResponse, FacilityWeekScheduleResponse } from '@slotbook/shared';


export async function getFacilitySchedule(facilityId: string) {
  const result = await api<FacilityWeekScheduleResponse>(`/facilities/${facilityId}/schedule`, {
    method: "GET",
  });

  return result;
}

export async function putFacilitySchedule(facilityId: string, data: ChangeWeekScheduleRequest) {
  const result = await api<FacilityScheduleEntryResponse>(`/facilities/${facilityId}/schedule`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  return result;
}
