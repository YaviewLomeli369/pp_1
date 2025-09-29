
-- Add hero images data columns to site_config table
ALTER TABLE "site_config" ADD COLUMN "hero_images_data" jsonb;
ALTER TABLE "site_config" ADD COLUMN "hero_images_meta" jsonb;
