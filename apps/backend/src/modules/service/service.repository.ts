import type { DB } from '../../db/drizzlePlugin.ts';
import { eq } from 'drizzle-orm';
import { services, type NewServiceEntity, type ServiceEntity } from '../../db/schema/service.ts';

export async function getServicesByFacilityId(db: DB, id: string): Promise<ServiceEntity[]> {
  return db.select().from(services).where(eq(services.facilityId, id));
}

export async function insertService(db: DB, data: NewServiceEntity): Promise<ServiceEntity> {
  const [service] = await db
    .insert(services)
    .values({ ...data })
    .returning();

  if (!service) {
    throw new Error('Failed to insert service');
  }

  return service;
}
