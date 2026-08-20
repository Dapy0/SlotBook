import {  staffScheduleSchema } from '@slotbook/shared/staffSchedule';
import z from 'zod';

export const scheduleParamsSchema = z.object({
  staffId: z.uuid().nonempty(),
  facilityId: z.uuid().nonempty(),
});
export type ScheduleParams = z.infer<typeof scheduleParamsSchema>;
const scheduleObjectWithoutIdSchema = staffScheduleSchema
  .omit({ staffMemberId: true })
  .refine((obj) => obj.startTime < obj.endTime, {
    message: 'Start Time must be before end time',
    path: ['endTime'],
  });

export const scheduleBody = z.array(scheduleObjectWithoutIdSchema).min(1);
export type ScheduleBody = z.infer<typeof scheduleBody>;
