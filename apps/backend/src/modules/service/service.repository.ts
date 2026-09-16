import type { DB } from "../../db/drizzlePlugin.ts";
import { eq, and, getColumns, inArray, sql } from "drizzle-orm";
import { services, type NewServiceEntity, type ServiceEntity } from "../../db/schema/service.ts";
import { facilities } from "../../db/schema/facility.ts";
import { staffServices } from "../../db/schema/staffService.ts";
export type ServiceWithCurrency = ServiceEntity & {
  currency: string;
};

export async function getServicesByFacilityId(
  db: DB,
  facilityId: string,
): Promise<ServiceWithCurrency[]> {
  return db
    .select({ ...getColumns(services), currency: facilities.currency })
    .from(services)
    .innerJoin(facilities, eq(facilities.id, services.facilityId))
    .where(eq(services.facilityId, facilityId));
}

export async function getServicesByFacilityIds(
  db: DB,
  facilityIds: string[],
): Promise<ServiceWithCurrency[]> {
  return db
    .select({
      ...getColumns(services),
      currency: facilities.currency,
    })
    .from(services)
    .innerJoin(facilities, eq(facilities.id, services.facilityId))
    .where(and(inArray(services.facilityId, facilityIds), eq(services.isActive, true)));
}
export async function getServicesWithStaffIds(db: DB, facilityId: string) {
  return db
    .select({
      ...getColumns(services),
      currency: facilities.currency,
      staffMemberIds: sql<string[]>`
        coalesce(
          array_agg(${staffServices.staffMemberId})
            filter (where ${staffServices.staffMemberId} is not null),
          '{}'
        )`,
    })
    .from(services)
    .innerJoin(facilities, eq(facilities.id, services.facilityId))
    .leftJoin(staffServices, eq(staffServices.serviceId, services.id))
    .where(and(eq(services.facilityId, facilityId), eq(services.isActive, true)))
    .groupBy(services.id, facilities.currency);
}
export async function getStaffIdsByServiceIds(db: DB, serviceIds: string[]) {
  const rows = await db
    .select({ serviceId: staffServices.serviceId, staffMemberId: staffServices.staffMemberId })
    .from(staffServices)
    .where(inArray(staffServices.serviceId, serviceIds));

  return Map.groupBy(rows, (r) => r.serviceId); // serviceId → [{ staffMemberId }, ...]
}

export async function getServiceByFacilityIdAndServiceId(
  db: DB,
  facilityId: string,
  serviceId: string,
): Promise<ServiceEntity> {
  const [facilityService] = await db
    .select()
    .from(services)
    .where(and(eq(services.facilityId, facilityId), eq(services.id, serviceId)));
  return facilityService ?? null;
}

export async function insertService(db: DB, data: NewServiceEntity): Promise<ServiceEntity> {
  const [service] = await db
    .insert(services)
    .values({ ...data })
    .returning();

  if (!service) {
    throw new Error("Failed to insert service");
  }

  return service;
}
