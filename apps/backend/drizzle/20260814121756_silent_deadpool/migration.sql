ALTER TABLE "facilities" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "facilities" ALTER COLUMN "images" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "facilities" ALTER COLUMN "working_hours" SET NOT NULL;