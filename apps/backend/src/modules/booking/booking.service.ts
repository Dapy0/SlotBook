import type { DaySchedule } from '@slotbook/shared/facilities';
import type { DB } from '../../db/drizzlePlugin.ts';
import type { StaffScheduleEntity } from '../../db/schema/staffSchedule.ts';
import { ConflictError, ForbiddenError, NotFoundError } from '../../lib/errors.ts';
import { findFacilitiesByOwnerId } from '../facility/facility.repository.ts';
import { checkFacilityOwnership, getFacilityDetails } from '../facility/facility.service.ts';
import { receiveStaffSchedule } from '../schedule/schedule.service.ts';
import { checkIfServiceIsMadeInFacility } from '../service/service.service.ts';
import { findStaffMemberById } from '../staff/staff.repository.ts';
import {
  checkIfStaffIsFacilityWorker,
  checkIfStaffMemberIsDoingService,
} from '../staff/staff.service.ts';
import { findBookingsByFacilityId, insertBooking } from './booking.repository.ts';
import type { BookingBody } from './booking.schema.ts';
export async function getAllFacilityBookings(db: DB, userId: string, facilityId: string) {
  await checkFacilityOwnership(db, facilityId, userId);

  const facilityBookings = await findBookingsByFacilityId(db, facilityId);

  return facilityBookings;
}
export async function createBookingForFacility(
  db: DB,
  userId: string,
  facilityId: string,
  data: BookingBody,
) {
  const facility = await getFacilityDetails(db, facilityId);
  const staffMember = await checkIfStaffIsFacilityWorker(db, facilityId, data.staffMemberId);
  const staffMemberSchedule = await receiveStaffSchedule(db, facilityId, staffMember.id);
  const serviceDetails = await checkIfServiceIsMadeInFacility(db, data.serviceId, facilityId);
  await checkIfStaffMemberIsDoingService(db, staffMember.id, data.serviceId);

  if (userId === facility.ownerId) {
    throw new ForbiddenError('No self bookings allowed');
  }
  if (data.startDatetime <= new Date()) {
    throw new ConflictError('Start time is in the past');
  }

  const localDay = ((data.startDatetime.getDay() + 6) % 7) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
  const staffDaySchedules = staffMemberSchedule.filter((s) => s.dayOfTheWeek === localDay);

  await checkIfBookingFitsAllSchedules(
    data.startDatetime,
    serviceDetails.durationMinutes,
    staffDaySchedules,
    facility.workingHours[localDay],
  );

  const endDatetime = new Date(
    data.startDatetime.getTime() + serviceDetails.durationMinutes * 60_000,
  );

  const booking = await insertBooking(db, {
    clientId: userId,
    facilityId,
    staffMemberId: staffMember.id,
    serviceId: data.serviceId,
    startDatetime: data.startDatetime,
    endDatetime,
  }).catch((e) => {
    const pgError = (e as any)?.cause ?? e;
    if (pgError?.code === '23P01') {
      throw new ConflictError('This time slot is already booked');
    }
    throw e;
  });

  return booking;
}
function toTimeString(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
export async function checkIfBookingFitsAllSchedules(
  startDatetime: Date,
  serviceDuration: number,
  staffDaySchedules: StaffScheduleEntity[],
  facilitySchedule: DaySchedule,
) {
  if (facilitySchedule === null) {
    throw new ConflictError('Facility is closed on this day');
  }

  const endDatetime = new Date(startDatetime.getTime() + serviceDuration * 60_000);
  const startTimeStr = toTimeString(startDatetime);
  const endTimeStr = toTimeString(endDatetime);

  if (startTimeStr < facilitySchedule.open || endTimeStr > facilitySchedule.close) {
    throw new ConflictError('Booking is outside facility working hours');
  }

  if (staffDaySchedules.length === 0) {
    throw new ConflictError('Staff member does not work on this day');
  }

  const fitsStaffSchedule = staffDaySchedules.some(
    (schedule) => schedule.startTime <= startTimeStr && endTimeStr <= schedule.endTime,
  );

  if (!fitsStaffSchedule) {
    throw new ConflictError('Booking is outside staff working hours');
  }
}
