import { and, count, eq, sql } from "drizzle-orm";
import type { DB } from "../../db/drizzlePlugin.ts";
import { staffMembers, type StaffMemberEntity } from "../../db/schema/staffMember.ts";
import { staffServices, type StaffServiceEntity } from "../../db/schema/staffService.ts";
import { services } from "../../db/schema/service.ts";
import { users } from "../../db/schema/user.ts";
import { reviews } from "../../db/schema/reviews.ts";
import { bookings } from "../../db/schema/booking.ts";
import type { StaffMemberPublicResponse } from "@slotbook/shared";

export async function findStaffByFacilityIdPublic(
  db: DB,
  facilityId: string,
): Promise<StaffMemberPublicResponse[]> {
  return await db
    .select({
      id: staffMembers.id,
      name: users.name,
      score: sql<number | null>`avg(${reviews.rating})`,
      reviewsCount: count(reviews.id),
    })
    .from(staffMembers)
    .innerJoin(users, eq(users.id, staffMembers.userId))
    .leftJoin(bookings, eq(bookings.staffMemberId, staffMembers.id))
    .leftJoin(reviews, eq(reviews.bookingId, bookings.id))
    .where(and(eq(staffMembers.facilityId, facilityId), eq(staffMembers.isActive, true)))
    .groupBy(staffMembers.id, users.name);
}

export async function findStaffMemberById(
  db: DB,
  staffMemberId: string,
): Promise<StaffMemberEntity> {
  const [member] = await db
    .select()
    .from(staffMembers)

    .where(eq(staffMembers.id, staffMemberId));
  return member ?? null;
}

export async function insertStaffMemberById(
  db: DB,
  userId: string,
  facilityId: string,
): Promise<StaffMemberEntity> {
  const [staffMember] = await db.insert(staffMembers).values({ userId, facilityId }).returning();
  if (!staffMember) {
    throw new Error("Failed to insert staff member");
  }
  return staffMember;
}

export async function assignServiceToStaff(
  db: DB,
  staffMemberId: string,
  serviceId: string,
): Promise<StaffServiceEntity> {
  const [assignedService] = await db
    .insert(staffServices)
    .values({ staffMemberId, serviceId })
    .returning();
  if (!assignedService) {
    throw new Error("Failed to assign service to staff member");
  }
  return assignedService;
}

export async function findServicesByStaffMemberId(db: DB, staffMemberId: string) {
  //   SELECT  name from services
  // JOIN staff_services
  // ON staff_services.service_id = services.id
  // WHERE staff_services.staff_member_id = 'cccccccc-cccc-4ccc-8ccc-cccccccccc01'

  const result = await db
    .select({
      name: services.name,
    })
    .from(services)
    .innerJoin(staffServices, eq(staffServices.serviceId, services.id))
    .where(eq(staffServices.staffMemberId, staffMemberId));
  if (!result) return [];

  return result;
}

export async function findServiceByServiceIdAndMemberId(
  db: DB,
  staffMemberId: string,
  serviceId: string,
) {
  const [service] = await db
    .select()
    .from(services)
    .innerJoin(staffServices, eq(staffServices.serviceId, services.id))
    .where(
      and(eq(staffServices.serviceId, serviceId), eq(staffServices.staffMemberId, staffMemberId)),
    );
  return service;
}
