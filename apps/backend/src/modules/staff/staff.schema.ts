import z from "zod";

export const staffParamsSchema = z.object({
  id: z.uuid(),
});
export type StaffParams = z.infer<typeof staffParamsSchema>;
