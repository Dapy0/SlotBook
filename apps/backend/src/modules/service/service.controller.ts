import type { FastifyReply, FastifyRequest } from 'fastify';
import { getServicesByFacilityId, insertService } from './service.repository.ts';
import { findFacilityById } from '../facility/facility.repository.ts';
import type { ServiceParams } from './service.schema.ts';
import type { CreateServiceRequest } from '@slotbook/shared/service';
import type { NewServiceEntity } from '../../db/schema/service.ts';

export async function getFacilityServices(
  request: FastifyRequest<{
    Params: ServiceParams;
  }>,
  response: FastifyReply,
) {
  const id = request.params.id;
  const services = await getServicesByFacilityId(request.server.drizzle, id);
  return response.status(200).send(services);
}
export async function createService(
  request: FastifyRequest<{
    Params: ServiceParams;
    Body: CreateServiceRequest;
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
  const newServiceData: NewServiceEntity = {
    ...body,
    facilityId:request.params.id
  };
  const service = await insertService(request.server.drizzle, newServiceData);

  return response.status(201).send(service);
}
