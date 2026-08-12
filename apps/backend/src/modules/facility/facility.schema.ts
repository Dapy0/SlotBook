import z from 'zod';

export const facilityListQuerySchema = z.object({
  city: z.string().optional(),
});

export const CreateRequestBody = z.object({
  
});
