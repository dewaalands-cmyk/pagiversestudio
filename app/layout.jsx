// Kerangka utama seluruh halaman.
// Di sini kita pasang: font Sora, info SEO, dan pengatur tema gelap/terang.

import "./globals.css";
import { Sora } from "next/font/google";
import ThemeProvider from "@/components/ThemeProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import AnalyticsProvider from "@/components/AnalyticsProvider";

// Font Sora dimuat otomatis & dioptimasi oleh Next.js (anti layout shift).
const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

// Info SEO yang muncul di tab browser & hasil pencarian Google.
export const metadata = {
  title: "Pagiverse Studio — Jasa Pembuatan Website Profesional di Garut",
  description:
    "Pagiverse Studio membantu UMKM dan brand lokal punya website yang cepat, rapi, dan mudah ditemukan di Google. Konsultasi gratis via WhatsApp.",
  keywords: [
    "jasa pembuatan website",
    "web developer Garut",
    "website company profile",
    "landing page UMKM",
    "Pagiverse Studio",
  ],
  openGraph: {
    title: "Pagiverse Studio — Jasa Pembuatan Website Profesional",
    description:
      "Website cepat, rapi, dan siap ditemukan di Google untuk bisnismu.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning diperlukan agar toggle tema tidak memunculkan warning.
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${sora.className} bg-cloud-50 text-navy-deep antialiased dark:bg-navy-deep dark:text-cloud-100`}
      >
        <ThemeProvider>
          <AnalyticsProvider>
            <LanguageProvider>{children}</LanguageProvider>
          </AnalyticsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
