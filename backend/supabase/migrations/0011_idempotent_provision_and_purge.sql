-- ============================================================================
-- Migration 0011: Idempotent handle_new_user and purge_expired_staging RPC
--
-- 1. handle_new_user: ON CONFLICT (email) DO UPDATE agar re-signup dengan email
--    sama tidak bricking karena duplicate key violation.
-- 2. purge_expired_staging: RPC untuk membersihkan baris staging batch preview > 24 jam (ADR-2).
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seller_id uuid;
  v_name text;
BEGIN
  v_name := COALESCE('Toko ' || split_part(new.email, '@', 1), 'Toko Saya');

  INSERT INTO public.sellers (name, email, plan, timezone, service_level, lead_time_days, cycle_days, review_days, overstock_days)
  VALUES (v_name, new.email, 'free', 'Asia/Jakarta', 0.95, 5, 14, 7, 60)
  ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_seller_id;

  INSERT INTO public.seller_members (seller_id, user_id, role)
  VALUES (v_seller_id, new.id, 'owner')
  ON CONFLICT (seller_id, user_id) DO NOTHING;

  RETURN new;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;

CREATE OR REPLACE FUNCTION public.purge_expired_staging(p_hours int DEFAULT 24)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n int;
BEGIN
  DELETE FROM import_staging s
  USING import_batches b
  WHERE s.batch_id = b.id
    AND b.status = 'preview'
    AND b.created_at < now() - make_interval(hours => p_hours);
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.purge_expired_staging(int) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.purge_expired_staging(int) TO service_role;
