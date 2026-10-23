"use client";

import { ArrowUpRight, Instagram } from "lucide-react";
import { focusProjectForm } from "./project-form";
import Logo from "@/components/Logo";
import { useLang } from "@/components/LanguageProvider";
import { INSTAGRAM_URL } from "@/components/site-config";

export default function StudioFooter() {
  const { lang } = useLang();
  const year = new Date().getFullYear();
  const t = lang === "id"
    ? { tagline: "Dari template pilihan, jadi website dengan ceritamu sendiri.", nav: ["Tentang", "Template", "Portfolio", "Kontak"], consult: "Isi formulir proyek", rights: "Semua hak cipta dilindungi.", navigation: "Navigasi footer" }
    : { tagline: "From a template you love to a website that tells your story.", nav: ["About", "Templates", "Portfolio", "Contact"], consult: "Fill in the project form", rights: "All rights reserved.", navigation: "Footer navigation" };

  return (
    <footer className="pg-footer bg-[#f4f5f3] text-navy-deep">
      <div className="pg-footer__main studio-shell grid gap-12 border-t border-navy-deep/15 py-14 md:grid-cols-[1.35fr_.7fr_.95fr]">
        <div>
          <Logo />
          <p className="mt-6 max-w-[34ch] text-sm leading-7 text-navy-deep/65">{t.tagline}</p>
        </div>
        <nav aria-label={t.navigation} className="grid content-start gap-3 text-sm font-medium">
          {["#tentang", "#template", "#portfolio", "#kontak"].map((href, index) => <a key={href} href={href} className="w-fit text-navy-deep/65 transition hover:text-teal-700">{t.nav[index]}</a>)}
        </nav>
        <div className="flex flex-wrap items-start gap-3 md:justify-end">
          <a href="#form-proyek" onClick={focusProjectForm} className="inline-flex items-center gap-5 rounded-lg bg-navy-deep px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173253]">{t.consult}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram Pagiverse Studio" className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-navy-deep/20 text-navy-deep transition hover:border-mint"><Instagram className="h-5 w-5" aria-hidden="true" /></a>
        </div>
      </div>
      <div className="pg-footer__bottom studio-shell flex flex-col gap-2 border-t border-navy-deep/15 py-5 text-xs text-navy-deep/60 sm:flex-row sm:items-center sm:justify-between">
        <span>© {year} Pagiverse Studio.</span><span>{t.rights}</span>
      </div>
    </footer>
  );
}
