
CREATE TABLE IF NOT EXISTS "navbar_config" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
	"module_key" text NOT NULL,
	"label" text NOT NULL,
	"href" text NOT NULL,
	"is_visible" boolean DEFAULT true,
	"order" integer DEFAULT 0,
	"is_required" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" varchar
);

-- Add foreign key constraint
DO $$ BEGIN
 ALTER TABLE "navbar_config" ADD CONSTRAINT "navbar_config_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
