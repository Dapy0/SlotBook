import { facilityCategoryQuerystringSchema, facilityParamsSchema } from "./facility.schema.ts";

import z from "zod";
import {
  createFacilityRequestSchema,
  facilityBookingDataResponseSchema,
  facilityBookingQuerySchema,
  facilityCategoryCountResponseSchema,
  facilityCityResponseSchema,
  facilityListQuerySchema,
  facilityResponseSchema,
  facilityScheduleEntryResponseSchema,
  facilityWithServicesResponseSchema,
  updateFacilityRequestSchema,
} from "@slotbook/shared";
import { staffRoutes } from "../staff/staff.routes.ts";
import { bookingRoutes } from "../booking/booking.routes.ts";

import { reviewResponseSchema } from "@slotbook/shared";
import {
  findAllFacilitiesByParams,
  findCitiesByCountry,
  getAllCategories,
} from "./facility.repository.ts";
import {
  getServicesByFacilityIds,
  getServicesWithStaffIds,
} from "../service/service.repository.ts";
import {
  changeFacilityWeekSchedule,
  createFacilityByUserId,
  getAllPublicFacilities,
  getFacilityOrThrow,
  getFacilityScheduleById,
  getOwnFacilitiesByUserId,
  removeOwnedFacilityById,
  updateOwnedFacility,
} from "./facility.service.ts";
import { findStaffByFacilityIdPublic } from "../staff/staff.repository.ts";
import { availabilityRoutes } from "../availability/availability.routes.ts";
import { changeWeekScheduleRequestSchema } from "@slotbook/shared";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { getAllFacilityReviews } from "../review/review.service";

export const facilityRoutes: FastifyPluginAsyncZod = async (fastify) => {
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
    async (request, response) => {
      const facilities = await getAllPublicFacilities(request.server.drizzle, request.query);
      response.header(
        "Cache-Control",
        "public, max-age=60, s-maxage=600, stale-while-revalidate=30",
      );
      return response.send(facilities);
    },
  );
  fastify.get(
    "/search",
    {
      schema: {
        querystring: facilityListQuerySchema,
        response: { 200: facilityWithServicesResponseSchema.array() },
      },
    },
    async (request) => {
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
        response: {
          200: z.array(facilityResponseSchema),
        },
      },
    },
    async (request, response) => {
      const facilities = await getOwnFacilitiesByUserId(request.server.drizzle, request.user.id);
      response.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
      return response.send(facilities);
    },
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
    async (request, response) => {
      const facility = await getFacilityOrThrow(request.server.drizzle, request.params.id);
      response.header("Cache-Control", "public, no-cache");
      return response.send(facility);
    },
  );
  fastify.get(
    "/:id/bookingData",
    {
      schema: {
        params: facilityParamsSchema,
        querystring: facilityBookingQuerySchema,
        response: { 200: facilityBookingDataResponseSchema },
      },
    },
    async (request) => {
      const facility = await getFacilityOrThrow(request.server.drizzle, request.params.id);
      const servicesByFacilityId = await getServicesWithStaffIds(
        request.server.drizzle,
        facility.id,
      );
      const staff = await findStaffByFacilityIdPublic(request.server.drizzle, facility.id);

      return {
        ...facility,
        staff: staff,
        services: servicesByFacilityId,
      };
    },
  );
  fastify.post(
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
    async (request, response) => {
      const facility = await createFacilityByUserId(
        request.server.drizzle,
        request.body,
        request.user.id,
      );
      return response.status(201).send(facility);
    },
  );
  fastify.patch(
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
    async (request, response) => {
      const updated = await updateOwnedFacility(
        request.server.drizzle,
        request.params.id,
        request.user.id,
        request.body,
      );
      return response.status(200).send(updated);
    },
  );

  fastify.get(
    "/:id/schedule",
    {
      schema: {
        params: facilityParamsSchema,
        response: {
          200: facilityScheduleEntryResponseSchema.array(),
        },
      },
    },
    async (request, response) => {
      const schedule = await getFacilityScheduleById(request.server.drizzle, request.params.id);
      return response.send(schedule);
    },
  );
  fastify.put(
    "/:id/schedule",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: facilityParamsSchema,
        body: changeWeekScheduleRequestSchema,
        response: {
          201: facilityScheduleEntryResponseSchema.array(),
        },
      },
    },
    async (request, response) => {
      const schedule = await changeFacilityWeekSchedule(
        request.server.drizzle,
        request.params.id,
        request.user.id,
        request.body,
      );
      return response.status(201).send(schedule);
    },
  );
  fastify.delete(
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
    async (request, response) => {
      await removeOwnedFacilityById(request.server.drizzle, request.params.id, request.user.id);

      return response.status(204);
    },
  );
  fastify.get(
    "/:id/reviews",
    {
      schema: {
        params: facilityParamsSchema,
        response: {
          200: z.array(reviewResponseSchema),
        },
      },
    },
    async (request, response) => {
      const reviews = await getAllFacilityReviews(request.server.drizzle, request.params.id);
      return response.send(reviews);
    },
  );
  fastify.get(
    "/categories",
    {
      schema: {
        querystring: facilityCategoryQuerystringSchema,
        response: {
          200: facilityCategoryCountResponseSchema.array(),
        },
      },
    },
    async (request, response) => {
      const categories = await getAllCategories(
        request.server.drizzle,
        request.query.country,
        request.query.limit,
      );
      return response.send(categories);
    },
  );
  fastify.get(
    "/cities",
    {
      schema: {
        querystring: facilityCategoryQuerystringSchema,
        response: {
          200: z.array(facilityCityResponseSchema),
        },
      },
    },
    async (request, response) => {
      response.send(await findCitiesByCountry(request.server.drizzle, request.query.country));
    },
  );
  fastify.register(staffRoutes, { prefix: "/" });
  fastify.register(bookingRoutes, { prefix: "/" });
  fastify.register(availabilityRoutes, { prefix: "/:id" });
};
