
-- Drop the existing FK that points to owner_lorries
ALTER TABLE public.transport_requests DROP CONSTRAINT IF EXISTS transport_requests_assigned_lorry_id_fkey;

-- Add new FK pointing to fleet_vehicles
ALTER TABLE public.transport_requests 
  ADD CONSTRAINT transport_requests_assigned_lorry_id_fkey 
  FOREIGN KEY (assigned_lorry_id) REFERENCES public.fleet_vehicles(id);

-- Fix RLS policies to be PERMISSIVE (drop restrictive, recreate as permissive)

-- transport_requests
DROP POLICY IF EXISTS "Admins can view all requests" ON public.transport_requests;
DROP POLICY IF EXISTS "Owners can view assigned requests" ON public.transport_requests;
DROP POLICY IF EXISTS "Admins can update requests" ON public.transport_requests;
DROP POLICY IF EXISTS "Anyone can submit transport requests" ON public.transport_requests;

CREATE POLICY "Admins can view all requests" ON public.transport_requests FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners can view assigned requests" ON public.transport_requests FOR SELECT TO authenticated USING (assigned_owner_id = auth.uid());
CREATE POLICY "Admins can update requests" ON public.transport_requests FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can submit transport requests" ON public.transport_requests FOR INSERT TO authenticated WITH CHECK (true);

-- profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can insert own profile" ON public.profiles;

CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Anyone can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- fleet_vehicles
DROP POLICY IF EXISTS "Anyone can view fleet vehicles" ON public.fleet_vehicles;
DROP POLICY IF EXISTS "Approved owners can insert fleet vehicles" ON public.fleet_vehicles;
DROP POLICY IF EXISTS "Owners can update own fleet vehicles" ON public.fleet_vehicles;
DROP POLICY IF EXISTS "Owners can delete own fleet vehicles" ON public.fleet_vehicles;
DROP POLICY IF EXISTS "Admins can manage all fleet vehicles" ON public.fleet_vehicles;

CREATE POLICY "Anyone can view fleet vehicles" ON public.fleet_vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Approved owners can insert fleet vehicles" ON public.fleet_vehicles FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND is_approved(auth.uid()));
CREATE POLICY "Owners can update own fleet vehicles" ON public.fleet_vehicles FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owners can delete own fleet vehicles" ON public.fleet_vehicles FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Admins can manage all fleet vehicles" ON public.fleet_vehicles FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- user_roles
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- owner_lorries
DROP POLICY IF EXISTS "Admins can view all lorries" ON public.owner_lorries;
DROP POLICY IF EXISTS "Owners can view own lorries" ON public.owner_lorries;
DROP POLICY IF EXISTS "Admins can update all lorries" ON public.owner_lorries;
DROP POLICY IF EXISTS "Approved owners can insert lorries" ON public.owner_lorries;
DROP POLICY IF EXISTS "Owners can update own lorries" ON public.owner_lorries;
DROP POLICY IF EXISTS "Owners can delete own lorries" ON public.owner_lorries;

CREATE POLICY "Admins can view all lorries" ON public.owner_lorries FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners can view own lorries" ON public.owner_lorries FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Admins can update all lorries" ON public.owner_lorries FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Approved owners can insert lorries" ON public.owner_lorries FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND is_approved(auth.uid()));
CREATE POLICY "Owners can update own lorries" ON public.owner_lorries FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owners can delete own lorries" ON public.owner_lorries FOR DELETE TO authenticated USING (owner_id = auth.uid());
