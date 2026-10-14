CREATE TABLE "schedule_change_request_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"request_id" uuid NOT NULL,
	"day_of_the_week" smallint NOT NULL,
	"start_time" time(0) NOT NULL,
	"end_time" time(0) NOT NULL,
	CONSTRAINT "schedule_change_request_entries_unique_slot" UNIQUE("request_id","day_of_the_week","start_time","end_time")
);
--> statement-breakpoint
CREATE TABLE "schedule_change_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"staff_member_id" uuid NOT NULL,
	"facility_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"staff_note" text,
	"owner_comment" text,
	"decided_by_user_id" uuid,
	"decided_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "schedule_change_request_status_check" CHECK ("status" IN ('pending', 'approved', 'rejected', 'withdrawn'))
);
--> statement-breakpoint
ALTER TABLE "schedule_change_request_entries" ADD CONSTRAINT "schedule_change_request_entries_c2np0RZguDDb_fkey" FOREIGN KEY ("request_id") REFERENCES "schedule_change_requests"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "schedule_change_requests" ADD CONSTRAINT "schedule_change_requests_staff_member_id_staff_members_id_fkey" FOREIGN KEY ("staff_member_id") REFERENCES "staff_members"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "schedule_change_requests" ADD CONSTRAINT "schedule_change_requests_facility_id_facilities_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "schedule_change_requests" ADD CONSTRAINT "schedule_change_requests_decided_by_user_id_users_id_fkey" FOREIGN KEY ("decided_by_user_id") REFERENCES "users"("id");