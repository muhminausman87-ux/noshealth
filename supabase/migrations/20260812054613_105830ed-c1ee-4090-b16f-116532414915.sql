-- ============ FROMEX Phase 2: acuity -> workload -> capacity -> priority ============

-- 1. PATIENT ACUITY -----------------------------------------------------------
CREATE TABLE public.patient_acuity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  department dept_code,
  mews_current integer,
  mews_previous integer,
  mews_recorded_at timestamptz NOT NULL DEFAULT now(),
  mews_previous_at timestamptz,
  acuity_level text NOT NULL DEFAULT 'low',
  complexity_indicators jsonb NOT NULL DEFAULT '[]'::jsonb,
  workload_factors jsonb NOT NULL DEFAULT '{}'::jsonb,
  workload_score numeric NOT NULL DEFAULT 0,
  workload_level text NOT NULL DEFAULT 'low',
  computation_source text NOT NULL DEFAULT 'prototype',
  recorded_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (patient_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_acuity TO authenticated;
GRANT ALL ON public.patient_acuity TO service_role;
ALTER TABLE public.patient_acuity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acuity_select_same_institution" ON public.patient_acuity FOR SELECT TO authenticated
  USING (institution_id = private.user_institution(auth.uid()) AND private.can_access_patient(auth.uid(), patient_id));
CREATE POLICY "acuity_insert_clinician" ON public.patient_acuity FOR INSERT TO authenticated
  WITH CHECK (institution_id = private.user_institution(auth.uid()) AND private.can_access_patient(auth.uid(), patient_id));
CREATE POLICY "acuity_update_clinician" ON public.patient_acuity FOR UPDATE TO authenticated
  USING (institution_id = private.user_institution(auth.uid()) AND private.can_access_patient(auth.uid(), patient_id))
  WITH CHECK (institution_id = private.user_institution(auth.uid()));
CREATE TRIGGER patient_acuity_set_updated_at BEFORE UPDATE ON public.patient_acuity
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. ACUITY EVENTS (trend history) --------------------------------------------
CREATE TABLE public.acuity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  event_type text NOT NULL DEFAULT 'mews_change',
  from_score integer,
  to_score integer,
  note text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.acuity_events TO authenticated;
GRANT ALL ON public.acuity_events TO service_role;
ALTER TABLE public.acuity_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acuity_events_select" ON public.acuity_events FOR SELECT TO authenticated
  USING (institution_id = private.user_institution(auth.uid()) AND private.can_access_patient(auth.uid(), patient_id));
CREATE POLICY "acuity_events_insert" ON public.acuity_events FOR INSERT TO authenticated
  WITH CHECK (institution_id = private.user_institution(auth.uid()) AND private.can_access_patient(auth.uid(), patient_id));

-- 3. WORKFLOW TASKS ------------------------------------------------------------
CREATE TABLE public.workflow_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES auth.users(id),
  department dept_code,
  task_type text NOT NULL,
  label text NOT NULL,
  detail text,
  due_at timestamptz,
  time_sensitive boolean NOT NULL DEFAULT false,
  weight numeric NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'pending',
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workflow_tasks TO authenticated;
GRANT ALL ON public.workflow_tasks TO service_role;
ALTER TABLE public.workflow_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_select_same_institution" ON public.workflow_tasks FOR SELECT TO authenticated
  USING (institution_id = private.user_institution(auth.uid())
     AND (private.has_role(auth.uid(),'nurse') OR private.has_role(auth.uid(),'doctor') OR private.has_role(auth.uid(),'admin')));
CREATE POLICY "tasks_insert_clinician" ON public.workflow_tasks FOR INSERT TO authenticated
  WITH CHECK (institution_id = private.user_institution(auth.uid())
     AND (private.has_role(auth.uid(),'nurse') OR private.has_role(auth.uid(),'doctor') OR private.has_role(auth.uid(),'admin')));
CREATE POLICY "tasks_update_clinician" ON public.workflow_tasks FOR UPDATE TO authenticated
  USING (institution_id = private.user_institution(auth.uid())
     AND (private.has_role(auth.uid(),'nurse') OR private.has_role(auth.uid(),'doctor') OR private.has_role(auth.uid(),'admin')))
  WITH CHECK (institution_id = private.user_institution(auth.uid()));
CREATE TRIGGER workflow_tasks_set_updated_at BEFORE UPDATE ON public.workflow_tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. NURSING CAPACITY ----------------------------------------------------------
CREATE TABLE public.nursing_capacity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department dept_code NOT NULL,
  shift text NOT NULL DEFAULT 'day',
  shift_date date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  available_minutes integer NOT NULL DEFAULT 480,
  break_minutes integer NOT NULL DEFAULT 60,
  on_leave boolean NOT NULL DEFAULT false,
  competency_level text NOT NULL DEFAULT 'standard',
  responsibility_level text NOT NULL DEFAULT 'bedside_nurse',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_id, shift_date, shift)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nursing_capacity TO authenticated;
GRANT ALL ON public.nursing_capacity TO service_role;
ALTER TABLE public.nursing_capacity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "capacity_select_own_or_leader" ON public.nursing_capacity FOR SELECT TO authenticated
  USING (institution_id = private.user_institution(auth.uid())
     AND (employee_id = auth.uid()
       OR private.has_role(auth.uid(),'admin')
       OR private.has_responsibility(auth.uid(),'charge_nurse')
       OR private.has_responsibility(auth.uid(),'nursing_admin')));
CREATE POLICY "capacity_write_leader" ON public.nursing_capacity FOR ALL TO authenticated
  USING (institution_id = private.user_institution(auth.uid())
     AND (private.has_role(auth.uid(),'admin')
       OR private.has_responsibility(auth.uid(),'charge_nurse')
       OR private.has_responsibility(auth.uid(),'nursing_admin')))
  WITH CHECK (institution_id = private.user_institution(auth.uid())
     AND (private.has_role(auth.uid(),'admin')
       OR private.has_responsibility(auth.uid(),'charge_nurse')
       OR private.has_responsibility(auth.uid(),'nursing_admin')));
CREATE TRIGGER nursing_capacity_set_updated_at BEFORE UPDATE ON public.nursing_capacity
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. WORKLOAD MODEL CONFIG — reuses the Phase 1 institution policy engine -------
INSERT INTO public.institution_policies (institution_id, kind, code, title, summary, escalation_pathway, active)
SELECT i.id, 'workload_model', 'WLM-01', 'Prototype nursing workload model',
  'Transparent demo weights used to explain patient workload. Not a clinically validated score.',
  '{"weights":{"acuity":3,"medication":2,"monitoring":2,"isolation":1.5,"fall_risk":1,"procedure":2,"documentation":1,"admission_discharge":1.5,"assessment":1.5,"interventions":1.5},"thresholds":{"moderate":6,"high":11,"critical":16},"mews_thresholds":{"moderate":3,"high":5,"critical":7}}'::jsonb,
  true
FROM public.institutions i WHERE i.code = 'DEMO';

-- 6. DEMO DATA (fictional, demo institution only) --------------------------------
WITH inst AS (SELECT id FROM public.institutions WHERE code = 'DEMO'),
nurse AS (SELECT id FROM public.profiles WHERE full_name = 'Demo Nurse' LIMIT 1),
nurse2 AS (SELECT id FROM public.profiles WHERE full_name = 'RN A. Chen' LIMIT 1),
newpat AS (
  INSERT INTO public.patients (mrn, full_name, age, sex, dept, room, status, reason_for_admission, code_status, short_note, institution_id)
  SELECT v.mrn, v.name, v.age, v.sex, 'medical'::dept_code, v.room, v.status::patient_status, v.reason, 'Full code', v.note, inst.id
  FROM inst, (VALUES
    ('MRN-2301','Demo Patient 301A',68,'F','301A','critical','Community acquired pneumonia','Rising MEWS, IV antibiotics due'),
    ('MRN-2302','Demo Patient 302B',54,'M','302B','watch','Post-operative day 1','Medication due, lab result pending'),
    ('MRN-2303','Demo Patient 303A',77,'M','303A','watch','Heart failure exacerbation','Contact isolation, hourly monitoring'),
    ('MRN-2304','Demo Patient 304B',41,'F','304B','stable','Cellulitis','Simple dressing, routine observations'),
    ('MRN-2305','Demo Patient 305A',33,'M','305A','stable','Appendicectomy recovery','Discharge planned today, education pending')
  ) AS v(mrn,name,age,sex,room,status,reason,note)
  RETURNING id, room, institution_id
),
assign AS (
  INSERT INTO public.patient_assignments (institution_id, patient_id, employee_id, care_role, shift, active)
  SELECT np.institution_id, np.id,
         CASE WHEN np.room IN ('301A','302B','303A') THEN (SELECT id FROM nurse) ELSE (SELECT id FROM nurse2) END,
         'primary_nurse', 'day', true
  FROM newpat np
  RETURNING patient_id
),
acu AS (
  INSERT INTO public.patient_acuity (institution_id, patient_id, department, mews_current, mews_previous, mews_previous_at, acuity_level, complexity_indicators, workload_factors, workload_score, workload_level)
  SELECT np.institution_id, np.id, 'medical'::dept_code, d.cur, d.prev, now() - interval '30 minutes', d.level,
         d.indicators::jsonb, d.factors::jsonb, d.score, d.wl
  FROM newpat np JOIN (VALUES
    ('301A',7,4,'critical','["Sepsis pathway","Oxygen therapy"]','{"medication":3,"monitoring":3,"assessment":3,"isolation":0,"fall_risk":1,"procedure":1,"documentation":2,"admission_discharge":0,"interventions":3}',18,'critical'),
    ('302B',5,5,'high','["Post-operative"]','{"medication":2,"monitoring":2,"assessment":2,"isolation":0,"fall_risk":1,"procedure":1,"documentation":2,"admission_discharge":0,"interventions":2}',12,'high'),
    ('303A',4,5,'moderate','["Contact isolation"]','{"medication":2,"monitoring":3,"assessment":2,"isolation":3,"fall_risk":2,"procedure":0,"documentation":1,"admission_discharge":0,"interventions":1}',10,'moderate'),
    ('304B',1,1,'low','[]','{"medication":1,"monitoring":1,"assessment":1,"isolation":0,"fall_risk":0,"procedure":1,"documentation":1,"admission_discharge":0,"interventions":0}',4,'low'),
    ('305A',2,2,'low','["Discharge planning"]','{"medication":1,"monitoring":1,"assessment":1,"isolation":0,"fall_risk":0,"procedure":0,"documentation":2,"admission_discharge":3,"interventions":0}',7,'moderate')
  ) AS d(room,cur,prev,level,indicators,factors,score,wl) ON d.room = np.room
  RETURNING patient_id
),
ev AS (
  INSERT INTO public.acuity_events (institution_id, patient_id, event_type, from_score, to_score, note, occurred_at)
  SELECT np.institution_id, np.id, 'mews_change', e.f, e.t, e.note, now() - interval '30 minutes'
  FROM newpat np JOIN (VALUES
    ('301A',4,7,'MEWS increasing over the last 30 minutes'),
    ('303A',5,4,'MEWS improving after diuretic')
  ) AS e(room,f,t,note) ON e.room = np.room
  RETURNING id
)
INSERT INTO public.workflow_tasks (institution_id, patient_id, assigned_to, department, task_type, label, detail, due_at, time_sensitive, weight, status)
SELECT np.institution_id, np.id,
       CASE WHEN np.room IN ('301A','302B','303A') THEN (SELECT id FROM nurse) ELSE (SELECT id FROM nurse2) END,
       'medical'::dept_code, t.ttype, t.label, t.detail, now() + (t.mins || ' minutes')::interval, t.ts, t.w, t.status
FROM newpat np JOIN (VALUES
  ('301A','reassessment','Reassessment due','MEWS increased 4 → 7', -15, true, 3, 'overdue'),
  ('301A','medication','IV antibiotic overdue','Ceftriaxone IV', -25, true, 3, 'overdue'),
  ('302B','medication','Medication due','Analgesia oral', 10, true, 2, 'pending'),
  ('302B','documentation','Documentation','Post-op note', 90, false, 1, 'pending'),
  ('303A','assessment','Wound assessment','Dressing review', 45, false, 2, 'pending'),
  ('303A','medication','IV medication','Furosemide IV', 75, true, 2, 'pending'),
  ('304B','assessment','Routine observations','4-hourly vitals', 120, false, 1, 'pending'),
  ('305A','education','Discharge education','Wound care and follow-up', 60, false, 2, 'pending'),
  ('305A','discharge','Discharge paperwork','Planned today', 180, false, 2, 'pending')
) AS t(room,ttype,label,detail,mins,ts,w,status) ON t.room = np.room;

-- Nurse capacity for the demo shift
INSERT INTO public.nursing_capacity (institution_id, employee_id, department, shift, available_minutes, break_minutes, competency_level, responsibility_level, notes)
SELECT i.id, p.id, 'medical'::dept_code, 'day', 480, 60, c.comp, 'bedside_nurse', c.note
FROM public.institutions i
JOIN (VALUES ('Demo Nurse','senior','Carrying three higher-acuity patients'), ('RN A. Chen','standard','Two lower-acuity patients')) AS c(name,comp,note) ON true
JOIN public.profiles p ON p.full_name = c.name AND p.institution_id = i.id
WHERE i.code = 'DEMO'
ON CONFLICT (employee_id, shift_date, shift) DO NOTHING;