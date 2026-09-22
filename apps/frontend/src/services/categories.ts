import { api } from "@/lib/api";
import { createParams } from "@/lib/queryStrings";
import {
  facilityCategoryCountResponseSchema,
  type FacilityCategoryQuery,
  type FacilityListQuery,
} from "@slotbook/shared";

export async function getCategories(incomingQuery: FacilityCategoryQuery) {
  const query = createParams(incomingQuery);
  const endpoint = query ? `/facilities/categories?${query}` : "/facilities/categories";
  return await api(endpoint, facilityCategoryCountResponseSchema.array());
}
