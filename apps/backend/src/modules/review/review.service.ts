import type { CreateReviewRequest } from '@slotbook/shared/reviews';
import type { DB } from '../../db/drizzlePlugin.ts';
import { findBookingById } from '../booking/booking.repository.ts';
import { ConflictError, ForbiddenError, NotFoundError } from '../../lib/errors.ts';
import { parseTsRangeLiteral } from '@slotbook/shared/bookings';
import { findReviewsByFacilityId, insertReview } from './review.repository.ts';

export async function createReviewForBooking(
  db: DB,
  userId: string,
  bookingId: string,
  reviewData: CreateReviewRequest,
) {
  const booking = await findBookingById(db, bookingId);
  if (!booking) {
    throw new NotFoundError('No such booking found');
  }
  if (booking.clientId !== userId) {
    throw new ForbiddenError();
  }
  if (booking.status !== 'confirmed') {
    throw new ConflictError('Booking is not confirmed');
  }
  if (parseTsRangeLiteral(booking.timeRange).end! > new Date()) {
    throw new ConflictError('Service has not happened yet');
  }
  await insertReview(db, bookingId, reviewData).catch((e) => {
    const pgError = (e as any)?.cause ?? e;
    if (pgError?.code === '23505') {
      throw new ConflictError('You already reviewed this booking');
    }

    throw e;
  });
}
export async function getAllFacilityReviews(db: DB, facilityId: string) {
  const reviews = await findReviewsByFacilityId(db,facilityId)
  return reviews;
}
