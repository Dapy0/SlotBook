import type { FastifyReply, FastifyRequest } from 'fastify';

import type { CreateFacilityRequest, UpdateFacilityRequest } from '@slotbook/shared/facility';
import type {
  FacilityCategoryQuerystring,
  FacilityListQuery,
  FacilityParams,
} from './facility.schema.ts';
import {
  changeFacilityWeekSchedule,
  createFacilityByUserId,
  getAllPublicFacilities,
  getFacilityDetails,
  getFacilityScheduleById,
  getOwnFacilitiesByUserId,
  removeOwnedFacilityById,
  updateOwnedFacility,
} from './facility.service.ts';
import type { CreateFacilitySchedule } from '@slotbook/shared/facilitySchedule';
import { getAllFacilityReviews } from '../review/review.service.ts';
import { getAllCategories } from './facility.repository.ts';

export async function getAllFacilities(
  request: FastifyRequest<{ Querystring: FacilityListQuery }>,
  response: FastifyReply,
) {
  const facilities = await getAllPublicFacilities(
    request.server.drizzle,
    request.query.country,
    request.query.limit,
    request.query.category,
  );
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
export async function getFacilitySchedule(
  request: FastifyRequest<{
    Params: FacilityParams;
  }>,
  response: FastifyReply,
) {
  const schedule = await getFacilityScheduleById(request.server.drizzle, request.params.id);
  return response.send(schedule);
}
export async function putFacilitySchedule(
  request: FastifyRequest<{
    Params: FacilityParams;
    Body: CreateFacilitySchedule[];
  }>,
  response: FastifyReply,
) {
  const schedule = await changeFacilityWeekSchedule(
    request.server.drizzle,
    request.params.id,
    request.user.id,
    request.body,
  );
  return response.status(201).send(schedule);
}

export async function getFacilityReviews(
  request: FastifyRequest<{
    Params: FacilityParams;
  }>,
  response: FastifyReply,
) {
  const reviews = await getAllFacilityReviews(request.server.drizzle, request.params.id);
  return response.send(reviews);
}

export async function getAllFacilitiesCategory(
  request: FastifyRequest<{ Querystring: FacilityCategoryQuerystring }>,
  response: FastifyReply,
) {
  const categories = await getAllCategories(request.server.drizzle,request.query.country, request.query.limit);
  return response.send(categories);
}
