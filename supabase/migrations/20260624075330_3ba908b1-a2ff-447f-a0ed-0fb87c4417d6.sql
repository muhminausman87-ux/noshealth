CREATE TABLE public.gcs_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  eye_score integer,
  verbal_score integer,
  motor_score integer,
  total_score integer,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  recorded_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.gcs_scores TO authenticated;
GRANT ALL ON public.gcs_scores TO service_role;

ALTER TABLE public.gcs_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view gcs_scores"
  ON public.gcs_scores
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Clinicians can insert gcs_scores"
  ON public.gcs_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'doctor'::public.app_role) OR
    public.has_role(auth.uid(), 'nurse'::public.app_role)
  );

CREATE POLICY "Clinicians can update gcs_scores"
  ON public.gcs_scores
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'doctor'::public.app_role) OR
    public.has_role(auth.uid(), 'nurse'::public.app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'doctor'::public.app_role) OR
    public.has_role(auth.uid(), 'nurse'::public.app_role)
  );

CREATE POLICY "Admins can delete gcs_scores"
  ON public.gcs_scores
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER update_gcs_scores_updated_at
  BEFORE UPDATE ON public.gcs_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();