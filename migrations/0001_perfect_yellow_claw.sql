CREATE TABLE "media_files" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filename" text NOT NULL,
	"original_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"url" text NOT NULL,
	"object_key" text NOT NULL,
	"alt" text,
	"description" text,
	"uploaded_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "navbar_config" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module_key" text NOT NULL,
	"label" text NOT NULL,
	"href" text NOT NULL,
	"is_visible" boolean DEFAULT true,
	"order" integer DEFAULT 0,
	"is_required" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" varchar
);
--> statement-breakpoint
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "navbar_config" ADD CONSTRAINT "navbar_config_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;