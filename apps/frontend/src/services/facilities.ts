import { api } from '@/lib/api';
import type { FacilityResponseDTO } from '@slotbook/shared/facilities';

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

export async function getMyFacilities(): Promise<FacilityResponseDTO[]> {
  const res = await api<FacilityResponseDTO[] | null>(`/facilities/mine`, {
    method: 'GET',
  });
  return res ?? [];
}
