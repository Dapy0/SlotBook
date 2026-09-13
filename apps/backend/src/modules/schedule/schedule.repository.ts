import { eq } from "drizzle-orm";
import type { DB } from "../../db/drizzlePlugin.ts";
import { staffSchedules } from "../../db/schema/staffSchedule.ts";
import type { ScheduleBody } from "./schedule.schema.ts";

export async function findScheduleByStaffId(db: DB, staffId: string) {
  return db.select().from(staffSchedules).where(eq(staffSchedules.staffMemberId, staffId));
}
export async function deleteScheduleByStaffId(db: DB, staffId: string) {
  return db.delete(staffSchedules).where(eq(staffSchedules.staffMemberId, staffId));
}
export async function insertScheduleByStaffId(db: DB, staffId: string, newSchedule: ScheduleBody) {
  const insertedSchedule = await db
    .insert(staffSchedules)
    .values(
      newSchedule.map((s) => ({
        staffMemberId: staffId,
        dayOfTheWeek: s.dayOfTheWeek,
        startTime: s.startTime,
        endTime: s.endTime,
      })),
    )
    .returning();
  if (!insertedSchedule) {
    throw new Error("Failed to insert new schedule");
  }
  return insertedSchedule;
}
