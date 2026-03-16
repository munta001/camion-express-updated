
DROP POLICY "Anyone can view fleet vehicles" ON public.fleet_vehicles;
CREATE POLICY "Anyone can view fleet vehicles"
  ON public.fleet_vehicles
  FOR SELECT
  USING (true);
