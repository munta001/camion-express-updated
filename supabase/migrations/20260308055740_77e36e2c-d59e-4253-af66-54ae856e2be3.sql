
-- Add owner-specific columns to fleet_vehicles
ALTER TABLE public.fleet_vehicles 
  ADD COLUMN IF NOT EXISTS owner_id uuid,
  ADD COLUMN IF NOT EXISTS registration_number text DEFAULT '',
  ADD COLUMN IF NOT EXISTS license_plate text DEFAULT '',
  ADD COLUMN IF NOT EXISTS availability_status text DEFAULT 'available';

-- Drop the restrictive SELECT policy and replace with permissive ones
DROP POLICY IF EXISTS "Anyone can view fleet vehicles" ON public.fleet_vehicles;

-- Everyone can view fleet vehicles
CREATE POLICY "Anyone can view fleet vehicles"
ON public.fleet_vehicles FOR SELECT
USING (true);

-- Approved owners can insert their own vehicles
CREATE POLICY "Approved owners can insert fleet vehicles"
ON public.fleet_vehicles FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid() AND is_approved(auth.uid()));

-- Owners can update their own vehicles
CREATE POLICY "Owners can update own fleet vehicles"
ON public.fleet_vehicles FOR UPDATE
TO authenticated
USING (owner_id = auth.uid());

-- Owners can delete their own vehicles
CREATE POLICY "Owners can delete own fleet vehicles"
ON public.fleet_vehicles FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- Admins can manage all fleet vehicles
CREATE POLICY "Admins can manage all fleet vehicles"
ON public.fleet_vehicles FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
