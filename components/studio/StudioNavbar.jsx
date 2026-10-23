"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Logo from "@/components/Logo";
import { useLang } from "@/components/LanguageProvider";

const NAV = {
  id: [
    ["#tentang", "Tentang"],
    ["#template", "Template"],
    ["#portfolio", "Portfolio"],
    ["#kontak", "Kontak"],
  ],
  en: [
    ["#tentang", "About"],
    ["#template", "Templates"],
    ["#portfolio", "Portfolio"],
    ["#kontak", "Contact"],
  ],
};

export default function StudioNavbar() {
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const { lang, setLang } = useLang();
  const a11y = lang === "id"
    ? { skip: "Langsung ke konten", nav: "Navigasi utama", home: "Pagiverse Studio, kembali ke atas", language: "Pilih bahasa", openMenu: "Buka menu", closeMenu: "Tutup menu", editor: "Buka editor" }
    : { skip: "Skip to content", nav: "Main navigation", home: "Pagiverse Studio, back to top", language: "Choose language", openMenu: "Open menu", closeMenu: "Close menu", editor: "Open editor" };

  useEffect(() => {
    if (!open) return;
    function closeOnEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <header className="pg-nav sticky top-0 z-50 bg-[#f4f5f3]/90 backdrop-blur-xl">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-mint focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-navy-deep">
        {a11y.skip}
      </a>
      <nav className="pg-nav__shell studio-shell flex h-[84px] items-center justify-between gap-6" aria-label={a11y.nav}>
        <a href="#" onClick={() => setOpen(false)} aria-label={a11y.home} className="shrink-0">
          <Logo />
        </a>

        <div className="pg-nav__links hidden items-center gap-8 lg:flex">
          {NAV[lang].map(([href, label]) => (
            <a key={href} href={href} className="text-[13px] font-medium text-navy-deep/65 transition-colors hover:text-navy-deep">
              {label}
            </a>
          ))}
        </div>

        <div className="pg-nav__actions flex items-center gap-3">
          <div className="pg-nav__language hidden items-center gap-1 p-1 sm:flex" role="group" aria-label={a11y.language}>
            {["id", "en"].map((code) => (
              <button key={code} type="button" onClick={() => setLang(code)} aria-pressed={lang === code} className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${lang === code ? "bg-navy-deep text-white" : "text-navy-deep/55 hover:text-navy-deep"}`}>
                {code}
              </button>
            ))}
          </div>
          <a href="/templates" className="pg-nav__editor hidden items-center gap-6 rounded-lg bg-navy-deep px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173253] sm:inline-flex">
            {a11y.editor}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <button ref={menuButtonRef} type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="studio-mobile-navigation" aria-label={open ? a11y.closeMenu : a11y.openMenu} className="pg-nav__toggle inline-flex h-11 w-11 items-center justify-center rounded-full border border-navy-deep/15 bg-white text-navy-deep lg:hidden">
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {open && (
        <div id="studio-mobile-navigation" className="pg-nav__mobile border-t border-navy-deep/10 bg-[#f4f5f3] lg:hidden">
          <div className="studio-shell py-5">
            <div className="grid">
              {NAV[lang].map(([href, label]) => (
                <a key={href} href={href} onClick={() => setOpen(false)} className="border-b border-navy-deep/10 py-4 text-lg font-semibold text-navy-deep">
                  {label}
                </a>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between">
              <div className="flex gap-2" role="group" aria-label={a11y.language}>
                {["id", "en"].map((code) => (
                  <button key={code} type="button" onClick={() => setLang(code)} aria-pressed={lang === code} className={`rounded-lg px-4 py-2 text-xs font-bold uppercase ${lang === code ? "bg-mint text-navy-deep" : "border border-navy-deep/15 text-navy-deep"}`}>
                    {code}
                  </button>
                ))}
              </div>
              <a href="/templates" onClick={() => setOpen(false)} className="rounded-lg bg-navy-deep px-5 py-2.5 text-sm font-semibold text-white">
                {a11y.editor}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
