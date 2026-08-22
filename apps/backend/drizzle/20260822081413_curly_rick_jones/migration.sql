ALTER TABLE "facilities" ADD COLUMN "timezone_IANA" text DEFAULT 'Europe/Warsaw' NOT NULL;--> statement-breakpoint
ALTER TABLE "facilities" DROP COLUMN "working_hours";--> statement-breakpoint
ALTER TABLE "staff_schedule" DROP COLUMN "updated_at";