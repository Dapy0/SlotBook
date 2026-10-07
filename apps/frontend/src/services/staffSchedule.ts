import { api } from "@/lib/api";
import {
  changeWeekScheduleRequestSchema,
  staffScheduleEntryResponseSchema,
  type ChangeWeekScheduleRequest,
} from "@slotbook/shared";

export async function getStaffSchedule(facilityId: string, staffId: string) {
  return await api(
    `/facilities/${facilityId}/staff/${staffId}/schedule`,
    staffScheduleEntryResponseSchema.array(),
  );
}

export async function putStaffSchedule(
  facilityId: string,
  staffId: string,
  data: ChangeWeekScheduleRequest,
) {

  return await api(
    `/facilities/${facilityId}/staff/${staffId}/schedule`,
    staffScheduleEntryResponseSchema.array(),
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}
