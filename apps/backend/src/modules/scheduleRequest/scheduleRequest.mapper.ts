import type { ChangeWeekScheduleRequest, ScheduleRequestResponse } from "@slotbook/shared";
import type { ScheduleChangeRequestEntity } from "../../db/schema/scheduleChangeRequests";

export function toScheduleRequestResponse(
  input: ScheduleChangeRequestEntity,
  entries: ChangeWeekScheduleRequest,
): ScheduleRequestResponse {
  return {
    ...input,
    entries,
  };
}
