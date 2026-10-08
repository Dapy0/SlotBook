import { apiWithAuth } from "@/lib/api.server";
import { createParams } from "@/lib/queryStrings";
import {
  facilityBookingResponseSchema,
  staffMeResponseSchema,
  type StaffBookingQuery,
} from "@slotbook/shared";
import React, { cache } from "react";

export const getStaffMe = cache(async () => {
  return await apiWithAuth(`/staff/me`, staffMeResponseSchema);
});
export async function getStaffMeBookings(query: StaffBookingQuery = {}) {
  const qs = createParams({ ...query });
  return await apiWithAuth(
    qs ? `/staff/me/bookings?${qs}` : "/staff/me/bookings",
    facilityBookingResponseSchema.array(),
  );
}
