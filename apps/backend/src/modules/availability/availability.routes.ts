import { availabilityParamSchema } from "./availability.schema.ts";
import { availabilityQuerySchema, availabilityResponseSchema } from "@slotbook/shared";
import { getAvailableSlots } from "./availability.service.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const availabilityRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    "/:id/availability",
    {
      schema: {
        params: availabilityParamSchema,
        querystring: availabilityQuerySchema,
        response: {
          200: availabilityResponseSchema,
        },
      },
    },
    async function (request, response) {
      const availableTime = await getAvailableSlots(
        request.server.drizzle,
        request.params.id,
        request.query.staffId,
        request.query.serviceId,
      );
      return response.send(availableTime);
    },
  );
};
