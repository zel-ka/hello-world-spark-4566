
-- Create health_entries table for patient vitals data
CREATE TABLE public.health_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  systolic INTEGER NOT NULL,
  diastolic INTEGER NOT NULL,
  heart_rate INTEGER NOT NULL,
  temperature NUMERIC(4,1) NOT NULL DEFAULT 36.6,
  weight NUMERIC(5,1) NOT NULL,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_health_entries_patient ON public.health_entries(patient_id);
CREATE INDEX idx_health_entries_user ON public.health_entries(user_id);

-- Enable RLS
ALTER TABLE public.health_entries ENABLE ROW LEVEL SECURITY;

-- Patients can view their own entries
CREATE POLICY "Patients view own health entries" ON public.health_entries
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Patients can insert their own entries
CREATE POLICY "Patients insert own health entries" ON public.health_entries
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Doctors can view all entries
CREATE POLICY "Doctors view all health entries" ON public.health_entries
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'doctor'));

-- Admins full access
CREATE POLICY "Admins full access health entries" ON public.health_entries
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.health_entries;
