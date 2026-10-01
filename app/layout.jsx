// Kerangka utama seluruh halaman.
// Di sini kita pasang font, info SEO, analytics, dan pengatur bahasa.

import "./globals.css";
import { Manrope } from "next/font/google";
import ThemeProvider from "@/components/ThemeProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import AnalyticsProvider from "@/components/AnalyticsProvider";

// Font dimuat otomatis dan dioptimasi oleh Next.js.
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Info SEO yang muncul di tab browser & hasil pencarian Google.
export const metadata = {
  title: "Pagiverse Studio | Jasa Pembuatan Website Profesional di Garut",
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
    title: "Pagiverse Studio | Jasa Pembuatan Website Profesional",
    description:
      "Website cepat, rapi, dan siap ditemukan di Google untuk bisnismu.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${manrope.className} bg-[#f6f5f1] text-navy-deep antialiased`}
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
