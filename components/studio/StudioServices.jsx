"use client";

import { ArrowUpRight, LayoutTemplate, RefreshCw, Search, Store, WalletCards } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";
import Reveal from "@/components/Reveal";

const DEFAULT_ITEMS = {
  id: [
    { title: "Website Company Profile", desc: "Profil resmi bisnis, organisasi, atau event yang jelas, kredibel, dan mudah dihubungi." },
    { title: "Landing Page & Website UMKM", desc: "Halaman penjualan yang fokus pada satu tujuan dan mengarahkan calon pembeli untuk bertindak." },
    { title: "SEO & Optimasi", desc: "Struktur, metadata, dan performa yang membantu website ditemukan dan terasa cepat." },
    { title: "Redesign & Maintenance", desc: "Penyegaran website lama serta perawatan rutin agar tetap relevan dan aman." },
    { title: "Sistem Kasir, Stok & Keuangan", desc: "Web app operasional untuk mencatat transaksi, persediaan, dan laporan dengan lebih rapi." },
  ],
  en: [
    { title: "Company Profile Website", desc: "A clear, credible official website for a business, organization, or event." },
    { title: "Landing Pages & Small Business Websites", desc: "A focused sales page that guides prospective customers toward one clear action." },
    { title: "SEO & Optimization", desc: "Structure, metadata, and performance improvements that help your website rank and load quickly." },
    { title: "Redesign & Maintenance", desc: "A refreshed website plus ongoing care to keep it relevant, secure, and up to date." },
    { title: "Point of Sale, Inventory & Finance Systems", desc: "Operational web apps that organize transactions, inventory, and financial reporting." },
  ],
};

const ICONS = [LayoutTemplate, Store, Search, RefreshCw, WalletCards];

export default function StudioServices({ settings = {} }) {
  const { lang } = useLang();
  const isId = lang === "id";
  let items = DEFAULT_ITEMS[lang];
  if (isId && settings.services_items) {
    try { items = JSON.parse(settings.services_items); } catch {}
  }

  const copy = isId
    ? {
        kicker: settings.services_label || "Layanan",
        title: settings.services_title || "Dari identitas digital sampai sistem kerja.",
        body: settings.services_subtitle || "Pilih kebutuhan yang paling dekat dengan tahap bisnismu. Lingkup final disusun bersama setelah konsultasi.",
        cta: "Bahas kebutuhan",
      }
    : {
        kicker: "Services",
        title: "From digital presence to working systems.",
        body: "Choose what best fits your business stage. We will shape the final scope together after consultation.",
        cta: "Discuss your needs",
      };

  return (
    <section id="layanan" className="border-y studio-rule bg-white/55">
      <div className="studio-shell grid gap-14 py-24 md:py-32 lg:grid-cols-[.72fr_1.28fr] lg:gap-24">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <p className="studio-kicker">{copy.kicker}</p>
          <h2 className="mt-7 max-w-[12ch] text-balance text-4xl font-extrabold leading-[1.04] tracking-[-.05em] text-navy-deep sm:text-5xl">
            {copy.title}
          </h2>
          <p className="mt-6 max-w-[40ch] text-sm leading-7 text-navy-deep/55">{copy.body}</p>
          <a href="#kontak" className="mt-8 inline-flex items-center gap-2 rounded-full border border-navy-deep/20 px-5 py-3 text-sm font-bold text-navy-deep transition hover:border-mint">
            {copy.cta} <ArrowUpRight className="h-4 w-4" />
          </a>
        </Reveal>

        <div className="border-t studio-rule">
          {items.map((item, index) => {
            const Icon = ICONS[index % ICONS.length];
            return (
              <Reveal key={item.title || index} delay={index * 55} className="group grid gap-5 border-b py-8 studio-rule sm:grid-cols-[auto_1fr_auto] sm:items-start">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-deep text-mint">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-[-.025em] text-navy-deep sm:text-2xl">{item.title}</h3>
                  <p className="mt-2 max-w-[56ch] text-sm leading-7 text-navy-deep/55">{item.desc}</p>
                </div>
                <ArrowUpRight className="mt-1 hidden h-5 w-5 text-navy-deep/25 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-teal-700 sm:block" />
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
