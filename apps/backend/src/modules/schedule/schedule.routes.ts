import { scheduleParamsSchema, type ScheduleBody } from "./schedule.schema.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { changeWeekSchedule, receiveStaffSchedule } from "./schedule.service";
import {
  changeWeekScheduleRequestSchema,
  staffScheduleEntryResponseSchema,
} from "@slotbook/shared";

export const scheduleRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    "/schedule",
    {
      schema: {
        params: scheduleParamsSchema,
        response: {
          200: staffScheduleEntryResponseSchema.array(),
        },
      },
    },
    async (request, response) => {
      const schedule = await receiveStaffSchedule(
        request.server.drizzle,
        request.params.id,
        request.params.staffId,
      );
      return response.send(schedule);
    },
  );
  fastify.put(
    "/schedule",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: scheduleParamsSchema,
        body: changeWeekScheduleRequestSchema,
        response: {
          200: staffScheduleEntryResponseSchema.array(),
        },
      },
    },
    async (request, response) => {
      const schedule = await changeWeekSchedule(
        request.server.drizzle,
        request.user.id,
        request.params.id,
        request.params.staffId,
        request.body as ScheduleBody,
      );
      return response.send(schedule);
    },
  );
};
