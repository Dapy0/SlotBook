import type {
  BookingPolicyResponse,
  CreateFacilityRequest,
  FacilityReadinessResponse,
  FacilityResponse,
  FacilityScheduleEntryResponse,
  UpdateBookingPolicyRequest,
  UpdateFacilityRequest,
} from "@slotbook/shared";
import type { DB } from "../../db/drizzlePlugin.ts";
import {
  findFacilitiesByOwnerId,
  findFacilityById,
  insertFacility,
  updateFacilityById,
  deleteFacilityById,
  findFacilityBySlug,
  countReadinessFacts,
  setFacilityPublished,
  findFacilityBookingsPolicy,
  updateFacilityBookingsPolicy,
} from "./facility.repository.ts";
import { BadRequestError, ConflictError, NotFoundError } from "../../lib/errors.ts";
import {
  deleteFacilityScheduleByFacilityId,
  findFacilitySchedule,
  findFacilityScheduleBySlug,
  findSlugsStartingWith,
  insertFacilityScheduleByFacilityId,
} from "./facilitySchedule.repository.ts";
import type { ChangeWeekScheduleRequest } from "@slotbook/shared";
import { assertFound } from "../utils";
import { getPgErrorCode, PG } from "../../lib/pgErrors";
import { assertFacilityOwner } from "../../lib/authz";
import { isLeadWithinHorizon, slugifyStr } from "@slotbook/shared";
import { findBookingsByFacilityId } from "../booking/booking.repository";
import { toFacilityResponse } from "./facility.mapper";
import type { FacilityEntity } from "../../db/schema";
export async function getFacilityBySlugOrThrow(db: DB, slug: string): Promise<FacilityEntity> {
  const facility = await findFacilityBySlug(db, slug);
  assertFound(facility, "Facility not found");
  return facility;
}
export async function getFacilityByIdOrThrow(db: DB, facilityId: string): Promise<FacilityEntity> {
  const facility = await findFacilityById(db, facilityId);
  assertFound(facility, "Facility not found");
  return facility;
}
export async function updateBookingPolicy(
  db: DB,
  facilityId: string,
  userId: string,
  body: UpdateBookingPolicyRequest,
): Promise<BookingPolicyResponse> {
  await assertFacilityOwner(db, facilityId, userId);

  const current = await findFacilityBookingsPolicy(db, facilityId);
  assertFound(current, "Facility not found");

  const next = { ...current, ...body };

  if (!isLeadWithinHorizon(next.bookingLeadMinutes!, next.bookingHorizonDays!)) {
    throw new BadRequestError();
  }

  const updated = await updateFacilityBookingsPolicy(db, facilityId, body);
  assertFound(updated, "Facility not found");
  return updated;
}

export async function getOwnFacilitiesByUserId(
  db: DB,
  userId: string,
): Promise<FacilityResponse[]> {
  return (await findFacilitiesByOwnerId(db, userId)).map((facility) =>
    toFacilityResponse(facility),
  );
}
export async function createFacilityByUserId(
  db: DB,
  data: CreateFacilityRequest,
  userId: string,
): Promise<FacilityResponse> {
  const slug = await generateUniqueSlug(db, data.name);
  try {
    return toFacilityResponse(
      await insertFacility(db, {
        ...data,
        ownerId: userId,
        slug: slug,
        isPublished: false,
      }),
    );
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
): Promise<FacilityResponse> {
  await assertFacilityOwner(db, facilityId, userId);

  try {
    const updatedFacility = await updateFacilityById(db, facilityId, data);
    if (!updatedFacility) {
      throw new NotFoundError("Facility not found");
    }
    return toFacilityResponse(updatedFacility);
  } catch (e) {
    if (getPgErrorCode(e) === PG.UNIQUE) {
      throw new ConflictError(`Venue with such slug: ${data.slug} already exists. `);
    }
    throw e;
  }
}

export async function removeOwnedFacilityById(
  db: DB,
  facilityId: string,
  userId: string,
): Promise<FacilityResponse> {
  await assertFacilityOwner(db, facilityId, userId);
  const bookings = await findBookingsByFacilityId(db, facilityId);
  if (bookings.length > 0) {
    throw new ConflictError("You still have bookings so u can not delete your facility");
  }
  const deletedFacility = await deleteFacilityById(db, facilityId);
  if (!deletedFacility) {
    throw new NotFoundError("Facility not found");
  }
  return toFacilityResponse(deletedFacility);
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

export async function generateUniqueSlug(db: DB, name: string): Promise<string> {
  const base = slugifyStr(name);
  if (base.length === 0) {
    throw new BadRequestError("Wrong name. So can not generate proper slug");
  }
  const taken = await findSlugsStartingWith(db, base);
  let newName = base;
  let i = 1;
  while (taken.includes(newName)) {
    newName = `${base}-${i}`;
    i++;
  }
  return newName;
}
export async function getOwnedFacility(
  db: DB,
  id: string,
  userId: string,
): Promise<FacilityResponse> {
  const facility = await assertFacilityOwner(db, id, userId);
  return facility;
}

export async function getFacilityReadiness(
  db: DB,
  id: string,
  userId: string,
): Promise<FacilityReadinessResponse> {
  const facility = await assertFacilityOwner(db, id, userId);
  const facts = await countReadinessFacts(db, id);

  const checks: FacilityReadinessResponse["checks"] = [
    { key: "HAS_HOURS", ok: facts.hours > 0 },
    { key: "HAS_ACTIVE_SERVICE", ok: facts.activeServices > 0 },
    { key: "HAS_BOOKABLE_STAFF", ok: facts.bookableStaff > 0 },
    { key: "HAS_LOCATION", ok: !(facility.latitude === 0 && facility.longitude === 0) },
  ];

  return {
    ready: checks.every((obj) => obj.ok),
    checks: checks,
  };
}
export async function publishFacility(
  db: DB,
  id: string,
  userId: string,
): Promise<FacilityResponse> {
  const facility = await assertFacilityOwner(db, id, userId);
  const { ready } = await getFacilityReadiness(db, id, userId);
  if (!ready) {
    throw new ConflictError("Facility is not ready yet");
  }
  if (facility.isPublished) {
    return facility;
  }
  const updatedFacility = await setFacilityPublished(db, id, true);
  if (!updatedFacility) {
    throw new ConflictError("Something went wrong");
  }
  return toFacilityResponse(updatedFacility);
}

export async function unPublishFacility(
  db: DB,
  id: string,
  userId: string,
): Promise<FacilityResponse> {
  const facility = await assertFacilityOwner(db, id, userId);
  const { ready } = await getFacilityReadiness(db, id, userId);
  if (!ready) {
    throw new ConflictError("Facility is not ready yet");
  }
  if (facility.isPublished == false) {
    return facility;
  }
  const updatedFacility = await setFacilityPublished(db, id, false);
  if (!updatedFacility) {
    throw new ConflictError("Something went wrong");
  }
  return toFacilityResponse(updatedFacility);
}
