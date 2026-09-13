import type { FastifyInstance } from "fastify";
import { getAvailableTime } from "./availability.controller.ts";
import {
  availabilityParamSchema,
  availabilityQuerySchema,
  type AvailabilityParamsAndQuery,
} from "./availability.schema.ts";
import { availabilitySlotSchema } from "@slotbook/shared/availability";
import z from "zod";

export function availabilityRoutes(fastify: FastifyInstance) {
  fastify.get<AvailabilityParamsAndQuery>(
    "/availability",
    {
      schema: {
        params: availabilityParamSchema,
        querystring: availabilityQuerySchema,
        response: {
          200: z.array(availabilitySlotSchema),
        },
      },
    },
    getAvailableTime,
  );
}
