import type { BookingStatus } from "@slotbook/shared";
import type { SQL } from "drizzle-orm";
import z from "zod";

export const paramsSchema = z.object({
  id: z.string().nonempty(),
});
export type BookingParams = z.infer<typeof paramsSchema>;

export const paramsPatchSchema = z.object({
  bookingId: z.string().nonempty(),
});
export type BookingPatchParams = z.infer<typeof paramsPatchSchema>;

export type BookingsFilter = {
  clientId?: string;
  facilityId?: string;
  staffMemberId?: string;
  statuses?: BookingStatus[];
  overlaps?: { from: Date; to: Date };
  order: "asc" | "desc";
  limit?: number;
  where?: SQL;
};
