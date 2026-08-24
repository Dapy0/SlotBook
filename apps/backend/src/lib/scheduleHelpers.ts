import type { CreateFacilitySchedule, ResponseFacilityScheduleSchema } from '@slotbook/shared/facilitySchedule';
import { BadRequestError, ConflictError } from './errors.ts';
import type { CreateStaffSchedule, ResponseStaffScheduleSchema } from '@slotbook/shared/staffSchedule';

export function checkNoOverlapWithinSchedule(
  schedule: Array<{ dayOfTheWeek: number; startTime: string; endTime: string }>,
) {
  const grouped = Object.groupBy(schedule, ({ dayOfTheWeek }) => dayOfTheWeek);
  for (const [day, entries] of Object.entries(grouped)) {
    if (!entries) continue;
    const sorted = [...entries].sort((a, b) => a.startTime.localeCompare(b.startTime));
    let previous: (typeof sorted)[number] | undefined;
    for (const current of sorted) {
      if (current.startTime >= current.endTime) {
        throw new BadRequestError(`Start time must be before end time for day ${day}`);
      }
      if (previous && current.startTime < previous.endTime) {
        throw new ConflictError(`Overlapping schedules for day ${day}`);
      }
      previous = current;
    }
  }
}

export function checkStaffScheduleFitsFacility(
  staffSchedule: ResponseStaffScheduleSchema[],
  facilitySchedule: ResponseFacilityScheduleSchema[],
) {
  for (const current of staffSchedule) {
    const facilityDay = facilitySchedule.find((f) => f.dayOfTheWeek === current.dayOfTheWeek);
    if (!facilityDay) {
      throw new ConflictError(`Facility is closed on day ${current.dayOfTheWeek}`);
    }
    if (current.startTime < facilityDay.startTime || current.endTime > facilityDay.endTime) {
      throw new ConflictError(
        `Staff schedule outside facility hours on day ${current.dayOfTheWeek}`,
      );
    }
  }
}
