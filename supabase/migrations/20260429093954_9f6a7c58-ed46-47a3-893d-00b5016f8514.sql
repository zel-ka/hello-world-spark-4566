-- Assessments table for storing questionnaire results (PHQ-9, GAD-7, FINDRISC, Nutrition, Sleep, Hydration, Exercise, etc.)
CREATE TABLE public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'nutrition' | 'exercise' | 'sleep' | 'hydration' | 'stress' | 'phq9' | 'gad7' | 'findrisc' | 'heart' | 'cancer_lifestyle'
  score NUMERIC NOT NULL DEFAULT 0, -- normalized 0-100
  raw_score NUMERIC, -- raw scoring (e.g., FINDRISC points)
  risk_level TEXT NOT NULL DEFAULT 'low', -- 'low' | 'moderate' | 'high'
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_assessments_user_type_date ON public.assessments(user_id, type, created_at DESC);

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own assessments"
  ON public.assessments FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own assessments"
  ON public.assessments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own assessments"
  ON public.assessments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Doctors view all assessments"
  ON public.assessments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'doctor'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_assessments_updated_at
  BEFORE UPDATE ON public.assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Health scores history (daily computed health score 0-100)
CREATE TABLE public.health_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  breakdown JSONB NOT NULL DEFAULT '{}'::jsonb, -- { vitals, lifestyle, assessments, adherence }
  computed_for_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, computed_for_date)
);

CREATE INDEX idx_health_scores_user_date ON public.health_scores(user_id, computed_for_date DESC);

ALTER TABLE public.health_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own health scores"
  ON public.health_scores FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own health scores"
  ON public.health_scores FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own health scores"
  ON public.health_scores FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Doctors view all health scores"
  ON public.health_scores FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'doctor'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role));

-- Add height_cm and cholesterol tracking to profiles for BMI/calorie calc
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS height_cm NUMERIC;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS activity_level TEXT DEFAULT 'moderate';

-- Add cholesterol to health_entries for monitoring
ALTER TABLE public.health_entries ADD COLUMN IF NOT EXISTS cholesterol NUMERIC;