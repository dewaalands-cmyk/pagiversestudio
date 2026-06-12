"use client";

import { useState } from "react";
import { Menu, X, MessageCircle } from "lucide-react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { WHATSAPP_URL } from "./site-config";
import { useLang } from "./LanguageProvider";

const navLinks = {
  id: [
    { href: "#tentang",   label: "Tentang" },
    { href: "#layanan",   label: "Layanan" },
    { href: "#portfolio", label: "Portfolio" },
    { href: "#klien",     label: "Klien" },
    { href: "#harga",     label: "Harga" },
    { href: "#kontak",    label: "Kontak" },
  ],
  en: [
    { href: "#tentang",   label: "About" },
    { href: "#layanan",   label: "Services" },
    { href: "#portfolio", label: "Portfolio" },
    { href: "#klien",     label: "Clients" },
    { href: "#harga",     label: "Pricing" },
    { href: "#kontak",    label: "Contact" },
  ],
};

const ctaLabel = { id: "Konsultasi", en: "Consult" };
const ctaMobile = { id: "Konsultasi via WhatsApp", en: "Consult via WhatsApp" };

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { lang, setLang } = useLang();

  const links = navLinks[lang];

  return (
    <header className="sticky top-0 z-50 border-b border-cloud-200/70 bg-cloud-50/80 backdrop-blur dark:border-white/10 dark:bg-navy-deep/80">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <a href="#" className="flex items-center" aria-label="Pagiverse Studio">
          <Logo />
        </a>

        {/* Menu untuk layar lebar */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-slate-muted transition-colors hover:text-navy-deep dark:text-slate-label dark:hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <div className="flex overflow-hidden rounded-lg border border-cloud-200 dark:border-white/20">
            <button
              onClick={() => setLang("id")}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                lang === "id"
                  ? "bg-mint text-navy-deep"
                  : "text-slate-muted hover:text-navy-deep dark:text-slate-label dark:hover:text-white"
              }`}
            >
              ID
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                lang === "en"
                  ? "bg-mint text-navy-deep"
                  : "text-slate-muted hover:text-navy-deep dark:text-slate-label dark:hover:text-white"
              }`}
            >
              EN
            </button>
          </div>

          <ThemeToggle />

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-lg bg-mint px-4 py-2 text-sm font-semibold text-navy-deep transition-transform hover:-translate-y-0.5 sm:inline-flex"
          >
            <MessageCircle className="h-4 w-4" /> {ctaLabel[lang]}
          </a>

          {/* Tombol menu untuk HP */}
          <button
            onClick={() => setOpen(!open)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-cloud-200 text-navy-deep dark:border-white/10 dark:text-white md:hidden"
            aria-label="Buka atau tutup menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Menu versi HP */}
      {open && (
        <div className="space-y-1 border-t border-cloud-200/70 px-4 py-3 dark:border-white/10 md:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-md px-2 py-2 text-sm text-navy-deep hover:bg-cloud-100 dark:text-cloud-100 dark:hover:bg-white/5"
            >
              {l.label}
            </a>
          ))}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block rounded-lg bg-mint px-3 py-2 text-center text-sm font-semibold text-navy-deep"
          >
            {ctaMobile[lang]}
          </a>
        </div>
      )}
    </header>
  );
}
