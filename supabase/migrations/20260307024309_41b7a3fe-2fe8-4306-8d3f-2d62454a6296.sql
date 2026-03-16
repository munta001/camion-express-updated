
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'owner');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  company_name TEXT,
  phone TEXT,
  email TEXT,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Security definer function to check if user is approved
CREATE OR REPLACE FUNCTION public.is_approved(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND approved = true
  )
$$;

-- Profiles RLS
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can insert own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());

-- User roles RLS
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Create owner_lorries table
CREATE TABLE public.owner_lorries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  registration_number TEXT NOT NULL,
  license_plate TEXT NOT NULL,
  capacity TEXT NOT NULL,
  max_load TEXT NOT NULL,
  body TEXT NOT NULL,
  body_size TEXT NOT NULL,
  engine TEXT NOT NULL,
  ideal TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  availability_status TEXT NOT NULL DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.owner_lorries ENABLE ROW LEVEL SECURITY;

-- Owner lorries RLS
CREATE POLICY "Owners can view own lorries" ON public.owner_lorries FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Admins can view all lorries" ON public.owner_lorries FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Approved owners can insert lorries" ON public.owner_lorries FOR INSERT WITH CHECK (owner_id = auth.uid() AND public.is_approved(auth.uid()));
CREATE POLICY "Owners can update own lorries" ON public.owner_lorries FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Owners can delete own lorries" ON public.owner_lorries FOR DELETE USING (owner_id = auth.uid());
CREATE POLICY "Admins can update all lorries" ON public.owner_lorries FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Add assignment columns to transport_requests
ALTER TABLE public.transport_requests 
  ADD COLUMN assigned_owner_id UUID REFERENCES auth.users(id),
  ADD COLUMN assigned_lorry_id UUID REFERENCES public.owner_lorries(id);

-- Allow owners to view their assigned transport requests
CREATE POLICY "Owners can view assigned requests" ON public.transport_requests FOR SELECT USING (assigned_owner_id = auth.uid());
CREATE POLICY "Admins can view all requests" ON public.transport_requests FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update requests" ON public.transport_requests FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  
  -- Auto-assign owner role on signup
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'owner');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
