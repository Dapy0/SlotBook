ALTER TABLE "facilities" RENAME COLUMN "timezone_IANA" TO "timezone";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "timezone" SET NOT NULL;