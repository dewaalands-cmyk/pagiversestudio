"use client";

import { Rocket, ShieldCheck, Smartphone, Search } from "lucide-react";
import { useLang } from "./LanguageProvider";

const defaultCards = [
  { title: "Cepat & Modern",   desc: "Dibangun dengan teknologi terkini (Next.js) agar website ringan dan enak diakses." },
  { title: "Rapi di HP",       desc: "Tampilan otomatis menyesuaikan di ponsel, tablet, maupun komputer." },
  { title: "Siap Ditemukan",   desc: "Dioptimasi dasar untuk SEO supaya lebih mudah muncul di pencarian Google." },
  { title: "Komunikasi Jelas", desc: "Proses transparan dari awal hingga tayang. Setiap revisi direspon cepat." },
];

const ikon = [Rocket, Smartphone, Search, ShieldCheck];

export default function About({ settings = {} }) {
  const { lang } = useLang();
  const isId = lang === "id";

  const label = (isId && settings.about_label)  || (isId ? "Tentang Kami" : "About Us");
  const judul = (isId && settings.about_title)  || (isId
    ? "Pagiverse: Partner digital untuk bisnis lokal yang serius"
    : "Pagiverse: Digital partner for serious local businesses");
  const p1 = (isId && settings.about_p1) || (isId
    ? "Pagiverse Studio membangun website dan aplikasi untuk bisnis yang siap berkembang di era digital. Kami tidak buat template generic — setiap project custom, dirancang khusus untuk kebutuhan dan target market kamu."
    : "Pagiverse Studio builds websites and apps for businesses ready to grow in the digital era. We don't do generic templates — every project is custom, designed specifically for your needs and target market.");
  const p2 = (isId && settings.about_p2) || (isId
    ? "Hasil kami deliver tiga hal yang matter: design yang distinctive (bukan copy-paste, tapi custom sesuai brand kamu), performance yang fast (pengunjung tidak bosan, website ringan dan cepat), dan presence yang strong (SEO-optimized, mudah ditemukan di Google)."
    : "We deliver three things that matter: distinctive design (not copy-paste, but custom to your brand), fast performance (visitors stay engaged, site loads quickly), and strong presence (SEO-optimized, easy to find on Google).");
  const p3 = (isId && settings.about_p3) || (isId
    ? "Setiap project dikerjakan langsung, dikomunikasikan transparan, dan didukung dengan support responsif. Kamu fokus ke bisnis, kami urus digital-nya dengan serius."
    : "Every project is handled directly, communicated transparently, and backed by responsive support. You focus on your business, we handle the digital side seriously.");

  let cards = defaultCards;
  if (isId && settings.about_cards) {
    try { cards = JSON.parse(settings.about_cards); } catch {}
  }

  return (
    <section id="tentang" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid items-start gap-12 lg:grid-cols-2">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wider text-teal-700 dark:text-mint">
            {label}
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-deep dark:text-white md:text-4xl">
            {judul}
          </h2>
          <p className="mt-5 leading-relaxed text-slate-muted dark:text-slate-label">{p1}</p>
          <p className="mt-4 leading-relaxed text-slate-muted dark:text-slate-label">{p2}</p>
          <p className="mt-4 leading-relaxed text-slate-muted dark:text-slate-label">{p3}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((p, i) => {
            const Icon = ikon[i % ikon.length];
            return (
              <div
                key={i}
                className="rounded-2xl border border-cloud-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-navy-soft"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint/10 text-teal-700 dark:text-mint">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-navy-deep dark:text-white">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-muted dark:text-slate-label">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
