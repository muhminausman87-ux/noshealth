
DROP POLICY IF EXISTS "Authenticated can view patients" ON public.patients;
CREATE POLICY "Clinicians can view patients" ON public.patients FOR SELECT TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'doctor'::app_role) OR private.has_role(auth.uid(), 'nurse'::app_role));

DROP POLICY IF EXISTS "Authenticated can view vitals" ON public.vitals;
CREATE POLICY "Clinicians can view vitals" ON public.vitals FOR SELECT TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'doctor'::app_role) OR private.has_role(auth.uid(), 'nurse'::app_role));

DROP POLICY IF EXISTS "Authenticated can view gcs_scores" ON public.gcs_scores;
CREATE POLICY "Clinicians can view gcs_scores" ON public.gcs_scores FOR SELECT TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'doctor'::app_role) OR private.has_role(auth.uid(), 'nurse'::app_role));

DROP POLICY IF EXISTS "Authenticated can view nursing_notes" ON public.nursing_notes;
CREATE POLICY "Clinicians can view nursing_notes" ON public.nursing_notes FOR SELECT TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'doctor'::app_role) OR private.has_role(auth.uid(), 'nurse'::app_role));

DROP POLICY IF EXISTS "Authenticated users can view all medications" ON public.medications;
CREATE POLICY "Clinicians can view medications" ON public.medications FOR SELECT TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'doctor'::app_role) OR private.has_role(auth.uid(), 'nurse'::app_role));

DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id);
CREATE POLICY "Clinicians can view all profiles" ON public.profiles FOR SELECT TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'doctor'::app_role) OR private.has_role(auth.uid(), 'nurse'::app_role));
