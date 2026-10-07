// Copy UI Bahasa Indonesia — satu sumber untuk seluruh teks halaman (AGENTS.md aturan 6).

export type StatusKey = "critical" | "reorder" | "ok" | "overstock" | "dead" | "insufficient";

export type SplitPart = string | { text: string; className: string };

export const routes = {
  home: "/",
  login: "/login",
  afterLogin: "/dashboard",
  tos: "/tos",
  privacy: "/privacy",
};

export const meta = {
  title: "Laku — Restock Engine",
  description:
    "Tau apa yang bakal laku, sebelum stokmu habis. Laku membaca export marketplace Anda dan menghitung apa yang perlu di-restock.",
};

export const nav = {
  brandName: "Laku",
  brandHint: "Lihat makna logo",
  brandHintSr: ", lihat makna logo",
  ariaMain: "Navigasi utama",
  home: "Laku, ke beranda",
  links: [
    { href: "/#fitur", label: "Fitur" },
    { href: "/#cara-kerja", label: "Cara kerja" },
    { href: "/#harga", label: "Harga" },
  ],
  login: "Masuk",
  loginGoogle: "Masuk dengan Google",
  cta: "Coba gratis",
  menuOpen: "Buka menu",
  menuClose: "Tutup menu",
};

export const hero = {
  tag: "Restock engine · MuaraAI",
  headline: ["Tau apa yang bakal laku, ", { text: "sebelum stokmu habis.", className: "soft" }] as SplitPart[],
  sub: "Upload export Shopee, TikTok Shop, dan Tokopedia. Laku menghitung apa yang perlu di-restock, berapa banyak, dan apa yang berhenti dibeli.",
  routeFrom: "Supplier",
  routeLeadLong: "lead time ",
  routeLead: "5 hari",
  routeTo: "Gudang",
  routeCap: "Kalau stok habis sebelum kiriman tiba, Laku menandainya “Segera pesan”.",
  ctaPrimary: "Coba gratis",
  ctaSecondary: "Lihat cara kerjanya",
  notes: ["File CSV / XLSX", "Tanpa login marketplace", "Data pembeli tidak disimpan"],
};

export const status: Record<StatusKey, { label: string; icon: string }> = {
  critical: { label: "Segera pesan", icon: "error" },
  reorder: { label: "Waktunya pesan", icon: "schedule" },
  ok: { label: "Aman", icon: "check_circle" },
  overstock: { label: "Stok berlebih", icon: "stacks" },
  dead: { label: "Tidak laku", icon: "block" },
  insufficient: { label: "Data belum cukup", icon: "help" },
};

export const assumption = "asumsi";

export const kinetic = {
  aria: "Restock pakai data, bukan feeling.",
  line1: "Restock pakai data,",
  line2: "bukan feeling",
};

export const statement = {
  tag: "Laku dalam satu kalimat",
  aria: "Ringkasan",
  lead: "Laku membaca file export Anda, lalu menjawab tiga hal: ",
  highlight: "apa yang dibeli, berapa banyak, dan apa yang berhenti dibeli.",
};

export const problem = {
  tag: "Masalahnya",
  title: "Kiriman dari supplier butuh berhari-hari. Salah tebak, rugi dua kali.",
  body: "Banyak seller restock dari supplier luar kota atau luar pulau dengan lead time 3-7 hari. Tanpa hitungan, stok habis saat laris dan modal nyangkut di barang yang lambat.",
  cells: [
    { key: "A.", big: "3-7 hr", title: "Kiriman dari supplier tidak instan", body: "Telat pesan sehari, rak kosong berhari-hari dan pembeli pindah toko." },
    { key: "B.", big: "2×", title: "Kehabisan dan kebanyakan sekaligus", body: "Yang laris kehabisan, yang lambat menumpuk. Dua-duanya makan modal." },
    { key: "C.", big: "≠1", title: "Data tersebar di beberapa Seller Center", body: "Format beda-beda, angka harus dicocokkan manual setiap minggu." },
  ],
};

export const features = {
  tag: "Fitur",
  title: "Satu tampilan untuk semua channel, satu keputusan restock.",
  hubIdle: "pilih fitur untuk lihat alurnya",
  items: [
    {
      title: "Import tanpa ribet",
      body: "Upload file export apa adanya. Laku menampilkan preview dulu: baris baru, diupdate, bermasalah, dan kelengkapan SKU, sebelum ada yang disimpan.",
      chips: ["CSV & XLSX", "Upload ulang: 0 baru, 0 diupdate", "Deteksi ID rusak Excel"],
      hub: "baca 3 file, cek preview",
    },
    {
      title: "Saran restock yang bisa dijelaskan",
      body: "Titik pesan ulang, stok pengaman, dan jumlah saran per produk, diurutkan dari yang paling mendesak. Tombol “mengapa” membuka semua angka di baliknya.",
      chips: ["Lead time sendiri", "Default bertanda “asumsi”", "Tanpa angka karangan"],
      hub: "hitung saran: 173 unit",
    },
    {
      title: "Tahu kapan berhenti beli",
      body: "Stok berlebih dan barang tidak laku dipisah ke daftar sendiri, lengkap dengan modal yang tertahan kalau harga modal diisi.",
      chips: ["Stok berlebih", "Tidak laku 60 hari", "Modal tertahan"],
      hub: "tandai stok berlebih",
    },
    {
      title: "Rekap penjualan gabungan",
      body: "Omzet kotor dan penjualan bersih dari semua marketplace dalam satu angka, dipecah per channel. Banner cakupan data memberi tahu kalau ada file yang belum diperbarui.",
      chips: ["Per channel & periode", "Definisi tiap angka", "Chip “sementara”"],
      hub: "jumlah omzet per channel",
    },
    {
      title: "Privasi pembeli terjaga",
      body: "Nama, nomor HP, dan alamat pembeli dibuang saat file dibaca. File mentah tidak pernah disimpan, dan Anda tidak perlu memberi password marketplace.",
      chips: ["Diproses di memori", "Hanya provinsi/kabupaten", "Tanpa kredensial"],
      hub: "buang nama & HP pembeli",
    },
  ],
  diagram: {
    inputs: [
      { name: "Shopee", ext: ".csv" },
      { name: "TikTok Shop", ext: ".xlsx" },
      { name: "Tokopedia", ext: ".csv" },
    ],
    hub: "Laku",
    outRestock: { name: "Segera pesan", sub: "173 unit" },
    outRecap: { name: "Rekap omzet", sub: "per channel" },
    outStop: { name: "Berhenti beli", sub: "stok berlebih" },
    caption: "fig. 02 — file export → Laku → keputusan",
  },
  stats: [
    { value: 3, label: "Marketplace dalam satu tampilan" },
    { value: 6, label: "Status stok, dari “Segera pesan” sampai “Tidak laku”" },
    { value: 20000, label: "Baris per file dalam sekali upload", locale: true },
    { value: 0, label: "Nama & nomor HP pembeli yang disimpan" },
  ] as { value: number; label: string; locale?: boolean }[],
};

export const why = {
  tag: "Bisa dipercaya",
  title: "Kenapa 173? Setiap angka ada notanya.",
  body: "Semua dihitung dari file Anda sendiri. Nilai default yang belum Anda konfirmasi diberi tanda “asumsi”.",
  principles: [
    "Pesanan batal, retur, dan belum dibayar tidak dihitung sebagai permintaan.",
    "Data terlalu sedikit? Laku bilang “Data belum cukup”, bukan menebak.",
    "Stok minus atau file lama ditandai sebelum Anda bertindak.",
  ],
  nota: {
    aria: "Nota perhitungan: saran pesan Kopi Robusta 173 unit, status segera pesan",
    head: "LAKU · NOTA RESTOCK",
    shop: "Tokopi",
    date: "Sen, 05 Okt 2026 · 08.12 WIB",
    item: "KOPI ROBUSTA 200 G",
    lines: [
      { k: "Laku/hari (30 hr)", v: "10", pi: 3 },
      { k: "Naik-turun harian", v: "±4", pi: 4 },
      { k: "Lead time", v: "5 hr", pi: 5, assumed: true },
      { k: "Cek ulang", v: "7 hr", pi: 6, assumed: true },
      { k: "Tingkat layanan", v: "95%", pi: 6, assumed: true },
      { k: "Siklus restock", v: "14 hr", pi: 6, assumed: true },
      { k: "Stok pengaman", v: "23", pi: 7, formula: "⌈1,65 × 4 × √(5 + 7)⌉ = ⌈22,86⌉" },
      { k: "Titik pesan ulang", v: "143", pi: 8, formula: "10 × 12 + 23" },
      { k: "Stok sekarang", v: "40", pi: 9 },
    ] as { k: string; v: string; pi: number; assumed?: boolean; formula?: string }[],
    totalKey: "SARAN PESAN",
    total: 173,
    unit: "unit",
    totalFormula: "10 × (5 + 14) + 23 − 40",
    foot: "stok cukup 4 hr · kiriman butuh 5 hr",
  },
};

export const how = {
  tag: "Cara kerja",
  title: "Sekali seminggu: export, upload, beres.",
  body: "Export dari laptop, baca hasilnya di HP. Tidak perlu menghubungkan akun marketplace.",
  steps: [
    { icon: "storefront", title: "Pilih marketplace", body: "Ikuti panduan export per marketplace dalam Bahasa Indonesia." },
    { icon: "upload_file", title: "Upload file export", body: "CSV atau XLSX, sampai 20.000 baris per file." },
    { icon: "fact_check", title: "Cek preview, lalu konfirmasi", body: "Lihat baris baru, diupdate, dan bermasalah sebelum disimpan." },
    { icon: "checklist", title: "Isi lead time & stok", body: "Daftar restock langsung terurut dari yang paling mendesak." },
  ],
};

export const pricing = {
  tag: "Harga",
  title: "Mulai gratis. Paket Pro segera hadir.",
  free: {
    name: "Gratis",
    tag: "Untuk mulai",
    price: "Rp0",
    priceNote: "selama uji coba",
    items: [
      { icon: "check", text: "Import Shopee, TikTok Shop, Tokopedia" },
      { icon: "check", text: "Daftar restock & 6 status stok" },
      { icon: "check", text: "Rekap penjualan gabungan" },
      { icon: "schedule", text: "Asisten AI, kuota terbatas (segera)" },
    ],
    cta: "Coba gratis",
  },
  pro: {
    name: "Pro",
    tag: "Segera hadir",
    price: "Segera",
    priceNote: "harga setelah uji coba",
    items: [
      { icon: "forum", text: "Kuota asisten AI lebih besar" },
      { icon: "map", text: "Insight permintaan per daerah" },
      { icon: "api", text: "API Laku untuk data Anda sendiri" },
    ],
  },
  note: "Harga belum final dan akan ditentukan setelah uji coba bersama seller.",
};

export const finalCta = {
  tag: "Mulai minggu ini",
  title: "Berhenti menebak. ",
  titleSoft: "Mulai restock.",
  body: "Upload satu file export dan lihat daftar restock pertama Anda dalam hitungan menit.",
  primary: "Coba gratis",
  secondary: "Masuk dengan Google",
};

export const footer = {
  about: "Restock engine untuk seller multi-marketplace di daerah. Tau apa yang bakal laku, sebelum stokmu habis.",
  location: "Pontianak, Kalimantan Barat, Indonesia",
  email: "support@laku.muaraai.com",
  cols: [
    {
      title: "Produk",
      links: [
        { href: "/#fitur", label: "Fitur" },
        { href: "/#cara-kerja", label: "Cara kerja" },
        { href: "/#harga", label: "Harga" },
      ],
    },
    {
      title: "MuaraAI",
      links: [
        { href: "/tos", label: "Syarat & Ketentuan" },
        { href: "/privacy", label: "Kebijakan Privasi" },
        { href: "mailto:support@laku.muaraai.com", label: "support@laku.muaraai.com" },
        { href: "https://github.com/MuaraAI/laku", label: "GitHub" },
      ],
    },
  ],
  wordmark: "laku",
  copyright: "© 2026 MuaraAI · Pontianak, Kalimantan Barat, Indonesia",
  disclaimer:
    "Laku tidak berafiliasi dengan, atau didukung oleh, Shopee, TikTok Shop, maupun Tokopedia. Nama marketplace hanya dipakai untuk menyebut format file export.",
};

export const brand = {
  barTag: "Logo",
  barTitle: "Anatomi Laku",
  close: "Tutup",
  dotsAria: "Bagian logo",
  wordmark: "Laku",
  byline: "BY MUARAAI",
  steps: [
    {
      dot: "Pembuka",
      kicker: "Anatomi logo",
      title: "Satu tanda, lima makna.",
      body: "Logo Laku tersusun dari lima bagian sederhana. Gulir untuk membongkarnya satu per satu.",
      hint: "Gulir ke bawah",
    },
    {
      dot: "Segi delapan",
      no: "01",
      kicker: "Bingkai",
      title: "Segi delapan",
      body: "Bentuk rambu STOP. Laku tidak hanya memberi tahu kapan harus beli, tapi juga kapan harus berhenti beli.",
      spec: [{ text: "Sudut terpotong 30%" }, { text: "Garis tinta #072033", chip: "text-primary" }],
    },
    {
      dot: "Siku rak",
      no: "02",
      kicker: "Huruf",
      title: "Siku rak",
      body: "Huruf L untuk Laku, sekaligus siku penyangga rak dinding. Laku hadir untuk menopang rak toko, bukan menggantikan marketplace.",
      spec: [{ text: "Huruf L" }, { text: "Garis 6 satuan, ujung bulat" }],
    },
    {
      dot: "Kotak biru",
      no: "03",
      kicker: "Isi rak",
      title: "Kotak biru",
      body: "Stok yang ada di rak hari ini. Birunya River Current Blue, warisan MuaraAI dan satu-satunya warna aksen Laku: di mana pun biru muncul, di situ ada yang bisa Anda lakukan.",
      spec: [{ text: "Biru #0369A1", chip: "primary" }, { text: "Stok saat ini" }],
    },
    {
      dot: "Kotak putus-putus",
      no: "04",
      kicker: "Rencana",
      title: "Kotak putus-putus",
      body: "Restock yang sudah dihitung, tapi belum datang. Garisnya putus-putus karena masih rencana: Laku melihat kebutuhan sebelum rak kosong.",
      spec: [{ text: "Saran pesan" }, { text: "Belum tiba" }],
    },
    {
      dot: "Celah lima",
      no: "05",
      kicker: "Jarak",
      title: "Celah lima",
      body: "Jarak antara kotak yang datang dan kotak di rak tepat lima satuan, sama dengan lead time bawaan lima hari dari supplier ke gudang. Celah inilah yang dijaga Laku supaya rak tidak pernah kosong.",
      spec: [{ text: "5 satuan = 5 hari" }, { text: "Lead time bawaan" }],
    },
    {
      dot: "Penutup",
      kicker: "Disatukan",
      title: "Tau apa yang bakal laku, sebelum stokmu habis.",
      body: "Bingkai yang tahu kapan berhenti, rak yang ditopang, stok yang dijaga, dan restock yang datang tepat waktu.",
      back: "Kembali ke halaman",
      replay: "Ulangi dari awal",
    },
  ] as {
    dot: string;
    no?: string;
    kicker: string;
    title: string;
    body: string;
    hint?: string;
    spec?: { text: string; chip?: "text-primary" | "primary" }[];
    back?: string;
    replay?: string;
  }[],
};

/** Supply map (login panel + landing hero): illustrative routes from other islands into one warehouse. */
export const supplyMap = {
  aria: "Peta Indonesia: kiriman dari Sumatra, Jawa, Bali, Sulawesi, dan Papua mengalir ke gudang di Pontianak.",
  hub: "Gudang Pontianak",
  hubSub: "stok dipantau Laku",
  sources: { sumatra: "Sumatra", jawa: "Jawa", bali: "Bali", sulawesi: "Sulawesi", papua: "Papua" },
  caption: "Ilustrasi rute kiriman supplier",
};

export const login = {
  metaTitle: "Masuk — Laku",
  back: "Kembali ke beranda",
  title: "Masuk ke Laku",
  sub: "Pakai akun Google atau email Anda. Tidak perlu password marketplace.",
  google: "Lanjut dengan Google",
  loading: "Mengalihkan ke Google…",
  email: {
    label: "Alamat email",
    placeholder: "nama@contoh.com",
    send: "Kirim tautan masuk",
    sending: "Mengirim tautan…",
    divider: "atau pakai email",
    empty: "Isi alamat email dulu.",
    invalid: "Format email belum benar, contoh: nama@contoh.com",
    failed: "Gagal mengirim tautan. Coba lagi sebentar lagi.",
    hint: "Kami kirim tautan masuk dan kode 6 digit. Tanpa password.",
  },
  otp: {
    title: "Cek email Anda",
    sentLead: "Tautan masuk dan kode 6 digit sudah dikirim ke",
    spam: "Belum masuk? Cek folder spam atau promosi.",
    label: "Atau ketik kode 6 digit",
    verify: "Masuk dengan kode",
    verifying: "Memeriksa kode…",
    invalid: "Kode salah atau sudah kedaluwarsa. Pakai kode dari email terbaru.",
    resend: "Kirim ulang kode",
    resendIn: (s: number) => `Kirim ulang dalam ${s} dtk`,
    resent: "Kode baru sudah dikirim.",
    change: "Ganti email",
  },
  demo: {
    title: "Lihat demo dulu",
    sub: "Tanpa daftar, pakai data contoh toko",
  },
  help: "Butuh bantuan?",
  notes: ["Data pembeli tidak disimpan", "File mentah tidak pernah disimpan", "Gratis selama uji coba"],
  aside: {
    sub: "Upload export marketplace seminggu sekali. Laku menyusun daftar restock dari yang paling mendesak.",
  },
  consentLead: "Dengan masuk, Anda menyetujui ",
  consentTos: "Syarat & Ketentuan",
  consentAnd: " dan ",
  consentPrivacy: "Kebijakan Privasi",
  consentEnd: " Laku.",
  errors: {
    config: "Login belum dikonfigurasi di server ini. Hubungi tim Laku.",
    oauth: "Login dengan Google gagal. Coba lagi.",
    callback: "Sesi login tidak bisa dibuat. Coba masuk lagi.",
  },
};

export type LegalDoc = {
  metaTitle: string;
  title: string;
  updated: string;
  sections: { heading: string; body: string[] }[];
};

export const legalCommon = {
  draft: "Draf untuk masa uji coba. Teks final menyusul setelah review tim dan review hukum sebelum peluncuran komersial.",
  updatedLabel: "Terakhir diperbarui",
  other: { tos: "Baca juga Kebijakan Privasi", privacy: "Baca juga Syarat & Ketentuan" },
};

export const tos: LegalDoc = {
  metaTitle: "Syarat & Ketentuan — Laku",
  title: "Syarat & Ketentuan",
  updated: "6 Oktober 2026",
  sections: [
    {
      heading: "1. Tentang Laku",
      body: [
        "Laku adalah layanan inovasi digital dari MuaraAI (berbasis di Pontianak, Kalimantan Barat, Indonesia) yang membaca file export penjualan marketplace yang Anda upload, lalu menghitung saran restock, status stok, dan rekap penjualan gabungan.",
        "Laku tidak berafiliasi dengan, atau didukung oleh, Shopee, TikTok Shop, maupun Tokopedia. Nama marketplace hanya dipakai untuk menyebut format file export.",
      ],
    },
    {
      heading: "2. Akun",
      body: [
        "Anda masuk dengan akun Google. Laku tidak pernah meminta atau menyimpan password marketplace Anda.",
        "Anda bertanggung jawab atas aktivitas di akun Anda dan wajib menjaga akses akun Google Anda.",
      ],
    },
    {
      heading: "3. Data yang Anda upload",
      body: [
        "Data penjualan dan stok tetap milik Anda. Anda menjamin berhak memakai file yang Anda upload.",
        "Laku memproses data itu hanya untuk menjalankan layanan bagi Anda. Rincian pemrosesan ada di Kebijakan Privasi.",
      ],
    },
    {
      heading: "4. Saran restock adalah estimasi",
      body: [
        "Angka di Laku dihitung dari file yang Anda upload dan dari nilai default yang ditandai “asumsi” sampai Anda mengonfirmasinya. Saran restock adalah estimasi, bukan jaminan penjualan.",
        "Keputusan membeli stok tetap ada di tangan Anda. Angka Laku bisa berbeda dari Seller Center, misalnya karena rentang tanggal file atau pesanan yang berubah status.",
      ],
    },
    {
      heading: "5. Masa uji coba",
      body: [
        "Selama uji coba, Laku gratis dan disediakan apa adanya, tanpa jaminan ketersediaan. Fitur dan batas pemakaian bisa berubah.",
        "Paket berbayar belum tersedia. Harga akan diumumkan sebelum berlaku, dan tidak ada tagihan tanpa persetujuan Anda.",
      ],
    },
    {
      heading: "6. Larangan",
      body: [
        "Jangan memakai Laku untuk mengakses data seller lain, mengganggu layanan, atau mengupload file yang bukan hak Anda atau berisi perangkat lunak berbahaya.",
      ],
    },
    {
      heading: "7. Merek dan kode",
      body: [
        "Kode Laku dirilis dengan lisensi Apache 2.0. Nama “Laku” dan logo MuaraAI adalah merek MuaraAI dan tidak ikut dilisensikan.",
      ],
    },
    {
      heading: "8. Menghentikan layanan",
      body: [
        "Anda bisa berhenti kapan saja dan meminta akun dihapus. Kami bisa menangguhkan akun yang melanggar syarat ini.",
      ],
    },
    {
      heading: "9. Perubahan dan hukum yang berlaku",
      body: [
        "Kami akan memberi tahu perubahan penting pada syarat ini sebelum berlaku. Syarat ini tunduk pada hukum Republik Indonesia.",
        "Pertanyaan dan komunikasi resmi dapat disampaikan ke tim MuaraAI melalui email support@laku.muaraai.com atau repositori GitHub Laku.",
      ],
    },
  ],
};

export const privacy: LegalDoc = {
  metaTitle: "Kebijakan Privasi — Laku",
  title: "Kebijakan Privasi",
  updated: "6 Oktober 2026",
  sections: [
    {
      heading: "1. Peran kami",
      body: [
        "Untuk data penjualan yang Anda upload, Anda adalah pengendali data dan Laku (MuaraAI, Pontianak, Kalimantan Barat, Indonesia) adalah pemroses data yang bekerja atas instruksi Anda.",
      ],
    },
    {
      heading: "2. Data yang kami simpan",
      body: [
        "Akun: nama, email, dan ID dari login Google.",
        "Penjualan: nomor pesanan, produk, SKU, jumlah, harga, diskon, status, waktu, dan wilayah pembeli sampai tingkat provinsi, kabupaten, atau kecamatan.",
        "Stok dan pengaturan: stok awal, barang masuk, penyesuaian, harga modal (opsional), lead time, dan pengaturan restock Anda.",
      ],
    },
    {
      heading: "3. Data yang tidak pernah kami simpan",
      body: [
        "Nama, nomor HP, email, dan alamat jalan pembeli dibuang saat file dibaca di memori. Data itu tidak masuk ke database, tabel sementara, log, maupun laporan error.",
        "File export mentah tidak pernah disimpan. Baris yang sudah dibersihkan disimpan sementara untuk pratinjau, lalu dihapus setelah Anda konfirmasi atau paling lambat 24 jam. Kami hanya mencatat sidik file (hash) dan jumlah baris.",
        "Laku tidak pernah meminta password marketplace.",
      ],
    },
    {
      heading: "4. Cara kami memakai data",
      body: [
        "Untuk menghitung saran restock, status stok, dan rekap penjualan bagi Anda sendiri. Data seller dipisahkan per akun, sehingga seller lain tidak bisa melihat data Anda.",
      ],
    },
    {
      heading: "5. Insight regional (opsional)",
      body: [
        "Berbagi data ke insight regional mati secara bawaan. Jika Anda mengaktifkannya, kami mencatat persetujuan Anda, dan Anda bisa mencabutnya kapan saja dengan efek langsung.",
        "Insight hanya menampilkan peringkat kategori per wilayah, dari minimal 3 seller dan 30 baris pesanan, dengan kontributor terbesar tidak lebih dari 60%. Nama produk, nama toko, dan angka mentah tidak pernah ditampilkan ke seller lain.",
      ],
    },
    {
      heading: "6. Asisten AI",
      body: [
        "Asisten AI (segera hadir) diproses oleh Muara V1 Flash melalui gateway MuaraAI. AI hanya menerima hasil perhitungan dari data Anda, tidak pernah data pembeli, dan semua angka ditampilkan langsung dari data, bukan dikarang AI.",
        "Riwayat chat disimpan 30 hari. Ringkasan yang diingat AI bisa Anda lihat dan hapus kapan saja.",
      ],
    },
    {
      heading: "7. Penyedia layanan",
      body: [
        "Kami memakai Supabase (database dan login, wilayah Singapura), Vercel (hosting web), server VPS MuaraAI (API), dan gateway MuaraAI (AI). Mereka memproses data hanya untuk menjalankan Laku.",
      ],
    },
    {
      heading: "8. Berapa lama data disimpan",
      body: [
        "Data penjualan disimpan selama akun aktif. Jika akun dihapus, data dihapus permanen paling lambat 30 hari. Catatan audit admin disimpan 1 tahun.",
      ],
    },
    {
      heading: "9. Hak Anda",
      body: [
        "Sesuai UU Pelindungan Data Pribadi, Anda bisa meminta akses, koreksi, atau penghapusan data, dan mencabut persetujuan insight kapan saja.",
        "Permohonan dapat diajukan kepada kami melalui email support@laku.muaraai.com atau repositori GitHub Laku.",
      ],
    },
  ],
};

// -----------------------------------------------------------------------------
// Copy UI Dashboard Terpusat (AGENTS.md Aturan 6: Single Source of Truth)
// -----------------------------------------------------------------------------
export const dashboard = {
  common: {
    loadingSession: "Memeriksa sesi login…",
    serverLoading: "Memuat data rekomendasi restock dari server…",
    serverError: (err: string) => `Gagal memuat data dari server: ${err}`,
    retry: "Coba Lagi",
    saveAndContinue: "Simpan & lanjut",
    back: "Kembali",
    saving: "Menyimpan…",
  },
  sidebar: {
    brandSubtitle: "Restock yuk!",
    demoModeGuest: "Mode Demo (Tamu)",
    demoStoreName: "Warung Bu Rina",
    defaultLiveName: "Toko Saya",
    nav: {
      setup: "Setup",
      restock: "Restock",
      penjualan: "Penjualan",
      upload: "Upload",
    },
    toggleDemo: "Demo",
    toggleLive: "Toko Saya",
    loginRequiredTitle: "Login untuk buka Toko Saya",
    switchToLiveTitle: "Beralih ke Toko Saya",
    loginBtn: "Masuk",
    logoutBtn: "Keluar",
  },
  status: {
    CRITICAL: { label: "Segera pesan", icon: "alert" },
    REORDER: { label: "Waktunya pesan", icon: "bell" },
    OK: { label: "Aman", icon: "check" },
    OVERSTOCK: { label: "Stok berlebih", icon: "boxes" },
    DEAD: { label: "Tidak laku", icon: "moon" },
    INSUFFICIENT_DATA: { label: "Data belum cukup", icon: "hourglass" },
  },
  restock: {
    kicker: "Prioritas Pemesanan",
    searchPlaceholder: "Cari produk atau SKU…",
    filter: {
      all: "Semua",
      critical: (count: number) => `Segera pesan (${count})`,
      reorder: (count: number) => `Waktunya pesan (${count})`,
      stop: (count: number) => `Berhenti beli (${count})`,
    },
    kpi: {
      critical: "Segera pesan",
      criticalSub: "Di bawah titik pesan ulang",
      reorder: "Waktunya pesan",
      reorderSub: "Mendekati titik pesan",
      estimate: "Estimasi nilai pesanan",
      estimateSub: "Untuk barang yang perlu dipesan",
      stale: "Data usang",
      staleSub: "Perlu sinkronisasi ulang",
    },
    emptyLive: {
      title: "Toko Anda belum punya data produk",
      desc: "Unggah file export pesanan dari Shopee, TikTok Shop, atau Tokopedia lewat menu Upload agar Laku bisa menghitung laju penjualan dan titik pesan ulang (ROP) produk Anda.",
      cta: "Buka menu Upload sekarang →",
    },
    emptySearch: (q: string) => `Tidak ada produk yang cocok dengan pencarian “${q}”.`,
    emptyFilter: "Tidak ada produk berstatus ini sekarang.",
    resetSearch: "Reset pencarian",
    showAll: "Tampilkan semua",
    sectionActionable: (count: number) => `Perlu dipesan (${count})`,
    sectionStop: (count: number) => `Berhenti beli (${count})`,
    sectionStopSub: "Stok berlebih atau tidak laku. Tahan dulu uangnya, jangan pesan ulang.",
  },
  whyPanel: {
    kicker: "Mengapa angka ini?",
    ariaLabel: (name: string) => `Mengapa angka restock ${name}`,
    closeAria: "Tutup panel",
    negativeWarning: {
      lead: (qty: number) => `Stok tercatat minus (${qty} unit).`,
      body: "Laku menyembunyikan saran restock dulu. Cocokkan stok aktual lewat halaman Upload atau stok opname, lalu perbarui saldo supaya rekomendasi bisa dihitung lagi.",
    },
    avgDaily: {
      label: "Penjualan rata-rata per hari",
      desc: "Dihitung dari riwayat pesanan yang sudah diunggah.",
    },
    leadTime: {
      label: "Lead time supplier",
      assumedDesc: "Nilai bawaan aplikasi. Konfirmasi lead time asli supplier supaya hitungan pas.",
      confirmedDesc: "Sudah dikonfirmasi saat onboarding.",
    },
    demandLead: {
      label: "Kebutuhan selama lead time",
      desc: "Perkiraan stok yang habis sebelum pesanan baru tiba.",
    },
    safetyStock: {
      label: "Stok pengaman",
      desc: "Bantalan kalau penjualan tiba-tiba naik atau supplier telat.",
    },
    rop: {
      label: "Titik pesan ulang (ROP)",
      roundedNote: "Dibulatkan ke atas, karena stok dihitung per unit utuh.",
      statusBelow: (onHand: number) => `Stok saat ini ${onHand} unit, sudah di bawah titik pesan. Waktunya order.`,
      statusAbove: (onHand: number) => `Stok saat ini ${onHand} unit, masih di atas titik pesan.`,
    },
    suggested: {
      label: "Saran jumlah pesanan",
      desc: "Cukup untuk ±30 hari ke depan berdasarkan laju penjualan sekarang.",
    },
  },
  sales: {
    kicker: "Rekap penjualan",
    title: "Penjualan",
    coverageStale: (channels: string, days: number) => `Data ${channels} terakhir ${days} hari lalu. Unggah ulang laporan supaya rekomendasi restock akurat.`,
    coverageTemp: "Transaksi 7 hari terakhir masih sementara. Angka bisa berubah karena pesanan belum selesai, retur, atau pembatalan.",
    kpi: {
      gross: "Omzet kotor",
      grossSub: (days: number) => `${days} hari terakhir, semua channel`,
      net: "Penjualan bersih",
      netSub: "Setelah potongan platform & retur",
      orders: "Transaksi",
      ordersSub: "Pesanan tercatat",
      dailyAvg: "Rata-rata harian",
      dailyAvgSub: "Omzet kotor per hari",
    },
    trendTitle: "Tren omzet kotor",
    trendHint: "Sentuh atau arahkan ke grafik untuk lihat angka harian.",
    trendEmpty: "Grafik tren muncul setelah ada penjualan di minimal dua hari berbeda.",
    channelTitle: "Per channel",
    channelEmpty: "Rincian per channel belum tersedia untuk periode ini.",
    emptyLiveTitle: (days: number) => `Belum ada transaksi penjualan tercatat untuk Toko Saya dalam ${days} hari terakhir.`,
    emptyLiveDesc: "Impor data pesanan dari Shopee, TikTok Shop, atau Tokopedia lewat menu Upload untuk melihat rekap omzet dan grafik tren penjualan.",
    errorTitle: (err: string) => `Gagal memuat rekap penjualan: ${err}`,
  },
  upload: {
    step1Title: "Pilih channel",
    step2Title: "Pilih file CSV / XLSX",
    pickPrompt: "Klik untuk pilih file laporan",
    pickWait: "Pilih channel dulu di langkah 1",
    pickHint: "Maksimal 90 hari riwayat pesanan",
    pickWarn: "Pilih channel dulu supaya kolom file bisa dipetakan dengan benar.",
    step3Loading: "Membaca file…",
    step3Target: "Saran restock",
    previewTitle: "Preview: cek dulu sebelum konfirmasi",
    kpiRowsRead: "Baris dibaca",
    kpiRowsNew: "Baris baru",
    kpiSkuFillRate: "SKU fill rate",
    confirmBtn: "Konfirmasi & simpan",
    cancelBtn: "Batal, ganti file",
    defaultActionNote: "Periksa format baris dan unggah ulang.",
  },
  onboarding: {
    title: "Kenalkan, ini Laku",
    sub: "Enam langkah singkat supaya Laku bisa mulai menyarankan restock dari data penjualanmu.",
    stepTitles: ["Channel", "Panduan upload", "Upload awal", "Lead time", "Saldo awal stok", "Selesai"],
    step1: {
      title: "Jualan di mana saja?",
      sub: "Pilih channel utama dulu. Channel lain bisa ditambah lewat halaman Upload nanti.",
    },
    step2: {
      title: "Cara ambil laporan penjualan",
      guides: {
        Shopee: [
          "Buka Seller Centre → Penjualan Saya → Unduh laporan pesanan.",
          "Pilih rentang tanggal maksimal 90 hari terakhir.",
          "Ekspor sebagai CSV atau XLSX, lalu unggah di sini.",
        ],
        "TikTok Shop": [
          "Buka Seller Center → Pesanan → Ekspor riwayat pesanan.",
          "Pilih status \"Selesai\" agar hitungan laku akurat.",
          "Unduh file XLSX, lalu unggah di sini.",
        ],
        Tokopedia: [
          "Buka Seller Dashboard → Statistik → Unduh laporan penjualan.",
          "Pilih periode maksimal 90 hari terakhir.",
          "Simpan sebagai CSV, lalu unggah di sini.",
        ],
      },
    },
    step3: {
      title: "Upload laporan pertama",
      pickTitle: (ch: string) => `Pilih file CSV / XLSX dari ${ch}`,
      maxHint: "Maksimal 90 hari riwayat pesanan",
      doneLive: (name: string) => `${name} berhasil diimpor ke tokomu.`,
      doneDemo: (name: string) => `${name} terbaca. Preview lengkap bisa dicek di halaman Upload.`,
      skip: "Lewati dulu",
      continue: "Lanjut",
    },
    step4: {
      title: "Konfirmasi lead time supplier",
      sub: "Lead time = lama barang tiba setelah kamu pesan ke supplier. Laku memakai angka ini untuk menghitung titik pesan ulang (ROP).",
      label: "Lead time (hari)",
      hint: (defDays: number) => `Default ${defDays} hari adalah asumsi bawaan. Ganti sesuai kenyataan supplier-mu, lalu konfirmasi.`,
      errRange: "Lead time harus antara 1 dan 60 hari.",
      assumeBtn: "Pakai asumsi dulu",
      confirmBtn: (days: number) => `Konfirmasi ${days} hari`,
    },
    step5: {
      title: "Saldo awal stok",
      optionalChip: "opsional",
      sub: "Kalau kamu tahu stok fisik barang terlaris sekarang, isi di sini supaya saran restock langsung akurat. Bisa di-skip dan diisi belakangan.",
      skuLabel: "SKU",
      skuPlaceholder: "mis. KOP-GUL-250",
      nameLabel: "Nama produk",
      namePlaceholder: "mis. Kopi Gula Aren 250ml",
      qtyLabel: "Stok fisik sekarang (unit)",
      skipBtn: "Skip, isi nanti",
      saveBtn: "Simpan & lanjut",
      errValidation: "Isi SKU dan jumlah stok, atau pilih \"Skip, isi nanti\".",
    },
    step6: {
      title: "Siap. Dashboard restock-mu sudah menunggu.",
      sub: "Laku akan menandai barang yang harus segera dipesan, yang masih aman, dan yang sebaiknya berhenti dibeli. Unggah laporan rutin supaya angkanya tetap segar.",
      finishBtn: "Masuk ke Dashboard",
    },
  },
};


/** Halaman error global (app/not-found.tsx, app/error.tsx, app/global-error.tsx) + banner offline. */
export const errorPages = {
  notFound: {
    metaTitle: "Halaman tidak ditemukan — Laku",
    code: "404",
    title: "Halaman ini tidak ada di rak kami.",
    body: "Tautannya mungkin salah ketik atau halamannya sudah dipindah. Coba mulai lagi dari beranda.",
  },
  crash: {
    code: "500",
    title: "Ada yang tidak beres di halaman ini.",
    body: "Kesalahan sudah tercatat. Coba muat ulang; kalau masih terjadi, kabari kami di",
    retry: "Coba lagi",
  },
  home: "Kembali ke beranda",
  dashboard: "Buka dashboard",
  offline: "Anda sedang offline. Data terbaru belum bisa dimuat — sambungkan internet lalu coba lagi.",
  backOnline: "Koneksi kembali. Muat ulang data kalau angka belum berubah.",
};

/** Pesan error API untuk pengguna (lib/api.ts). Server boleh menimpa dengan pesan yang lebih spesifik. */
export const apiErrors = {
  offline: "Tidak ada koneksi internet. Periksa jaringan Anda lalu coba lagi.",
  timeout: "Server terlalu lama merespons. Coba lagi sebentar lagi.",
  network: "Tidak bisa terhubung ke server Laku. Coba lagi beberapa saat lagi.",
  badRequest: "Permintaan tidak valid. Periksa isian Anda.",
  unauthorized: "Sesi login Anda sudah berakhir. Silakan masuk lagi.",
  forbidden: "Akun ini tidak punya akses untuk tindakan ini.",
  notFound: "Data yang diminta tidak ditemukan.",
  conflict: "Data ini sudah diproses sebelumnya.",
  tooLarge: "File terlalu besar. Maksimal 10 MB per file — pecah berdasarkan rentang tanggal.",
  validation: "Ada isian yang belum benar. Periksa lagi lalu kirim ulang.",
  rateLimited: (s: number | null) =>
    s ? `Terlalu banyak permintaan. Coba lagi dalam ${s} detik.` : "Terlalu banyak permintaan. Coba lagi sebentar lagi.",
  server: "Server Laku sedang bermasalah. Tim kami sudah diberi tahu — coba lagi sebentar lagi.",
  unavailable: "Server Laku sedang tidak bisa dijangkau (pemeliharaan atau gangguan). Coba lagi beberapa menit lagi.",
  unknown: "Terjadi kesalahan yang tidak terduga. Coba lagi.",
  loginAgain: "Masuk lagi",
};

/** Validasi file di browser sebelum upload (A14: ≤10 MB, CSV/XLSX). */
export const uploadRules = {
  maxBytes: 10 * 1024 * 1024,
  accept: ".csv,.xlsx",
  badType: (name: string) => `“${name}” bukan file CSV atau XLSX. Unduh ulang laporan dari Seller Center dalam format CSV/XLSX.`,
  tooLarge: (mb: string) => `File ${mb} MB melebihi batas 10 MB. Pecah laporan per rentang tanggal lalu unggah satu per satu.`,
  empty: "File kosong (0 byte). Unduh ulang laporan dari Seller Center.",
  noChannel: "Pilih channel dulu supaya kolom file bisa dipetakan dengan benar.",
};
