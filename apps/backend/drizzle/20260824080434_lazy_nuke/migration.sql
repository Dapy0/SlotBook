ALTER TABLE "staff_schedule" ALTER COLUMN "startTime" SET DATA TYPE time(0) USING "startTime"::time(0);--> statement-breakpoint
ALTER TABLE "staff_schedule" ALTER COLUMN "endTime" SET DATA TYPE time(0) USING "endTime"::time(0);--> statement-breakpoint
ALTER TABLE "facility_schedule" ALTER COLUMN "startTime" SET DATA TYPE time(0) USING "startTime"::time(0);--> statement-breakpoint
ALTER TABLE "facility_schedule" ALTER COLUMN "endTime" SET DATA TYPE time(0) USING "endTime"::time(0);