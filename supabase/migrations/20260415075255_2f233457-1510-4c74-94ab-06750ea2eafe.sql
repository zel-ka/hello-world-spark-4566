
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  signup_role app_role;
  patient_code_val text;
  gender_val text;
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));

  signup_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'patient'
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, signup_role);

  IF signup_role = 'patient' THEN
    patient_code_val := 'PT-' || LPAD(FLOOR(RANDOM() * 99999)::text, 5, '0');
    gender_val := COALESCE(NEW.raw_user_meta_data->>'gender', 'Male');
    IF gender_val NOT IN ('Male', 'Female') THEN
      gender_val := 'Male';
    END IF;
    
    INSERT INTO public.patients (user_id, patient_code, name, age, gender)
    VALUES (
      NEW.id,
      patient_code_val,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Patient'),
      0,
      gender_val
    );
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$;
