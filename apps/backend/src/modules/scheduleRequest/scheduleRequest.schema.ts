import z from "zod";

export const myScheduleRequestParamsSchema = z.object({
  requestId: z.uuid(),
});
export const facilityScheduleRequestsParamsSchema = z.object({ id: z.uuid() });
export const facilityScheduleRequestParamsSchema = facilityScheduleRequestsParamsSchema.extend({
  requestId: z.uuid(),
});
