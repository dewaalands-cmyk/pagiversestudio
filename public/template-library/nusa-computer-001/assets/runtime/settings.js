export const settings = {
  whatsapp: "",
  storeName: "NUSA Computer",
  demo: true,
};
export function setStoreSettings(next = {}) {
  settings.whatsapp =
    typeof next.whatsapp === "string" || typeof next.whatsapp === "number"
      ? String(next.whatsapp).slice(0, 32)
      : "";
  settings.storeName =
    typeof next.storeName === "string"
      ? next.storeName
          .replace(/[\r\n\u0000-\u001f]/g, " ")
          .trim()
          .slice(0, 70) || "NUSA Computer"
      : "NUSA Computer";
}

export const commerceTextFields = {
  "sections.products.ui.add": {
    type: "text",
    label: "Tombol tambah produk",
    maxLength: 24,
    default: "Tambah",
  },
  "sections.products.ui.detail": {
    type: "text",
    label: "Tautan detail produk",
    maxLength: 30,
    default: "Lihat detail",
  },
  "sections.products.ui.addToCart": {
    type: "text",
    label: "Tombol tambah ke keranjang",
    maxLength: 36,
    default: "Tambah ke keranjang",
  },
  "sections.products.ui.emptyHeading": {
    type: "text",
    label: "Judul hasil kosong",
    maxLength: 80,
    default: "Belum menemukan yang cocok.",
  },
  "sections.products.ui.emptyBody": {
    type: "textarea",
    label: "Pesan hasil kosong",
    maxLength: 160,
    default: "Coba kata kunci lain atau lihat semua kategori.",
  },
  "sections.products.ui.reset": {
    type: "text",
    label: "Tombol reset pencarian",
    maxLength: 30,
    default: "Reset pencarian",
  },
  "sections.products.ui.productUnit": {
    type: "text",
    label: "Label jumlah produk",
    maxLength: 20,
    default: "produk",
  },
  "sections.products.ui.demoNote": {
    type: "textarea",
    label: "Catatan harga detail produk",
    maxLength: 180,
    default: "Harga dan konfigurasi demo. Konfirmasi produk akhir dengan toko.",
  },
  "sections.products.ui.illustrationNote": {
    type: "text",
    label: "Catatan gambar ilustrasi",
    maxLength: 100,
    default: "Gambar merupakan ilustrasi visual.",
  },
  "sections.about.cart.eyebrow": {
    type: "text",
    label: "Eyebrow keranjang",
    maxLength: 40,
    default: "Pilihanmu",
  },
  "sections.about.cart.heading": {
    type: "text",
    label: "Judul keranjang",
    maxLength: 60,
    default: "Keranjang",
  },
  "sections.about.cart.description": {
    type: "textarea",
    label: "Deskripsi keranjang",
    maxLength: 160,
    default: "Atur pilihan, lalu simpan ringkasan pesananmu.",
  },
  "sections.about.cart.emptyHeading": {
    type: "text",
    label: "Judul keranjang kosong",
    maxLength: 80,
    default: "Mulai dari yang kamu butuhkan.",
  },
  "sections.about.cart.emptyBody": {
    type: "textarea",
    label: "Pesan keranjang kosong",
    maxLength: 160,
    default: "Produk dan komponen pilihanmu akan tersimpan di sini.",
  },
  "sections.about.cart.explore": {
    type: "text",
    label: "Tombol lanjut jelajah",
    maxLength: 30,
    default: "Lanjut jelajah",
  },
  "sections.about.cart.remove": {
    type: "text",
    label: "Tombol hapus barang",
    maxLength: 24,
    default: "Hapus",
  },
  "sections.about.cart.clear": {
    type: "text",
    label: "Tombol kosongkan keranjang",
    maxLength: 36,
    default: "Kosongkan keranjang",
  },
  "sections.about.cart.subtotal": {
    type: "text",
    label: "Label subtotal",
    maxLength: 24,
    default: "Subtotal",
  },
  "sections.about.cart.priceNote": {
    type: "textarea",
    label: "Catatan harga keranjang",
    maxLength: 180,
    default: "Harga demo. Ongkir dan ketersediaan akan dikonfirmasi toko.",
  },
  "sections.about.cart.shopperName": {
    type: "text",
    label: "Label nama pembeli",
    maxLength: 40,
    default: "Nama kamu",
  },
  "sections.about.cart.optional": {
    type: "text",
    label: "Label opsional",
    maxLength: 24,
    default: "opsional",
  },
  "sections.about.cart.namePlaceholder": {
    type: "text",
    label: "Placeholder nama pembeli",
    maxLength: 50,
    default: "Nama untuk ringkasan",
  },
  "sections.about.cart.summary": {
    type: "text",
    label: "Label ringkasan",
    maxLength: 40,
    default: "Ringkasan pesanan",
  },
  "sections.about.cart.whatsapp": {
    type: "text",
    label: "Tombol WhatsApp",
    maxLength: 40,
    default: "Lanjut ke WhatsApp",
  },
  "sections.about.cart.copy": {
    type: "text",
    label: "Tombol salin pesanan",
    maxLength: 30,
    default: "Salin pesanan",
  },
  "sections.about.cart.download": {
    type: "text",
    label: "Tombol unduh pesanan",
    maxLength: 30,
    default: "Unduh .txt",
  },
  "sections.about.cart.summaryPrefix": {
    type: "text",
    label: "Awalan judul pesanan",
    maxLength: 30,
    default: "PESANAN",
  },
  "sections.about.cart.summaryNote": {
    type: "textarea",
    label: "Catatan ringkasan pesanan",
    maxLength: 220,
    default:
      "Harga demo. Ongkir, ketersediaan, dan konfigurasi akhir perlu dikonfirmasi dengan toko.",
  },
  "sections.about.builder.eyebrow": {
    type: "text",
    label: "Eyebrow perakit PC",
    maxLength: 70,
    default: "Dari komponen menjadi kemungkinan.",
  },
  "sections.about.builder.heading": {
    type: "text",
    label: "Judul perakit PC",
    maxLength: 70,
    default: "Rakit PC versimu.",
  },
  "sections.about.builder.description": {
    type: "textarea",
    label: "Deskripsi perakit PC",
    maxLength: 180,
    default: "Mulai dari kebutuhanmu. Kami bantu memeriksa kecocokan dasarnya.",
  },
  "sections.about.builder.officePreset": {
    type: "text",
    label: "Label paket kerja",
    maxLength: 40,
    default: "Paket kerja harian",
  },
  "sections.about.builder.gamingPreset": {
    type: "text",
    label: "Label paket gaming",
    maxLength: 40,
    default: "Paket gaming",
  },
  "sections.about.builder.summaryHeading": {
    type: "text",
    label: "Judul ringkasan rakitan",
    maxLength: 50,
    default: "Rakitan pilihanmu",
  },
  "sections.about.builder.priceNote": {
    type: "text",
    label: "Catatan total rakitan",
    maxLength: 80,
    default: "Total komponen pilihan · harga demo",
  },
  "sections.about.builder.add": {
    type: "text",
    label: "Tombol tambah rakitan",
    maxLength: 45,
    default: "Tambah rakitan ke keranjang",
  },
  "sections.about.builder.reset": {
    type: "text",
    label: "Tombol mulai ulang rakitan",
    maxLength: 30,
    default: "Mulai ulang",
  },
  "sections.about.builder.cartNote": {
    type: "textarea",
    label: "Catatan penambahan rakitan",
    maxLength: 220,
    default:
      "Komponen ditambahkan satu per satu. Pilihan yang sudah ada di keranjang akan bertambah jumlahnya.",
  },
};
