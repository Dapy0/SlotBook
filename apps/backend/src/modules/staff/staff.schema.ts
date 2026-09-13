import z from "zod";

export const staffParamsSchema = z.object({
  id: z.uuid(),
});
export type StaffParams = z.infer<typeof staffParamsSchema>;
export const staffBodySchema = z.object({
  email: z.email(),
});

export type StaffBody = z.infer<typeof staffBodySchema>;
