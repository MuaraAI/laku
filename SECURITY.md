# Kebijakan Keamanan (Security Policy)

Proyek **Laku** berkomitmen untuk melindungi data pengguna dan mematuhi standar privasi data serta hukum yang berlaku, khususnya **Undang-Undang Pelindungan Data Pribadi (UU PDP No. 27/2022)** Republik Indonesia.

---

## 🛡️ Versi yang Didukung

Pembaruan keamanan aktif hanya diberikan untuk versi produksi resmi pada branch `main`:

| Versi | Status Dukungan |
| :--- | :--- |
| `main` / `v1.x` | :white_check_mark: Didukung aktif (patch keamanan berkala) |
| `< 1.0` (draft/alpha) | :x: Tidak didukung |

---

## 🔒 Prinsip & Arsitektur Keamanan Laku

Laku dibangun dengan pendekatan pertahanan berlapis (*defense-in-depth*):

1. **Zero PII At Rest (Kepatuhan UU PDP)**:
   - Data identitas pembeli marketplace (nama lengkap, nomor HP `08xx`, dan alamat jalan mentah) **dibuang di memori saat file diparsing**.
   - Sistem tidak pernah menyimpan file ekspor mentah maupun PII pembeli ke dalam database Postgres, tabel sementara, storage, log aplikasi, atau laporan error.
2. **Isolasi Tenant & Row Level Security (RLS)**:
   - Setiap tabel database (16 tabel) memaksakan kebijakan RLS PostgreSQL dengan isolasi berbasis `seller_id`.
   - Pengguna dengan role Operator Gudang dibatasi dari akses data finansial/rekap omzet (`require_owner`).
3. **Autentikasi & Token Pinned**:
   - Autentikasi berbasis Supabase Auth dengan verifikasi kriptografi RS256 JWKS pinned.
   - Pintu masuk fleksibel menggunakan Google OAuth 2.0 dan Email Magic Link / OTP via SMTP Resend terenkripsi (`smtp.resend.com:465`).
4. **Perlindungan Terhadap DoS & Injeksi**:
   - Batas ukuran upload ketat: $\le 10\text{ MB}$ dan $\le 20.000$ baris per file dengan *early-abort* row counter.
   - Sanitasi otomatis terhadap CSV/Excel Formula Injection (`=CMD`, `+`, `-`, `@`, `|`, `%`).
   - Rate limiting in-memory berbasis token bucket di lapisan middleware FastAPI (120 req/menit untuk baca, 10 req/menit untuk mutasi).
5. **Kebijakan Rahasia & Kredensial**:
   - Seluruh kunci API, service role key, dan kredensial database dimuat melalui variabel lingkungan `.env` (terdaftar di `.gitignore`).
   - Tidak ada kredensial yang di-hardcode ke dalam kode sumber, repositori git, maupun image container.

---

## 🚨 Pelaporan Kerentanan (Reporting a Vulnerability)

Jika Anda menemukan celah keamanan atau potensi kerentanan di repositori, API, atau situs live Laku, **mohon untuk TIDAK membuka publik Issue di GitHub**.

Silakan laporkan temuan Anda secara privat dan bertanggung jawab (*Responsible Disclosure*) melalui:

* **Email Resmi Keamanan**: [support@laku.muaraai.com](mailto:support@laku.muaraai.com)
* **Subjek Email**: `[SECURITY] Laporan Kerentanan: <Deskripsi Singkat>`

### Informasi yang Dibutuhkan dalam Laporan:
- Ringkasan potensi dampak dan severity (Critical, High, Medium, Low).
- Langkah-langkah reproduksi yang jelas (*Proof of Concept* / skrip / curl command).
- Komponen atau endpoint yang terdampak (`laku.muaraai.com` atau `api.muaraai.com`).
- Saran mitigasi atau perbaikan (jika ada).

---

## ⏱️ Komitmen & SLA Tim

- **Konfirmasi Awal**: Tim MuaraAI akan mengonfirmasi penerimaan laporan dalam kurun waktu **24–48 jam kerja**.
- **Triage & Analisis**: Evaluasi teknis dan reproduksi kerentanan dilakukan dalam waktu maksimal **3 hari**.
- **Penerbitan Patch**: Jika kerentanan terkonfirmasi valid, perbaikan akan segera di-deploy ke lingkungan produksi dan dicatat dalam changelog tanpa membocorkan identitas data sebelum mitigasi tuntas.

Kami sangat menghargai kerja sama komunitas peneliti keamanan dan praktisi open source dalam menjaga keamanan ekosistem Laku.
