CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

DROP POLICY IF EXISTS "Admins can delete gcs_scores" ON public.gcs_scores;
DROP POLICY IF EXISTS "Clinicians can insert gcs_scores" ON public.gcs_scores;
DROP POLICY IF EXISTS "Clinicians can update gcs_scores" ON public.gcs_scores;
DROP POLICY IF EXISTS "Admins, doctors and nurses can insert medications" ON public.medications;
DROP POLICY IF EXISTS "Admins, doctors and nurses can update medications" ON public.medications;
DROP POLICY IF EXISTS "Only admins can delete medications" ON public.medications;
DROP POLICY IF EXISTS "Admins can delete nursing_notes" ON public.nursing_notes;
DROP POLICY IF EXISTS "Clinicians can insert nursing_notes" ON public.nursing_notes;
DROP POLICY IF EXISTS "Clinicians can update nursing_notes" ON public.nursing_notes;
DROP POLICY IF EXISTS "Admins can delete patients" ON public.patients;
DROP POLICY IF EXISTS "Clinicians can insert patients" ON public.patients;
DROP POLICY IF EXISTS "Clinicians can update patients" ON public.patients;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete vitals" ON public.vitals;
DROP POLICY IF EXISTS "Clinicians can insert vitals" ON public.vitals;
DROP POLICY IF EXISTS "Clinicians can update vitals" ON public.vitals;

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

CREATE POLICY "Admins can delete gcs_scores" ON public.gcs_scores
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Clinicians can insert gcs_scores" ON public.gcs_scores
  FOR INSERT TO authenticated WITH CHECK (
    private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'doctor') OR private.has_role(auth.uid(), 'nurse'));
CREATE POLICY "Clinicians can update gcs_scores" ON public.gcs_scores
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'doctor') OR private.has_role(auth.uid(), 'nurse'))
  WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'doctor') OR private.has_role(auth.uid(), 'nurse'));

CREATE POLICY "Admins, doctors and nurses can insert medications" ON public.medications
  FOR INSERT TO authenticated WITH CHECK (
    private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'doctor') OR private.has_role(auth.uid(), 'nurse'));
CREATE POLICY "Admins, doctors and nurses can update medications" ON public.medications
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'doctor') OR private.has_role(auth.uid(), 'nurse'))
  WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'doctor') OR private.has_role(auth.uid(), 'nurse'));
CREATE POLICY "Only admins can delete medications" ON public.medications
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete nursing_notes" ON public.nursing_notes
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Clinicians can insert nursing_notes" ON public.nursing_notes
  FOR INSERT TO authenticated WITH CHECK (
    private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'doctor') OR private.has_role(auth.uid(), 'nurse'));
CREATE POLICY "Clinicians can update nursing_notes" ON public.nursing_notes
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'doctor') OR private.has_role(auth.uid(), 'nurse'))
  WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'doctor') OR private.has_role(auth.uid(), 'nurse'));

CREATE POLICY "Admins can delete patients" ON public.patients
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Clinicians can insert patients" ON public.patients
  FOR INSERT TO authenticated WITH CHECK (
    private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'doctor') OR private.has_role(auth.uid(), 'nurse'));
CREATE POLICY "Clinicians can update patients" ON public.patients
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'doctor') OR private.has_role(auth.uid(), 'nurse'))
  WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'doctor') OR private.has_role(auth.uid(), 'nurse'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete vitals" ON public.vitals
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Clinicians can insert vitals" ON public.vitals
  FOR INSERT TO authenticated WITH CHECK (
    private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'doctor') OR private.has_role(auth.uid(), 'nurse'));
CREATE POLICY "Clinicians can update vitals" ON public.vitals
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'doctor') OR private.has_role(auth.uid(), 'nurse'))
  WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'doctor') OR private.has_role(auth.uid(), 'nurse'));