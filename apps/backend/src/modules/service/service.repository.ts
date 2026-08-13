import type { DB } from '../../db/drizzlePlugin.ts';
import { services, type CreateServiceBody } from '../../db/schema/service.ts';
import { eq } from 'drizzle-orm';

export async function getServicesById(db: DB, id: string) {
  return db.select().from(services).where(eq(services.facilityId, id));
}

export async function insertService(db: DB, facilityId: string, data: CreateServiceBody) {
  const [service] = await db
    .insert(services)
    .values({ ...data, facilityId })
    .returning();

  if (!service) {
    throw new Error('Failed to insert service');
  }

  return service;
}
