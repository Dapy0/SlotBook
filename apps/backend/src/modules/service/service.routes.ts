import z from "zod";
import { serviceParamsSchema } from "./service.schema.ts";
import {
  createServiceRequestSchema,
  serviceResponseSchema,
  updateServiceRequestSchema,
} from "@slotbook/shared";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import {
  createServiceByFacilityId,
  getFacilityPublicServicesById,
  getFacilityServiceById,
  getFacilityServicesForOwner,
  ownerSoftDeleteService,
  patchService,
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
      const services = await getFacilityPublicServicesById(
        request.server.drizzle,
        request.params.id,
      );

      return response.send(services);
    },
  );
  fastify.get(
    "/:id/services/manage",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: serviceParamsSchema,
        response: {
          200: serviceResponseSchema.array(),
        },
      },
    },
    async (request, reply) => {
      const services = await getFacilityServicesForOwner(
        request.server.drizzle,
        request.params.id,
        request.user.id,
      );
      return reply.send(services);
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
        request.params.id,
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
          201: serviceResponseSchema,
        },
      },
    },
    async (request, response) => {
      const createdFacility = await createServiceByFacilityId(
        request.server.drizzle,
        request.body,
        request.params.id,
        request.user.id,
      );

      return response.status(201).send(createdFacility);
    },
  );
  fastify.patch(
    "/:id/services/:serviceId",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: serviceParamsSchema.extend({
          serviceId: z.string(),
        }),
        body: updateServiceRequestSchema,
        response: {
          200: serviceResponseSchema,
        },
      },
    },
    async (request, response) => {
      const updatesService = await patchService(
        request.server.drizzle,
        request.params.id,
        request.params.serviceId,
        request.user.id,
        request.body,
      );

      return response.status(200).send(updatesService);
    },
  );
  fastify.delete(
    "/:id/services/:serviceId",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: serviceParamsSchema.extend({
          serviceId: z.string(),
        }),
      },
    },
    async (request, response) => {
      await ownerSoftDeleteService(
        request.server.drizzle,
        request.params.id,
        request.params.serviceId,
        request.user.id,
      );

      return response.status(204).send();
    },
  );
};
