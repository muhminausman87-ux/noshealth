CREATE TABLE public.vitals (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    heart_rate integer,
    systolic_bp integer,
    diastolic_bp integer,
    respiratory_rate integer,
    spo2 integer,
    temperature numeric(4,1),
    recorded_at timestamp with time zone NOT NULL DEFAULT now(),
    recorded_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.vitals TO authenticated;
GRANT ALL ON public.vitals TO service_role;

ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view vitals"
ON public.vitals FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Clinicians can insert vitals"
ON public.vitals FOR INSERT
TO authenticated
WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'doctor'::app_role) OR
    has_role(auth.uid(), 'nurse'::app_role)
);

CREATE POLICY "Clinicians can update vitals"
ON public.vitals FOR UPDATE
TO authenticated
USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'doctor'::app_role) OR
    has_role(auth.uid(), 'nurse'::app_role)
)
WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'doctor'::app_role) OR
    has_role(auth.uid(), 'nurse'::app_role)
);

CREATE POLICY "Admins can delete vitals"
ON public.vitals FOR DELETE
TO authenticated
USING (
    has_role(auth.uid(), 'admin'::app_role)
);

CREATE TRIGGER update_vitals_updated_at
BEFORE UPDATE ON public.vitals
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();