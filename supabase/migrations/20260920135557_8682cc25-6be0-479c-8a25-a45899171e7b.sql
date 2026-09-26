DROP INDEX public.customers_user_legacy_idx;
DROP INDEX public.equipment_profiles_user_legacy_idx;
DROP INDEX public.equipment_user_legacy_idx;
DROP INDEX public.work_orders_user_legacy_idx;
DROP INDEX public.evidences_user_legacy_idx;

CREATE UNIQUE INDEX customers_user_legacy_idx ON public.customers(user_id, legacy_id);
CREATE UNIQUE INDEX equipment_profiles_user_legacy_idx ON public.equipment_profiles(user_id, legacy_id);
CREATE UNIQUE INDEX equipment_user_legacy_idx ON public.equipment(user_id, legacy_id);
CREATE UNIQUE INDEX work_orders_user_legacy_idx ON public.work_orders(user_id, legacy_id);
CREATE UNIQUE INDEX evidences_user_legacy_idx ON public.evidences(user_id, legacy_id);