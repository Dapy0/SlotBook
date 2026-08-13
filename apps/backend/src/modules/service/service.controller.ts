import type { FastifyReply, FastifyRequest } from 'fastify';
import { getServicesById, insertService } from './service.repository.ts';
import type { CreateServiceBody } from '../../db/schema/service.ts';
import { findFacilityById } from '../facility/facility.repository.ts';

export async function getFacilityServices(
  request: FastifyRequest<{
    Params: { id: string };
  }>,
  response: FastifyReply,
) {
  const id = request.params.id as string;
  const services = await getServicesById(request.server.drizzle, id);
  return response.status(200).send(services);
}
export async function createService(
  request: FastifyRequest<{
    Params: { id: string };
    Body: CreateServiceBody;
  }>,
  response: FastifyReply,
) {
  const body = request.body;

  const facility = await findFacilityById(request.server.drizzle, request.params.id);

  if (!facility) {
    return response.code(404).send({ message: 'Facility not found' });
  }
  const isOwner = request.user.id === facility.ownerId;

  if (!isOwner) {
    return response.code(403).send({ message: 'Not owned facility' });
  }

  const service = await insertService(request.server.drizzle, request.params.id, body);

  return response.status(201).send(service);
}
