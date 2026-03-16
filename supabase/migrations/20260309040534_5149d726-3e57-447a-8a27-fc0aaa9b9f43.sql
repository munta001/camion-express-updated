-- Add column for multiple images (array of URLs)
ALTER TABLE public.fleet_vehicles
ADD COLUMN image_urls text[] DEFAULT '{}';

-- Migrate existing image_url data to image_urls array
UPDATE public.fleet_vehicles
SET image_urls = ARRAY[image_url]
WHERE image_url IS NOT NULL AND image_url != '';