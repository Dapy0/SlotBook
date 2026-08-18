import type { FastifyReply, FastifyRequest } from 'fastify';
import { getServicesByFacilityId, insertService } from './service.repository.ts';
import { findFacilityById } from '../facility/facility.repository.ts';
import type { ServiceParams } from './service.schema.ts';
import type { CreateServiceRequest } from '@slotbook/shared/service';
import type { NewServiceEntity } from '../../db/schema/service.ts';
import { createServiceByFacilityId, getFacilityServicesById } from './service.service.ts';

export async function getFacilityServices(
  request: FastifyRequest<{
    Params: ServiceParams;
  }>,
  response: FastifyReply,
) {
  const services = await getFacilityServicesById(request.server.drizzle, request.params.id);

  return response.send(services);
}
export async function createService(
  request: FastifyRequest<{
    Params: ServiceParams;
    Body: CreateServiceRequest;
  }>,
  response: FastifyReply,
) {
  const createdFacility = await createServiceByFacilityId(
    request.server.drizzle,
    request.body,
    request.params.id,
    request.user.id,
  );

  return response.status(201).send(createdFacility);
}
