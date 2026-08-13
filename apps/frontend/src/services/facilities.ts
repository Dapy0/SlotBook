import { api } from '@/lib/api';
import { ConsoleIcon } from '@hugeicons/core-free-icons';
import type { CreateServicePayload, Facility, Service } from '@slotbook/shared/facilities';

export async function getFacilities(): Promise<Facility[]> {
  const result = await api<Facility[]>('/facilities/', {
    method: 'GET',
  });

  return result;
}
export async function getFacilityById(id: string): Promise<Facility | null> {
  return await api<Facility>(`/facilities/${id}`, {
    method: 'GET',
  });
}

export async function getFacilityServicesById(id: string): Promise<Service[]> {
  const result =  await api<Service[]>(`/facilities/${id}/services`, {
    method: 'GET',
  });
  console.log(result)
  return result;
}
export async function createService(
  facilityId: string,
  payload: CreateServicePayload,
): Promise<Service> {
  return await api<Service>(`/facilities/${facilityId}/services`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getMyFacilities(): Promise<Facility[]> {

  const res = await api<Facility[] | null>(`/facilities/mine`, {
    method: 'GET',
  });
  return res ?? [];
}
