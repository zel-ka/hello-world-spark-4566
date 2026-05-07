
-- Medical history table
CREATE TABLE public.medical_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  condition TEXT NOT NULL,
  diagnosis_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.medical_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read medical_history" ON public.medical_history FOR SELECT USING (true);
CREATE POLICY "Anyone can insert medical_history" ON public.medical_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update medical_history" ON public.medical_history FOR UPDATE USING (true);

CREATE TRIGGER update_medical_history_updated_at
  BEFORE UPDATE ON public.medical_history
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Allergies table
CREATE TABLE public.allergies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  allergen TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'mild',
  reaction TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.allergies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read allergies" ON public.allergies FOR SELECT USING (true);
CREATE POLICY "Anyone can insert allergies" ON public.allergies FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update allergies" ON public.allergies FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete allergies" ON public.allergies FOR DELETE USING (true);

-- Appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  doctor_name TEXT NOT NULL DEFAULT '',
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL DEFAULT '09:00',
  status TEXT NOT NULL DEFAULT 'scheduled',
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read appointments" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update appointments" ON public.appointments FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete appointments" ON public.appointments FOR DELETE USING (true);

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for appointments
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
