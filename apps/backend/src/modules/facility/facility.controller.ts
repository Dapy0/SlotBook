import type { FastifyReply, FastifyRequest } from 'fastify';
import {
  deleteFacilityById,
  findAllFacilities,
  findFacilitiesByOwnerId,
  findFacilityById,
  insertFacility,
  updateFacilityById,
} from './facility.repository.ts';
import type {
  CreateFacilityBody,
  FacilitySchema,
  UpdateFacilityBody,
} from '../../db/schema/facility.ts';

export async function getFacilities(request: FastifyRequest, response: FastifyReply) {
  const facilities = await findAllFacilities(request.server.drizzle);

  return response.status(200).send(facilities);
}
export async function getOwnFacilities(request: FastifyRequest, response: FastifyReply) {
  const facilities = await findFacilitiesByOwnerId(request.server.drizzle, request.user.id);

  return response.status(200).send(facilities);
}
export async function getFacilityById(
  request: FastifyRequest<{ Params: { id: string } }>,
  response: FastifyReply,
) {
  const { id } = request.params;
  const facility = await findFacilityById(request.server.drizzle, id);

  if (!facility) {
    return response.status(404).send({ message: 'Facility not found' });
  }
  return response.code(200).send(facility);
}
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
export async function patchFacilityById(
  request: FastifyRequest<{ Body: UpdateFacilityBody; Params: { id: string } }>,
  response: FastifyReply,
) {
  const body = request.body as UpdateFacilityBody;
  const facility = await findFacilityById(request.server.drizzle, request.params.id);

  if (!facility) {
    return response.code(404).send({ message: 'Facility not found' });
  }
  const isOwner = request.user.id === facility.ownerId;

  if (!isOwner) {
    return response.code(403).send({ message: 'Not owned facility' });
  }

  const updatedFacility = await updateFacilityById(request.server.drizzle, request.params.id, body);

  if (!updatedFacility) {
    return response.status(404).send({ message: 'Facility not found' });
  }

  return response.status(200).send(updatedFacility);
}
export async function removeFacilityById(
  request: FastifyRequest<{
    Params: { id: string };
  }>,
  response: FastifyReply,
) {
  const facility = await findFacilityById(request.server.drizzle, request.params.id);

  if (!facility) {
    return response.code(404).send({ message: 'Facility not found' });
  }
  const isOwner = request.user.id === facility.ownerId;

  if (!isOwner) {
    return response.code(403).send({ message: 'Not owned facility' });
  }
  await deleteFacilityById(request.server.drizzle, request.params.id);

  return response.status(204).send();
}
