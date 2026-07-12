ALTER TABLE "user" ADD COLUMN "units" text DEFAULT 'metric' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "reminders_enabled" boolean DEFAULT true NOT NULL;