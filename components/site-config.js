// ──────────────────────────────────────────────────────────────
// PUSAT KONTAK & LINK PAGIVERSE STUDIO
// Cukup ubah di file ini saja — semua tombol (Navbar, Kontak, Footer)
// otomatis ikut berubah.
// ──────────────────────────────────────────────────────────────

// Nomor WhatsApp dalam format internasional: tanpa "+" dan tanpa "0" di depan.
// Contoh: nomor 0895-0283-9893 ditulis menjadi 6289502839893
export const WHATSAPP_NUMBER = "6289502839893";

// Pesan yang otomatis terisi saat calon klien membuka chat WhatsApp.
export const WHATSAPP_TEXT =
  "Halo Pagiverse Studio, saya tertarik untuk membuat website. Boleh konsultasi dulu?";

// Link WhatsApp siap klik (jangan diubah — terbentuk otomatis dari dua data di atas).
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_TEXT
)}`;

// Instagram
export const INSTAGRAM_HANDLE = "@pagiversestudio";
export const INSTAGRAM_URL = "https://www.instagram.com/pagiversestudio/";
