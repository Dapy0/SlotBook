import type { FastifyReply, FastifyRequest } from 'fastify';
import type { AvailabilityParamsAndQuery } from './availability.schema.ts';
import { getAvailableTimeByStaffAndServiceId } from './availability.service.ts';

export async function getAvailableTime(
  request: FastifyRequest<AvailabilityParamsAndQuery>,
  response: FastifyReply,
) {
  const availableTime = await getAvailableTimeByStaffAndServiceId(
    request.server.drizzle,
    request.params.id,
    request.params.staffId,
    request.query.serviceId,
    request.query.date,
  );
  return response.send(
    availableTime.map((s) => ({ start: s.start.toISOString(), end: s.end.toISOString() })),
  );
}
