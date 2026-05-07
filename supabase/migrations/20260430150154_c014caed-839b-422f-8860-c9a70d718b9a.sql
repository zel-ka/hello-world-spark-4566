
-- ============ TIMESTAMP HELPER ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('patient', 'doctor', 'admin');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  address TEXT,
  height_cm NUMERIC,
  activity_level TEXT DEFAULT 'moderate',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Doctors can view patient profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'doctor'));

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PATIENTS ============
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
  condition TEXT NOT NULL DEFAULT '',
  risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('high', 'medium', 'low')),
  last_visit DATE,
  phone TEXT DEFAULT '',
  bp TEXT DEFAULT '',
  sugar NUMERIC DEFAULT 0,
  medicines TEXT[] DEFAULT '{}',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_patients_user_id ON public.patients(user_id);
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own record" ON public.patients FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Doctors can view all patients" ON public.patients FOR SELECT TO authenticated USING (has_role(auth.uid(), 'doctor'));
CREATE POLICY "Admins full access patients" ON public.patients FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Patients can update own record" ON public.patients FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Doctors can update patients" ON public.patients FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'doctor'));
CREATE POLICY "System can insert patients" ON public.patients FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ VITALS ============
CREATE TABLE public.vitals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  recorded_date TEXT NOT NULL,
  systolic INTEGER NOT NULL,
  diastolic INTEGER NOT NULL,
  sugar NUMERIC NOT NULL DEFAULT 0,
  adherence NUMERIC NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients view own vitals" ON public.vitals FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = vitals.patient_id AND p.user_id = auth.uid()));
CREATE POLICY "Doctors view all vitals" ON public.vitals FOR SELECT TO authenticated USING (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated insert vitals" ON public.vitals FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = vitals.patient_id AND p.user_id = auth.uid()) OR has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated update vitals" ON public.vitals FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));

-- ============ ALERTS ============
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('critical', 'warning', 'info')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  time TEXT NOT NULL DEFAULT '',
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients view own alerts" ON public.alerts FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = alerts.patient_id AND p.user_id = auth.uid()));
CREATE POLICY "Doctors view all alerts" ON public.alerts FOR SELECT TO authenticated USING (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "System insert alerts" ON public.alerts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Doctors update alerts" ON public.alerts FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON public.alerts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ MEDICAL HISTORY ============
CREATE TABLE public.medical_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  condition TEXT NOT NULL,
  diagnosis_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.medical_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients view own medical_history" ON public.medical_history FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = medical_history.patient_id AND p.user_id = auth.uid()));
CREATE POLICY "Doctors view all medical_history" ON public.medical_history FOR SELECT TO authenticated USING (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated insert medical_history" ON public.medical_history FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = medical_history.patient_id AND p.user_id = auth.uid()) OR has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated update medical_history" ON public.medical_history FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_medical_history_updated_at BEFORE UPDATE ON public.medical_history FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ALLERGIES ============
CREATE TABLE public.allergies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  allergen TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'mild',
  reaction TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.allergies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients view own allergies" ON public.allergies FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = allergies.patient_id AND p.user_id = auth.uid()));
CREATE POLICY "Doctors view all allergies" ON public.allergies FOR SELECT TO authenticated USING (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated insert allergies" ON public.allergies FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = allergies.patient_id AND p.user_id = auth.uid()) OR has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated update allergies" ON public.allergies FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = allergies.patient_id AND p.user_id = auth.uid()) OR has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated delete allergies" ON public.allergies FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = allergies.patient_id AND p.user_id = auth.uid()) OR has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));

-- ============ APPOINTMENTS ============
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  doctor_name TEXT NOT NULL DEFAULT '',
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL DEFAULT '09:00',
  status TEXT NOT NULL DEFAULT 'scheduled',
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients view own appointments" ON public.appointments FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = appointments.patient_id AND p.user_id = auth.uid()));
CREATE POLICY "Doctors view all appointments" ON public.appointments FOR SELECT TO authenticated USING (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated insert appointments" ON public.appointments FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = appointments.patient_id AND p.user_id = auth.uid()) OR has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated update appointments" ON public.appointments FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated delete appointments" ON public.appointments FOR DELETE TO authenticated USING (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;

-- ============ HEALTH ENTRIES ============
CREATE TABLE public.health_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  systolic INTEGER NOT NULL,
  diastolic INTEGER NOT NULL,
  heart_rate INTEGER NOT NULL,
  temperature NUMERIC(4,1) NOT NULL DEFAULT 36.6,
  weight NUMERIC(5,1) NOT NULL,
  cholesterol NUMERIC,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_health_entries_patient ON public.health_entries(patient_id);
CREATE INDEX idx_health_entries_user ON public.health_entries(user_id);
ALTER TABLE public.health_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients view own health entries" ON public.health_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Patients insert own health entries" ON public.health_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Doctors view all health entries" ON public.health_entries FOR SELECT TO authenticated USING (has_role(auth.uid(), 'doctor'));
CREATE POLICY "Admins full access health entries" ON public.health_entries FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
ALTER PUBLICATION supabase_realtime ADD TABLE public.health_entries;

-- ============ DAILY LOGS ============
CREATE TABLE public.daily_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sleep_hours NUMERIC(3,1),
  water_glasses INTEGER,
  exercise_minutes INTEGER,
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  meals_logged INTEGER,
  mood TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, log_date)
);
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own daily logs" ON public.daily_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own daily logs" ON public.daily_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own daily logs" ON public.daily_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Doctors can view all daily logs" ON public.daily_logs FOR SELECT TO authenticated USING (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_daily_logs_updated_at BEFORE UPDATE ON public.daily_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_daily_logs_user_date ON public.daily_logs(user_id, log_date DESC);

-- ============ RECOMMENDATIONS SHOWN ============
CREATE TABLE public.recommendations_shown (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tip_id TEXT NOT NULL,
  category TEXT NOT NULL,
  shown_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.recommendations_shown ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own recommendations" ON public.recommendations_shown FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own recommendations" ON public.recommendations_shown FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_recommendations_user_date ON public.recommendations_shown(user_id, shown_date DESC);

-- ============ ASSESSMENTS ============
CREATE TABLE public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  score NUMERIC NOT NULL DEFAULT 0,
  raw_score NUMERIC,
  risk_level TEXT NOT NULL DEFAULT 'low',
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_assessments_user_type_date ON public.assessments(user_id, type, created_at DESC);
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own assessments" ON public.assessments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own assessments" ON public.assessments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own assessments" ON public.assessments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Doctors view all assessments" ON public.assessments FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'doctor'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON public.assessments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ HEALTH SCORES ============
CREATE TABLE public.health_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  computed_for_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, computed_for_date)
);
CREATE INDEX idx_health_scores_user_date ON public.health_scores(user_id, computed_for_date DESC);
ALTER TABLE public.health_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own health scores" ON public.health_scores FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own health scores" ON public.health_scores FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own health scores" ON public.health_scores FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Doctors view all health scores" ON public.health_scores FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'doctor'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role));

-- ============ AUTO USER BOOTSTRAP ============
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

  signup_role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'patient');

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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
