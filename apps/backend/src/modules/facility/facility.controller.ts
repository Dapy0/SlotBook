import type { FastifyReply, FastifyRequest } from 'fastify';
import {
  deleteFacilityById,
  findAllFacilities,
  findFacilitiesByOwnerId,
  findFacilityById,
  insertFacility,
  updateFacilityById,
} from './facility.repository.ts';
import type { CreateFacilityRequest, UpdateFacilityRequest } from '@slotbook/shared/facilities';
import type { FacilityParams } from './facility.schema.ts';
import {
  createFacilityByUserId,
  getAllPublicFacilities,
  getFacilityDetails,
  getOwnFacilitiesByUserId,
  removeOwnedFacilityById,
  updateOwnedFacility,
} from './facility.service.ts';

export async function getAllFacilities(request: FastifyRequest, response: FastifyReply) {
  const facilities = await getAllPublicFacilities(request.server.drizzle);
  response.header('Cache-Control', 'public, max-age=60, s-maxage=600, stale-while-revalidate=30');
  return response.send(facilities);
}
export async function getFacilityById(
  request: FastifyRequest<{ Params: FacilityParams }>,
  response: FastifyReply,
) {
  const facility = await getFacilityDetails(request.server.drizzle, request.params.id);
  response.header('Cache-Control', 'public, no-cache');
  return response.send(facility);
}
export async function getOwnFacilities(request: FastifyRequest, response: FastifyReply) {
  const facilities = await getOwnFacilitiesByUserId(request.server.drizzle, request.user.id);
  response.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  return response.send(facilities);
}
export async function createFacility(
  request: FastifyRequest<{ Body: CreateFacilityRequest }>,
  response: FastifyReply,
) {
  const facility = await createFacilityByUserId(
    request.server.drizzle,
    request.body,
    request.user.id,
  );
  return response.status(201).send(facility);
}
export async function patchFacilityById(
  request: FastifyRequest<{ Body: UpdateFacilityRequest; Params: FacilityParams }>,
  response: FastifyReply,
) {
  const updated = await updateOwnedFacility(
    request.server.drizzle,
    request.params.id,
    request.user.id,
    request.body,
  );
  return response.status(200).send(updated);
}

export async function removeFacilityById(
  request: FastifyRequest<{
    Params: FacilityParams;
  }>,
  response: FastifyReply,
) {
  await removeOwnedFacilityById(request.server.drizzle, request.params.id, request.user.id);

  return response.status(204).send();
}
