import { api } from '@/lib/api';
import type { FacilityResponseDTO } from '@slotbook/shared/facility';

export async function getFacilities(city: string, limit?: number): Promise<FacilityResponseDTO[]> {
  const params = new URLSearchParams();
  params.set('city', city);
  if (limit !== undefined) params.set('limit', String(limit));

  const query = params.toString();
  const endpoint = query ? `/facilities/?${query}` : '/facilities/';

  const result = await api<FacilityResponseDTO[]>(endpoint, {
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
