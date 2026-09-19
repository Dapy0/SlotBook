import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { bookings } from "./booking.ts";

export const reviews = pgTable("reviews", {
  id: uuid().defaultRandom().primaryKey(),
  bookingId: uuid("booking_id")
    .notNull()
    .unique()
    .references(() => bookings.id, { onDelete: "cascade" }),
  rating: integer().notNull(),
  comment: text(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});
export type ReviewEntity = typeof reviews.$inferSelect;
export type NewReviewEntity = typeof reviews.$inferInsert;
