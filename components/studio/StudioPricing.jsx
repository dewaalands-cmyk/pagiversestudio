"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";
import Reveal from "@/components/Reveal";

const PACKAGES = [
  {
    name: "STARTER", price: { id: "Rp 1 - 2 jt", en: "IDR 1-2M" },
    summary: { id: "Landing page dan website sederhana", en: "Landing page and simple website" },
    detail: { id: "1 halaman, 5 revisi, 1 bulan support", en: "1 page, 5 revisions, 1 month support" },
    features: { id: ["1 halaman custom", "Responsive design", "SEO dasar", "Contact form", "Domain gratis 1 tahun"], en: ["1 custom page", "Responsive design", "Basic SEO", "Contact form", "Free domain for 1 year"] },
  },
  {
    name: "PROFESSIONAL", price: { id: "Rp 2 - 3 jt", en: "IDR 2-3M" },
    summary: { id: "Company profile 3-5 halaman", en: "Company profile, 3-5 pages" },
    detail: { id: "3-5 halaman, 10 revisi, 3 bulan support", en: "3-5 pages, 10 revisions, 3 months support" },
    features: { id: ["3-5 halaman custom", "Galeri dan portfolio", "SEO dan Analytics", "Admin dashboard", "Training dokumentasi"], en: ["3-5 custom pages", "Gallery and portfolio", "SEO and Analytics", "Admin dashboard", "Training and documentation"] },
  },
  {
    name: "PREMIUM", price: { id: "Rp 3 - 4 jt", en: "IDR 3-4M" }, popular: true,
    summary: { id: "Website dengan SEO intensif dan blog", en: "Website with intensive SEO and blog" },
    detail: { id: "15 revisi, 6 bulan support, laporan bulanan", en: "15 revisions, 6 months support, monthly report" },
    features: { id: ["Semua dari Professional", "Blog CMS", "Strategi SEO lengkap", "Optimasi kecepatan", "Laporan SEO bulanan"], en: ["Everything in Professional", "Blog CMS", "Full SEO strategy", "Speed optimization", "Monthly SEO report"] },
  },
  {
    name: "ULTIMATE", price: { id: "Hubungi Kami", en: "Contact us" },
    summary: { id: "Website dan web app custom", en: "Custom website and web app" },
    detail: { id: "Unlimited revisi, 6 bulan support, konsultasi", en: "Unlimited revisions, 6 months support, consultation" },
    features: { id: ["Semua dari Premium", "Integrasi web app", "Database dan autentikasi", "Payment gateway opsional", "Analytics lanjutan"], en: ["Everything in Premium", "Web app integration", "Database and authentication", "Optional payment gateway", "Advanced analytics"] },
  },
  {
    name: "WEB APP", price: { id: "Rp 2 - 4 jt", en: "IDR 2-4M" },
    summary: { id: "Aplikasi web standalone", en: "Standalone web application" },
    detail: { id: "10 revisi, 3 bulan support, bisa offline", en: "10 revisions, 3 months support, offline capable" },
    features: { id: ["Custom web app", "Database dan autentikasi", "Admin dashboard", "Offline capability", "Auto backup"], en: ["Custom web app", "Database and authentication", "Admin dashboard", "Offline capability", "Auto backup"] },
  },
  {
    name: "MAINTENANCE", price: { id: "Rp 500k - 1.5 jt", en: "IDR 500K-1.5M" },
    summary: { id: "Support dan perawatan bulanan", en: "Monthly support and maintenance" },
    detail: { id: "Pilih support dasar atau premium", en: "Choose basic or premium support" },
    features: { id: ["Update konten", "Perbaikan bug", "Penambahan fitur", "Monthly strategy call", "Pilihan jumlah request"], en: ["Content updates", "Bug fixes", "Feature additions", "Monthly strategy call", "Flexible request volume"] },
  },
];

const BUDGETS = { STARTER: "< Rp 3 juta", PROFESSIONAL: "Rp 3-5 juta", PREMIUM: "Rp 3-5 juta", ULTIMATE: "> Rp 5 juta", "WEB APP": "Rp 3-5 juta", MAINTENANCE: "< Rp 3 juta" };

function savePackage(name) {
  sessionStorage.setItem("inquiry_paket", name);
  sessionStorage.setItem("inquiry_budget", BUDGETS[name] || "");
}

export default function StudioPricing() {
  const { lang } = useLang();
  const [active, setActive] = useState("PROFESSIONAL");
  const selected = PACKAGES.find((item) => item.name === active) || PACKAGES[0];

  const copy = lang === "id"
    ? { kicker: "Pilihan investasi", title: "Mulai dari paket yang paling masuk akal.", body: "Harga transparan sebagai titik awal. Kebutuhan unik tetap bisa disesuaikan setelah konsultasi.", popular: "Paling diminati", choose: "Pilih paket ini", includes: "Yang kamu dapatkan" }
    : { kicker: "Investment options", title: "Start with the package that makes sense.", body: "Transparent pricing as a starting point. Unique needs can still be tailored after consultation.", popular: "Most popular", choose: "Choose this package", includes: "What is included" };

  return (
    <section id="harga" className="border-y studio-rule bg-white/55">
      <div className="studio-shell py-24 md:py-32">
        <Reveal className="grid gap-8 lg:grid-cols-[.85fr_1.15fr] lg:items-end">
          <div>
            <p className="studio-kicker">{copy.kicker}</p>
            <h2 className="mt-7 max-w-[13ch] text-balance text-4xl font-extrabold leading-[1.04] tracking-[-.05em] text-navy-deep sm:text-5xl">{copy.title}</h2>
          </div>
          <p className="max-w-[50ch] text-sm leading-7 text-navy-deep/55 lg:justify-self-end">{copy.body}</p>
        </Reveal>

        <Reveal className="mt-14 grid overflow-hidden rounded-[1.35rem] border studio-rule bg-[#f6f5f1] lg:grid-cols-[.72fr_1.28fr]">
          <div className="border-b studio-rule lg:border-b-0 lg:border-r">
            {PACKAGES.map((item) => (
              <button key={item.name} type="button" onClick={() => setActive(item.name)} className={`flex w-full items-center justify-between border-b px-5 py-5 text-left studio-rule transition last:border-b-0 sm:px-7 ${active === item.name ? "bg-navy-deep text-white" : "text-navy-deep hover:bg-white"}`}>
                <span>
                  <span className="block text-xs font-extrabold tracking-[.13em]">{item.name}</span>
                  <span className={`mt-1 block text-xs ${active === item.name ? "text-white/62" : "text-navy-deep/45"}`}>{item.summary[lang]}</span>
                </span>
                <span className="ml-4 text-sm font-bold">{item.price[lang]}</span>
              </button>
            ))}
          </div>

          <div className="flex min-h-[560px] flex-col p-7 sm:p-10 lg:p-12">
            <div className="flex flex-wrap items-start justify-between gap-5 border-b pb-8 studio-rule">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-extrabold tracking-[.15em] text-navy-deep">{selected.name}</h3>
                  {selected.popular && <span className="rounded-full bg-mint/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-teal-700">{copy.popular}</span>}
                </div>
                <p className="mt-3 text-sm leading-6 text-navy-deep/55">{selected.summary[lang]}</p>
              </div>
              <p className="text-3xl font-extrabold tracking-[-.04em] text-navy-deep sm:text-4xl">{selected.price[lang]}</p>
            </div>

            <div className="flex-1 pt-8">
              <p className="text-xs font-extrabold uppercase tracking-[.14em] text-navy-deep/42">{copy.includes}</p>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {selected.features[lang].map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm font-medium leading-6 text-navy-deep/72">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" /> {feature}
                  </li>
                ))}
              </ul>
              <p className="mt-8 border-t pt-5 text-xs leading-6 text-navy-deep/48 studio-rule">{selected.detail[lang]}</p>
            </div>

            <a href="#kontak" onClick={() => savePackage(selected.name)} className="mt-8 inline-flex w-full items-center justify-between rounded-full bg-navy-deep px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#173253] sm:w-auto sm:self-start">
              {copy.choose} <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
