CREATE TABLE "facility_schedule" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"facility_id" uuid NOT NULL,
	"dayOfTheWeek" smallint NOT NULL,
	"startTime" time NOT NULL,
	"endTime" time NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "facility_schedule" ADD CONSTRAINT "facility_schedule_facility_id_facilities_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE;