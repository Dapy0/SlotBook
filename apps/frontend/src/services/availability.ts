import { api } from "@/lib/api";
import { createParams } from "@/lib/queryStrings";
import {
  availabilityResponseSchema,
  type AvailabilityResponse,
  type AvailabilitySlot,
} from "@slotbook/shared/availability";

export async function getAvailability(
  facilityId: string,
  staff: string,
  service: string,
): Promise<AvailabilityResponse> {
  const query = createParams({ staff, service });
  return availabilityResponseSchema.parse(
    await api<AvailabilityResponse>(`/facilities/${facilityId}/availability?${query}`, {
      method: "GET",
    }),
  );
}
