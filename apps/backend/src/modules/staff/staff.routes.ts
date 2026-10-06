import { staffParamsSchema } from "./staff.schema.ts";
import {
  addServiceToStaffMemberRequestSchema,
  createStaffMemberRequestSchema,
  managedStaffMemberResponseSchema,
  staffMemberParamsSchema,
  staffMemberPublicResponseSchema,
  updateStaffMemberRequestSchema,
} from "@slotbook/shared";
import { scheduleRoutes } from "../schedule/schedule.routes.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { addNewStaffMembersToFacilityById } from "./staff.service";
import {
  deleteAllServicesByStaffMemberId,
  findStaffByFacilityIdPublic,
  findStaffMembersForOwner,
  insertServicesByStaffMemberId,
  updateActiveStatusByStaffId,
} from "./staff.repository";
import { assertFacilityOwner, assertFacilityStaffMember } from "../../lib/authz.ts";

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
      await assertFacilityOwner(request.server.drizzle, facilityId, request.user.id);
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
        body: createStaffMemberRequestSchema,
        response: { 201: managedStaffMemberResponseSchema },
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
  fastify.patch(
    "/:id/staff/:staffId",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: staffMemberParamsSchema,
        body: updateStaffMemberRequestSchema,
        response: { 200: managedStaffMemberResponseSchema },
      },
    },
    async (request, response) => {
      const { id: facilityId } = request.params;
      await assertFacilityOwner(request.server.drizzle, facilityId, request.user.id);
      await assertFacilityStaffMember(request.server.drizzle, facilityId, request.params.staffId);
      await updateActiveStatusByStaffId(
        request.server.drizzle,
        request.params.staffId,
        request.body,
      );
      const [staff] = await findStaffMembersForOwner(request.server.drizzle, facilityId);
      return response.send(staff);
    },
  );
  fastify.put(
    "/:id/staff/:staffId/services",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: staffMemberParamsSchema,
        body: addServiceToStaffMemberRequestSchema,
        response: { 200: managedStaffMemberResponseSchema },
      },
    },
    async (request, response) => {
      const { id: facilityId } = request.params;
      await assertFacilityOwner(request.server.drizzle, facilityId, request.user.id);
      await assertFacilityStaffMember(request.server.drizzle, facilityId, request.params.staffId);

      await request.server.drizzle
        .transaction(async (tx) => {
          await deleteAllServicesByStaffMemberId(tx, request.params.staffId);
          await insertServicesByStaffMemberId(tx, request.params.staffId, request.body);
        })
        .catch((err) => {
          throw new Error("Something in transaction went wrong :" + err);
        });
          // Осталось проверить если все status если они пренадлежат facilities и добавить на фронт потом для расписания изменения сделать
      const [staff] = await findStaffMembersForOwner(
        request.server.drizzle,
        facilityId,
        request.params.staffId,
      );
      return response.send(staff);
    },
  );
  fastify.register(scheduleRoutes, { prefix: "/:id/staff/:staffId" });
};
