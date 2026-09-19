ALTER TABLE "users" ADD COLUMN "timezone" varchar(64) DEFAULT 'Europe/Warsaw';--> statement-breakpoint
ALTER TABLE "staff_schedule" ADD CONSTRAINT "staff_schedule_unique_slot" UNIQUE("staff_member_id","day_of_the_week","start_time","end_time");--> statement-breakpoint
CREATE INDEX "staff_schedule_member_idx" ON "staff_schedule" ("staff_member_id");--> statement-breakpoint
CREATE INDEX "bookings_clients_idx" ON "bookings" ("client_id");--> statement-breakpoint
CREATE INDEX "bookings_staff_members_idx" ON "bookings" ("staff_member_id");