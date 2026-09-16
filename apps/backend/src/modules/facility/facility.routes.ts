import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  createFacility,
  getAllFacilities,
  getAllFacilitiesCategory,
  getFacilityById,
  getFacilityReviews,
  getFacilitySchedule,
  getOwnFacilities,
  patchFacilityById,
  putFacilitySchedule,
  removeFacilityById,
} from "./facility.controller.ts";
import {
  facilityCategoryQuerystringSchema,
  facilityParamsSchema,
  type FacilityCategoryQuerystring,
  type FacilityParams,
} from "./facility.schema.ts";

import z from "zod";
import {
  createFacilityRequestSchema,
  facilityBookingQuerySchema,
  facilityCategoryResponseSchema,
  facilityCityResponseSchema,
  facilityDataForBookingSchema,
  facilityListQuerySchema,
  facilityResponseSchema,
  facilityWithServicesResponseSchema,
  updateFacilityRequestSchema,
  type CreateFacilityRequest,
  type FacilityBookingQuery,
  type FacilityListQuery,
  type UpdateFacilityRequest,
} from "@slotbook/shared/facility";
import { staffRoutes } from "../staff/staff.routes.ts";
import { bookingRoutes } from "../booking/booking.routes.ts";
import {
  createFacilityScheduleSchema,
  facilityScheduleResponseSchema,
  type CreateFacilitySchedule,
} from "@slotbook/shared/facilitySchedule";
import { reviewResponseSchema } from "@slotbook/shared/reviews";
import { findAllFacilitiesByParams, findCitiesByCountry } from "./facility.repository.ts";
import {
  getServicesByFacilityId,
  getServicesByFacilityIds,
  getServicesWithStaffIds,
} from "../service/service.repository.ts";
import { getFacilityDetails } from "./facility.service.ts";
import { findStaffByFacilityId } from "../staff/staff.repository.ts";

export async function facilityRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/",
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
    "/search",
    {
      schema: {
        querystring: facilityListQuerySchema,
        response: { 200: facilityWithServicesResponseSchema.array() },
      },
    },
    async (request: FastifyRequest<{ Querystring: FacilityListQuery }>) => {
      const facilities = await findAllFacilitiesByParams(request.server.drizzle, request.query);
      const servicesByFacilityIds = await getServicesByFacilityIds(
        request.server.drizzle,
        facilities.map((f) => f.id),
      );
      const groupedServicesWithFacilities = Object.groupBy(
        servicesByFacilityIds,
        (obj) => obj.facilityId,
      );

      return facilities.map((facility) => ({
        ...facility,
        services: groupedServicesWithFacilities[facility.id] ?? [],
      }));
    },
  );
  fastify.get(
    "/mine",
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
    "/:id",
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
  fastify.get(
    "/:id/bookingData",
    {
      schema: {
        params: facilityParamsSchema,
        querystring: facilityBookingQuerySchema,
        response: { 200: facilityDataForBookingSchema },
      },
    },
    async (
      request: FastifyRequest<{ Params: FacilityParams; Querystring: FacilityBookingQuery }>,
    ) => {
      const facility = await getFacilityDetails(request.server.drizzle, request.params.id);
      const servicesByFacilityId = await getServicesWithStaffIds(
        request.server.drizzle,
        facility.id,
      );
      const staff = await findStaffByFacilityId(request.server.drizzle, facility.id);

      return {
        ...facility,
        staff: staff,
        services: servicesByFacilityId,
      };
    },
  );
  fastify.post<{
    Body: CreateFacilityRequest;
  }>(
    "/",
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
    "/:id",
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

  fastify.get<{
    Params: FacilityParams;
  }>(
    "/:id/schedule",
    {
      schema: {
        params: facilityParamsSchema,
        response: {
          200: z.array(facilityScheduleResponseSchema),
        },
      },
    },
    getFacilitySchedule,
  );
  fastify.put<{
    Body: CreateFacilitySchedule[];
    Params: FacilityParams;
  }>(
    "/:id/schedule",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: facilityParamsSchema,
        body: z.array(createFacilityScheduleSchema),
        response: {
          200: z.array(facilityScheduleResponseSchema),
        },
      },
    },
    putFacilitySchedule,
  );
  fastify.delete<{
    Params: FacilityParams;
  }>(
    "/:id",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: facilityParamsSchema,
        response: {
          204: z.null().describe("No Content"),
        },
      },
    },
    removeFacilityById,
  );
  fastify.get<{ Params: FacilityParams }>(
    "/:id/reviews",
    {
      schema: {
        params: facilityParamsSchema,
        response: {
          200: z.array(reviewResponseSchema),
        },
      },
    },
    getFacilityReviews,
  );
  fastify.get<{ Querystring: FacilityCategoryQuerystring }>(
    "/categories",
    {
      schema: {
        querystring: facilityCategoryQuerystringSchema,
        response: {
          200: z.array(facilityCategoryResponseSchema),
        },
      },
    },
    getAllFacilitiesCategory,
  );
  fastify.get<{ Querystring: FacilityCategoryQuerystring }>(
    "/cities",
    {
      schema: {
        querystring: facilityCategoryQuerystringSchema,
        response: {
          200: z.array(facilityCityResponseSchema),
        },
      },
    },
    async (
      request: FastifyRequest<{ Querystring: FacilityCategoryQuerystring }>,
      response: FastifyReply,
    ) => {
      response.send(await findCitiesByCountry(request.server.drizzle, request.query.country));
    },
  );
  fastify.register(staffRoutes, { prefix: "/" });
  fastify.register(bookingRoutes, { prefix: "/" });
}
