# Panduan Kontribusi (Contributing Guide)

Terima kasih atas ketertarikan Anda untuk berkontribusi pada proyek **Laku**!

Proyek ini dibangun dan dikembangkan oleh komunitas mahasiswa **MuaraAI** (Universitas Bina Sarana Informatika Pontianak) sebagai inisiatif riset dan inovasi digital untuk membantu seller UMKM multi-marketplace di Indonesia.

---

## ❤️ Prinsip & Ekspektasi Kontribusi

Sebelum Anda memutuskan untuk berkontribusi, harap dipahami bahwa:

* **Inisiatif Komunitas Sukarela**: Proyek ini bersifat nirlaba (*open source*). Kontribusi Anda **tidak memberikan kompensasi finansial, imbalan materi, atau hak royalti apa pun**.
* **Apresiasi & Rasa Bangga**: Kami sangat senang, berterima kasih, dan bangga kepada siapa pun yang mau meluangkan waktu, tenaga, dan keahliannya untuk berkontribusi bersama kami memajukan teknologi UMKM lokal.
* **Pengakuan Publik**: Setiap kontribusi yang diterima (di-merge) akan diakui secara terbuka di riwayat Git dan dicantumkan pada daftar kontributor repositori ini.

---

## 📋 Aturan Mengikat (Strict Invariants)

Demi menjaga keamanan, privasi data seller, dan integritas sistem, semua kontribusi wajib mematuhi aturan berikut:

1. **Zero PII At Rest (UU PDP No. 27/2022)**:
   - Dilarang keras menambahkan kode yang menyimpan nama pembeli, nomor telepon (`08xx`), atau alamat jalan mentah.
   - Jangan pernah melakukan commit file fixture pengujian yang memuat data pembeli nyata.
2. **Zero Hardcoded Secrets**:
   - Dilarang keras meng-hardcode API keys, service tokens, password, atau credential URL di dalam kode, skrip, maupun file konfigurasi CI.
   - Semua nilai konfigurasi sensitif harus dimuat melalui variabel lingkungan `.env`.
3. **Engine Deterministik**:
   - Angka stok, Reorder Point (ROP), Safety Stock (SS), dan omzet dihitung murni menggunakan formula matematika PRD §9A dan §9D. Dilarang mengganti perhitungan deterministik dengan tebakan atau generasi teks AI.
4. **Disiplin Desain (Frontend)**:
   - Komponen wajib mengonsumsi token semantik dari `app/theme.css` (`var(--token)`), bukan kode hex mentah.
   - Angka finansial dan kuantitas wajib menggunakan font `JetBrains Mono` dengan `tabular-nums` dan rata kanan.

---

## 🛠️ Alur Kerja Kontribusi (Workflow)

### 1. Buat Branch Baru
Jangan pernah melakukan commit langsung ke branch `main`. Buat branch baru dari `main` dengan format:
```bash
git checkout -b feat/nama-fitur     # untuk penambahan fitur
# atau
git checkout -b fix/nama-perbaikan   # untuk perbaikan bug
# atau
git docs/nama-dokumen               # untuk perbaikan dokumentasi
```

### 2. Format Pesan Commit (Conventional Commits)
Gunakan format pesan commit konvensional:
* `feat:` untuk penambahan fitur baru
* `fix:` untuk perbaikan bug
* `docs:` untuk dokumentasi
* `test:` untuk penambahan atau pembaruan test suite
* `chore:` untuk pemeliharaan dependensi / skrip

### 3. Jalankan Pengujian Lokal (Wajib Lulus)
Sebelum membuka Pull Request, pastikan seluruh pengujian lokal lulus tanpa error:

```bash
# Pengujian Backend (FastAPI)
cd backend
source .venv/bin/activate
pytest tests/ -v

# Pengujian & Build Frontend (Next.js)
cd ..
npm run lint
npm run build
```

PR yang gagal pada tahap pengujian atau linting tidak akan di-merge.

### 4. Buka Pull Request (PR)
* Buka PR ke branch `main` repositori `MuaraAI/laku`.
* Berikan judul dan deskripsi yang jelas: apa yang diubah, mengapa perubahan tersebut dibutuhkan, dan bukti pengujian lokal.
* Tim maintainer akan meninjau (*code review*) PR Anda secepatnya.

---

## 🤝 Kode Etik

Dengan berpartisipasi dalam proyek ini, Anda setuju untuk mematuhi [Kode Etik (CODE_OF_CONDUCT.md)](CODE_OF_CONDUCT.md). Kami mengutamakan komunikasi yang saling menghargai, ramah, dan profesional.

---

## 📬 Pertanyaan & Diskusi

Jika Anda memiliki pertanyaan seputar arsitektur proyek, ide fitur baru, atau ingin berdiskusi teknis, silakan:
* Buka [GitHub Discussions](https://github.com/MuaraAI/laku/discussions) atau Issue.
* Hubungi kami via email resmi: [support@laku.muaraai.com](mailto:support@laku.muaraai.com).

*Sekali lagi, terima kasih telah menjadi bagian dari perjalanan MuaraAI dan Laku!* 🚀
