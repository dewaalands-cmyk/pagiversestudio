"use client";

// Section "Harga / Pricing" — toggle kartu/tabel, ringkasan harga di atas, bilingual ID/EN.
// Untuk update konten: edit objek "teks", array "paket", dan array "perbandingan".

import { useState } from "react";
import { Check } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";

// ─── Teks bilingual ──────────────────────────────────────────────────────────

const teks = {
  id: {
    label: "Harga",
    judul: "Paket Layanan Pagiverse Studio",
    subjudul:
      "Pilih paket yang sesuai kebutuhan bisnis kamu. Semua paket dapat dikustomisasi lebih lanjut.",
    tombolKartu: "Kartu Paket",
    tombolTabel: "Bandingkan Fitur",
    rekomendasi: "REKOMENDASI",
    ctaKartu: "Pilih Paket Ini",
    maintenanceSub: "Support & Perawatan Bulanan",
    maintenanceDetail: "Per bulan, mulai dari support dasar",
    basicLabel: "BASIC (Rp 500k)",
    basicFitur: ["Content update", "Bug fix minor", "Max 3 request/bulan"],
    premiumLabel: "PREMIUM (Rp 1.5 jt)",
    premiumFitur: ["Unlimited request", "Feature addition", "Monthly strategy call"],
    footerJudul: "Tidak yakin paket mana yang tepat?",
    footerSub:
      "Chat dengan kami gratis untuk konsultasi. Kami bantu tentukan solusi terbaik untuk bisnis kamu.",
    footerCTA: "Konsultasi Gratis Sekarang",
    waPesan: "konsultasi paket website yang cocok untuk bisnis saya",
  },
  en: {
    label: "Pricing",
    judul: "Pagiverse Studio Service Packages",
    subjudul:
      "Choose the package that fits your business needs. All packages can be further customized.",
    tombolKartu: "Package Cards",
    tombolTabel: "Compare Features",
    rekomendasi: "RECOMMENDED",
    ctaKartu: "Choose This Package",
    maintenanceSub: "Monthly Support & Maintenance",
    maintenanceDetail: "Per month, starting from basic support",
    basicLabel: "BASIC (Rp 500k)",
    basicFitur: ["Content update", "Minor bug fix", "Max 3 requests/month"],
    premiumLabel: "PREMIUM (Rp 1.5 jt)",
    premiumFitur: ["Unlimited requests", "Feature addition", "Monthly strategy call"],
    footerJudul: "Not sure which package is right for you?",
    footerSub:
      "Chat with us for a free consultation. We'll help you find the best solution for your business.",
    footerCTA: "Get Free Consultation",
    waPesan: "I'd like a free consultation for the best website package for my business",
  },
};

// ─── Data paket ──────────────────────────────────────────────────────────────

const paket = [
  {
    nama: "STARTER",
    harga: "Rp 1 – 2 jt",
    sub: { id: "Landing Page & Website Sederhana", en: "Landing Page & Simple Website" },
    detail: { id: "1 halaman, 5 revisi, 1 bulan support", en: "1 page, 5 revisions, 1 month support" },
    fitur: {
      id: ["1 halaman custom", "Responsive design", "SEO dasar", "Contact form", "Domain gratis 1 tahun"],
      en: ["1 custom page", "Responsive design", "Basic SEO", "Contact form", "Free domain 1 year"],
    },
    unggulan: false,
  },
  {
    nama: "PROFESSIONAL",
    harga: "Rp 2 – 3 jt",
    sub: { id: "Company Profile 3-5 Halaman", en: "Company Profile 3-5 Pages" },
    detail: { id: "3-5 halaman, 10 revisi, 3 bulan support", en: "3-5 pages, 10 revisions, 3 months support" },
    fitur: {
      id: ["3-5 halaman custom", "Gallery & portfolio", "SEO & Analytics setup", "Admin dashboard", "Training dokumentasi"],
      en: ["3-5 custom pages", "Gallery & portfolio", "SEO & Analytics setup", "Admin dashboard", "Training & documentation"],
    },
    unggulan: false,
  },
  {
    nama: "PREMIUM",
    harga: "Rp 3 – 4 jt",
    sub: { id: "SEO Intensive & Blog", en: "SEO Intensive & Blog" },
    detail: { id: "15 revisi, 6 bulan support, monthly report", en: "15 revisions, 6 months support, monthly report" },
    fitur: {
      id: ["Semua dari PROFESSIONAL", "Blog CMS", "SEO strategy lengkap", "Speed optimization", "Monthly SEO report"],
      en: ["Everything in PROFESSIONAL", "Blog CMS", "Full SEO strategy", "Speed optimization", "Monthly SEO report"],
    },
    unggulan: true,
  },
  {
    nama: "ULTIMATE",
    harga: "Hubungi Kami",
    sub: { id: "Website + Web App custom", en: "Full Website + Web App" },
    detail: { id: "Unlimited revisi, 6 bulan support, konsultasi", en: "Unlimited revisions, 6 months support, consultation" },
    fitur: {
      id: ["Semua dari PREMIUM", "Web app integration", "Database & authentication", "Payment gateway (optional)", "Advanced analytics & SEO optimization"],
      en: ["Everything in PREMIUM", "Web app integration", "Database & authentication", "Payment gateway (optional)", "Advanced analytics & SEO optimization"],
    },
    unggulan: false,
  },
  {
    nama: "WEB APP",
    harga: "Rp 2 – 4 jt",
    sub: { id: "Aplikasi Web Standalone", en: "Standalone Web Application" },
    detail: { id: "10 revisi, 3 bulan support, offline capable", en: "10 revisions, 3 months support, offline capable" },
    fitur: {
      id: ["Custom web app", "Database & authentication", "Admin dashboard", "Offline capability", "Auto backup"],
      en: ["Custom web app", "Database & authentication", "Admin dashboard", "Offline capability", "Auto backup"],
    },
    unggulan: false,
  },
];

// ─── Tabel perbandingan (bilingual) ──────────────────────────────────────────

const perbandingan = {
  id: [
    { label: "Harga",    starter: "1 – 2 jt",  pro: "2 – 3 jt", premium: "3 – 4 jt",  ultimate: "Hubungi Kami" },
    { label: "Halaman",  starter: "1",          pro: "3–5",       premium: "5–7",        ultimate: "5–7 + app" },
    { label: "Web App",  starter: "—",          pro: "—",         premium: "—",          ultimate: "✓" },
    { label: "Blog CMS", starter: "—",          pro: "—",         premium: "✓",          ultimate: "✓" },
    { label: "SEO",      starter: "Dasar",      pro: "Standard",  premium: "Intensive",  ultimate: "Intensive" },
    { label: "Revisi",   starter: "5",          pro: "10",        premium: "15",         ultimate: "Unlimited" },
    { label: "Support",  starter: "1 bulan",    pro: "3 bulan",   premium: "6 bulan",    ultimate: "6 bulan" },
    { label: "Timeline", starter: "7–10 hari",  pro: "14 hari",   premium: "21 hari",    ultimate: "30–40 hari" },
  ],
  en: [
    { label: "Price",     starter: "1 – 2 jt",  pro: "2 – 3 jt", premium: "3 – 4 jt",  ultimate: "Contact Us" },
    { label: "Pages",     starter: "1",          pro: "3–5",       premium: "5–7",        ultimate: "5–7 + app" },
    { label: "Web App",   starter: "—",          pro: "—",         premium: "—",          ultimate: "✓" },
    { label: "Blog CMS",  starter: "—",          pro: "—",         premium: "✓",          ultimate: "✓" },
    { label: "SEO",       starter: "Basic",      pro: "Standard",  premium: "Intensive",  ultimate: "Intensive" },
    { label: "Revisions", starter: "5",          pro: "10",        premium: "15",         ultimate: "Unlimited" },
    { label: "Support",   starter: "1 month",    pro: "3 months",  premium: "6 months",   ultimate: "6 months" },
    { label: "Timeline",  starter: "7–10 days",  pro: "14 days",   premium: "21 days",    ultimate: "30–40 days" },
  ],
};

// Budget mapping per paket
const BUDGET_MAP = {
  STARTER:      "< Rp 3 juta",
  PROFESSIONAL: "Rp 3–5 juta",
  PREMIUM:      "Rp 3–5 juta",
  ULTIMATE:     "> Rp 5 juta",
  "WEB APP":    "Rp 3–5 juta",
  MAINTENANCE:  "< Rp 3 juta",
};

function pilihPaket(nama) {
  sessionStorage.setItem("inquiry_paket", nama);
  sessionStorage.setItem("inquiry_budget", BUDGET_MAP[nama] ?? "");
  const el = document.getElementById("kontak");
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  } else {
    window.location.hash = "kontak";
  }
}

// ─── Komponen ─────────────────────────────────────────────────────────────────

export default function Pricing() {
  const [tampilan, setTampilan] = useState("kartu");
  const { lang } = useLang();

  const t = teks[lang];
  const rows = perbandingan[lang];
  const tabelHeader = lang === "id"
    ? ["Fitur", "Starter", "Professional", "Premium", "Ultimate"]
    : ["Feature", "Starter", "Professional", "Premium", "Ultimate"];

  return (
    <section id="harga" className="bg-navy-deep">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-mint">
            {t.label}
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
            {t.judul}
          </h2>
          <p className="mt-4 leading-relaxed text-cloud-200/80">{t.subjudul}</p>
        </div>

        {/* Toggle kartu / tabel */}
        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={() => setTampilan("kartu")}
            className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-all ${
              tampilan === "kartu"
                ? "bg-mint text-navy-deep"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {t.tombolKartu}
          </button>
          <button
            onClick={() => setTampilan("tabel")}
            className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-all ${
              tampilan === "tabel"
                ? "bg-mint text-navy-deep"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {t.tombolTabel}
          </button>
        </div>

        {/* Cards */}
        {tampilan === "kartu" && (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {paket.map((p) => (
              <div
                key={p.nama}
                className={`relative flex flex-col rounded-2xl bg-white p-6 transition-all hover:-translate-y-1 ${
                  p.unggulan
                    ? "scale-[1.02] border-2 border-mint shadow-lg shadow-mint/10"
                    : "border border-cloud-200 hover:border-mint/40 hover:shadow-lg"
                }`}
              >
                {p.unggulan && (
                  <span className="absolute -top-3 left-5 rounded-full bg-mint px-3 py-1 text-xs font-semibold text-navy-deep">
                    {t.rekomendasi}
                  </span>
                )}
                <div className="mb-5 mt-2">
                  <h3 className="text-base font-semibold text-navy-deep">{p.nama}</h3>
                  <p className="mt-1 text-xs text-slate-muted">{p.sub[lang]}</p>
                </div>
                <div className="mb-6">
                  <div className="text-2xl font-semibold text-mint">{p.harga}</div>
                  <p className="mt-1 text-xs text-slate-muted">{p.detail[lang]}</p>
                </div>
                <ul className="mb-6 flex-1 space-y-2 border-t border-cloud-200 pt-5">
                  {p.fitur[lang].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-navy-deep">
                      <Check className="h-4 w-4 shrink-0 text-mint" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => pilihPaket(p.nama)}
                  className="block w-full rounded-lg bg-mint py-3 text-center text-sm font-semibold text-navy-deep transition-colors hover:bg-teal-400"
                >
                  {t.ctaKartu}
                </button>
              </div>
            ))}

            {/* MAINTENANCE — layout khusus karena ada dua sub-tier */}
            <div className="flex flex-col rounded-2xl border border-cloud-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-mint/40 hover:shadow-lg">
              <div className="mb-5">
                <h3 className="text-base font-semibold text-navy-deep">MAINTENANCE</h3>
                <p className="mt-1 text-xs text-slate-muted">{t.maintenanceSub}</p>
              </div>
              <div className="mb-6">
                <div className="text-2xl font-semibold text-mint">Rp 500k – 1.5 jt</div>
                <p className="mt-1 text-xs text-slate-muted">{t.maintenanceDetail}</p>
              </div>
              <div className="mb-6 flex-1 space-y-4 border-t border-cloud-200 pt-5">
                <div>
                  <p className="mb-2 text-xs font-semibold text-navy-deep">{t.basicLabel}</p>
                  <ul className="space-y-1 text-xs text-slate-muted">
                    {t.basicFitur.map((f) => (
                      <li key={f}>· {f}</li>
                    ))}
                  </ul>
                </div>
                <div className="border-t border-cloud-200 pt-4">
                  <p className="mb-2 text-xs font-semibold text-navy-deep">{t.premiumLabel}</p>
                  <ul className="space-y-1 text-xs text-slate-muted">
                    {t.premiumFitur.map((f) => (
                      <li key={f}>· {f}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <button
                onClick={() => pilihPaket("MAINTENANCE")}
                className="block w-full rounded-lg bg-mint py-3 text-center text-sm font-semibold text-navy-deep transition-colors hover:bg-teal-400"
              >
                {t.ctaKartu}
              </button>
            </div>
          </div>
        )}

        {/* Tabel perbandingan */}
        {tampilan === "tabel" && (
          <div className="mt-10 overflow-x-auto rounded-2xl">
            <table className="w-full border-collapse bg-white text-sm">
              <thead>
                <tr className="bg-navy-deep text-white">
                  {tabelHeader.map((h, i) => (
                    <th
                      key={h}
                      className={`p-4 font-medium ${
                        i === 0 ? "text-left" : "border-l border-white/10 text-center"
                      } ${i === 3 ? "bg-mint/10 text-mint" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={r.label}
                    className={`border-t border-cloud-200 ${i % 2 !== 0 ? "bg-cloud-50" : ""}`}
                  >
                    <td className="p-4 font-medium text-navy-deep">{r.label}</td>
                    <td className="border-l border-cloud-200 p-4 text-center text-slate-muted">{r.starter}</td>
                    <td className="border-l border-cloud-200 p-4 text-center text-slate-muted">{r.pro}</td>
                    <td className="border-l border-cloud-200 bg-mint/5 p-4 text-center text-navy-deep">{r.premium}</td>
                    <td className="border-l border-cloud-200 p-4 text-center text-slate-muted">{r.ultimate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-16 border-t border-white/10 pt-12 text-center">
          <h2 className="text-xl font-semibold text-white">{t.footerJudul}</h2>
          <p className="mt-3 text-sm text-cloud-200/80">{t.footerSub}</p>
          <a
            href="#kontak"
            className="mt-6 inline-block rounded-lg bg-mint px-8 py-3 text-sm font-semibold text-navy-deep transition-colors hover:bg-teal-400"
          >
            {t.footerCTA}
          </a>
        </div>

      </div>
    </section>
  );
}
