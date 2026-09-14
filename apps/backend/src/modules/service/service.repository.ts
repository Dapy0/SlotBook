import type { DB } from "../../db/drizzlePlugin.ts";
import { eq, and, getColumns } from "drizzle-orm";
import { services, type NewServiceEntity, type ServiceEntity } from "../../db/schema/service.ts";
import { facilities } from "../../db/schema/facility.ts";
export type ServiceWithCurrency = ServiceEntity & { currency: string };

export async function getServicesByFacilityId(db: DB, id: string): Promise<ServiceWithCurrency[]> {
  return db
    .select({ ...getColumns(services), currency: facilities.currency })
    .from(services)
    .innerJoin(facilities, eq(facilities.id, services.facilityId))
    .where(eq(services.facilityId, id));
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
