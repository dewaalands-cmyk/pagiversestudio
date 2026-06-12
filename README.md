# Pagiverse Studio — Website Company Profile

Website company profile dengan tema gelap/terang, dibangun dengan **Next.js + Tailwind CSS**.

## Cara Menjalankan (untuk pemula)

Pastikan **Node.js** sudah terpasang di komputermu (versi 18 ke atas).
Cek dengan membuka Terminal / Command Prompt lalu ketik: `node -v`

Jika belum ada, unduh di https://nodejs.org (pilih versi LTS).

Lalu ikuti langkah berikut:

```bash
# 1. Masuk ke folder proyek
cd pagiverse-studio

# 2. Install semua kebutuhan (cukup sekali saja)
npm install

# 3. Jalankan website di mode pengembangan
npm run dev
```

Buka browser ke **http://localhost:3000** — website-mu sudah jalan.
Klik ikon matahari/bulan di kanan atas untuk ganti mode terang/gelap.

## Struktur Folder

```
pagiverse-studio/
├── app/
│   ├── layout.jsx        # Kerangka utama + pengaturan tema & SEO
│   ├── page.jsx          # Halaman utama (menyusun semua section)
│   └── globals.css       # Style global + motif kotak khas
├── components/           # Tiap bagian website jadi 1 file terpisah
│   ├── site-config.js    # ⭐ Pusat kontak: nomor WhatsApp & link Instagram
│   ├── Logo.jsx
│   ├── ThemeProvider.jsx
│   ├── ThemeToggle.jsx
│   ├── Navbar.jsx
│   ├── Hero.jsx
│   ├── About.jsx
│   ├── Services.jsx
│   ├── Portfolio.jsx
│   ├── Testimonials.jsx
│   ├── Clients.jsx
│   ├── Contact.jsx
│   └── Footer.jsx
├── public/
│   └── portfolio/        # Gambar/logo karya untuk section Portfolio
└── tailwind.config.js    # Warna brand & font didefinisikan di sini
```

## Yang Perlu Kamu Ganti

1. **Kontak (WhatsApp & Instagram)** → buka `components/site-config.js`.
   Cukup ubah satu file ini, semua tombol di navbar, section kontak, dan footer
   ikut berubah otomatis. (Nomor WhatsApp pakai format `62...` tanpa `+`/`0` depan.)
2. **Teks & konten** → tiap section punya datanya sendiri di bagian atas file
   (cari variabel seperti `layanan`, `proyek`, `testimoni`, `klien`, `poin`).
3. **Gambar portfolio** → ada di `public/portfolio/`. Untuk mengganti, timpa file
   gambarnya atau ubah nama file pada array `proyek` di `components/Portfolio.jsx`.

## Warna Brand

| Nama        | Kode     |
|-------------|----------|
| Navy Deep   | #0C1B33  |
| Navy Soft   | #162D47  |
| Mint Accent | #00D4A0  |
| White       | #FFFFFF  |

Font: **Sora** (dimuat otomatis lewat Next.js).
