import type { FastifyReply, FastifyRequest } from 'fastify';
import { findStaffByFacilityId, insertStaffMemberById } from './staff.repository.ts';
import type { CreateStaffMemberRequest } from '@slotbook/shared/staffMembers';
import type { StaffBody, StaffParams } from './staff.schema.ts';
import { findUserByEmail } from '../auth/auth.repository.ts';

export async function addStaffToFacility(
  request: FastifyRequest<{ Params: StaffParams; Body: StaffBody }>,
  response: FastifyReply,
) {
  const { id: facilityId } = request.params;
  const { email } = request.body;

  const user = await findUserByEmail(request.server.drizzle, email);

  if (!user) {
    response.code(404).send({ message: "User with this email doesn't exists" });
    return;
  }

  const newStaff = await insertStaffMemberById(request.server.drizzle, user.id, facilityId).catch(
    (err) => {
      if (err.code === '23505') {
        response.status(409).send({ message: 'This user is already working here' });
        return;
      }
    },
  );
  return response.status(201).send(newStaff);
}

export async function getFacilityStaff(
  request: FastifyRequest<{ Params: StaffParams }>,
  response: FastifyReply,
) {
  const { id: facilityId } = request.params;
  const staff = await findStaffByFacilityId(request.server.drizzle, facilityId);
  console.log("Вот стаф",staff)
  return response.status(200).send(staff);
}
