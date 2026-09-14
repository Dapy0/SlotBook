import * as z from "zod";

// Request DTOs

export const requestStaffServiceSchema = z.object({
  staffMemberId: z.uuid(),
  serviceId: z.uuid(),
});

export type CreateStaffServiceRequest = z.infer<typeof requestStaffServiceSchema>;
export const updateStaffServiceSchema = requestStaffServiceSchema.partial();
export type UpdateStaffServiceRequest = z.infer<typeof updateStaffServiceSchema>;

// Response DTOs

export type StaffServiceResponseDTO = z.infer<typeof requestStaffServiceSchema>;
