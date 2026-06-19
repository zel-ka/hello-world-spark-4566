
-- 1) Promote target phone to admin (try several common Tanzania phone formats)
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::app_role
FROM auth.users u
WHERE regexp_replace(COALESCE(u.phone,''), '\D', '', 'g') IN ('0752519974','255752519974','752519974')
   OR regexp_replace(COALESCE(u.raw_user_meta_data->>'phone',''), '\D','', 'g') IN ('0752519974','255752519974','752519974')
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, 'admin'::app_role
FROM public.profiles p
WHERE regexp_replace(COALESCE(p.phone,''), '\D','', 'g') IN ('0752519974','255752519974','752519974')
ON CONFLICT (user_id, role) DO NOTHING;

-- 2) login_events table
CREATE TABLE IF NOT EXISTS public.login_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS login_events_created_at_idx ON public.login_events(created_at DESC);
CREATE INDEX IF NOT EXISTS login_events_user_id_idx ON public.login_events(user_id);

GRANT SELECT, INSERT ON public.login_events TO authenticated;
GRANT ALL ON public.login_events TO service_role;

ALTER TABLE public.login_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users insert own login events" ON public.login_events;
CREATE POLICY "Users insert own login events" ON public.login_events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own login events" ON public.login_events;
CREATE POLICY "Users view own login events" ON public.login_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins view all login events" ON public.login_events;
CREATE POLICY "Admins view all login events" ON public.login_events
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3) Admin users overview - security definer function returning name + phone of all users
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (user_id uuid, full_name text, phone text, email text, created_at timestamptz)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    u.id AS user_id,
    COALESCE(p.full_name, '') AS full_name,
    COALESCE(p.phone, u.phone, '') AS phone,
    COALESCE(u.email, '') AS email,
    u.created_at
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.user_id = u.id
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
  ORDER BY u.created_at DESC
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;

-- 4) Login analytics aggregator (security definer, admin-only)
CREATE OR REPLACE FUNCTION public.admin_login_analytics(bucket text DEFAULT 'day')
RETURNS TABLE (bucket_start timestamptz, login_count bigint, unique_users bigint)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  IF bucket NOT IN ('day','week','month') THEN
    bucket := 'day';
  END IF;

  RETURN QUERY EXECUTE format(
    'SELECT date_trunc(%L, created_at) AS bucket_start,
            COUNT(*)::bigint AS login_count,
            COUNT(DISTINCT user_id)::bigint AS unique_users
     FROM public.login_events
     WHERE created_at >= now() - interval %L
     GROUP BY 1
     ORDER BY 1',
    bucket,
    CASE bucket WHEN 'day' THEN '30 days' WHEN 'week' THEN '12 weeks' ELSE '12 months' END
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_login_analytics(text) TO authenticated;
