import { api } from "@/lib/api";
import {
  facilityScheduleEntryResponseSchema,
  type ChangeWeekScheduleRequest,
} from "@slotbook/shared";

export async function getFacilitySchedule(facilityId: string) {
  return await api(
    `/facilities/${facilityId}/schedule`,
    facilityScheduleEntryResponseSchema.array(),
  );
}

export async function putFacilitySchedule(facilityId: string, data: ChangeWeekScheduleRequest) {
  return await api(
    `/facilities/${facilityId}/schedule`,
    facilityScheduleEntryResponseSchema.array(),
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}
