import type { FastifyReply, FastifyRequest } from 'fastify';
import { findStaffByFacilityId } from './staff.repository.ts';
import type { StaffBody, StaffParams } from './staff.schema.ts';
import { addNewStaffMembersToFacilityById } from './staff.service.ts';

export async function addStaffToFacility(
  request: FastifyRequest<{ Params: StaffParams; Body: StaffBody }>,
  response: FastifyReply,
) {
  const addedStaff = await addNewStaffMembersToFacilityById(
    request.server.drizzle,
    request.body,
    request.params.id,
    request.user.id,
  );
  return response.status(201).send(addedStaff);
}

export async function getFacilityStaff(
  request: FastifyRequest<{ Params: StaffParams }>,
  response: FastifyReply,
) {
  const { id: facilityId } = request.params;
  const staff = await findStaffByFacilityId(request.server.drizzle, facilityId);
  return response.status(200).send(staff);
}
