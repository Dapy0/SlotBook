CREATE TYPE "role" AS ENUM('CLIENT', 'OWNER', 'ADMIN');--> statement-breakpoint
CREATE TYPE "facility_category" AS ENUM('BEAUTY', 'SPORT_FITNESS', 'MEDICAL', 'AUTO', 'EDUCATION', 'OTHER');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL UNIQUE,
	"password_hash" text NOT NULL,
	"role" "role" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "facilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"owner_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL UNIQUE,
	"description" text,
	"category" "facility_category" NOT NULL,
	"city" varchar(120) NOT NULL,
	"address" varchar(255) NOT NULL,
	"latitude" numeric(9,6),
	"longitude" numeric(9,6),
	"phone" varchar(32) NOT NULL,
	"email" varchar(255) NOT NULL,
	"images" jsonb DEFAULT '[]' NOT NULL,
	"working_hours" jsonb,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"facility_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(255) NOT NULL,
	"duration_minutes" integer NOT NULL,
	"price_cents" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'PLN' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "facilities_city_idx" ON "facilities" ("city");--> statement-breakpoint
CREATE INDEX "facilities_owner_idx" ON "facilities" ("owner_id");--> statement-breakpoint
CREATE INDEX "services_facility_idx" ON "services" ("facility_id");--> statement-breakpoint
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_owner_id_users_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_facility_id_facilities_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE;