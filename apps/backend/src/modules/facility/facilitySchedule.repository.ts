import type { DB } from "../../db/drizzlePlugin.ts";
import {
  facilitySchedules,
  type FacilityScheduleEntity,
} from "../../db/schema/facilitySchedule.ts";
import { and, eq } from "drizzle-orm";
import type { ChangeWeekScheduleRequest, Weekday } from "@slotbook/shared";
export async function findFacilitySchedule(
  db: DB,
  facilityId: string,
): Promise<FacilityScheduleEntity[]> {
  const schedule = await db
    .select()
    .from(facilitySchedules)
    .where(eq(facilitySchedules.facilityId, facilityId));
  return schedule;
}

export async function findFacilityScheduleByDay(
  db: DB,
  facilityId: string,
  day: Weekday,
): Promise<FacilityScheduleEntity[] | null> {
  const schedule = await db
    .select()
    .from(facilitySchedules)
    .where(
      and(eq(facilitySchedules.facilityId, facilityId), eq(facilitySchedules.dayOfTheWeek, day)),
    );
  return schedule;
}

export async function insertFacilityScheduleByFacilityId(
  db: DB,
  facilityId: string,
  newFacilitySchedule: ChangeWeekScheduleRequest,
): Promise<FacilityScheduleEntity[]> {
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
