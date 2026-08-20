import {
  responseStaffScheduleSchema,
} from '@slotbook/shared/staffSchedule';
import type { FastifyInstance } from 'fastify';
import z from 'zod';
import { getStaffSchedule, updateStaffSchedule } from './schedule.controller.ts';
import {
  scheduleBody,
  scheduleParamsSchema,
  type ScheduleBody,
  type ScheduleParams,
} from './schedule.schema.ts';


export async function scheduleRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/schedule',
    {
      schema: {
        params: scheduleParamsSchema,
        response: {
          200: z.array(responseStaffScheduleSchema),
        },
      },
    },
    getStaffSchedule,
  );
  fastify.put<{ Params: ScheduleParams; Body: ScheduleBody }>(
    '/schedule',
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: scheduleParamsSchema,
        body: scheduleBody,
        response: {
          200: z.array(responseStaffScheduleSchema),
        },
      },
    },
    updateStaffSchedule,
  );
}
