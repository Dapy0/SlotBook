ALTER TABLE "bookings" ADD COLUMN "price_cents" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "currency" varchar(3) NOT NULL;