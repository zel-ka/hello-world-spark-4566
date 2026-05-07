
-- Drop existing trigger if any (safe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the handle_new_user function to also create a patient record
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  signup_role app_role;
  patient_code_val text;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));

  -- Assign role (default patient)
  signup_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'patient'
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, signup_role);

  -- If patient, also create a patients record
  IF signup_role = 'patient' THEN
    patient_code_val := 'PT-' || LPAD(FLOOR(RANDOM() * 99999)::text, 5, '0');
    INSERT INTO public.patients (user_id, patient_code, name, age, gender)
    VALUES (
      NEW.id,
      patient_code_val,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Patient'),
      0,
      COALESCE(NEW.raw_user_meta_data->>'gender', 'unknown')
    );
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
