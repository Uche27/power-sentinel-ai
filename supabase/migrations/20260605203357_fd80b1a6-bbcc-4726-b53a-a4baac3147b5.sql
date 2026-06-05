CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT USAGE ON SCHEMA private TO service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

REVOKE EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO service_role;

ALTER POLICY "Admins view all profiles" ON public.profiles
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));
ALTER POLICY "Admins view all roles" ON public.user_roles
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));
ALTER POLICY "Admins manage roles" ON public.user_roles
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
ALTER POLICY "Admins manage datasets" ON public.datasets
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
ALTER POLICY "Admins view dataset rows" ON public.dataset_rows
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
ALTER POLICY "Admins manage models" ON public.trained_models
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
ALTER POLICY "Admins view all reports" ON public.suspicious_reports
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));
ALTER POLICY "Admins update reports" ON public.suspicious_reports
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
ALTER POLICY "Admins view inspections" ON public.field_inspections
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));
ALTER POLICY "Admins manage generated reports" ON public.generated_reports
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
ALTER POLICY "Admins read datasets bucket" ON storage.objects
  USING (bucket_id = 'datasets' AND private.has_role(auth.uid(), 'admin'::public.app_role));
ALTER POLICY "Admins upload datasets bucket" ON storage.objects
  WITH CHECK (bucket_id = 'datasets' AND private.has_role(auth.uid(), 'admin'::public.app_role));
ALTER POLICY "Admins delete datasets bucket" ON storage.objects
  USING (bucket_id = 'datasets' AND private.has_role(auth.uid(), 'admin'::public.app_role));

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;