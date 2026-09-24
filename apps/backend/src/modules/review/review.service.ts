import type { CreateReviewRequest, ReviewResponse } from "@slotbook/shared";
import type { DB } from "../../db/drizzlePlugin.ts";
import { findBookingById } from "../booking/booking.repository.ts";
import { ConflictError, ForbiddenError, NotFoundError } from "../../lib/errors.ts";
import { findReviewsByFacilityId, insertReview } from "./review.repository.ts";
import { updateFacilityScore } from "../facility/facility.repository.ts";
import { getPgErrorCode, PG } from '../../lib/pgErrors';

export async function createReviewForBooking(
  db: DB,
  userId: string,
  bookingId: string,
  facilityId: string,
  reviewData: CreateReviewRequest,
) {
  const booking = await findBookingById(db, bookingId);
  if (!booking) {
    throw new NotFoundError("No such booking found");
  }
  if (booking.facilityId !== facilityId) {
    throw new ForbiddenError("Can not review another facility service");
  }
  if (booking.clientId !== userId) {
    throw new ForbiddenError();
  }
  if (booking.status !== "confirmed") {
    throw new ConflictError("Booking is not confirmed");
  }
  // if (new Date(parseTsRangeLiteral(booking.timeRange).end!) > new Date()) {
  //   throw new ConflictError("Service has not happened yet");
  // }
  await insertReview(db, bookingId, reviewData).catch((e) => {
    if (getPgErrorCode(e) === PG.UNIQUE) {
      throw new ConflictError("You already reviewed this booking");
    }

    throw e;
  });
  await updateFacilityScore(db, facilityId);
  return;
}
export async function getAllFacilityReviews(db: DB, facilityId: string): Promise<ReviewResponse[]> {
  const reviews = await findReviewsByFacilityId(db, facilityId);
  return reviews;
}
