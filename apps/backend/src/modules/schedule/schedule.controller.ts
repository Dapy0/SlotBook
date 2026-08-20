import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ScheduleBody, ScheduleParams } from './schedule.schema.ts';
import { changeWeekSchedule, receiveStaffSchedule } from './schedule.service.ts';

export async function getStaffSchedule(
  request: FastifyRequest<{ Params: ScheduleParams }>,
  response: FastifyReply,
) {
  const schedule = await receiveStaffSchedule(
    request.server.drizzle,
    request.params.facilityId,
    request.params.staffId,
  );
  return response.send(schedule);
}

export async function updateStaffSchedule(
  request: FastifyRequest<{ Params: ScheduleParams; Body: ScheduleBody }>,
  response: FastifyReply,
) {
  const schedule = await changeWeekSchedule(
    request.server.drizzle,
    request.user.id,
    request.params.facilityId,
    request.params.staffId,
    request.body,
  );
  return response.send(schedule);
}
