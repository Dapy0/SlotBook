import type { FastifyReply, FastifyRequest } from 'fastify';
import {
  findAllFacilities,
  findFacilitiesByOwnerId,
  insertFacility,
} from './facility.repository.ts';
import type { CreateFacilityBody, FacilitySchema } from '../../db/schema/facility.ts';

export async function getFacilities(request: FastifyRequest, response: FastifyReply) {
  const facilities = await findAllFacilities(request.server.drizzle);

  return response.status(200).send(facilities);
}
export async function getOwnFacilities(request: FastifyRequest, response: FastifyReply) {
  console.log("My Id",request.user.id);
  const facilities = await findFacilitiesByOwnerId(request.server.drizzle, request.user.id);

  return response.status(200).send(facilities);
}
// export async function getFacilityById(request: FastifyRequest, response: FastifyReply) {  }
export async function createFacility(
  request: FastifyRequest<{ Body: CreateFacilityBody }>,
  response: FastifyReply,
) {
  const {
    name,
    slug,
    description,
    category,
    city,
    address,
    latitude,
    longitude,
    phone,
    email,
    images,
    workingHours,
  } = request.body;

  const facility = await insertFacility(request.server.drizzle, {
    name,
    slug,
    description,
    category,
    city,
    address,
    latitude,
    longitude,
    phone,
    email,
    images,
    workingHours,
    ownerId: request.user.id,
  }).catch((err) => {
    request.log.error(err, 'Failed to create facility');
    return null;
  });

  if (!facility) {
    return response
      .status(400)
      .send({ message: 'Failed to create facility. Slug may already be taken.' });
  }

  return response.status(201).send(facility);
}
// export async function patchFacilityById(request: FastifyRequest, response: FastifyReply) {  }
// export async function deleteFacilityById(request: FastifyRequest, response: FastifyReply) {  }
