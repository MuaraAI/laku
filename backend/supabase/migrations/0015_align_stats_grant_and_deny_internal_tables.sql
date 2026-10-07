-- ============================================================================
-- Migration 0015: selaraskan grant get_platform_stats + deny eksplisit tabel
-- internal terhadap anon
--
-- Latar (pentest internal 7 Okt 2026, temuan B3 & B4):
-- 1. Migration 0008 memberi GRANT EXECUTE get_platform_stats() ke anon,
--    migration 0009 mencabutnya lagi — konfigurasi bertentangan. Di database
--    yang sudah jalan, grant 0008 masih aktif: RPC bisa dipanggil tanpa login
--    dan mengembalikan angka bisnis agregat (total seller, order, urgency).
--    Keputusan: endpoint publik /stats mengambil data via SERVICE key
--    (stats.py), jadi grant anon tidak diperlukan → dicabut permanen.
-- 2. seller_members / audit_log / consents tidak punya policy untuk anon —
--    di PostgREST hasilnya 200 [] (kosong) HARI INI hanya karena belum ada
--    data. Begitu tabel terisi, isinya terbaca siapa pun lewat REST langsung.
--    audit_log sifatnya lintas-seller. → deny eksplisit sejak sekarang;
--    consents tetap bisa dibaca pemiliknya (user_id = auth.uid()).
-- ============================================================================

-- (1) selaraskan grant RPC stats: hanya authenticated + service_role
REVOKE EXECUTE ON FUNCTION get_platform_stats() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION get_platform_stats() TO authenticated, service_role;

-- (2) audit_log: service-only (tanpa policy SELECT = deny utk anon+authenticated)
DROP POLICY IF EXISTS audit_log_read ON audit_log;

-- (3) seller_members: user lihat membership-nya sendiri saja (anon = kosong)
DROP POLICY IF EXISTS member_self ON seller_members;
CREATE POLICY member_self ON seller_members FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- (4) consents: milik user masing-masing (anon = kosong)
DROP POLICY IF EXISTS consents_self ON consents;
CREATE POLICY consents_self ON consents FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
