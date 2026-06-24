CREATE TABLE public.nursing_notes (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    author_id uuid REFERENCES auth.users(id),
    note_type text NOT NULL,
    body text NOT NULL,
    recorded_at timestamp with time zone NOT NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.nursing_notes TO authenticated;
GRANT ALL ON public.nursing_notes TO service_role;

ALTER TABLE public.nursing_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view nursing_notes"
    ON public.nursing_notes
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Clinicians can insert nursing_notes"
    ON public.nursing_notes
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.has_role(auth.uid(), 'admin'::public.app_role)
        OR public.has_role(auth.uid(), 'doctor'::public.app_role)
        OR public.has_role(auth.uid(), 'nurse'::public.app_role)
    );

CREATE POLICY "Clinicians can update nursing_notes"
    ON public.nursing_notes
    FOR UPDATE
    TO authenticated
    USING (
        public.has_role(auth.uid(), 'admin'::public.app_role)
        OR public.has_role(auth.uid(), 'doctor'::public.app_role)
        OR public.has_role(auth.uid(), 'nurse'::public.app_role)
    )
    WITH CHECK (
        public.has_role(auth.uid(), 'admin'::public.app_role)
        OR public.has_role(auth.uid(), 'doctor'::public.app_role)
        OR public.has_role(auth.uid(), 'nurse'::public.app_role)
    );

CREATE POLICY "Admins can delete nursing_notes"
    ON public.nursing_notes
    FOR DELETE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER update_nursing_notes_updated_at
    BEFORE UPDATE ON public.nursing_notes
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();