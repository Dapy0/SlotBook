import { apiWithAuth } from "@/lib/api.server";
import { createParams } from "@/lib/queryStrings";
import {
  scheduleRequestDetailResponseSchema,
  scheduleRequestResponseSchema,
  type ScheduleRequestDetailResponse,
  type ScheduleRequestListQuery,
  type ScheduleRequestResponse,
} from "@slotbook/shared";

export async function getMyScheduleRequests(query: ScheduleRequestListQuery = {}) {
  const qs = createParams({ ...query });
  return await apiWithAuth(
    qs ? `/staff/me/schedule-requests?${qs}` : "/staff/me/schedule-requests",
    scheduleRequestResponseSchema.array(),
  );
}

export async function getFacilityScheduleRequests(
  facilityId: string,
  query: ScheduleRequestListQuery = {},
): Promise<ScheduleRequestResponse[]> {
  const qs = createParams({ ...query });
  return await apiWithAuth(
    qs
      ? `/facilities/${facilityId}/schedule-requests?${qs}`
      : `/facilities/${facilityId}/schedule-requests`,

    scheduleRequestResponseSchema.array(),
  );
}
export async function getFacilityScheduleRequest(
  facilityId: string,
  requestId: string,
): Promise<ScheduleRequestDetailResponse> {
  return await apiWithAuth(
    `/facilities/${facilityId}/schedule-requests/${requestId}`,

    scheduleRequestDetailResponseSchema,
  );
}
