"use client";

import { useLang } from "./LanguageProvider";

const defaults = {
  badge: "Web & App Developer • Garut, Indonesia",
  h1: "Solusi Digital yang Bikin Bisnismu Terlihat",
  h1_accent: "Profesional",
  h1_end: "& Dipercaya",
  desc: "Pagiverse Studio bantu UMKM dan brand lokal punya website dan aplikasi yang cepat, rapi, dan siap pakai — tanpa pusing mengurus teknisnya. Kamu fokus ke bisnis, urusan digitalnya biar kami yang rapikan.",
  tagline: "Sudah dipercaya bisnis lokal, UMKM & event organizer • Respons cepat • Tanpa ribet",
};

const en_defaults = {
  badge: "Web & App Developer • Garut, Indonesia",
  h1: "Digital Solutions That Make Your Business Look",
  h1_accent: "Professional",
  h1_end: "& Trusted",
  desc: "Pagiverse Studio helps local businesses and brands have a fast, clean, and ready-to-use website and app — without worrying about the technical side. You focus on your business, we handle the digital.",
  tagline: "Trusted by local businesses, SMEs & event organizers • Fast response • Hassle-free",
};

export default function Hero({ settings = {} }) {
  const { lang } = useLang();
  const isId = lang === "id";

  const s = (key) => (isId ? settings[`hero_${key}`] : null);

  const badge    = s("badge")    ?? (isId ? defaults.badge    : en_defaults.badge);
  const h1       = s("h1")       ?? (isId ? defaults.h1       : en_defaults.h1);
  const h1_accent= s("h1_accent")?? (isId ? defaults.h1_accent: en_defaults.h1_accent);
  const h1_end   = s("h1_end")   ?? (isId ? defaults.h1_end   : en_defaults.h1_end);
  const desc     = s("desc")     ?? (isId ? defaults.desc     : en_defaults.desc);
  const tagline  = s("tagline")  ?? (isId ? defaults.tagline  : en_defaults.tagline);

  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 grid-pattern [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/10 px-3 py-1 text-xs font-semibold text-teal-700 dark:text-mint">
            <span className="h-1.5 w-1.5 rounded-full bg-mint" />
            {badge}
          </span>

          <h1 className="mt-6 animate-fade-up text-4xl font-extrabold leading-tight tracking-tight text-navy-deep dark:text-white md:text-5xl lg:text-6xl">
            {h1}{" "}
            <span className="text-teal-600 dark:text-mint">{h1_accent}</span>{" "}
            {h1_end}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-muted dark:text-slate-label">
            {desc}
          </p>

          <p className="mt-8 text-sm text-slate-muted dark:text-slate-label">
            {tagline}
          </p>
        </div>
      </div>
    </section>
  );
}
