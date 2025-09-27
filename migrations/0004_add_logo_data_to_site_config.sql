
-- Migration to add logo data fields to site_config table
ALTER TABLE "site_config" 
ADD COLUMN "logo_data" text,
ADD COLUMN "logo_mime_type" text,
ADD COLUMN "logo_filename" text;
