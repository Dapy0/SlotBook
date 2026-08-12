import type { FastifyInstance, FastifyRequest } from 'fastify';
import { createFacility, getFacilities, getOwnFacilities } from './fascility.controller.ts';
import { facilityListQuerySchema } from './facility.schema.ts';
import {
  insertFacilitySchema,
  selectFacilitySchema,
  type CreateFacilityBody,
} from '../../db/schema/facility.ts';
import z from 'zod';

export async function facilityRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/',
    {
      schema: {
        querystring: facilityListQuerySchema,
        response: {
          200: z.array(selectFacilitySchema),
        },
      },
    },
    getFacilities,
  );
  fastify.get(
    '/getOwnFacilities',
    {
      onRequest: [fastify.authenticate],
      schema: {
        querystring: facilityListQuerySchema,
        response: {
          200: z.array(selectFacilitySchema),
        },
      },
    },
    getOwnFacilities,
  );
  fastify.post<{
    Body: CreateFacilityBody;
  }>(
    '/',
    {
      onRequest: [fastify.authenticate],
      schema: {
        body: insertFacilitySchema,
        response: {
          201: selectFacilitySchema,
        },
      },
    },
    createFacility,
  );
}
