-- ============================================================================
-- Migration 0010: Auto-provision seller workspace on new user signup
--
-- Saat user baru mendaftar (Google OAuth / Email Magic Link), otomatis:
-- 1. Buat record seller baru di public.sellers dengan default settings Laku.
-- 2. Daftarkan user sebagai 'owner' di public.seller_members.
-- Mencegah HTTP 403 No seller membership pada user yang baru login.
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
  RETURNING id INTO v_seller_id;

  INSERT INTO public.seller_members (seller_id, user_id, role)
  VALUES (v_seller_id, new.id, 'owner');

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, public;
