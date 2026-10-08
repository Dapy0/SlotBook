import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import {
  facilityBookingResponseSchema,
  staffBookingQuerySchema,
  staffMeResponseSchema,
} from "@slotbook/shared";
import { getStaffBookings, getStaffMe } from "./staff.service";

export const staffMeRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    "/me",
    {
      onRequest: [fastify.authenticate],
      schema: {
        response: {
          200: staffMeResponseSchema,
        },
      },
    },
    async (request, response) => {
      const res = await getStaffMe(request.server.drizzle, request.user.id);
      return response.send(res);
    },
  );
  fastify.get(
    "/me/bookings",
    {
      onRequest: [fastify.authenticate],

      schema: {
        querystring: staffBookingQuerySchema,
        response: {
          200: facilityBookingResponseSchema.array(),
        },
      },
    },
    async (request, response) => {
      const res = await getStaffBookings(request.server.drizzle, request.user.id, request.query);
      return response.send(res);
    },
  );
};
