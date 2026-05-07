
DROP POLICY IF EXISTS "System insert alerts" ON public.alerts;
CREATE POLICY "Staff insert alerts" ON public.alerts
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));
