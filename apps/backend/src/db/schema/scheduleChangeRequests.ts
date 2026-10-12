import { check, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { facilities } from "./facility.ts";
import { staffMembers } from "./staffMember";
import { sql } from "drizzle-orm";
import { users } from "./user";

export const scheduleChangeRequests = pgTable(
  "schedule_change_requests",
  {
    id: uuid().defaultRandom().primaryKey(),
    staffMemberId: uuid("staff_member_id")
      .notNull()
      .references(() => staffMembers.id, { onDelete: "cascade" }),
    facilityId: uuid("facility_id")
      .notNull()
      .references(() => facilities.id, { onDelete: "cascade" }),
    status: text("status", { enum: ["pending", "approved", "rejected", "withdrawn"] })
      .notNull()
      .default("pending"),
    staffNote: text("staff_note"),
    ownerComment: text("owner_comment"),
    decidedByUserId: uuid("decided_by_user_id").references(() => users.id),
    decidedAT: timestamp("decided_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    check(
      "schedule_change_request_status_check",
      sql`${table.status} IN ("pending", "approved", "rejected", "withdrawn")`,
    ),
  ],
);
export type ScheduleChangeRequestEntity = typeof scheduleChangeRequests.$inferSelect;
export type NewScheduleChangeRequestEntity = typeof scheduleChangeRequests.$inferInsert;
