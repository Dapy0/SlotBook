import { eq } from "drizzle-orm";
import type { DB } from "../../db/drizzlePlugin.ts";
import { reviews } from "../../db/schema/reviews.ts";
import { staffMembers } from "../../db/schema/staffMember.ts";
import { bookings } from "../../db/schema/booking.ts";
import { services } from "../../db/schema/service.ts";
import type { CreateReviewRequest, ReviewResponse } from "@slotbook/shared";
import { users } from "../../db/schema/user.ts";
import { alias } from "drizzle-orm/pg-core";

export async function findReviewsByFacilityId(
  db: DB,
  facilityId: string,
): Promise<ReviewResponse[]> {
  return await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      authorName: alias(users, "clientUsers").name,
      staffMemberName: alias(users, "staffUsers").name,
      serviceName: services.name,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .innerJoin(bookings, eq(bookings.id, reviews.bookingId))
    .innerJoin(alias(users, "clientUsers"), eq(bookings.clientId, alias(users, "clientUsers").id))
    .innerJoin(staffMembers, eq(bookings.staffMemberId, staffMembers.id))
    .innerJoin(alias(users, "staffUsers"), eq(staffMembers.userId, alias(users, "staffUsers").id))
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .where(eq(bookings.facilityId, facilityId));
}
export async function insertReview(db: DB, bookingId: string, data: CreateReviewRequest) {
  const [review] = await db
    .insert(reviews)
    .values({
      bookingId: bookingId,
      ...data,
    })
    .returning();
  if (!review) throw new Error("Failed to insert review");
  return review;
}
