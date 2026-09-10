import { api } from '@/lib/api';
import type { ReviewResponse } from '@slotbook/shared/reviews';

export async function getFacilityReviews(facilityId: string): Promise<ReviewResponse[]> {
  const res = await api<ReviewResponse[]>(`/facilities/${facilityId}/reviews`, {
    method: 'GET',
  });
  return res;
}
