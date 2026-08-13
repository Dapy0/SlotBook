import type { FastifyInstance, FastifyRequest } from 'fastify';
import {
  createFacility,
  deleteFacilityById,
  getFacilities,
  getFacilityById,
  getOwnFacilities,
  patchFacilityById,
} from './fascility.controller.ts';
import { facilityListQuerySchema } from './facility.schema.ts';
import {
  insertFacilitySchema,
  selectFacilitySchema,
  updateFacilitySchema,
  type CreateFacilityBody,
  type UpdateFacilityBody,
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
    '/:id',
    {
      schema: {
        params: {
          id: z.string(),
        },
        response: {
          200: z.array(selectFacilitySchema),
        },
      },
    },
    getFacilityById,
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
  fastify.patch<{
    Body: UpdateFacilityBody;
    Params: {id:string}
  }>(
    '/:id',
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: {
          id: z.string(),
        },
        body: updateFacilitySchema,
        response: {
          200: selectFacilitySchema,
        },
      },
    },
    patchFacilityById,
  );
  fastify.delete<{
    Params: { id: string };
  }>(
    '/:id',
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: {
          id: z.string(),
        },
        response: {
          200: selectFacilitySchema,
        },
      },
    },
    deleteFacilityById,
  );
}
