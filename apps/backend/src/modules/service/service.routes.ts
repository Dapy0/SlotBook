import z from "zod";
import { serviceParamsSchema } from "./service.schema.ts";
import { createServiceRequestSchema, serviceResponseSchema } from "@slotbook/shared";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import {
  createServiceByFacilityId,
  getFacilityServiceById,
  getFacilityServicesById,
} from "./service.service";

export const serviceRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    "/:id/services",
    {
      schema: {
        params: serviceParamsSchema,
        response: {
          200: serviceResponseSchema.array(),
        },
      },
    },
    async (request, response) => {
      const services = await getFacilityServicesById(request.server.drizzle, request.params.id);

      return response.send(services);
    },
  );
  fastify.get(
    "/:id/services/:serviceId",
    {
      schema: {
        params: serviceParamsSchema.extend({
          serviceId: z.string(),
        }),
        response: {
          200: serviceResponseSchema,
        },
      },
    },
    async (request, response) => {
      const service = await getFacilityServiceById(
        request.server.drizzle,
        request.params.serviceId,
        request.params.id
      );

      return response.send(service);
    },
  );
  fastify.post(
    "/:id/services",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: serviceParamsSchema,
        body: createServiceRequestSchema,
        response: {
          201: serviceResponseSchema.omit({ currency: true }),
        },
      },
    },
    async (request, response) => {
      const createdFacility = await createServiceByFacilityId(
        request.server.drizzle,
        request.body,
        request.params.id,
        request.user.id
      );

      return response.status(201).send(createdFacility);
    },
  );
};
