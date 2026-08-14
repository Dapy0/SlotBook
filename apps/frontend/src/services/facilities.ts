import { api } from '@/lib/api';
import type { CreateServicePayload, FacilityResponseDTO, Service } from '@slotbook/shared/facilities';

export async function getFacilities(): Promise<FacilityResponseDTO[]> {
  const result = await api<FacilityResponseDTO[]>('/facilities/', {
    method: 'GET',
  });

  return result;
}
export async function getFacilityById(id: string): Promise<FacilityResponseDTO | null> {
  return await api<FacilityResponseDTO>(`/facilities/${id}`, {
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

export async function getMyFacilities(): Promise<FacilityResponseDTO[]> {
  const res = await api<FacilityResponseDTO[] | null>(`/facilities/mine`, {
    method: 'GET',
  });
  return res ?? [];
}
