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
  panelAria: "Contoh daftar restock Tokopi, data demo",
  panelLive: "Data demo",
  panelLiveLong: " · Tokopi, Pontianak",
  panelSource: "Shopee s/d 3 Okt",
  title: "Restock minggu ini",
  hint: "Kiriman dari Jawa butuh 5 hari. Stok yang cukup 5 hari atau kurang harus dipesan hari ini.",
  cols: ["Produk", "Stok", "Cukup", "Status"],
  rows: [
    { name: "Kopi Robusta 200 g", stock: "40", days: "4 hari", status: "critical", hot: true },
    { name: "Kopi Arabika Gayo 200 g", stock: "36", days: "9 hari", status: "reorder" },
    { name: "Drip Bag Kopi isi 10", stock: "52", days: "26 hari", status: "ok" },
    { name: "French Press 600 ml", stock: "120", days: ">60 hari", status: "overstock" },
  ] as { name: string; stock: string; days: string; status: StatusKey; hot?: boolean }[],
  footKey: "Saran pesan hari ini",
  footProduct: "Kopi Robusta · ",
  footQty: "173",
  footUnit: " unit",
  footWhy: "Kenapa 173?",
  tag: "Restock engine · MuaraAI",
  headline: ["Tau apa yang bakal laku, ", { text: "sebelum stokmu habis.", className: "soft" }] as SplitPart[],
  sub: "Upload export Shopee, TikTok Shop, dan Tokopedia. Laku menghitung apa yang perlu di-restock, berapa banyak, dan apa yang berhenti dibeli.",
  routeFrom: "Supplier",
  routeFromLong: " · Jawa",
  routeLeadLong: "lead time ",
  routeLead: "5 hari",
  routeTo: "Gudang",
  routeToLong: " · Pontianak",
  routeCap: "Kopi Robusta habis dalam 4 hari, kiriman butuh 5. Itu sebabnya statusnya “Segera pesan”.",
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
  title: "Barang dari Jawa butuh berhari-hari. Salah tebak, rugi dua kali.",
  body: "Seller di Kalimantan Barat restock dari Jawa dengan lead time 3–7 hari. Tanpa hitungan, stok habis saat laris dan modal nyangkut di barang yang lambat.",
  cells: [
    { key: "A.", big: "3–7 hr", title: "Kiriman dari Jawa tidak instan", body: "Telat pesan sehari, rak kosong berhari-hari dan pembeli pindah toko." },
    { key: "B.", big: "2×", title: "Kehabisan dan kebanyakan sekaligus", body: "Yang laris kehabisan, yang lambat menumpuk. Dua-duanya makan modal." },
    { key: "C.", big: "≠1", title: "Data tersebar di beberapa Seller Center", body: "Format beda-beda, angka harus dicocokkan manual setiap minggu." },
  ],
};

export const features = {
  tag: "Fitur",
  title: "Satu tampilan untuk semua channel, satu keputusan restock.",
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
    shop: "Tokopi — Pontianak",
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
      { icon: "map", text: "Insight permintaan regional Kalimantan" },
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
        { href: "https://github.com/MuaraAI/laku", label: "GitHub" },
      ],
    },
  ],
  wordmark: "laku",
  copyright: "© 2026 MuaraAI",
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
      body: "Jarak antara kotak yang datang dan kotak di rak tepat lima satuan, sama dengan lead time bawaan lima hari dari Jawa ke Kalimantan. Celah inilah yang dijaga Laku supaya rak tidak pernah kosong.",
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

export const login = {
  metaTitle: "Masuk — Laku",
  back: "Kembali ke beranda",
  title: "Masuk ke Laku",
  sub: "Pakai akun Google Anda. Tidak perlu password marketplace.",
  google: "Lanjut dengan Google",
  loading: "Mengalihkan ke Google…",
  notes: ["Data pembeli tidak disimpan", "File mentah tidak pernah disimpan", "Gratis selama uji coba"],
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
        "Laku adalah layanan MuaraAI yang membaca file export penjualan marketplace yang Anda upload, lalu menghitung saran restock, status stok, dan rekap penjualan gabungan.",
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
        "Pertanyaan bisa disampaikan ke tim MuaraAI lewat repositori GitHub Laku.",
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
        "Untuk data penjualan yang Anda upload, Anda adalah pengendali data dan Laku (MuaraAI) adalah pemroses data yang bekerja atas instruksi Anda.",
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
        "Hubungi tim MuaraAI lewat repositori GitHub Laku.",
      ],
    },
  ],
};
