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

## 🚀 Tutorial Langkah-demi-Langkah (Step-by-Step Workflow)

Berikut alur lengkap berkontribusi mulai dari melakukan fork hingga Pull Request diterima:

### Langkah 1: Fork Repositori
1. Buka repositori resmi Laku di GitHub: [https://github.com/MuaraAI/laku](https://github.com/MuaraAI/laku).
2. Klik tombol **Fork** di pojok kanan atas halaman untuk menduplikasi repositori ke akun GitHub pribadi Anda.

### Langkah 2: Clone ke Komputer Lokal
Salin (*clone*) repositori hasil fork Anda ke laptop/komputer lokal:

```bash
# Ganti <username-anda> dengan username akun GitHub Anda
git clone https://github.com/<username-anda>/laku.git
cd laku
```

### Langkah 3: Konfigurasi Upstream Remote
Hubungkan repositori lokal Anda ke repositori utama (`upstream`) agar Anda selalu bisa menarik pembaruan terbaru:

```bash
git remote add upstream https://github.com/MuaraAI/laku.git
git fetch upstream
```

### Langkah 4: Buat Branch Baru
Selalu buat branch baru dari `upstream/main` untuk setiap fitur atau perbaikan bug (jangan bekerja langsung di branch `main`):

```bash
# Pastikan branch lokal sinkron dengan upstream terbaru
git checkout main
git pull upstream main

# Buat branch baru
git checkout -b feat/nama-fitur-baru       # Untuk penambahan fitur baru
# atau
git checkout -b fix/perbaikan-bug-anda     # Untuk perbaikan bug
# atau
git checkout -b docs/pembaruan-panduan     # Untuk pembaruan dokumentasi
```

### Langkah 5: Tulis Kode & Jalankan Pengujian Lokal
Tuliskan kode perbaikan atau fitur Anda. Sebelum melakukan commit, **wajib menjalankan pengujian lokal** dan memastikan semuanya lulus 100%:

```bash
# 1. Jalankan pengujian Backend (FastAPI - 139 tests)
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pytest tests/ -v

# 2. Jalankan pengujian & build Frontend (Next.js)
cd ..
npm install
npm run lint
npm run build
```

> **Catatan**: Pull Request yang mengalami kegagalan pada saat build atau test suite merah tidak akan di-merge oleh tim maintainer.

### Langkah 6: Commit Perubahan (Conventional Commits)
Gunakan format pesan commit terstandarisasi:

```bash
git add <file-yang-diubah>
git commit -m "feat(scope): deskripsi singkat perubahan Anda"
```

Contoh format:
* `feat(parser): tambah pemetaan kolom ekspor lazada`
* `fix(engine): perbaiki pembagian nol pada lead time dinamis`
* `docs(readme): tambahkan panduan setup docker lokal`
* `style(dashboard): perbaiki kontras badge status di mode terang`

### Langkah 7: Push ke Fork & Buka Pull Request (PR)
Kirimkan commit Anda ke repositori fork Anda di GitHub:

```bash
git push -u origin feat/nama-fitur-baru
```

Setelah branch ter-push:
1. Buka kembali halaman repositori fork Anda di GitHub atau repositori utama [MuaraAI/laku](https://github.com/MuaraAI/laku).
2. Anda akan melihat banner **"Compare & pull request"**. Klik tombol tersebut.
3. Pastikan base branch adalah `MuaraAI/laku` branch `main`, dan compare branch adalah branch fitur Anda.
4. Tuliskan deskripsi ringkas:
   - Apa yang diubah?
   - Mengapa perubahan ini diperlukan?
   - Bukti tangkapan layar / bukti test passed lokal.
5. Klik **Create Pull Request**. Tim maintainer MuaraAI akan segera meninjau (*code review*) karya Anda!

---

## 🤝 Kode Etik

Dengan berpartisipasi dalam proyek ini, Anda setuju untuk mematuhi [Kode Etik (CODE_OF_CONDUCT.md)](CODE_OF_CONDUCT.md). Kami mengutamakan komunikasi yang saling menghargai, ramah, dan profesional.

---

## 📬 Pertanyaan & Diskusi

Jika Anda memiliki pertanyaan seputar arsitektur proyek, ide fitur baru, atau ingin berdiskusi teknis, silakan:
* Buka [GitHub Discussions](https://github.com/MuaraAI/laku/discussions) atau Issue.
* Hubungi kami via email resmi: [support@laku.muaraai.com](mailto:support@laku.muaraai.com).

*Sekali lagi, terima kasih telah menjadi bagian dari perjalanan MuaraAI dan Laku!* 🚀
