
-- Add user_id column to patients to link with auth users
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);

-- Update handle_new_user to also create a patient record
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_code TEXT;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  );
  
  -- Assign patient role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'patient');
  
  -- Generate patient code
  new_code := 'PT-' || LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0');
  
  -- Create patient record linked to auth user
  INSERT INTO public.patients (user_id, patient_code, name, age, gender)
  VALUES (
    NEW.id,
    new_code,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Patient'),
    0,
    'unknown'
  );
  
  RETURN NEW;
END;
$$;

-- Drop old permissive RLS policies on patients and replace with role-based ones
DROP POLICY IF EXISTS "Anyone can read patients" ON public.patients;
DROP POLICY IF EXISTS "Anyone can insert patients" ON public.patients;
DROP POLICY IF EXISTS "Anyone can update patients" ON public.patients;
DROP POLICY IF EXISTS "Anyone can delete patients" ON public.patients;
DROP POLICY IF EXISTS "Patients can view own record" ON public.patients;
DROP POLICY IF EXISTS "Doctors can view all patients" ON public.patients;
DROP POLICY IF EXISTS "Admins full access patients" ON public.patients;
DROP POLICY IF EXISTS "Patients can update own record" ON public.patients;
DROP POLICY IF EXISTS "Doctors can update patients" ON public.patients;
DROP POLICY IF EXISTS "System can insert patients" ON public.patients;

-- Patients can view their own record
CREATE POLICY "Patients can view own record" ON public.patients
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Doctors can view all patients
CREATE POLICY "Doctors can view all patients" ON public.patients
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'doctor'));

-- Admins can do everything on patients
CREATE POLICY "Admins full access patients" ON public.patients
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Patients can update their own record
CREATE POLICY "Patients can update own record" ON public.patients
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Doctors can update any patient
CREATE POLICY "Doctors can update patients" ON public.patients
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'doctor'));

-- System can insert patients (for trigger)
CREATE POLICY "System can insert patients" ON public.patients
  FOR INSERT TO public
  WITH CHECK (true);
