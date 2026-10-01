"use client";

import { ArrowUpRight, Instagram } from "lucide-react";
import Logo from "@/components/Logo";
import { useLang } from "@/components/LanguageProvider";
import { getLocalizedWhatsAppUrl, INSTAGRAM_URL } from "@/components/site-config";

export default function StudioFooter() {
  const { lang } = useLang();
  const year = new Date().getFullYear();
  const whatsappUrl = getLocalizedWhatsAppUrl(lang);
  const t = lang === "id"
    ? { tagline: "Website dan aplikasi yang membuat bisnis tampil matang dan dipercaya.", nav: ["Tentang", "Layanan", "Portfolio", "Template"], consult: "Konsultasi proyek", rights: "Semua hak cipta dilindungi." }
    : { tagline: "Websites and apps that help businesses look established and trusted.", nav: ["About", "Services", "Portfolio", "Templates"], consult: "Discuss a project", rights: "All rights reserved." };

  return (
    <footer className="bg-[#f6f5f1]">
      <div className="studio-shell grid gap-12 py-16 md:grid-cols-[1.35fr_.7fr_.95fr]">
        <div>
          <Logo />
          <p className="mt-6 max-w-[34ch] text-sm leading-7 text-navy-deep/52">{t.tagline}</p>
        </div>
        <nav className="grid content-start gap-3 text-sm font-semibold">
          {["#tentang", "#layanan", "#portfolio", "/templates"].map((href, index) => <a key={href} href={href} className="w-fit text-navy-deep/62 transition hover:text-teal-700">{t.nav[index]}</a>)}
        </nav>
        <div className="flex flex-wrap items-start gap-3 md:justify-end">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-navy-deep px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5">{t.consult}<ArrowUpRight className="h-4 w-4" /></a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram Pagiverse Studio" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-navy-deep/15 text-navy-deep transition hover:border-mint"><Instagram className="h-5 w-5" /></a>
        </div>
      </div>
      <div className="studio-shell flex flex-col gap-2 border-t py-5 text-xs text-navy-deep/42 studio-rule sm:flex-row sm:items-center sm:justify-between">
        <span>© {year} Pagiverse Studio.</span><span>{t.rights}</span>
      </div>
    </footer>
  );
}
