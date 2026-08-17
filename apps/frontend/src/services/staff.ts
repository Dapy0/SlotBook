import { api } from '@/lib/api';
import type { StaffMemberResponseDTO } from '@slotbook/shared/staffMembers';

export async function getStaffMembersByFacilityId(
  facilityId: string,
): Promise<StaffMemberResponseDTO[]> {
  return await api<StaffMemberResponseDTO>(`/facilities/${facilityId}/staff`, {
    method: 'GET',
  });
}
