CREATE TABLE public.scheduling_departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  department_code public.dept_code NOT NULL,
  department_name text NOT NULL,
  minimum_staff_required integer NOT NULL DEFAULT 0,
  preferred_staff_required integer NOT NULL DEFAULT 0,
  operating_hours jsonb NOT NULL DEFAULT '{}'::jsonb,
  active_status boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (institution_id, department_code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduling_departments TO authenticated;
GRANT ALL ON public.scheduling_departments TO service_role;
ALTER TABLE public.scheduling_departments ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.scheduling_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  employee_code text NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'nurse',
  department public.dept_code NOT NULL,
  employment_type text NOT NULL DEFAULT 'full_time',
  grade text NOT NULL DEFAULT 'Staff Nurse',
  active_status boolean NOT NULL DEFAULT true,
  contracted_hours numeric NOT NULL DEFAULT 40,
  maximum_hours_per_week numeric NOT NULL DEFAULT 48,
  minimum_hours_per_week numeric NOT NULL DEFAULT 0,
  preferred_shift_types text[] NOT NULL DEFAULT ARRAY[]::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (institution_id, employee_code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduling_staff TO authenticated;
GRANT ALL ON public.scheduling_staff TO service_role;
ALTER TABLE public.scheduling_staff ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.scheduling_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  skill_code text NOT NULL,
  skill_name text NOT NULL,
  active_status boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (institution_id, skill_code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduling_skills TO authenticated;
GRANT ALL ON public.scheduling_skills TO service_role;
ALTER TABLE public.scheduling_skills ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.scheduling_staff_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES public.scheduling_staff(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES public.scheduling_skills(id) ON DELETE CASCADE,
  competency_level text NOT NULL DEFAULT 'verified',
  department_authorized public.dept_code,
  expiry_date date,
  verified_status text NOT NULL DEFAULT 'verified',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (staff_id, skill_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduling_staff_skills TO authenticated;
GRANT ALL ON public.scheduling_staff_skills TO service_role;
ALTER TABLE public.scheduling_staff_skills ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.scheduling_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  name text NOT NULL,
  version text NOT NULL,
  effective_from date NOT NULL DEFAULT current_date,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  active_status boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (institution_id, name, version)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduling_policies TO authenticated;
GRANT ALL ON public.scheduling_policies TO service_role;
ALTER TABLE public.scheduling_policies ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.scheduling_shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  department_id uuid NOT NULL REFERENCES public.scheduling_departments(id) ON DELETE CASCADE,
  shift_date date NOT NULL,
  shift_type text NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  required_nurses integer NOT NULL DEFAULT 0,
  required_rn integer NOT NULL DEFAULT 0,
  required_skill_mix jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (department_id, shift_date, shift_type)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduling_shifts TO authenticated;
GRANT ALL ON public.scheduling_shifts TO service_role;
ALTER TABLE public.scheduling_shifts ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.scheduling_staff_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES public.scheduling_staff(id) ON DELETE CASCADE,
  availability_date date NOT NULL,
  available_from time,
  available_to time,
  availability_status text NOT NULL DEFAULT 'available',
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (staff_id, availability_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduling_staff_availability TO authenticated;
GRANT ALL ON public.scheduling_staff_availability TO service_role;
ALTER TABLE public.scheduling_staff_availability ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.scheduling_leave (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES public.scheduling_staff(id) ON DELETE CASCADE,
  leave_type text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'requested',
  reason text,
  approved_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduling_leave TO authenticated;
GRANT ALL ON public.scheduling_leave TO service_role;
ALTER TABLE public.scheduling_leave ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.scheduling_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES public.scheduling_staff(id) ON DELETE CASCADE,
  preferred_shift_types text[] NOT NULL DEFAULT ARRAY[]::text[],
  unavailable_dates date[] NOT NULL DEFAULT ARRAY[]::date[],
  preferred_department public.dept_code,
  preferred_shift_count integer,
  weekend_preference text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (staff_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduling_preferences TO authenticated;
GRANT ALL ON public.scheduling_preferences TO service_role;
ALTER TABLE public.scheduling_preferences ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.scheduling_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES public.scheduling_staff(id) ON DELETE CASCADE,
  request_kind text NOT NULL,
  start_date date,
  end_date date,
  shift_type text,
  reason text,
  status text NOT NULL DEFAULT 'submitted',
  outcome text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  decided_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduling_requests TO authenticated;
GRANT ALL ON public.scheduling_requests TO service_role;
ALTER TABLE public.scheduling_requests ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.scheduling_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  department_id uuid NOT NULL REFERENCES public.scheduling_departments(id) ON DELETE CASCADE,
  roster_period_start date NOT NULL,
  roster_period_end date NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now(),
  generated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  algorithm_version text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  schedule_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  approved_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at timestamptz,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.scheduling_runs TO authenticated;
GRANT ALL ON public.scheduling_runs TO service_role;
ALTER TABLE public.scheduling_runs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.scheduling_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  run_id uuid NOT NULL REFERENCES public.scheduling_runs(id) ON DELETE CASCADE,
  shift_id uuid NOT NULL REFERENCES public.scheduling_shifts(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES public.scheduling_staff(id) ON DELETE CASCADE,
  assignment_status text NOT NULL DEFAULT 'proposed',
  assigned_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (run_id, shift_id, staff_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduling_assignments TO authenticated;
GRANT ALL ON public.scheduling_assignments TO service_role;
ALTER TABLE public.scheduling_assignments ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.scheduling_shift_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES public.scheduling_staff(id) ON DELETE CASCADE,
  shift_id uuid REFERENCES public.scheduling_shifts(id) ON DELETE SET NULL,
  department public.dept_code NOT NULL,
  shift_date date NOT NULL,
  shift_type text NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  hours numeric NOT NULL DEFAULT 0,
  is_night boolean NOT NULL DEFAULT false,
  is_weekend boolean NOT NULL DEFAULT false,
  workload_score numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduling_shift_history TO authenticated;
GRANT ALL ON public.scheduling_shift_history TO service_role;
ALTER TABLE public.scheduling_shift_history ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.scheduling_conflicts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  run_id uuid NOT NULL REFERENCES public.scheduling_runs(id) ON DELETE CASCADE,
  shift_id uuid REFERENCES public.scheduling_shifts(id) ON DELETE SET NULL,
  staff_id uuid REFERENCES public.scheduling_staff(id) ON DELETE SET NULL,
  category text NOT NULL,
  severity text NOT NULL DEFAULT 'moderate',
  message text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  resolved boolean NOT NULL DEFAULT false,
  resolution text,
  resolved_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduling_conflicts TO authenticated;
GRANT ALL ON public.scheduling_conflicts TO service_role;
ALTER TABLE public.scheduling_conflicts ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.scheduling_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  run_id uuid REFERENCES public.scheduling_runs(id) ON DELETE SET NULL,
  assignment_id uuid REFERENCES public.scheduling_assignments(id) ON DELETE SET NULL,
  action text NOT NULL,
  previous_assignment jsonb,
  proposed_assignment jsonb,
  reason text NOT NULL,
  decided_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  approval_status text NOT NULL DEFAULT 'recorded',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.scheduling_decisions TO authenticated;
GRANT ALL ON public.scheduling_decisions TO service_role;
ALTER TABLE public.scheduling_decisions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION private.is_scheduling_leader(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT private.has_role(_user_id, 'admin'::app_role)
  OR private.has_responsibility(_user_id, 'charge_nurse')
  OR private.has_responsibility(_user_id, 'nursing_admin')
  OR private.has_responsibility(_user_id, 'hr')
  OR private.has_responsibility(_user_id, 'executive') $$;

CREATE POLICY "Scheduling departments same institution" ON public.scheduling_departments FOR SELECT TO authenticated
  USING (institution_id = private.user_institution(auth.uid()));
CREATE POLICY "Scheduling department leaders manage" ON public.scheduling_departments FOR ALL TO authenticated
  USING (institution_id = private.user_institution(auth.uid()) AND private.is_scheduling_leader(auth.uid()))
  WITH CHECK (institution_id = private.user_institution(auth.uid()) AND private.is_scheduling_leader(auth.uid()));

CREATE POLICY "Scheduling staff same institution" ON public.scheduling_staff FOR SELECT TO authenticated
  USING (institution_id = private.user_institution(auth.uid()));
CREATE POLICY "Scheduling staff leaders manage" ON public.scheduling_staff FOR ALL TO authenticated
  USING (institution_id = private.user_institution(auth.uid()) AND private.is_scheduling_leader(auth.uid()))
  WITH CHECK (institution_id = private.user_institution(auth.uid()) AND private.is_scheduling_leader(auth.uid()));

CREATE POLICY "Scheduling skills same institution" ON public.scheduling_skills FOR SELECT TO authenticated
  USING (institution_id = private.user_institution(auth.uid()));
CREATE POLICY "Scheduling skills leaders manage" ON public.scheduling_skills FOR ALL TO authenticated
  USING (institution_id = private.user_institution(auth.uid()) AND private.is_scheduling_leader(auth.uid()))
  WITH CHECK (institution_id = private.user_institution(auth.uid()) AND private.is_scheduling_leader(auth.uid()));

CREATE POLICY "Scheduling staff skills same institution" ON public.scheduling_staff_skills FOR SELECT TO authenticated
  USING (institution_id = private.user_institution(auth.uid()));
CREATE POLICY "Scheduling staff skills leaders manage" ON public.scheduling_staff_skills FOR ALL TO authenticated
  USING (institution_id = private.user_institution(auth.uid()) AND private.is_scheduling_leader(auth.uid()))
  WITH CHECK (institution_id = private.user_institution(auth.uid()) AND private.is_scheduling_leader(auth.uid()));

CREATE POLICY "Scheduling policies same institution" ON public.scheduling_policies FOR SELECT TO authenticated
  USING (institution_id = private.user_institution(auth.uid()));
CREATE POLICY "Scheduling policies leaders manage" ON public.scheduling_policies FOR ALL TO authenticated
  USING (institution_id = private.user_institution(auth.uid()) AND private.is_scheduling_leader(auth.uid()))
  WITH CHECK (institution_id = private.user_institution(auth.uid()) AND private.is_scheduling_leader(auth.uid()));

CREATE POLICY "Scheduling shifts same institution" ON public.scheduling_shifts FOR SELECT TO authenticated
  USING (institution_id = private.user_institution(auth.uid()));
CREATE POLICY "Scheduling shifts leaders manage" ON public.scheduling_shifts FOR ALL TO authenticated
  USING (institution_id = private.user_institution(auth.uid()) AND private.is_scheduling_leader(auth.uid()))
  WITH CHECK (institution_id = private.user_institution(auth.uid()) AND private.is_scheduling_leader(auth.uid()));

CREATE POLICY "Scheduling availability self or leader" ON public.scheduling_staff_availability FOR SELECT TO authenticated
  USING (institution_id = private.user_institution(auth.uid()) AND (EXISTS (SELECT 1 FROM public.scheduling_staff s WHERE s.id = staff_id AND s.profile_id = auth.uid()) OR private.is_scheduling_leader(auth.uid())));
CREATE POLICY "Scheduling availability self or leader manage" ON public.scheduling_staff_availability FOR ALL TO authenticated
  USING (institution_id = private.user_institution(auth.uid()) AND (EXISTS (SELECT 1 FROM public.scheduling_staff s WHERE s.id = staff_id AND s.profile_id = auth.uid()) OR private.is_scheduling_leader(auth.uid())))
  WITH CHECK (institution_id = private.user_institution(auth.uid()));

CREATE POLICY "Scheduling leave self or leader" ON public.scheduling_leave FOR SELECT TO authenticated
  USING (institution_id = private.user_institution(auth.uid()) AND (EXISTS (SELECT 1 FROM public.scheduling_staff s WHERE s.id = staff_id AND s.profile_id = auth.uid()) OR private.is_scheduling_leader(auth.uid())));
CREATE POLICY "Scheduling leave self or leader manage" ON public.scheduling_leave FOR ALL TO authenticated
  USING (institution_id = private.user_institution(auth.uid()) AND (EXISTS (SELECT 1 FROM public.scheduling_staff s WHERE s.id = staff_id AND s.profile_id = auth.uid()) OR private.is_scheduling_leader(auth.uid())))
  WITH CHECK (institution_id = private.user_institution(auth.uid()));

CREATE POLICY "Scheduling preferences self or leader" ON public.scheduling_preferences FOR SELECT TO authenticated
  USING (institution_id = private.user_institution(auth.uid()) AND (EXISTS (SELECT 1 FROM public.scheduling_staff s WHERE s.id = staff_id AND s.profile_id = auth.uid()) OR private.is_scheduling_leader(auth.uid())));
CREATE POLICY "Scheduling preferences self or leader manage" ON public.scheduling_preferences FOR ALL TO authenticated
  USING (institution_id = private.user_institution(auth.uid()) AND (EXISTS (SELECT 1 FROM public.scheduling_staff s WHERE s.id = staff_id AND s.profile_id = auth.uid()) OR private.is_scheduling_leader(auth.uid())))
  WITH CHECK (institution_id = private.user_institution(auth.uid()));

CREATE POLICY "Scheduling requests self or leader" ON public.scheduling_requests FOR SELECT TO authenticated
  USING (institution_id = private.user_institution(auth.uid()) AND (EXISTS (SELECT 1 FROM public.scheduling_staff s WHERE s.id = staff_id AND s.profile_id = auth.uid()) OR private.is_scheduling_leader(auth.uid())));
CREATE POLICY "Scheduling requests self or leader manage" ON public.scheduling_requests FOR ALL TO authenticated
  USING (institution_id = private.user_institution(auth.uid()) AND (EXISTS (SELECT 1 FROM public.scheduling_staff s WHERE s.id = staff_id AND s.profile_id = auth.uid()) OR private.is_scheduling_leader(auth.uid())))
  WITH CHECK (institution_id = private.user_institution(auth.uid()));

CREATE POLICY "Scheduling runs same institution" ON public.scheduling_runs FOR SELECT TO authenticated
  USING (institution_id = private.user_institution(auth.uid()));
CREATE POLICY "Scheduling runs leaders manage" ON public.scheduling_runs FOR INSERT TO authenticated
  WITH CHECK (institution_id = private.user_institution(auth.uid()) AND private.is_scheduling_leader(auth.uid()));
CREATE POLICY "Scheduling runs leaders update" ON public.scheduling_runs FOR UPDATE TO authenticated
  USING (institution_id = private.user_institution(auth.uid()) AND private.is_scheduling_leader(auth.uid()))
  WITH CHECK (institution_id = private.user_institution(auth.uid()) AND private.is_scheduling_leader(auth.uid()));

CREATE POLICY "Scheduling assignments same institution" ON public.scheduling_assignments FOR SELECT TO authenticated
  USING (institution_id = private.user_institution(auth.uid()));
CREATE POLICY "Scheduling assignments leaders manage" ON public.scheduling_assignments FOR ALL TO authenticated
  USING (institution_id = private.user_institution(auth.uid()) AND private.is_scheduling_leader(auth.uid()))
  WITH CHECK (institution_id = private.user_institution(auth.uid()) AND private.is_scheduling_leader(auth.uid()));

CREATE POLICY "Scheduling history leaders or self" ON public.scheduling_shift_history FOR SELECT TO authenticated
  USING (institution_id = private.user_institution(auth.uid()) AND (EXISTS (SELECT 1 FROM public.scheduling_staff s WHERE s.id = staff_id AND s.profile_id = auth.uid()) OR private.is_scheduling_leader(auth.uid())));
CREATE POLICY "Scheduling history leaders manage" ON public.scheduling_shift_history FOR ALL TO authenticated
  USING (institution_id = private.user_institution(auth.uid()) AND private.is_scheduling_leader(auth.uid()))
  WITH CHECK (institution_id = private.user_institution(auth.uid()) AND private.is_scheduling_leader(auth.uid()));

CREATE POLICY "Scheduling conflicts same institution" ON public.scheduling_conflicts FOR SELECT TO authenticated
  USING (institution_id = private.user_institution(auth.uid()));
CREATE POLICY "Scheduling conflicts leaders manage" ON public.scheduling_conflicts FOR ALL TO authenticated
  USING (institution_id = private.user_institution(auth.uid()) AND private.is_scheduling_leader(auth.uid()))
  WITH CHECK (institution_id = private.user_institution(auth.uid()) AND private.is_scheduling_leader(auth.uid()));

CREATE POLICY "Scheduling decisions same institution" ON public.scheduling_decisions FOR SELECT TO authenticated
  USING (institution_id = private.user_institution(auth.uid()));
CREATE POLICY "Scheduling decisions leaders manage" ON public.scheduling_decisions FOR ALL TO authenticated
  USING (institution_id = private.user_institution(auth.uid()) AND private.is_scheduling_leader(auth.uid()))
  WITH CHECK (institution_id = private.user_institution(auth.uid()) AND private.is_scheduling_leader(auth.uid()));

CREATE TRIGGER scheduling_departments_updated_at BEFORE UPDATE ON public.scheduling_departments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER scheduling_staff_updated_at BEFORE UPDATE ON public.scheduling_staff FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER scheduling_skills_updated_at BEFORE UPDATE ON public.scheduling_skills FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER scheduling_staff_skills_updated_at BEFORE UPDATE ON public.scheduling_staff_skills FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER scheduling_policies_updated_at BEFORE UPDATE ON public.scheduling_policies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER scheduling_shifts_updated_at BEFORE UPDATE ON public.scheduling_shifts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER scheduling_availability_updated_at BEFORE UPDATE ON public.scheduling_staff_availability FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER scheduling_leave_updated_at BEFORE UPDATE ON public.scheduling_leave FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER scheduling_preferences_updated_at BEFORE UPDATE ON public.scheduling_preferences FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER scheduling_requests_updated_at BEFORE UPDATE ON public.scheduling_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER scheduling_runs_updated_at BEFORE UPDATE ON public.scheduling_runs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER scheduling_assignments_updated_at BEFORE UPDATE ON public.scheduling_assignments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER scheduling_conflicts_updated_at BEFORE UPDATE ON public.scheduling_conflicts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.scheduling_departments (institution_id, department_code, department_name, minimum_staff_required, preferred_staff_required, operating_hours)
SELECT i.id, d.code::public.dept_code, d.name, CASE WHEN d.code IN ('icu','ed') THEN 4 ELSE 3 END, CASE WHEN d.code IN ('icu','ed') THEN 6 ELSE 5 END, '{"open":"00:00","close":"23:59"}'::jsonb
FROM public.institutions i
CROSS JOIN (VALUES
  ('ed','Emergency Department'),('icu','Intensive Care Unit'),('medsurg','Medical-Surgical Floor'),('maternity','Maternity Ward'),('cardiac','Cardiac Ward'),('labour','Labour Room'),('pediatric','Pediatric Ward'),('medical','Medical Ward'),('surgical','Surgical Ward'),('opd','Out-Patient Department'),('daycare','Day Care Ward'),('ot','Operation Theatre')
) AS d(code,name)
ON CONFLICT (institution_id, department_code) DO NOTHING;

INSERT INTO public.scheduling_staff (institution_id, profile_id, employee_code, name, role, department, employment_type, grade, contracted_hours, maximum_hours_per_week, minimum_hours_per_week, preferred_shift_types)
SELECT p.institution_id, p.id, 'DEMO-' || LPAD(ROW_NUMBER() OVER (PARTITION BY p.institution_id ORDER BY p.created_at)::text, 3, '0'), p.full_name, CASE WHEN p.title ILIKE '%nurse%' OR p.title ILIKE '%nursing%' THEN 'nurse' ELSE 'clinical_staff' END, COALESCE(p.assigned_dept, 'medical'::public.dept_code), 'full_time', CASE WHEN p.title ILIKE '%director%' OR p.title ILIKE '%administrator%' THEN 'Charge Nurse' ELSE 'Staff Nurse' END, 40, 48, 24, ARRAY['M','E']::text[]
FROM public.profiles p
WHERE p.institution_id IS NOT NULL
ON CONFLICT (institution_id, employee_code) DO NOTHING;

INSERT INTO public.scheduling_skills (institution_id, skill_code, skill_name)
SELECT i.id, s.code, s.name
FROM public.institutions i
CROSS JOIN (VALUES
  ('icu','Critical care / ICU'),('ed','Emergency care'),('paeds','Paediatrics'),('midwifery','Midwifery'),('cardiac','Cardiac care'),('acls','Advanced Life Support'),('bls','Basic Life Support'),('preceptor','Preceptor')
) AS s(code,name)
ON CONFLICT (institution_id, skill_code) DO NOTHING;

INSERT INTO public.scheduling_staff_skills (institution_id, staff_id, skill_id, department_authorized, competency_level, verified_status)
SELECT st.institution_id, st.id, sk.id, st.department, 'verified', 'verified'
FROM public.scheduling_staff st
JOIN public.scheduling_skills sk ON sk.institution_id = st.institution_id AND sk.skill_code IN ('bls','acls', CASE st.department WHEN 'icu' THEN 'icu' WHEN 'ed' THEN 'ed' WHEN 'pediatric' THEN 'paeds' WHEN 'maternity' THEN 'midwifery' WHEN 'labour' THEN 'midwifery' WHEN 'cardiac' THEN 'cardiac' ELSE 'bls' END)
ON CONFLICT (staff_id, skill_id) DO NOTHING;

INSERT INTO public.scheduling_policies (institution_id, name, version, effective_from, config)
SELECT i.id, 'Nursing Duty Policy', 'v1.0', current_date, '{"maxHoursPerDay":12,"maxHoursPerWeek":48,"minRestHoursBetweenShifts":11,"maxConsecutiveWorkDays":6,"maxConsecutiveNights":3,"minDaysOffPerWeek":1,"maxNightsPerMonth":8,"weekendDutiesPerMonth":2,"overtimeAllowed":true,"maxOvertimeHoursPerMonth":16,"breakMinutesPerShift":30,"breakMustBeCovered":true,"leaveIsHardConstraint":true,"swapsRequireApproval":true,"emergencyOverrideAllowed":true,"restrictions":["Institutional policy values require local approval."],"shiftTypes":[{"code":"M","label":"Morning","start":"07:00","end":"14:00","hours":7,"kind":"working","countsAsDuty":true},{"code":"E","label":"Evening","start":"14:00","end":"21:00","hours":7,"kind":"working","countsAsDuty":true},{"code":"N","label":"Night","start":"21:00","end":"07:00","hours":10,"kind":"working","night":true,"countsAsDuty":true},{"code":"D","label":"Long day","start":"08:00","end":"20:00","hours":12,"kind":"working","countsAsDuty":true},{"code":"OC","label":"On call","start":"00:00","end":"00:00","hours":0,"kind":"oncall"},{"code":"OFF","label":"Off duty","start":"","end":"","hours":0,"kind":"off"},{"code":"WO","label":"Weekly off","start":"","end":"","hours":0,"kind":"off"},{"code":"AL","label":"Annual leave","start":"","end":"","hours":0,"kind":"leave"},{"code":"SL","label":"Sick leave","start":"","end":"","hours":0,"kind":"leave"}],"requirements":[]}'::jsonb
FROM public.institutions i
ON CONFLICT (institution_id, name, version) DO NOTHING;

INSERT INTO public.scheduling_shifts (institution_id, department_id, shift_date, shift_type, start_time, end_time, required_nurses, required_rn, required_skill_mix)
SELECT d.institution_id, d.id, gs::date, x.shift_type, x.start_time::time, x.end_time::time, x.required_nurses, x.required_rn, x.skill_mix::jsonb
FROM public.scheduling_departments d
CROSS JOIN generate_series(current_date, current_date + interval '29 days', interval '1 day') gs
CROSS JOIN (VALUES
  ('M','07:00','14:00',5,2,'{"senior":2}'::text),
  ('E','14:00','21:00',4,1,'{"senior":1}'::text),
  ('N','21:00','07:00',3,1,'{"senior":1,"night":true}'::text)
) AS x(shift_type,start_time,end_time,required_nurses,required_rn,skill_mix)
ON CONFLICT (department_id, shift_date, shift_type) DO NOTHING;

CREATE INDEX scheduling_staff_institution_idx ON public.scheduling_staff(institution_id, department);
CREATE INDEX scheduling_shifts_period_idx ON public.scheduling_shifts(institution_id, department_id, shift_date);
CREATE INDEX scheduling_runs_period_idx ON public.scheduling_runs(institution_id, department_id, roster_period_start, roster_period_end);
CREATE INDEX scheduling_conflicts_run_idx ON public.scheduling_conflicts(run_id, severity);
CREATE INDEX scheduling_requests_staff_idx ON public.scheduling_requests(institution_id, staff_id, status);