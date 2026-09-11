import { api } from '@/lib/api';
import { CATEGORY_METADATA, type FACILITY_CATEGORIES } from '@slotbook/shared/facility';

export async function getCategories(getParams: {
  country: string;
  limit?: number;
}) {
  const params = new URLSearchParams();
  params.set('country', String(getParams.country));
  if (getParams.limit !== undefined) params.set('limit', String(getParams.limit));

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
