ALTER TABLE "facilities" ADD COLUMN "score" numeric(3,1);--> statement-breakpoint
ALTER TABLE "facilities" ADD COLUMN "reviewsCount" integer DEFAULT 0 NOT NULL;