import { api } from '@/lib/api';
import { CATEGORY_METADATA, type FACILITY_CATEGORIES } from '@slotbook/shared/facility';

export async function getCategories(limit?: number) {
  const params = new URLSearchParams();
  if (limit !== undefined) params.set('limit', String(limit));

  const query = params.toString();
  const endpoint = query ? `/facilities/categories?${query}` : '/facilities/categories';

  const result = await api<
    Array<{
      categoryName: (typeof FACILITY_CATEGORIES)[number];
      count: number;
    }>
  >(endpoint, {
    method: 'GET',
  });

  return result;
}
