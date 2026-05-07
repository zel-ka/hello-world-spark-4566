-- Fix the handle_new_user trigger to handle role assignment from metadata
-- Allow specifying role at signup time (default to 'patient' if not specified)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  signup_role app_role;
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  -- Check if a role was specified in signup metadata, otherwise default to 'patient'
  signup_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'patient'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, signup_role);
  
  RETURN NEW;
END;
$$;
