import * as z from "zod";

//Request
export const setStaffMemberServicesRequestSchema = z.object({
  serviceIds: z.array(z.uuid()).refine((ids) => new Set(ids).size === ids.length, {
    error: "duplicate serviceIds",
  }),
});
export type SetStaffMemberServicesRequest = z.infer<typeof setStaffMemberServicesRequestSchema>;

//Response
export const staffMemberServicesResponseSchema = z.object({
  staffMemberId: z.uuid(),
  serviceIds: z.array(z.uuid()),
});
export type StaffMemberServicesResponse = z.infer<typeof staffMemberServicesResponseSchema>;
