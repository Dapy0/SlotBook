import { staffParamsSchema, staffBodySchema } from "./staff.schema.ts";
import {
  managedStaffMemberResponseSchema,
  staffMemberPublicResponseSchema,
  staffMemberResponseSchema,
} from "@slotbook/shared";
import { scheduleRoutes } from "../schedule/schedule.routes.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { addNewStaffMembersToFacilityById } from "./staff.service";
import { findStaffByFacilityIdPublic, findStaffMembersForOwner } from "./staff.repository";
import { assertFacilityOwner } from "../../lib/authz.ts";

export const staffRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    "/:id/staff",
    {
      schema: {
        params: staffParamsSchema,
        response: {
          200: staffMemberPublicResponseSchema.array(),
        },
      },
    },
    async (request, response) => {
      const { id: facilityId } = request.params;
      const staff = await findStaffByFacilityIdPublic(request.server.drizzle, facilityId);
      return response.status(200).send(staff);
    },
  );
  fastify.get(
    "/:id/staff/manage",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: staffParamsSchema,
        response: {
          200: managedStaffMemberResponseSchema.array(),
        },
      },
    },
    async (request, response) => {
      const { id: facilityId } = request.params;
      await assertFacilityOwner(request.server.drizzle, facilityId,request.user.id);
      const staff = await findStaffMembersForOwner(request.server.drizzle, facilityId);
      return response.status(200).send(staff);
    },
  );

  fastify.post(
    "/:id/staff",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: staffParamsSchema,
        body: staffBodySchema,
        response: { 201: staffMemberResponseSchema },
      },
    },
    async (request, response) => {
      const addedStaff = await addNewStaffMembersToFacilityById(
        request.server.drizzle,
        request.body,
        request.params.id,
        request.user.id,
      );
      return response.status(201).send(addedStaff);
    },
  );
  fastify.register(scheduleRoutes, { prefix: "/:id/staff/:staffId" });
};
