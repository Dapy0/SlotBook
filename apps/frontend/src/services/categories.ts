import { api } from "@/lib/api";
import { createParams } from "@/lib/queryStrings";
import {
  facilityCategoryCountResponseSchema,
  type FacilityListQuery,
} from "@slotbook/shared";

export async function getCategories(params: FacilityListQuery) {
  const query = createParams(params);
  const endpoint = query ? `/facilities/categories?${query}` : "/facilities/categories";


  return await api(endpoint, facilityCategoryCountResponseSchema.array());
}
