import { api } from '@/lib/api';
import type {
  CreateStaffSchedule,
  ResponseStaffScheduleSchema,
} from '@slotbook/shared/staffSchedule';

export async function getStaffSchedule(facilityId: string, staffId:string) {
  const result = await api<ResponseStaffScheduleSchema[]>(
    `/facilities/${facilityId}/staff/${staffId}/schedule`,
    {
      method: 'GET',
    },
  );

  return result;
}

export async function putStaffSchedule(
  facilityId: string,
  staffId: string,
  data: CreateStaffSchedule[],
) {
  const result = await api<ResponseStaffScheduleSchema[]>(
    `/facilities/${facilityId}/staff/${staffId}/schedule`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
  );

  return result;
}
