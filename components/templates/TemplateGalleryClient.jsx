"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";
import MarketplaceHeader from "@/components/templates/MarketplaceHeader";

export default function TemplateGalleryClient() {
  const { lang } = useLang();
  const copy = lang === "id"
    ? {
        eyebrow: "Katalog template",
        title: "Template asli sedang kami siapkan.",
        body: "Katalog akan diisi setelah setiap template siap dipreview, disesuaikan, dan digunakan melalui Pagiverse Studio.",
        status: "Belum ada template yang dipublikasikan.",
        contact: "Konsultasikan kebutuhanmu",
        processEyebrow: "Nanti di sini",
        processTitle: "Pilih, sesuaikan, lalu lihat hasilnya langsung.",
        processBody: "Saat template pertama tersedia, kamu dapat membuka preview, mengganti konten bisnis, dan meninjau hasilnya sebelum melanjutkan.",
      }
    : {
        eyebrow: "Template catalog",
        title: "Our real templates are being prepared.",
        body: "The catalog will open once each template is ready to preview, personalize, and use in Pagiverse Studio.",
        status: "No templates have been published yet.",
        contact: "Discuss your website",
        processEyebrow: "Coming here",
        processTitle: "Choose, personalize, and preview the result live.",
        processBody: "When the first template is available, you can open its preview, update your business content, and review the result before continuing.",
      };

  return (
    <main className="min-h-[100dvh] bg-[#f6f5f1] text-navy-deep">
      <MarketplaceHeader backHref="/" />

      <section id="koleksi" className="studio-shell py-20 sm:py-28 lg:py-32">
        <div className="grid gap-12 border-y border-navy-deep/12 py-12 sm:py-16 lg:grid-cols-[1fr_.58fr] lg:items-end lg:py-20">
          <div>
            <p className="studio-kicker">{copy.eyebrow}</p>
            <h1 className="mt-6 max-w-[12ch] text-balance text-5xl font-extrabold leading-[.98] tracking-[-.06em] sm:text-6xl lg:text-7xl">
              {copy.title}
            </h1>
          </div>
          <div className="lg:pb-1">
            <p className="max-w-[52ch] text-sm leading-7 text-navy-deep/58 sm:text-base">
              {copy.body}
            </p>
            <p className="mt-7 border-l-2 border-teal-700 pl-4 text-sm font-extrabold">
              {copy.status}
            </p>
            <Link
              href="/#kontak"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-navy-deep px-5 py-3 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#173253] active:translate-y-0"
            >
              {copy.contact}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section id="cara-kerja" className="border-t border-navy-deep/12 bg-white/55">
        <div className="studio-shell py-20 sm:py-24">
          <p className="studio-kicker">{copy.processEyebrow}</p>
          <h2 className="mt-6 max-w-[16ch] text-3xl font-extrabold leading-[1.04] tracking-[-.045em] sm:text-4xl">
            {copy.processTitle}
          </h2>
          <p className="mt-6 max-w-[62ch] text-sm leading-7 text-navy-deep/58 sm:text-base">
            {copy.processBody}
          </p>
        </div>
      </section>
    </main>
  );
}
