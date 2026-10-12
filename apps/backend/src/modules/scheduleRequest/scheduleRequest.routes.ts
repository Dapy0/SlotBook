import {
  createScheduleRequestSchema,
  rejectScheduleRequestSchema,
  scheduleRequestDetailResponseSchema,
  scheduleRequestListQuerySchema,
  scheduleRequestResponseSchema,
} from "@slotbook/shared";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import {
  approveScheduleRequest,
  getFacilityScheduleRequest,
  listFacilityScheduleRequests,
  listMyScheduleRequests,
  rejectScheduleRequest,
  submitScheduleRequest,
  withdrawScheduleRequest,
} from "./scheduleRequest.service";
import {
  facilityScheduleRequestParamsSchema,
  facilityScheduleRequestsParamsSchema,
  myScheduleRequestParamsSchema,
} from "./scheduleRequest.schema";

export const scheduleRequestRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    "/:id/schedule-requests",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: facilityScheduleRequestsParamsSchema,
        querystring: scheduleRequestListQuerySchema,
        response: { 200: scheduleRequestResponseSchema.array() },
      },
    },
    async (request, response) => {
      const res = await listFacilityScheduleRequests(
        request.server.drizzle,
        request.user.id,
        request.params.id,
        request.query,
      );
      return response.send(res);
    },
  );
  fastify.get(
    "/:id/schedule-requests/:requestId",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: facilityScheduleRequestParamsSchema,
        response: { 200: scheduleRequestDetailResponseSchema },
      },
    },
    async (request, response) => {
      const res = await getFacilityScheduleRequest(
        request.server.drizzle,
        request.user.id,
        request.params.id,
        request.params.requestId,
      );
      return response.send(res);
    },
  );

  fastify.post(
    "/:id/schedule-requests/:requestId/approve",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: facilityScheduleRequestParamsSchema,
        response: { 200: scheduleRequestResponseSchema },
      },
    },
    async (request, response) => {
      const res = await approveScheduleRequest(
        request.server.drizzle,
        request.user.id,
        request.params.id,
        request.params.requestId,
      );
      return response.send(res);
    },
  );
  fastify.post(
    "/:id/schedule-requests/:requestId/reject",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: facilityScheduleRequestParamsSchema,
        body: rejectScheduleRequestSchema,
        response: { 200: scheduleRequestResponseSchema },
      },
    },
    async (request, response) => {
      const res = await rejectScheduleRequest(
        request.server.drizzle,
        request.user.id,
        request.params.id,
        request.params.requestId,
        request.body,
      );
      return response.send(res);
    },
  );
};

export const scheduleRequestMeRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post(
    "/",
    {
      onRequest: [fastify.authenticate],
      schema: {
        body: createScheduleRequestSchema,
        response: {
          201: scheduleRequestResponseSchema,
        },
      },
    },
    async (request, response) => {
      const res = await submitScheduleRequest(
        request.server.drizzle,
        request.user.id,
        request.body,
      );
      return response.code(201).send(res);
    },
  );
  fastify.get(
    "/",
    {
      onRequest: [fastify.authenticate],
      schema: {
        querystring: scheduleRequestListQuerySchema,
        response: {
          200: scheduleRequestResponseSchema.array(),
        },
      },
    },
    async (request, response) => {
      const res = await listMyScheduleRequests(
        request.server.drizzle,
        request.user.id,
        request.query,
      );
      return response.send(res);
    },
  );
  fastify.post(
    "/:requestId/withdraw",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: myScheduleRequestParamsSchema,
        response: {
          200: scheduleRequestResponseSchema,
        },
      },
    },
    async (request, response) => {
      const res = await withdrawScheduleRequest(
        request.server.drizzle,
        request.user.id,
        request.params.requestId,
      );
      return response.send(res);
    },
  );
};
