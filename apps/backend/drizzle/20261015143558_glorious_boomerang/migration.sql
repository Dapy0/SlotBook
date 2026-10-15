CREATE TYPE "confirmation_mode" AS ENUM('manual', 'auto');--> statement-breakpoint
ALTER TABLE "facilities" ADD COLUMN "confirmation_mode" "confirmation_mode" DEFAULT 'manual'::"confirmation_mode" NOT NULL;--> statement-breakpoint
ALTER TABLE "facilities" ADD COLUMN "client_cancel_cutoff_minutes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "facilities" ADD COLUMN "booking_lead_minutes" integer DEFAULT 60 NOT NULL;--> statement-breakpoint
ALTER TABLE "facilities" ADD COLUMN "booking_horizon_days" integer DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "cancelable_until" timestamp with time zone;--> statement-breakpoint
UPDATE "bookings" SET "cancelable_until" = lower("time_range") WHERE "cancelable_until" IS NULL;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "cancelable_until" SET NOT NULL;--> statement-breakpointALTER TABLE "bookings" ADD COLUMN "canceled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "canceled_by" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "cancel_reason" text;--> statement-breakpoint
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_confirmation_mode_check" CHECK ("confirmation_mode" IN ('auto', 'manual'));--> statement-breakpoint
ALTER TABLE "facilities" ADD CONSTRAINT "client_cancel_cutoff_minutes_check" CHECK ("client_cancel_cutoff_minutes" BETWEEN 0 AND 10080 );--> statement-breakpoint
ALTER TABLE "facilities" ADD CONSTRAINT "booking_lead_minutes_check" CHECK ("booking_lead_minutes" BETWEEN 0 AND 10080 );--> statement-breakpoint
ALTER TABLE "facilities" ADD CONSTRAINT "booking_horizon_days_check" CHECK ("booking_horizon_days" BETWEEN 1 AND 365 );--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "booking_cancellation_check" CHECK ("status" = 'canceled' OR ("canceled_at" IS NULL AND "canceled_by" IS NULL AND "cancel_reason" IS NULL));--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "booking_canceled_by_check" CHECK ("canceled_by" IS NULL OR "canceled_by" IN ('client', 'staff', 'owner', 'system'));--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "booking_cancelable_until_before_start_check" CHECK ("cancelable_until" <= lower("time_range"));
