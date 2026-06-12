"use client";

import { Quote, Star } from "lucide-react";
import { useLang } from "./LanguageProvider";

const konten = {
  id: { label: "Testimoni", judul: "Apa kata klien kami" },
  en: { label: "Testimonials", judul: "What our clients say" },
};

const fallbackTestimoni = [
  {
    nama: "Coach Yunas",
    jabatan: "Owner Muay Thai School Garut & 3GRT Management",
    isi: "Pagiverse Studio mengerjakan dua website kami, Muay Thai School Garut dan 3GRT Management, dari nol. Komunikasinya enak, setiap revisi direspon cepat, dan hasilnya jauh lebih rapi dari yang saya bayangkan.",
    rating: 5,
  },
  {
    nama: "Cahya",
    jabatan: "Owner Teman Deadline",
    isi: "Awalnya saya cuma butuh website sederhana untuk Teman Deadline, tapi yang saya dapat jauh lebih dari itu. Prosesnya cepat, tepat waktu, dan tampilannya bikin usaha saya terlihat lebih kredibel di mata klien.",
    rating: 5,
  },
];

function inisial(nama) {
  return nama.split(" ").map((k) => k[0]).slice(0, 2).join("").toUpperCase();
}

export default function Testimonials({ dbItems = [] }) {
  const { lang } = useLang();
  const t = konten[lang];

  const items = dbItems.length > 0
    ? dbItems.map((item) => ({
        nama: item.client_name,
        jabatan: item.client_company ?? "",
        isi: item.content,
        rating: item.rating ?? 0,
      }))
    : fallbackTestimoni;

  return (
    <section className="border-y border-cloud-200/70 bg-white/60 dark:border-white/10 dark:bg-navy-soft/30">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-teal-700 dark:text-mint">
            {t.label}
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-deep dark:text-white md:text-4xl">
            {t.judul}
          </h2>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
          {items.map((item, i) => (
            <figure
              key={i}
              className="flex flex-col rounded-2xl border border-cloud-200 bg-white p-7 dark:border-white/10 dark:bg-navy-soft"
            >
              <div className="flex items-start justify-between gap-3">
                <Quote className="h-7 w-7 shrink-0 text-teal-600 dark:text-mint" />
                {item.rating > 0 && (
                  <div className="flex gap-0.5 shrink-0">
                    {Array.from({ length: Math.min(item.rating, 5) }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                )}
              </div>
              <blockquote className="mt-4 flex-1 leading-relaxed text-navy-deep/90 dark:text-cloud-100">
                "{item.isi}"
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-cloud-200 pt-5 dark:border-white/10">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-deep text-sm font-bold text-mint dark:bg-white/5">
                  {inisial(item.nama)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-navy-deep dark:text-white">{item.nama}</div>
                  {item.jabatan && (
                    <div className="text-xs text-slate-muted dark:text-slate-label">{item.jabatan}</div>
                  )}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
