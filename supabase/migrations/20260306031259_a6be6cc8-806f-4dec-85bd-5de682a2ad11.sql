
CREATE TABLE public.fleet_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  capacity text NOT NULL,
  body text NOT NULL,
  ideal text NOT NULL,
  image_url text,
  max_load text NOT NULL,
  body_size text NOT NULL,
  engine text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fleet_vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view fleet vehicles"
  ON public.fleet_vehicles
  FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO storage.buckets (id, name, public) VALUES ('fleet-images', 'fleet-images', true);

CREATE POLICY "Anyone can view fleet images"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'fleet-images');
