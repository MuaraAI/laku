-- Migration 0006 — Supabase Security & Performance Advisors Fix
-- 1. Security: Revoke execute anon/public pada internal functions (rls_auto_enable, current_seller_ids)
-- 2. Performance: RLS initPlan optimization (auth.uid() -> (SELECT auth.uid()))
-- 3. Performance: Covering indexes untuk foreign keys & RLS lookup helper

BEGIN;

-- 1. Revoke direct RPC execution pada internal functions
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.current_seller_ids() FROM anon;

-- 2. RLS initPlan (wrap auth.uid() in scalar subquery agar di-evaluate 1x per query, bukan per baris)
ALTER POLICY member_self ON public.seller_members
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

ALTER POLICY consents_self ON public.consents
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

ALTER POLICY ai_chat_self ON public.ai_chat_messages
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

ALTER POLICY ai_memories_self ON public.ai_memories
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- 3. Covering indexes untuk foreign keys & RLS subquery
CREATE INDEX IF NOT EXISTS idx_seller_members_user ON public.seller_members(user_id);
CREATE INDEX IF NOT EXISTS idx_order_lines_product ON public.order_lines(product_link_id);
CREATE INDEX IF NOT EXISTS idx_import_batches_channel ON public.import_batches(channel);
CREATE INDEX IF NOT EXISTS idx_product_links_channel ON public.product_links(channel);
CREATE INDEX IF NOT EXISTS idx_stock_movements_by_user ON public.stock_movements(by_user);
CREATE INDEX IF NOT EXISTS idx_consents_user ON public.consents(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_memories_user ON public.ai_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON public.audit_log(actor);

COMMIT;
