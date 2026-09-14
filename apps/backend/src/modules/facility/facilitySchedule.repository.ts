import type { CreateFacilitySchedule, DayOfTheWeek } from "@slotbook/shared/facilitySchedule";
import type { DB } from "../../db/drizzlePlugin.ts";
import {
  facilitySchedules,
  type FacilityScheduleEntity,
} from "../../db/schema/facilitySchedule.ts";
import { and, eq } from "drizzle-orm";
export async function findFacilitySchedule(
  db: DB,
  facilityId: string,
): Promise<FacilityScheduleEntity[] | null> {
  const schedule = await db
    .select()
    .from(facilitySchedules)
    .where(eq(facilitySchedules.facilityId, facilityId));
  return schedule ?? null;
}

export async function findFacilityScheduleByDay(
  db: DB,
  facilityId: string,
  day: DayOfTheWeek,
): Promise<FacilityScheduleEntity[] | null> {
  const schedule = await db
    .select()
    .from(facilitySchedules)
    .where(
      and(eq(facilitySchedules.facilityId, facilityId), eq(facilitySchedules.dayOfTheWeek, day)),
    );
  return schedule ?? null;
}

export async function insertFacilityScheduleByFacilityId(
  db: DB,
  facilityId: string,
  newFacilitySchedule: CreateFacilitySchedule[],
): Promise<FacilityScheduleEntity[] | null> {
  const insertedValues = await db
    .insert(facilitySchedules)
    .values(
      newFacilitySchedule.map((val) => ({
        facilityId: facilityId,
        dayOfTheWeek: val.dayOfTheWeek,
        startTime: val.startTime,
        endTime: val.endTime,
      })),
    )
    .returning();
  if (!insertedValues) {
    throw new Error("Failed to insert new schedule");
  }
  return insertedValues;
}

export async function deleteFacilityScheduleByFacilityId(db: DB, facilityId: string) {
  return db.delete(facilitySchedules).where(eq(facilitySchedules.facilityId, facilityId));
}
