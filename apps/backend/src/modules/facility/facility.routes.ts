import type { FastifyInstance } from 'fastify';
import {
  createFacility,
  getAllFacilities,
  getFacilityById,
  getOwnFacilities,
  patchFacilityById,
  putFacilitySchedule,
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
} from '@slotbook/shared/facility';
import { staffRoutes } from '../staff/staff.routes.ts';
import { bookingRoutes } from '../booking/booking.routes.ts';
import {
  createFacilityScheduleSchema,
  responseFacilityScheduleSchema,
  type CreateFacilitySchedule,
} from '@slotbook/shared/facilitySchedule';

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
    getAllFacilities,
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
  fastify.put<{
    Body: CreateFacilitySchedule[];
    Params: FacilityParams;
  }>(
    '/:id/schedule',
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: facilityParamsSchema,
        body: z.array(createFacilityScheduleSchema),
        response: {
          200: z.array(responseFacilityScheduleSchema),
        },
      },
    },
    putFacilitySchedule,
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
  fastify.register(staffRoutes, { prefix: '/' });
  fastify.register(bookingRoutes, { prefix: '/' });
}
