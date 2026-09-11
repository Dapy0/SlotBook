import { api } from '@/lib/api';
import type { FacilityResponseDTO } from '@slotbook/shared/facility';
import type { ResponseFacilityScheduleSchema } from '@slotbook/shared/facilitySchedule';
import type { ServiceResponseDTO } from '@slotbook/shared/service';

export async function getFacilities(getParams: {
  country: string;
  category?: string;
  rating?: string;
  priceMax?: string;
  q?: string;
  sort?: string;
  limit?: number;
}): Promise<FacilityResponseDTO[]> {
  const params = new URLSearchParams();
  for (const [param, value] of Object.entries(getParams)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(param, String(value));
  }
  const query = params.toString();
  const endpoint = query ? `/facilities/?${query}` : '/facilities/';

  const result = await api<FacilityResponseDTO[]>(endpoint, {
    method: 'GET',
  });

  return result;
}
export async function getFacilityById(id: string): Promise<
  FacilityResponseDTO & {
    facilitySchedule: ResponseFacilityScheduleSchema[];
  }
> {
  const facilityInfo = await api<FacilityResponseDTO>(`/facilities/${id}`, {
    method: 'GET',
  });
  const facilitySchedule = await api<ResponseFacilityScheduleSchema[]>(
    `/facilities/${id}/schedule`,
    {
      method: 'GET',
    },
  );
  return {
    ...facilityInfo,
    facilitySchedule: facilitySchedule,
  };
}

export async function getMyFacilities(): Promise<FacilityResponseDTO[]> {
  const res = await api<FacilityResponseDTO[] | null>(`/facilities/mine`, {
    method: 'GET',
  });
  return res ?? [];
}

export async function getFacilityServicesById(facilityId: string): Promise<ServiceResponseDTO[]> {
  const res = await api<ServiceResponseDTO[]>(`/facilities/${facilityId}/services`, {
    method: 'GET',
  });
  return res;
}
