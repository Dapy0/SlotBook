import { and, eq, getColumns } from 'drizzle-orm';
import type { DB } from '../../db/drizzlePlugin.ts';
import { staffMembers } from '../../db/schema/staffMember.ts';
import { staffServices } from '../../db/schema/staffService.ts';
import { services } from '../../db/schema/service.ts';

export async function findStaffByFacilityId(db: DB, facilityId: string) {
  return await db
    .select()
    .from(staffMembers)
    .where(and(eq(staffMembers.facilityId, facilityId), eq(staffMembers.isActive, true)));
}

export async function findStaffMemberById(db: DB, staffMemberId: string) {
  const [member] = await db.select().from(staffMembers).where(eq(staffMembers.id, staffMemberId));
  return member ?? null;
}

export async function insertStaffMemberById(db: DB, userId: string, facilityId: string) {
  const [staffMember] = await db.insert(staffMembers).values({ userId, facilityId }).returning();
  if (!staffMember) {
    throw new Error('Failed to insert staff member');
  }
  return staffMember;
}

export async function assignServiceToStaff(db: DB, staffMemberId: string, serviceId: string) {
  const [assignedService] = await db
    .insert(staffServices)
    .values({ staffMemberId, serviceId })
    .returning();
  if (!assignedService) {
    throw new Error('Failed to assign service to staff member');
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
    .select({
      ...getColumns(services),
    })
    .from(services)
    .innerJoin(staffServices, eq(staffServices.serviceId, services.id))
    .where(
      and(eq(staffServices.serviceId, serviceId), eq(staffServices.staffMemberId, staffMemberId)),
    );
  return service;
}
