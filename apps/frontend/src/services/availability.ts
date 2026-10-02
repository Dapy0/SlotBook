import { api } from "@/lib/api";
import { createParams } from "@/lib/queryStrings";
import type { AvailabilityQuery } from "@slotbook/shared";
import { availabilityResponseSchema } from "@slotbook/shared";

export async function getAvailability(id: string, { staffId, serviceId }: AvailabilityQuery) {
  const query = createParams({ staffId, serviceId });
  return await api(`/facilities/${id}/availability?${query}`, availabilityResponseSchema);
}
