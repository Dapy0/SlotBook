ALTER TABLE "facilities" RENAME COLUMN "reviewsCount" TO "reviews_count";--> statement-breakpoint
ALTER TABLE "staff_schedule" RENAME COLUMN "dayOfTheWeek" TO "day_of_the_week";--> statement-breakpoint
ALTER TABLE "staff_schedule" RENAME COLUMN "startTime" TO "start_time";--> statement-breakpoint
ALTER TABLE "staff_schedule" RENAME COLUMN "endTime" TO "end_time";--> statement-breakpoint
ALTER TABLE "bookings" RENAME COLUMN "user_id" TO "client_id";--> statement-breakpoint
ALTER TABLE "facility_schedule" RENAME COLUMN "dayOfTheWeek" TO "day_of_the_week";--> statement-breakpoint
ALTER TABLE "facility_schedule" RENAME COLUMN "startTime" TO "start_time";--> statement-breakpoint
ALTER TABLE "facility_schedule" RENAME COLUMN "endTime" TO "end_time";--> statement-breakpoint
ALTER TABLE "facilities" ADD COLUMN "currency" varchar(3) DEFAULT 'EUR' NOT NULL;--> statement-breakpoint
ALTER TABLE "services" DROP COLUMN "currency";