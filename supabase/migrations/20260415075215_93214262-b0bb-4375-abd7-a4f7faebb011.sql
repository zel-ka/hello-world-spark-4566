
-- ===== ALERTS =====
DROP POLICY IF EXISTS "Anyone can read alerts" ON public.alerts;
DROP POLICY IF EXISTS "Anyone can insert alerts" ON public.alerts;
DROP POLICY IF EXISTS "Anyone can update alerts" ON public.alerts;

CREATE POLICY "Patients view own alerts" ON public.alerts FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = alerts.patient_id AND p.user_id = auth.uid()));
CREATE POLICY "Doctors view all alerts" ON public.alerts FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "System insert alerts" ON public.alerts FOR INSERT TO authenticated
  WITH CHECK (true);
CREATE POLICY "Doctors update alerts" ON public.alerts FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));

-- ===== ALLERGIES =====
DROP POLICY IF EXISTS "Anyone can read allergies" ON public.allergies;
DROP POLICY IF EXISTS "Anyone can insert allergies" ON public.allergies;
DROP POLICY IF EXISTS "Anyone can update allergies" ON public.allergies;
DROP POLICY IF EXISTS "Anyone can delete allergies" ON public.allergies;

CREATE POLICY "Patients view own allergies" ON public.allergies FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = allergies.patient_id AND p.user_id = auth.uid()));
CREATE POLICY "Doctors view all allergies" ON public.allergies FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated insert allergies" ON public.allergies FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = allergies.patient_id AND p.user_id = auth.uid())
    OR has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated update allergies" ON public.allergies FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = allergies.patient_id AND p.user_id = auth.uid())
    OR has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated delete allergies" ON public.allergies FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = allergies.patient_id AND p.user_id = auth.uid())
    OR has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));

-- ===== APPOINTMENTS =====
DROP POLICY IF EXISTS "Anyone can read appointments" ON public.appointments;
DROP POLICY IF EXISTS "Anyone can insert appointments" ON public.appointments;
DROP POLICY IF EXISTS "Anyone can update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Anyone can delete appointments" ON public.appointments;

CREATE POLICY "Patients view own appointments" ON public.appointments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = appointments.patient_id AND p.user_id = auth.uid()));
CREATE POLICY "Doctors view all appointments" ON public.appointments FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated insert appointments" ON public.appointments FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = appointments.patient_id AND p.user_id = auth.uid())
    OR has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated update appointments" ON public.appointments FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated delete appointments" ON public.appointments FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));

-- ===== MEDICAL HISTORY =====
DROP POLICY IF EXISTS "Anyone can read medical_history" ON public.medical_history;
DROP POLICY IF EXISTS "Anyone can insert medical_history" ON public.medical_history;
DROP POLICY IF EXISTS "Anyone can update medical_history" ON public.medical_history;

CREATE POLICY "Patients view own medical_history" ON public.medical_history FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = medical_history.patient_id AND p.user_id = auth.uid()));
CREATE POLICY "Doctors view all medical_history" ON public.medical_history FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated insert medical_history" ON public.medical_history FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = medical_history.patient_id AND p.user_id = auth.uid())
    OR has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated update medical_history" ON public.medical_history FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));

-- ===== VITALS =====
DROP POLICY IF EXISTS "Anyone can read vitals" ON public.vitals;
DROP POLICY IF EXISTS "Anyone can insert vitals" ON public.vitals;
DROP POLICY IF EXISTS "Anyone can update vitals" ON public.vitals;

CREATE POLICY "Patients view own vitals" ON public.vitals FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = vitals.patient_id AND p.user_id = auth.uid()));
CREATE POLICY "Doctors view all vitals" ON public.vitals FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated insert vitals" ON public.vitals FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = vitals.patient_id AND p.user_id = auth.uid())
    OR has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated update vitals" ON public.vitals FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));

-- ===== Fix patients INSERT policy =====
DROP POLICY IF EXISTS "System can insert patients" ON public.patients;
CREATE POLICY "System can insert patients" ON public.patients FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));
