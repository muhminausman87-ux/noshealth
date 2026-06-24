
DO $$ BEGIN
  CREATE TYPE public.patient_status AS ENUM ('stable','watch','critical');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mrn text NOT NULL UNIQUE,
  full_name text NOT NULL,
  age int NOT NULL CHECK (age >= 0 AND age <= 150),
  sex text NOT NULL CHECK (sex IN ('M','F','O')),
  dept public.dept_code NOT NULL,
  room text,
  status public.patient_status NOT NULL DEFAULT 'stable',
  admitted_on timestamptz NOT NULL DEFAULT now(),
  discharged_on timestamptz,
  reason_for_admission text NOT NULL,
  history_summary text,
  code_status text NOT NULL DEFAULT 'Full Code',
  short_note text,
  attending_doctor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  primary_nurse_id    uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by          uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX patients_dept_idx        ON public.patients (dept);
CREATE INDEX patients_status_idx      ON public.patients (status);
CREATE INDEX patients_admitted_on_idx ON public.patients (admitted_on DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO authenticated;
GRANT ALL ON public.patients TO service_role;

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view patients"
  ON public.patients FOR SELECT TO authenticated USING (true);

CREATE POLICY "Clinicians can insert patients"
  ON public.patients FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'nurse')
  );

CREATE POLICY "Clinicians can update patients"
  ON public.patients FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'nurse')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'nurse')
  );

CREATE POLICY "Admins can delete patients"
  ON public.patients FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER patients_set_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
