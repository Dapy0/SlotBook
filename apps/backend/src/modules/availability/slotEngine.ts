import { fromZonedTime } from 'date-fns-tz';
import { addDaysToIso, getIsoWeekDay, todayInTimeZone } from "../../lib/utils";
import {
  intersectIntervals,
  overlaps,
  scheduleRowsToIntervals,
  sliceIntoSlots,
  type Interval,
  type ScheduleRow,
} from "./availability.utils";
import { BOOKING_RULES } from "./booking.rules";
type DaySlotsInput = {
  localDate: string;
  timeZone: string;
  facilityRows: ScheduleRow[];
  staffRows: ScheduleRow[];
  busy: Interval[];
  durationMinutes: number;
  stepMinutes?: number;
  earliestStart: Date;
};
export function computeDaySlots(input: DaySlotsInput): Interval[] {
  // const date = addDaysToIso(firstDate, i);
  const {
    localDate,
    timeZone,
    facilityRows,
    staffRows,
    busy,
    durationMinutes,
    earliestStart,
    stepMinutes = BOOKING_RULES.stepMinutes,
  } = input;
  const weekday = getIsoWeekDay(localDate);

  const facilityDaySchedule = scheduleRowsToIntervals(facilityRows, localDate, weekday, timeZone);
  const staffDaySchedule = scheduleRowsToIntervals(staffRows, localDate, weekday, timeZone);

  const working = intersectIntervals(facilityDaySchedule, staffDaySchedule);
  const slots = working
    .flatMap((interval) => sliceIntoSlots(interval, durationMinutes, stepMinutes))
    .filter((slot) => slot.start >= earliestStart)
    .filter((slot) => !busy.some((b) => overlaps(slot, b)))
    .sort((a, b) => a.start.getTime() - b.start.getTime());
  return slots;
}


export function dayBounds(date: string, timeZone: string): Interval {
  return {
    start: fromZonedTime(`${date}T00:00:00`, timeZone),
    end: fromZonedTime(`${addDaysToIso(date, 1)}T00:00:00`, timeZone),
  };
}

// Всё про «окно бронирования» — в одном месте, чтобы GET и POST считали одинаково
export function getBookingWindow(timeZone: string, now: Date) {
  const firstDate = todayInTimeZone(timeZone, now);
  const lastDate = addDaysToIso(firstDate, BOOKING_RULES.horizonDays - 1);
  return {
    firstDate,
    lastDate,
    earliestStart: new Date(now.getTime() + BOOKING_RULES.leadMinutes * 60_000),
    windowEnd: dayBounds(lastDate, timeZone).end,
  };
}
