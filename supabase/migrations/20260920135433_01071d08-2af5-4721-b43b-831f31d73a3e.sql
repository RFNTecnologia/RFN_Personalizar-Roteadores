ALTER TABLE public.customers ADD COLUMN legacy_id TEXT;
ALTER TABLE public.equipment_profiles ADD COLUMN legacy_id TEXT;
ALTER TABLE public.equipment ADD COLUMN legacy_id TEXT;
ALTER TABLE public.work_orders ADD COLUMN legacy_id TEXT, ADD COLUMN title TEXT;
ALTER TABLE public.provider_settings ADD COLUMN favicon_url TEXT;

CREATE UNIQUE INDEX customers_user_legacy_idx ON public.customers(user_id, legacy_id) WHERE legacy_id IS NOT NULL;
CREATE UNIQUE INDEX equipment_profiles_user_legacy_idx ON public.equipment_profiles(user_id, legacy_id) WHERE legacy_id IS NOT NULL;
CREATE UNIQUE INDEX equipment_user_legacy_idx ON public.equipment(user_id, legacy_id) WHERE legacy_id IS NOT NULL;
CREATE UNIQUE INDEX work_orders_user_legacy_idx ON public.work_orders(user_id, legacy_id) WHERE legacy_id IS NOT NULL;

CREATE TABLE public.evidences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  legacy_id TEXT,
  work_order_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evidences TO authenticated;
GRANT ALL ON public.evidences TO service_role;
ALTER TABLE public.evidences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own evidences" ON public.evidences FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE UNIQUE INDEX evidences_user_legacy_idx ON public.evidences(user_id, legacy_id) WHERE legacy_id IS NOT NULL;
CREATE INDEX evidences_work_order_idx ON public.evidences(work_order_id);
CREATE TRIGGER update_evidences_updated_at BEFORE UPDATE ON public.evidences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();