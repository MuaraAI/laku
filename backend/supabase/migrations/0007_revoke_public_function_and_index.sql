-- Migration 0007 — Revoke PUBLIC on current_seller_ids & index order_lines(sales_channel)
BEGIN;

REVOKE EXECUTE ON FUNCTION public.current_seller_ids() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_seller_ids() TO authenticated, service_role;

CREATE INDEX IF NOT EXISTS idx_order_lines_channel ON public.order_lines(sales_channel);

COMMIT;
