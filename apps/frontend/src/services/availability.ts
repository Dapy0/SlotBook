import { api } from '@/lib/api';
import type { AvailabilitySlot } from '@slotbook/shared/availability';

export async function getAvailability(
  facilityId: string,
  staffId: string,
  serviceId: string,
  date: string,
): Promise<AvailabilitySlot[]> {
  const params = new URLSearchParams({ serviceId, date });
  return await api<AvailabilitySlot[]>(
    `/facilities/${facilityId}/staff/${staffId}/availability?${params.toString()}`,
    { method: 'GET' },
  );
}
