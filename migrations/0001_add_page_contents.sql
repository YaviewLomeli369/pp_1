
CREATE TABLE IF NOT EXISTS "page_contents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" varchar NOT NULL,
	"section_key" varchar NOT NULL,
	"type" varchar NOT NULL,
	"title" text,
	"content" text,
	"image_url" text,
	"metadata" jsonb,
	"is_active" boolean DEFAULT true,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
