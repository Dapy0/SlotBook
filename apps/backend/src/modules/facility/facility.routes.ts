import type { FastifyInstance, FastifyRequest } from 'fastify';
import {
  createFacility,
  getFacilities,
  getFacilityById,
  getOwnFacilities,
  patchFacilityById,
  removeFacilityById,
} from './facility.controller.ts';
import {
  facilityListQuerySchema,
  facilityParamsSchema,
  type FacilityParams,
} from './facility.schema.ts';

import z from 'zod';
import {
  createFacilityRequestSchema,
  facilityResponseSchema,
  updateFacilityRequestSchema,
  type CreateFacilityRequest,
  type UpdateFacilityRequest,
} from '@slotbook/shared/facilities';

export async function facilityRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/',
    {
      schema: {
        querystring: facilityListQuerySchema,
        response: {
          200: z.array(facilityResponseSchema),
        },
      },
    },
    getFacilities,
  );
  fastify.get(
    '/mine',
    {
      onRequest: [fastify.authenticate],
      schema: {
        querystring: facilityListQuerySchema,
        response: {
          200: z.array(facilityResponseSchema),
        },
      },
    },
    getOwnFacilities,
  );
  fastify.get(
    '/:id',
    {
      schema: {
        params: facilityParamsSchema,
        response: {
          200: facilityResponseSchema,
        },
      },
    },
    getFacilityById,
  );
  fastify.post<{
    Body: CreateFacilityRequest;
  }>(
    '/',
    {
      onRequest: [fastify.authenticate],
      schema: {
        body: createFacilityRequestSchema,
        response: {
          201: facilityResponseSchema,
        },
      },
    },
    createFacility,
  );
  fastify.patch<{
    Body: UpdateFacilityRequest;
    Params: FacilityParams;
  }>(
    '/:id',
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: facilityParamsSchema,
        body: updateFacilityRequestSchema,
        response: {
          200: facilityResponseSchema,
        },
      },
    },
    patchFacilityById,
  );
  fastify.delete<{
    Params: FacilityParams;
  }>(
    '/:id',
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: facilityParamsSchema,
        response: {
          204: z.null().describe('No Content'),
        },
      },
    },
    removeFacilityById,
  );
}
