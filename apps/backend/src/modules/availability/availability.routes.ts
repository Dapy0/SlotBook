import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  availabilityParamSchema,
  availabilityQuerySchema,
  type AvailabilityParamsAndQuery,
} from "./availability.schema.ts";
import { availabilityResponseSchema } from "@slotbook/shared/availability";
import { getAvailableSlotsFor30days } from './availability.service.ts';

export function availabilityRoutes(fastify: FastifyInstance) {
  fastify.get<AvailabilityParamsAndQuery>(
    "/availability",
    {
      schema: {
        params: availabilityParamSchema,
        querystring: availabilityQuerySchema,
        response: {
          200: availabilityResponseSchema,
        },
      },
    },
    async function (request: FastifyRequest<AvailabilityParamsAndQuery>, response: FastifyReply) {
      const availableTime = await getAvailableSlotsFor30days(
        request.server.drizzle,
        request.params.id,
        request.query.staff,
        request.query.service,
      );
      return response.send(availableTime);
    },
  );
}
