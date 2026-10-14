import { api } from "@/lib/api";
import {
  scheduleRequestResponseSchema,
  type CreateScheduleRequest,
  type RejectScheduleRequest,
  type ScheduleRequestResponse,
} from "@slotbook/shared";

export async function submitMyScheduleRequests(body: CreateScheduleRequest) {
  return await api(`/staff/me/schedule-requests`, scheduleRequestResponseSchema, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function withdrawScheduleRequest(requestId: string): Promise<ScheduleRequestResponse> {
  return await api(
    `/staff/me/schedule-requests/${requestId}/withdraw`,
    scheduleRequestResponseSchema,
    {
      method: "POST",
      body: JSON.stringify(""),
    },
  );
}

export async function approveScheduleRequest(
  facilityId: string,
  requestId: string,
): Promise<ScheduleRequestResponse> {
  return await api(
    `/facilities/${facilityId}/schedule-requests/${requestId}/approve`,
    scheduleRequestResponseSchema,
    {
      method: "POST",
      body: JSON.stringify(""),
    },
  );
}

export async function rejectScheduleRequest(
  facilityId: string,
  requestId: string,
  body: RejectScheduleRequest,
): Promise<ScheduleRequestResponse> {
  return await api(
    `/facilities/${facilityId}/schedule-requests/${requestId}/reject`,
    scheduleRequestResponseSchema,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}
