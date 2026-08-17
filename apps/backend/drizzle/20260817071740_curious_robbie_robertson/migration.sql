ALTER TABLE "users" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone USING "updated_at"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "facilities" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "facilities" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone USING "updated_at"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone USING "updated_at"::timestamp with time zone;