"use client";

import { useLang } from "./LanguageProvider";

const label = {
  id: "Dipercaya oleh",
  en: "Trusted by",
};

const fallbackKlien = ["Muay Thai School Garut", "Teman Deadline", "3GRT Management"];

export default function Clients({ clientNames = [] }) {
  const { lang } = useLang();

  const klien = clientNames.length > 0 ? clientNames : fallbackKlien;

  return (
    <section id="klien" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-center text-sm font-semibold uppercase tracking-wider text-slate-muted dark:text-slate-label">
        {label[lang]}
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
        {klien.map((k) => (
          <div
            key={k}
            className="rounded-xl border border-cloud-200 bg-white px-6 py-3 text-sm font-semibold text-navy-deep dark:border-white/10 dark:bg-navy-soft dark:text-cloud-100"
          >
            {k}
          </div>
        ))}
      </div>
    </section>
  );
}
