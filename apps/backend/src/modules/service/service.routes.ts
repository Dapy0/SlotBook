import type { FastifyInstance } from 'fastify';
import z from 'zod';
import { createService, getFacilityServices } from './service.controller.ts';
import { serviceParamsSchema, type ServiceParams } from './service.schema.ts';
import {
  createServiceSchema,
  serviceResponseSchema,
  type ServiceResponseDTO,
} from '@slotbook/shared/service';

export async function serviceRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/:id/services',
    {
      schema: {
        params: serviceParamsSchema,
        response: {
          200: z.array(serviceResponseSchema),
        },
      },
    },
    getFacilityServices,
  );
  fastify.post<{
    Params: ServiceParams;
    Body: ServiceResponseDTO;
  }>(
    '/:id/services',
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: serviceParamsSchema,
        body: createServiceSchema,
        response: {
          201: serviceResponseSchema,
        },
      },
    },
    createService,
  );
}
