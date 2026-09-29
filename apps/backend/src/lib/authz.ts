import type { FacilityResponse } from "@slotbook/shared";
import type { DB } from "../db/drizzlePlugin";
import { ForbiddenError } from "./errors";
import { assertFound } from "../modules/utils";
import { findFacilityById } from "../modules/facility/facility.repository";

export async function assertFacilityOwner(
  db: DB,
  facilityId: string,
  userId: string,
): Promise<FacilityResponse> {
  const facility = await findFacilityById(db, facilityId);
  assertFound(facility, "Facility not found");
  if (userId !== facility.ownerId) {
    throw new ForbiddenError("Not owned facility");
  }
  return facility;
}
