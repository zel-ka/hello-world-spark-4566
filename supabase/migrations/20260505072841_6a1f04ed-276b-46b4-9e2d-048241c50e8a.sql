-- Add blood_sugar column to health_entries (cholesterol already exists)
ALTER TABLE public.health_entries
  ADD COLUMN IF NOT EXISTS blood_sugar numeric;

-- Helpful index for time-series queries per patient
CREATE INDEX IF NOT EXISTS idx_health_entries_patient_recorded
  ON public.health_entries (patient_id, recorded_date DESC);
