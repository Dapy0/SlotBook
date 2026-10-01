import { type BookingStatus } from "@slotbook/shared";
import type { SQL } from "drizzle-orm";
import z from "zod";

export const paramsSchema = z.object({
  id: z.uuid().nonempty(),
});

export const paramsPatchSchema = z.object({
  bookingId: z.uuid().nonempty(),
});

export type BookingsFilter = {
  clientId?: string;
  facilityId?: string;
  staffMemberId?: string | undefined;
  statuses?: BookingStatus[] | undefined;
  overlaps?: { from: Date; to: Date };
  order: "asc" | "desc";
  limit?: number;
  where?: SQL;
};
