"use client";

import Link from "next/link";
import { ArrowLeft, Menu, X } from "lucide-react";
import { useState } from "react";
import Logo from "@/components/Logo";
import { useLang } from "@/components/LanguageProvider";

export default function MarketplaceHeader({ backHref = "/", backLabel }) {
  const [open, setOpen] = useState(false);
  const { lang, setLang } = useLang();
  const t = lang === "id"
    ? { home: "Beranda", templates: "Template", process: "Cara kerja", contact: "Konsultasi", menu: "Buka menu", back: "Kembali" }
    : { home: "Home", templates: "Templates", process: "How it works", contact: "Consult", menu: "Open menu", back: "Back" };

  return (
    <header className="sticky top-0 z-50 border-b border-navy-deep/10 bg-[#f6f5f1]/92 backdrop-blur-xl">
      <div className="studio-shell flex h-[72px] items-center justify-between">
        <div className="flex items-center gap-5">
          <Link href="/" aria-label="Pagiverse Studio"><Logo /></Link>
          {backHref && (
            <Link href={backHref} className="hidden items-center gap-1.5 border-l border-navy-deep/15 pl-5 text-xs font-bold text-navy-deep/55 transition hover:text-navy-deep md:flex">
              <ArrowLeft className="h-3.5 w-3.5" />{backLabel || t.back}
            </Link>
          )}
        </div>

        <nav className="hidden items-center gap-7 lg:flex">
          <Link href="/" className="text-xs font-bold text-navy-deep/58 hover:text-navy-deep">{t.home}</Link>
          <Link href="/templates" className="text-xs font-bold text-navy-deep">{t.templates}</Link>
          <Link href="/templates#cara-kerja" className="text-xs font-bold text-navy-deep/58 hover:text-navy-deep">{t.process}</Link>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center rounded-full border border-navy-deep/15 p-1 sm:flex">
            {["id", "en"].map((code) => (
              <button key={code} type="button" onClick={() => setLang(code)} className={`rounded-full px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider ${lang === code ? "bg-navy-deep text-white" : "text-navy-deep/50"}`}>{code}</button>
            ))}
          </div>
          <Link href="/#kontak" className="hidden rounded-full bg-navy-deep px-4 py-2.5 text-xs font-extrabold text-white sm:inline-flex">{t.contact}</Link>
          <button type="button" aria-label={t.menu} aria-expanded={open} onClick={() => setOpen(!open)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-navy-deep/15 lg:hidden">
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-navy-deep/10 bg-[#f6f5f1] px-4 py-4 lg:hidden">
          <div className="studio-shell grid gap-1">
            <Link href="/" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm font-bold hover:bg-white">{t.home}</Link>
            <Link href="/templates" onClick={() => setOpen(false)} className="rounded-xl bg-white px-3 py-3 text-sm font-bold">{t.templates}</Link>
            <Link href="/templates#cara-kerja" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm font-bold hover:bg-white">{t.process}</Link>
            <div className="mt-3 flex gap-2 sm:hidden">{["id", "en"].map((code) => <button key={code} type="button" onClick={() => setLang(code)} className={`rounded-full px-4 py-2 text-xs font-extrabold uppercase ${lang === code ? "bg-navy-deep text-white" : "border border-navy-deep/15"}`}>{code}</button>)}</div>
          </div>
        </nav>
      )}
    </header>
  );
}
