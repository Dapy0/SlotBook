import z from 'zod';

export const serviceParamsSchema = z.object({
  id: z.uuid(),
});
export type ServiceParams = z.infer<typeof serviceParamsSchema>;
