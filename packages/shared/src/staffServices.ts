import z from 'zod';

// Request DTOs

export const createStaffServiceSchema = z.object({
  staffMemberId: z.uuid(),
  serviceId: z.uuid(),
});

export type CreateStaffServiceRequest = z.infer<typeof createStaffServiceSchema>;
export const updateStaffServiceSchema = createStaffServiceSchema.partial()
export type UpdateStaffServiceRequest = z.infer<typeof updateStaffServiceSchema>;


// Response DTOs

export type StaffServiceResponseDTO = z.infer<typeof createStaffServiceSchema>;
