"use client";

import { LayoutTemplate, Store, Search, RefreshCw, Receipt } from "lucide-react";
import { useLang } from "./LanguageProvider";

const defaultItems = [
  { title: "Website Company Profile", desc: "Halaman profil resmi untuk bisnis, organisasi, atau event — lengkap dengan layanan, portofolio, dan kontak." },
  { title: "Landing Page & Website UMKM", desc: "Satu halaman fokus untuk promosi produk. Ringkas, meyakinkan, dan mengarahkan calon pembeli untuk menghubungimu." },
  { title: "SEO & Optimasi", desc: "Pemasangan SEO dasar, meta tag, dan struktur rapi agar website lebih mudah ditemukan di Google." },
  { title: "Redesign & Maintenance", desc: "Punya website lama yang terlihat usang? Kami percantik ulang dan bantu rawat agar tetap update." },
  { title: "Sistem Kasir, Stok & Keuangan", desc: "Tidak perlu lagi mencatat manual atau khawatir stok tidak akurat. Sistem kami menangani kasir, persediaan, dan laporan keuangan secara otomatis sehingga kamu bisa fokus mengembangkan bisnis." },
];

const ikon = [LayoutTemplate, Store, Search, RefreshCw, Receipt];

export default function Services({ settings = {} }) {
  const { lang } = useLang();
  const isId = lang === "id";

  const label    = (isId && settings.services_label)    || (isId ? "Layanan" : "Services");
  const judul    = (isId && settings.services_title)    || (isId ? "Apa yang bisa kami bantu" : "How we can help");
  const subjudul = (isId && settings.services_subtitle) || (isId
    ? "Dari nol sampai jadi. Pilih yang paling sesuai dengan kebutuhan bisnismu sekarang."
    : "From scratch to launch. Choose what fits your current business needs.");

  let items = defaultItems;
  if (isId && settings.services_items) {
    try { items = JSON.parse(settings.services_items); } catch {}
  }

  return (
    <section
      id="layanan"
      className="border-y border-cloud-200/70 bg-white/60 dark:border-white/10 dark:bg-navy-soft/30"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-teal-700 dark:text-mint">
            {label}
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-deep dark:text-white md:text-4xl">
            {judul}
          </h2>
          <p className="mt-4 leading-relaxed text-slate-muted dark:text-slate-label">
            {subjudul}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((l, i) => {
            const Icon = ikon[i % ikon.length];
            return (
              <div
                key={i}
                className="group rounded-2xl border border-cloud-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-mint/40 hover:shadow-lg dark:border-white/10 dark:bg-navy-soft"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-deep text-mint transition-colors group-hover:bg-mint group-hover:text-navy-deep dark:bg-white/5">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-navy-deep dark:text-white">
                  {l.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-muted dark:text-slate-label">
                  {l.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
