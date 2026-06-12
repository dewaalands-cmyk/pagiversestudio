"use client";

import { Instagram } from "lucide-react";
import Logo from "./Logo";
import { INSTAGRAM_URL } from "./site-config";
import { useLang } from "./LanguageProvider";

const konten = {
  id: {
    tagline: "Studio website & aplikasi profesional • Garut, Indonesia",
    hak: "Semua hak cipta dilindungi.",
  },
  en: {
    tagline: "Professional website & app studio • Garut, Indonesia",
    hak: "All rights reserved.",
  },
};

export default function Footer() {
  const tahun = new Date().getFullYear();
  const { lang } = useLang();
  const t = konten[lang];

  return (
    <footer className="border-t border-cloud-200/70 bg-cloud-100/50 dark:border-white/10 dark:bg-navy-soft/30">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 py-10 sm:px-6 md:flex-row lg:px-8">
        <div className="flex flex-col items-center gap-3 md:items-start">
          <Logo />
          <p className="text-sm text-slate-muted dark:text-slate-label">{t.tagline}</p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram Pagiverse Studio"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white transition-transform hover:-translate-y-0.5"
          >
            <Instagram className="h-5 w-5" />
          </a>
        </div>
      </div>

      <div className="border-t border-cloud-200/70 py-5 text-center text-xs text-slate-muted dark:border-white/10 dark:text-slate-label">
        © {tahun} Pagiverse Studio. {t.hak}
      </div>
    </footer>
  );
}
