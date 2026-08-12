-- ============ 1. INSTITUTIONS (TENANTS) ============
CREATE TABLE public.institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active',
  timezone text NOT NULL DEFAULT 'Asia/Dubai',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.institutions TO authenticated;
GRANT ALL ON public.institutions TO service_role;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER institutions_set_updated_at BEFORE UPDATE ON public.institutions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.institutions (name, code) VALUES ('Demo General Hospital', 'DEMO');

-- ============ 2. TENANT LINKS ON EXISTING TABLES ============
ALTER TABLE public.profiles ADD COLUMN institution_id uuid REFERENCES public.institutions(id) ON DELETE RESTRICT;
ALTER TABLE public.patients ADD COLUMN institution_id uuid REFERENCES public.institutions(id) ON DELETE RESTRICT;

UPDATE public.profiles SET institution_id = (SELECT id FROM public.institutions WHERE code = 'DEMO');
UPDATE public.patients SET institution_id = (SELECT id FROM public.institutions WHERE code = 'DEMO');

CREATE INDEX idx_patients_institution ON public.patients(institution_id);
CREATE INDEX idx_profiles_institution ON public.profiles(institution_id);

-- ============ 3. TENANT / RESPONSIBILITY HELPERS ============
CREATE OR REPLACE FUNCTION private.user_institution(_user_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT institution_id FROM public.profiles WHERE id = _user_id $$;

CREATE POLICY "Members can view their institution" ON public.institutions
  FOR SELECT TO authenticated USING (id = private.user_institution(auth.uid()));

-- ============ 4. EMPLOYEE RESPONSIBILITIES ============
CREATE TABLE public.employee_responsibilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  responsibility text NOT NULL,
  department dept_code,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, responsibility, department)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employee_responsibilities TO authenticated;
GRANT ALL ON public.employee_responsibilities TO service_role;
ALTER TABLE public.employee_responsibilities ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION private.has_responsibility(_user_id uuid, _responsibility text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.employee_responsibilities
       WHERE user_id = _user_id AND responsibility = _responsibility) $$;

CREATE POLICY "Users can view their own responsibilities" ON public.employee_responsibilities
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Leaders can view institution responsibilities" ON public.employee_responsibilities
  FOR SELECT TO authenticated
  USING (institution_id = private.user_institution(auth.uid())
     AND (private.has_role(auth.uid(),'admin'::app_role)
       OR private.has_responsibility(auth.uid(),'charge_nurse')
       OR private.has_responsibility(auth.uid(),'nursing_admin')));
CREATE POLICY "Admins manage responsibilities" ON public.employee_responsibilities
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(),'admin'::app_role) AND institution_id = private.user_institution(auth.uid()))
  WITH CHECK (private.has_role(auth.uid(),'admin'::app_role) AND institution_id = private.user_institution(auth.uid()));

-- ============ 5. PATIENT ASSIGNMENTS ============
CREATE TABLE public.patient_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  care_role text NOT NULL DEFAULT 'primary_nurse',
  shift text NOT NULL DEFAULT 'day',
  active boolean NOT NULL DEFAULT true,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_assignments TO authenticated;
GRANT ALL ON public.patient_assignments TO service_role;
ALTER TABLE public.patient_assignments ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER patient_assignments_set_updated_at BEFORE UPDATE ON public.patient_assignments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_assignments_employee ON public.patient_assignments(employee_id) WHERE active;
CREATE INDEX idx_assignments_patient ON public.patient_assignments(patient_id) WHERE active;

CREATE OR REPLACE FUNCTION private.is_assigned_to_patient(_user_id uuid, _patient_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.patient_assignments
       WHERE employee_id = _user_id AND patient_id = _patient_id AND active) $$;

CREATE POLICY "Staff view their own assignments" ON public.patient_assignments
  FOR SELECT TO authenticated
  USING (employee_id = auth.uid() AND institution_id = private.user_institution(auth.uid()));
CREATE POLICY "Coordinators view institution assignments" ON public.patient_assignments
  FOR SELECT TO authenticated
  USING (institution_id = private.user_institution(auth.uid())
     AND (private.has_role(auth.uid(),'admin'::app_role)
       OR private.has_role(auth.uid(),'doctor'::app_role)
       OR private.has_responsibility(auth.uid(),'charge_nurse')
       OR private.has_responsibility(auth.uid(),'nursing_admin')));
CREATE POLICY "Coordinators manage assignments" ON public.patient_assignments
  FOR ALL TO authenticated
  USING (institution_id = private.user_institution(auth.uid())
     AND (private.has_role(auth.uid(),'admin'::app_role)
       OR private.has_responsibility(auth.uid(),'charge_nurse')
       OR private.has_responsibility(auth.uid(),'nursing_admin')))
  WITH CHECK (institution_id = private.user_institution(auth.uid())
     AND (private.has_role(auth.uid(),'admin'::app_role)
       OR private.has_responsibility(auth.uid(),'charge_nurse')
       OR private.has_responsibility(auth.uid(),'nursing_admin')));

-- ============ 6. INSTITUTION POLICY ENGINE ============
CREATE TABLE public.institution_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'protocol',
  code text NOT NULL,
  title text NOT NULL,
  summary text,
  department dept_code,
  trigger_expression text,
  escalation_pathway jsonb NOT NULL DEFAULT '[]'::jsonb,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (institution_id, code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.institution_policies TO authenticated;
GRANT ALL ON public.institution_policies TO service_role;
ALTER TABLE public.institution_policies ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER institution_policies_set_updated_at BEFORE UPDATE ON public.institution_policies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Members read active institution policies" ON public.institution_policies
  FOR SELECT TO authenticated
  USING (institution_id = private.user_institution(auth.uid()));
CREATE POLICY "Admins manage institution policies" ON public.institution_policies
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(),'admin'::app_role) AND institution_id = private.user_institution(auth.uid()))
  WITH CHECK (private.has_role(auth.uid(),'admin'::app_role) AND institution_id = private.user_institution(auth.uid()));

INSERT INTO public.institution_policies (institution_id, kind, code, title, summary, trigger_expression, escalation_pathway)
SELECT id, 'escalation', 'MEWS-ESC-01', 'MEWS escalation pathway',
  'MEWS 5 or above: reassess within 15 minutes, inform charge nurse, notify responsible clinician, document escalation.',
  'mews >= 5',
  '[{"step":1,"role":"bedside_nurse","action":"Reassess within 15 minutes"},{"step":2,"role":"charge_nurse","action":"Notify charge nurse"},{"step":3,"role":"doctor","action":"Notify responsible clinician"},{"step":4,"role":"bedside_nurse","action":"Document escalation and outcome"}]'::jsonb
FROM public.institutions WHERE code = 'DEMO';

-- ============ 7. AUDIT EVENTS ============
CREATE TABLE public.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES public.institutions(id) ON DELETE SET NULL,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  result text NOT NULL DEFAULT 'success',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_events TO authenticated;
GRANT ALL ON public.audit_events TO service_role;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_audit_institution_time ON public.audit_events(institution_id, occurred_at DESC);

CREATE POLICY "Users record their own audit events" ON public.audit_events
  FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid() AND institution_id = private.user_institution(auth.uid()));
CREATE POLICY "Admins read institution audit events" ON public.audit_events
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(),'admin'::app_role) AND institution_id = private.user_institution(auth.uid()));

-- ============ 8. TENANT-SCOPED CLINICAL ACCESS ============
CREATE OR REPLACE FUNCTION private.can_access_patient(_user_id uuid, _patient_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.patients p
    WHERE p.id = _patient_id
      AND p.institution_id = private.user_institution(_user_id)
      AND (private.has_role(_user_id,'admin'::app_role)
        OR private.has_role(_user_id,'doctor'::app_role)
        OR private.has_role(_user_id,'nurse'::app_role))
  )
$$;

DROP POLICY "Clinicians can view patients" ON public.patients;
CREATE POLICY "Clinicians can view patients in their institution" ON public.patients
  FOR SELECT TO authenticated
  USING (institution_id = private.user_institution(auth.uid())
     AND (private.has_role(auth.uid(),'admin'::app_role)
       OR private.has_role(auth.uid(),'doctor'::app_role)
       OR private.has_role(auth.uid(),'nurse'::app_role)));

DROP POLICY "Clinicians can update patients" ON public.patients;
CREATE POLICY "Clinicians can update patients in their institution" ON public.patients
  FOR UPDATE TO authenticated
  USING (institution_id = private.user_institution(auth.uid())
     AND (private.has_role(auth.uid(),'admin'::app_role)
       OR private.has_role(auth.uid(),'doctor'::app_role)
       OR private.has_role(auth.uid(),'nurse'::app_role)))
  WITH CHECK (institution_id = private.user_institution(auth.uid())
     AND (private.has_role(auth.uid(),'admin'::app_role)
       OR private.has_role(auth.uid(),'doctor'::app_role)
       OR private.has_role(auth.uid(),'nurse'::app_role)));

DROP POLICY "Clinicians can insert patients" ON public.patients;
CREATE POLICY "Clinicians can insert patients in their institution" ON public.patients
  FOR INSERT TO authenticated
  WITH CHECK (institution_id = private.user_institution(auth.uid())
     AND (private.has_role(auth.uid(),'admin'::app_role)
       OR private.has_role(auth.uid(),'doctor'::app_role)
       OR private.has_role(auth.uid(),'nurse'::app_role)));

DROP POLICY "Admins can delete patients" ON public.patients;
CREATE POLICY "Admins can delete patients in their institution" ON public.patients
  FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(),'admin'::app_role)
     AND institution_id = private.user_institution(auth.uid()));

-- vitals
DROP POLICY "Clinicians can view vitals" ON public.vitals;
CREATE POLICY "Clinicians can view vitals" ON public.vitals
  FOR SELECT TO authenticated USING (private.can_access_patient(auth.uid(), patient_id));
DROP POLICY "Clinicians can insert vitals" ON public.vitals;
CREATE POLICY "Clinicians can insert vitals" ON public.vitals
  FOR INSERT TO authenticated WITH CHECK (private.can_access_patient(auth.uid(), patient_id));
DROP POLICY "Clinicians can update vitals" ON public.vitals;
CREATE POLICY "Clinicians can update vitals" ON public.vitals
  FOR UPDATE TO authenticated USING (private.can_access_patient(auth.uid(), patient_id))
  WITH CHECK (private.can_access_patient(auth.uid(), patient_id));

-- medications
DROP POLICY "Clinicians can view medications" ON public.medications;
CREATE POLICY "Clinicians can view medications" ON public.medications
  FOR SELECT TO authenticated USING (private.can_access_patient(auth.uid(), patient_id));
DROP POLICY "Admins, doctors and nurses can insert medications" ON public.medications;
CREATE POLICY "Clinicians can insert medications" ON public.medications
  FOR INSERT TO authenticated WITH CHECK (private.can_access_patient(auth.uid(), patient_id));
DROP POLICY "Admins, doctors and nurses can update medications" ON public.medications;
CREATE POLICY "Clinicians can update medications" ON public.medications
  FOR UPDATE TO authenticated USING (private.can_access_patient(auth.uid(), patient_id))
  WITH CHECK (private.can_access_patient(auth.uid(), patient_id));

-- nursing notes
DROP POLICY "Clinicians can view nursing_notes" ON public.nursing_notes;
CREATE POLICY "Clinicians can view nursing_notes" ON public.nursing_notes
  FOR SELECT TO authenticated USING (private.can_access_patient(auth.uid(), patient_id));
DROP POLICY "Clinicians can insert nursing_notes" ON public.nursing_notes;
CREATE POLICY "Clinicians can insert nursing_notes" ON public.nursing_notes
  FOR INSERT TO authenticated WITH CHECK (private.can_access_patient(auth.uid(), patient_id));
DROP POLICY "Clinicians can update nursing_notes" ON public.nursing_notes;
CREATE POLICY "Clinicians can update nursing_notes" ON public.nursing_notes
  FOR UPDATE TO authenticated USING (private.can_access_patient(auth.uid(), patient_id))
  WITH CHECK (private.can_access_patient(auth.uid(), patient_id));

-- gcs scores
DROP POLICY "Clinicians can view gcs_scores" ON public.gcs_scores;
CREATE POLICY "Clinicians can view gcs_scores" ON public.gcs_scores
  FOR SELECT TO authenticated USING (private.can_access_patient(auth.uid(), patient_id));
DROP POLICY "Clinicians can insert gcs_scores" ON public.gcs_scores;
CREATE POLICY "Clinicians can insert gcs_scores" ON public.gcs_scores
  FOR INSERT TO authenticated WITH CHECK (private.can_access_patient(auth.uid(), patient_id));
DROP POLICY "Clinicians can update gcs_scores" ON public.gcs_scores;
CREATE POLICY "Clinicians can update gcs_scores" ON public.gcs_scores
  FOR UPDATE TO authenticated USING (private.can_access_patient(auth.uid(), patient_id))
  WITH CHECK (private.can_access_patient(auth.uid(), patient_id));

-- profiles: clinicians only see colleagues in their own institution
DROP POLICY "Clinicians can view all profiles" ON public.profiles;
CREATE POLICY "Clinicians can view institution profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (institution_id = private.user_institution(auth.uid())
     AND (private.has_role(auth.uid(),'admin'::app_role)
       OR private.has_role(auth.uid(),'doctor'::app_role)
       OR private.has_role(auth.uid(),'nurse'::app_role)));