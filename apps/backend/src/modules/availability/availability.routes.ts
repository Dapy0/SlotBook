import type { FastifyReply, FastifyRequest } from "fastify";
import {
  availabilityParamSchema,
  availabilityQuerySchema,
  type AvailabilityParamsAndQuery,
} from "./availability.schema.ts";
import { availabilityResponseSchema } from "@slotbook/shared";
import { getAvailableSlotsFor30days } from "./availability.service.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const availabilityRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
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
};
