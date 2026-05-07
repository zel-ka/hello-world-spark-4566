-- Daily logs table for self-reported wellness metrics
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
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, log_date)
);

ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily logs"
ON public.daily_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily logs"
ON public.daily_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily logs"
ON public.daily_logs FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Doctors can view all daily logs"
ON public.daily_logs FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_daily_logs_updated_at
BEFORE UPDATE ON public.daily_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_daily_logs_user_date ON public.daily_logs(user_id, log_date DESC);

-- Recommendations shown tracking
CREATE TABLE public.recommendations_shown (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tip_id TEXT NOT NULL,
  category TEXT NOT NULL,
  shown_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.recommendations_shown ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recommendations"
ON public.recommendations_shown FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recommendations"
ON public.recommendations_shown FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_recommendations_user_date ON public.recommendations_shown(user_id, shown_date DESC);