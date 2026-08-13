import type { FastifyInstance } from 'fastify';
import z from 'zod';
import { createService, getFacilityServices } from './service.controller.ts';
import {
  insertServiceSchema,
  selectServiceSchema,
  type CreateServiceBody,
} from '../../db/schema/service.ts';

export async function serviceRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/:id/services',
    {
      schema: {
        params: z.object({
          id: z.uuid(),
        }),
        response: {
          200: z.array(selectServiceSchema),
        },
      },
    },
    getFacilityServices,
  );
  fastify.post<{
    Params: { id: string };
    Body: CreateServiceBody;
  }>(
    '/:id/services',
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: z.object({
          id: z.uuid(),
        }),
        body: insertServiceSchema,
        response: {
          201: selectServiceSchema,
        },
      },
    },
    createService,
  );
}
