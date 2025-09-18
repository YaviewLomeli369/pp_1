
-- Section Content Configuration table
CREATE TABLE IF NOT EXISTS "section_content_config" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" varchar NOT NULL,
	"section_type" varchar NOT NULL,
	"title" text,
	"subtitle" text,
	"content" text,
	"images" jsonb DEFAULT '[]'::jsonb,
	"background_image" text,
	"config" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Button Configuration table
CREATE TABLE IF NOT EXISTS "button_config" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant" text NOT NULL,
	"size" text DEFAULT 'default' NOT NULL,
	"colors" jsonb DEFAULT '{"background":"#3B82F6","foreground":"#FFFFFF","border":"#3B82F6","hoverBackground":"#2563EB","hoverForeground":"#FFFFFF","hoverBorder":"#2563EB","focusBackground":"#1D4ED8","focusForeground":"#FFFFFF","focusBorder":"#1D4ED8","activeBackground":"#1E40AF","activeForeground":"#FFFFFF","activeBorder":"#1E40AF"}'::jsonb NOT NULL,
	"typography" jsonb DEFAULT '{"fontFamily":"Inter","fontSize":"14px","fontWeight":"500","lineHeight":"1.4","letterSpacing":"0px"}'::jsonb NOT NULL,
	"spacing" jsonb DEFAULT '{"paddingX":"16px","paddingY":"8px","margin":"0px"}'::jsonb NOT NULL,
	"borders" jsonb DEFAULT '{"radius":"6px","width":"1px","style":"solid"}'::jsonb NOT NULL,
	"effects" jsonb DEFAULT '{"shadow":"0 1px 2px 0 rgba(0, 0, 0, 0.05)","hoverShadow":"0 4px 6px -1px rgba(0, 0, 0, 0.1)","transition":"all 0.2s ease-in-out","transform":"none","hoverTransform":"translateY(-1px)"}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" varchar
);

-- Add foreign key for updated_by
DO $$ BEGIN
 ALTER TABLE "button_config" ADD CONSTRAINT "button_config_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create unique index for button configurations
CREATE UNIQUE INDEX IF NOT EXISTS "button_config_variant_size_unique" ON "button_config" ("variant","size") WHERE "is_active" = true;
