ALTER TABLE "meal" ADD COLUMN "recipe_id" uuid;--> statement-breakpoint
ALTER TABLE "meal" ADD COLUMN "calories" integer;--> statement-breakpoint
ALTER TABLE "meal" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "meal" ADD COLUMN "completed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "meal" ADD COLUMN "meal_date" date DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "steps" jsonb;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "diet_goal" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "daily_calorie_target" integer;--> statement-breakpoint
ALTER TABLE "meal" ADD CONSTRAINT "meal_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "meal_user_date_idx" ON "meal" USING btree ("user_id","meal_date");