import type {
  CreateFacilityRequest,
  FacilityListQuery,
  FacilityResponse,
  FacilityScheduleEntryResponse,
  UpdateFacilityRequest,
} from "@slotbook/shared";
import type { DB } from "../../db/drizzlePlugin.ts";
import {
  findAllFacilitiesByParams,
  findFacilitiesByOwnerId,
  findFacilityById,
  insertFacility,
  updateFacilityById,
  deleteFacilityById,
  findFacilityBySlug,
} from "./facility.repository.ts";
import { ConflictError, NotFoundError } from "../../lib/errors.ts";
import {
  deleteFacilityScheduleByFacilityId,
  findFacilitySchedule,
  findFacilityScheduleBySlug,
  insertFacilityScheduleByFacilityId,
} from "./facilitySchedule.repository.ts";
import type { ChangeWeekScheduleRequest } from "@slotbook/shared";
import { assertFound } from "../utils";
import { getPgErrorCode, PG } from "../../lib/pgErrors";
import { assertFacilityOwner } from "../../lib/authz";
import { slugifyStr } from "../../../../../packages/shared/src/utils/slug";
export async function getFacilityBySlugOrThrow(
  db: DB,
  facilityId: string,
): Promise<FacilityResponse> {
  const facility = await findFacilityBySlug(db, facilityId);
  assertFound(facility, "Facility not found");
  return facility;
}
export async function getFacilityByIdOrThrow(
  db: DB,
  facilityId: string,
): Promise<FacilityResponse> {
  const facility = await findFacilityById(db, facilityId);
  assertFound(facility, "Facility not found");
  return facility;
}

export async function getAllPublicFacilities(
  db: DB,
  query: FacilityListQuery,
): Promise<FacilityResponse[]> {
  return findAllFacilitiesByParams(db, query);
}

export async function getOwnFacilitiesByUserId(
  db: DB,
  userId: string,
): Promise<FacilityResponse[]> {
  return findFacilitiesByOwnerId(db, userId);
}
export async function createFacilityByUserId(db: DB, data: CreateFacilityRequest, userId: string) {
  try {
    return await insertFacility(db, {
      ...data,
      ownerId: userId,
    });
  } catch (e: unknown) {
    if (getPgErrorCode(e) === PG.UNIQUE) {
      throw new ConflictError("Slug already exists");
    }

    throw e;
  }
}

export async function updateOwnedFacility(
  db: DB,
  facilityId: string,
  userId: string,
  data: UpdateFacilityRequest,
  now = new Date(),
): Promise<FacilityResponse> {
  await assertFacilityOwner(db, facilityId, userId);

  const updatedFacility = await updateFacilityById(db, facilityId, data).catch((e) => {
    if (getPgErrorCode(e) === PG.UNIQUE) {
      throw new ConflictError(`Venue with such slug: ${data.slug} already exists. `);
    }
  });

  if (!updatedFacility) {
    throw new NotFoundError("Facility not found");
  }
  return updatedFacility;
}

export async function removeOwnedFacilityById(
  db: DB,
  facilityId: string,
  userId: string,
): Promise<FacilityResponse> {
  await assertFacilityOwner(db, facilityId, userId);

  const deletedFacility = await deleteFacilityById(db, facilityId);
  if (!deletedFacility) {
    throw new NotFoundError("Facility not found");
  }
  return deletedFacility;
}
export async function getFacilityScheduleBySlug(
  db: DB,
  slug: string,
): Promise<FacilityScheduleEntryResponse[]> {
  const schedule = await findFacilityScheduleBySlug(db, slug);
  if (!schedule) {
    throw new NotFoundError("No schedule for this facility");
  }
  return schedule;
}
export async function getFacilityScheduleById(
  db: DB,
  facilityId: string,
): Promise<FacilityScheduleEntryResponse[]> {
  const schedule = await findFacilitySchedule(db, facilityId);
  if (!schedule) {
    throw new NotFoundError("No schedule for this facility");
  }
  return schedule;
}
export async function changeFacilityWeekSchedule(
  db: DB,
  facilityId: string,
  requestedUserId: string,
  newSchedule: ChangeWeekScheduleRequest,
): Promise<FacilityScheduleEntryResponse[]> {
  await assertFacilityOwner(db, facilityId, requestedUserId);

  const transaction = await db.transaction(async (tx) => {
    await deleteFacilityScheduleByFacilityId(tx, facilityId);
    return await insertFacilityScheduleByFacilityId(tx, facilityId, newSchedule);
  });
  if (!transaction) {
    throw new Error("Something in transaction went wrong");
  }
  return transaction;
}
export async function createFacilityDraft(
  db: DB,
  userId: string,
  data: CreateFacilityRequest,
): Promise<FacilityResponse> {
  const base = slugifyStr(data.name);

  const res = await insertFacility(db, { ...data, ownerId: userId, slug: base }).catch((e) => {
    if (getPgErrorCode(e) === PG.UNIQUE) {
      throw new ConflictError(`Venue with such slug: ${base} already exists. `);
    }
    throw e;
  });
  return res;
}
