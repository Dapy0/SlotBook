import { api } from "@/lib/api";
import { createParams } from "@/lib/queryStrings";
import {
  facilityCategoryResponseSchema,
  type FacilityCategoryResponse,
} from "@slotbook/shared/facility";

export async function getCategories(getParams: { country: string; limit?: number }) {
  const query = createParams(getParams);
  const endpoint = query ? `/facilities/categories?${query}` : "/facilities/categories";

  const result = facilityCategoryResponseSchema.array().parse(
    await api<FacilityCategoryResponse[]>(endpoint, {
      method: "GET",
    }),
  );

  return result;
}
