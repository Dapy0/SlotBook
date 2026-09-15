import { api } from "@/lib/api";
import type {
  CreateFacilitySchedule,
  FacilityScheduleResponse,
} from "@slotbook/shared/facilitySchedule";

export async function getFacilitySchedule(facilityId: string) {
  const result = await api<FacilityScheduleResponse[]>(`/facilities/${facilityId}/schedule`, {
    method: "GET",
  });

  return result;
}

export async function putFacilitySchedule(facilityId: string, data: CreateFacilitySchedule[]) {
  const result = await api<FacilityScheduleResponse[]>(`/facilities/${facilityId}/schedule`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  return result;
}
