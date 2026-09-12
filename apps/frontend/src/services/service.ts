import { api } from '@/lib/api';
import type { CreateServiceRequest, ServiceResponseDTO } from '@slotbook/shared/service';

export async function getServicesByFacilityId(id: string): Promise<ServiceResponseDTO[]> {
  const result = await api<ServiceResponseDTO[]>(`/facilities/${id}/services`, {
    method: 'GET',
  });
  return result;
}
export async function getServiceByFacilityIdServiceId(
  facilityId: string,
  serviceId: string,
): Promise<ServiceResponseDTO> {
  const result = await api<ServiceResponseDTO>(
    `/facilities/${facilityId}/services/${serviceId}`,
    {
      method: 'GET',
    },
  );
  return result;
}
export async function createService(
  facilityId: string,
  payload: CreateServiceRequest,
): Promise<ServiceResponseDTO> {
  return await api<ServiceResponseDTO>(`/facilities/${facilityId}/services`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
