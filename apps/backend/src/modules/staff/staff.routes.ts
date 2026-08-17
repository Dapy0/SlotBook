import type { FastifyInstance } from 'fastify';
import { addStaffToFacility, getFacilityStaff } from './staff.controller.ts';
import {
  staffParamsSchema,
  staffBodySchema,
  type StaffParams,
  type StaffBody,
} from './staff.schema.ts';
import { staffMemberResponseSchema } from '@slotbook/shared/staffMembers';
import z from 'zod';

export async function staffRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/:id/staff',
    {
      schema: {
        params: staffParamsSchema,
        response: {
          200: z.array(staffMemberResponseSchema),
        },
      },
    },
    getFacilityStaff,
  );

  fastify.post<{ Params: StaffParams; Body: StaffBody }>(
    '/:id/staff',
    // [fastify.authenticate, requireFacilityOwnership],
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: staffParamsSchema,
        body: staffBodySchema,
      },
    },
    addStaffToFacility,
  );
}
