
-- Roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'utility_staff');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Auto-create profile + default role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _role app_role;
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'phone'
  );
  _role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'utility_staff');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Datasets
CREATE TABLE public.datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  file_path TEXT,
  rows_count INT NOT NULL DEFAULT 0,
  columns_count INT NOT NULL DEFAULT 0,
  size_bytes BIGINT NOT NULL DEFAULT 0,
  columns JSONB NOT NULL DEFAULT '[]'::jsonb,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;

-- Dataset preview rows
CREATE TABLE public.dataset_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES public.datasets(id) ON DELETE CASCADE,
  row_index INT NOT NULL,
  data JSONB NOT NULL
);
ALTER TABLE public.dataset_rows ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_dataset_rows_dataset ON public.dataset_rows(dataset_id, row_index);

-- Trained models
CREATE TABLE public.trained_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  algorithm TEXT NOT NULL,
  dataset_id UUID REFERENCES public.datasets(id) ON DELETE SET NULL,
  accuracy NUMERIC NOT NULL,
  precision NUMERIC NOT NULL,
  recall NUMERIC NOT NULL,
  f1 NUMERIC NOT NULL,
  training_time TEXT,
  params JSONB NOT NULL DEFAULT '{}'::jsonb,
  curve JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.trained_models ENABLE ROW LEVEL SECURITY;

-- Suspicious activity reports (filed by utility staff or admin)
CREATE TABLE public.suspicious_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  meter_no TEXT NOT NULL,
  location TEXT NOT NULL,
  disco TEXT,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  reported_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.suspicious_reports ENABLE ROW LEVEL SECURITY;

-- Field inspections
CREATE TABLE public.field_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.suspicious_reports(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  meter_no TEXT NOT NULL,
  location TEXT NOT NULL,
  findings TEXT NOT NULL,
  action_taken TEXT NOT NULL,
  outcome TEXT NOT NULL DEFAULT 'pending',
  inspector_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.field_inspections ENABLE ROW LEVEL SECURITY;

-- Generated reports metadata
CREATE TABLE public.generated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  report_type TEXT NOT NULL,
  format TEXT NOT NULL,
  size_bytes BIGINT NOT NULL DEFAULT 0,
  generated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;

-- ============ RLS POLICIES ============
-- profiles
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- user_roles
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- datasets (admin only)
CREATE POLICY "Admins manage datasets" ON public.datasets FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins view dataset rows" ON public.dataset_rows FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- trained_models (admin only)
CREATE POLICY "Admins manage models" ON public.trained_models FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- suspicious_reports
CREATE POLICY "Staff view own reports" ON public.suspicious_reports FOR SELECT USING (auth.uid() = reported_by);
CREATE POLICY "Admins view all reports" ON public.suspicious_reports FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated insert reports" ON public.suspicious_reports FOR INSERT WITH CHECK (auth.uid() = reported_by);
CREATE POLICY "Admins update reports" ON public.suspicious_reports FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- field_inspections
CREATE POLICY "Inspector views own" ON public.field_inspections FOR SELECT USING (auth.uid() = inspector_id);
CREATE POLICY "Admins view inspections" ON public.field_inspections FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated insert inspections" ON public.field_inspections FOR INSERT WITH CHECK (auth.uid() = inspector_id);

-- generated_reports (admin only)
CREATE POLICY "Admins manage generated reports" ON public.generated_reports FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('datasets', 'datasets', false);

CREATE POLICY "Admins read datasets bucket" ON storage.objects FOR SELECT
  USING (bucket_id = 'datasets' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins upload datasets bucket" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'datasets' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete datasets bucket" ON storage.objects FOR DELETE
  USING (bucket_id = 'datasets' AND public.has_role(auth.uid(), 'admin'));
