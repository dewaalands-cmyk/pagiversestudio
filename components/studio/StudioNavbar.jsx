"use client";

import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Logo from "@/components/Logo";
import { useLang } from "@/components/LanguageProvider";

const NAV = {
  id: [
    ["#tentang", "Tentang"],
    ["#layanan", "Layanan"],
    ["#portfolio", "Portfolio"],
    ["/templates", "Template"],
    ["#kontak", "Kontak"],
  ],
  en: [
    ["#tentang", "About"],
    ["#layanan", "Services"],
    ["#portfolio", "Portfolio"],
    ["/templates", "Templates"],
    ["#kontak", "Contact"],
  ],
};

export default function StudioNavbar() {
  const [open, setOpen] = useState(false);
  const { lang, setLang } = useLang();
  const a11y = lang === "id"
    ? { skip: "Langsung ke konten", nav: "Navigasi utama", home: "Pagiverse Studio, kembali ke atas", language: "Pilih bahasa", menu: "Buka atau tutup menu" }
    : { skip: "Skip to content", nav: "Main navigation", home: "Pagiverse Studio, back to top", language: "Choose language", menu: "Open or close menu" };

  return (
    <header className="sticky top-0 z-50 border-b border-navy-deep/10 bg-[#f6f5f1]/90 backdrop-blur-xl">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-mint focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-navy-deep">
        {a11y.skip}
      </a>
      <nav className="studio-shell flex h-[76px] items-center justify-between" aria-label={a11y.nav}>
        <a href="#" aria-label={a11y.home}>
          <Logo />
        </a>

        <div className="hidden items-center gap-8 lg:flex">
          {NAV[lang].map(([href, label]) => (
            <a key={href} href={href} className="text-[13px] font-semibold text-navy-deep/65 transition-colors hover:text-navy-deep">
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center rounded-full border border-navy-deep/15 p-1 sm:flex" aria-label={a11y.language}>
            {["id", "en"].map((code) => (
              <button key={code} type="button" onClick={() => setLang(code)} className={`rounded-full px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider transition ${lang === code ? "bg-navy-deep text-white" : "text-navy-deep/55"}`}>
                {code}
              </button>
            ))}
          </div>
          <a href="#kontak" className="hidden items-center gap-2 rounded-full bg-navy-deep px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#173253] sm:inline-flex">
            {lang === "id" ? "Mulai proyek" : "Start a project"}
            <ArrowUpRight className="h-4 w-4" />
          </a>
          <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={a11y.menu} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-navy-deep/15 text-navy-deep lg:hidden">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-navy-deep/10 bg-[#f6f5f1] lg:hidden">
          <div className="studio-shell py-5">
            <div className="grid">
              {NAV[lang].map(([href, label]) => (
                <a key={href} href={href} onClick={() => setOpen(false)} className="border-b border-navy-deep/10 py-4 text-lg font-semibold text-navy-deep">
                  {label}
                </a>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between">
              <div className="flex gap-2">
                {["id", "en"].map((code) => (
                  <button key={code} type="button" onClick={() => setLang(code)} className={`rounded-full px-4 py-2 text-xs font-bold uppercase ${lang === code ? "bg-mint text-navy-deep" : "border border-navy-deep/15"}`}>
                    {code}
                  </button>
                ))}
              </div>
              <a href="#kontak" onClick={() => setOpen(false)} className="rounded-full bg-navy-deep px-5 py-2.5 text-sm font-bold text-white">
                {lang === "id" ? "Mulai proyek" : "Start a project"}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
