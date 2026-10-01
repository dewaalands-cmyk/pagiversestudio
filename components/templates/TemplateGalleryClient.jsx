"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useLang } from "@/components/LanguageProvider";
import { TEMPLATE_CATEGORIES, TEMPLATE_LIBRARY, formatTemplatePrice } from "@/lib/template-library";
import MarketplaceHeader from "@/components/templates/MarketplaceHeader";
import TemplateRenderer from "@/components/templates/TemplateRenderer";

export default function TemplateGalleryClient() {
  const { lang } = useLang();
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  const t = lang === "id" ? {
    eyebrow: "Template Marketplace", title: "Pilih fondasi yang sudah terasa seperti bisnismu.",
    body: "Bukan sekadar contoh gambar. Setiap template adalah website asli yang bisa kamu isi dengan nama, warna, foto, produk, dan kontak bisnismu.",
    price: "Mulai dari", benefit: "Sudah termasuk penyesuaian brand, tampilan mobile, dan bantuan sampai tayang.",
    search: "Cari template atau kategori", results: "template ditemukan", preview: "Lihat preview", use: "Pakai template",
    empty: "Belum ada template yang cocok dengan pencarianmu.", reset: "Hapus pencarian",
    processEyebrow: "Cara kerja", processTitle: "Dari pilihan ke website siap tayang.",
    steps: [
      ["01", "Pilih template", "Cari tampilan yang paling dekat dengan karakter bisnismu."],
      ["02", "Isi konten", "Ganti nama, warna, foto, produk, harga, dan informasi kontak."],
      ["03", "Kami rapikan", "Tim Pagiverse memeriksa, menyempurnakan, lalu membantu website tayang."],
    ],
    ctaTitle: "Sudah punya gambaran?", ctaBody: "Mulai dari template, lalu buat versinya jadi benar-benar milik bisnismu.", cta: "Jelajahi template",
    heroBenefits: ["Website asli, bukan gambar", "Mudah disesuaikan", "Siap untuk mobile"],
  } : {
    eyebrow: "Template Marketplace", title: "Choose a foundation that already feels like your business.",
    body: "These are not static mockups. Every template is a real website you can personalize with your name, colors, photos, products, and contact details.",
    price: "Starting at", benefit: "Includes brand personalization, mobile layout, and support until launch.",
    search: "Search templates or categories", results: "templates found", preview: "View preview", use: "Use template",
    empty: "No templates match your search yet.", reset: "Clear search",
    processEyebrow: "How it works", processTitle: "From your choice to a launch-ready website.",
    steps: [
      ["01", "Choose a template", "Find a direction that feels close to your business."],
      ["02", "Add your content", "Change the name, colors, photos, products, prices, and contact details."],
      ["03", "We refine it", "Pagiverse reviews, polishes, and helps bring your website live."],
    ],
    ctaTitle: "Already have a direction?", ctaBody: "Start with a template, then make it truly yours.", cta: "Explore templates",
    heroBenefits: ["A real website, not a mockup", "Easy to personalize", "Built for mobile"],
  };

  const templates = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return TEMPLATE_LIBRARY.filter((template) => {
      const matchesCategory = category === "all" || template.category === category;
      const haystack = `${template.name} ${template.categoryLabel[lang]} ${template.description[lang]}`.toLowerCase();
      return matchesCategory && (!normalized || haystack.includes(normalized));
    });
  }, [category, lang, query]);

  return (
    <main className="min-h-screen bg-[#f6f5f1] text-navy-deep">
      <MarketplaceHeader backHref="/" />

      <section className="studio-shell pt-8 sm:pt-12 lg:pt-16">
        <div className="relative overflow-hidden rounded-[28px] bg-navy-deep text-white sm:rounded-[36px]">
          <div className="absolute inset-0 opacity-40"><img src="/templates/marketplace-hero.png" alt="" className="h-full w-full object-cover" /></div>
          <div className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/92 to-navy-deep/25" />
          <div className="relative grid min-h-[590px] items-end px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1fr_.48fr] lg:px-16 lg:py-16">
            <div className="max-w-3xl">
              <p className="text-xs font-extrabold uppercase tracking-[.2em] text-mint">{t.eyebrow}</p>
              <h1 className="mt-6 max-w-[11ch] text-balance text-5xl font-extrabold leading-[.98] tracking-[-.06em] sm:text-6xl lg:text-7xl">{t.title}</h1>
              <p className="mt-7 max-w-[60ch] text-sm leading-7 text-white/68 sm:text-base">{t.body}</p>
              <div className="mt-10 flex flex-wrap items-center gap-5">
                <a href="#koleksi" className="inline-flex items-center gap-2 rounded-full bg-mint px-5 py-3 text-sm font-extrabold text-navy-deep transition hover:-translate-y-0.5">{t.cta}<ArrowRight className="h-4 w-4" /></a>
                <p className="text-xs font-bold text-white/55"><span className="block text-sm text-white">{t.price} {formatTemplatePrice(1369500, lang)}</span>{t.benefit}</p>
              </div>
            </div>
            <div className="mt-10 hidden justify-self-end rounded-2xl border border-white/15 bg-white/8 p-5 backdrop-blur lg:block">
              {t.heroBenefits.map((item) => <p key={item} className="flex items-center gap-2 border-b border-white/10 py-3 text-xs font-bold text-white/75 last:border-0"><CheckCircle2 className="h-4 w-4 text-mint" />{item}</p>)}
            </div>
          </div>
        </div>
      </section>

      <section id="koleksi" className="studio-shell py-20 sm:py-28">
        <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
          <div><p className="studio-kicker">{lang === "id" ? "Koleksi pilihan" : "Curated collection"}</p><h2 className="mt-6 max-w-[12ch] text-4xl font-extrabold leading-[1.03] tracking-[-.05em] sm:text-5xl">{lang === "id" ? "Tampilan profesional, siap kamu isi." : "Professional design, ready for your content."}</h2></div>
          <div className="lg:justify-self-end">
            <label className="flex w-full items-center gap-3 rounded-full border border-navy-deep/15 bg-white px-5 py-3.5 lg:w-[390px]"><Search className="h-4 w-4 text-navy-deep/40" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} className="w-full bg-transparent text-sm outline-none placeholder:text-navy-deep/35" /></label>
          </div>
        </div>

        <div className="mt-10 flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          <span className="mr-1 inline-flex shrink-0 items-center gap-2 px-2 text-xs font-extrabold uppercase tracking-wider text-navy-deep/35"><SlidersHorizontal className="h-3.5 w-3.5" />Filter</span>
          {TEMPLATE_CATEGORIES.map((item) => <button key={item.id} type="button" onClick={() => setCategory(item.id)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-extrabold transition ${category === item.id ? "bg-navy-deep text-white" : "border border-navy-deep/15 bg-white text-navy-deep/58 hover:border-navy-deep/35"}`}>{item.label[lang]}</button>)}
        </div>
        <p className="mt-5 text-xs font-bold text-navy-deep/38">{templates.length} {t.results}</p>

        {templates.length ? (
          <div className="mt-7 grid gap-x-5 gap-y-10 md:grid-cols-2">
            {templates.map((template, index) => (
              <article key={template.id} className={index % 3 === 0 ? "md:col-span-2" : ""}>
                <div className={`overflow-hidden rounded-[24px] border border-navy-deep/12 bg-white shadow-[0_24px_70px_-42px_rgba(12,27,51,.4)] ${index % 3 === 0 ? "lg:grid lg:grid-cols-[1.25fr_.75fr]" : ""}`}>
                  <div className={`overflow-hidden bg-[#e9e6df] ${index % 3 === 0 ? "min-h-[390px]" : "min-h-[330px]"}`}><TemplateRenderer template={template} compact lang={lang} /></div>
                  <div className={`${index % 3 === 0 ? "flex flex-col justify-center" : ""} p-6 sm:p-7`}>
                    <div className="flex items-start justify-between gap-5">
                      <div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-teal-700">{template.categoryLabel[lang]}</p><h3 className="mt-2 text-2xl font-extrabold tracking-[-.04em]">{template.name}</h3></div>
                      <p className="shrink-0 text-right text-[10px] font-bold uppercase tracking-wider text-navy-deep/38">{t.price}<span className="mt-1 block text-sm normal-case tracking-normal text-navy-deep">{formatTemplatePrice(template.price, lang)}</span></p>
                    </div>
                    <p className="mt-4 max-w-[54ch] text-sm leading-6 text-navy-deep/52">{template.description[lang]}</p>
                    <div className="mt-7 flex flex-wrap gap-2">
                      <Link href={`/templates/${template.id}`} className="inline-flex items-center gap-2 rounded-full border border-navy-deep/18 px-4 py-2.5 text-xs font-extrabold transition hover:border-navy-deep">{t.preview}</Link>
                      <Link href={`/studio/${template.id}`} className="inline-flex items-center gap-2 rounded-full bg-navy-deep px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#173253]">{t.use}<ArrowRight className="h-3.5 w-3.5" /></Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-[28px] border border-dashed border-navy-deep/18 bg-white px-6 py-20 text-center"><p className="font-bold">{t.empty}</p><button type="button" onClick={() => { setQuery(""); setCategory("all"); }} className="mt-4 text-sm font-extrabold text-teal-700 underline underline-offset-4">{t.reset}</button></div>
        )}
      </section>

      <section id="cara-kerja" className="border-y border-navy-deep/12 bg-white">
        <div className="studio-shell py-20 sm:py-28">
          <p className="studio-kicker">{t.processEyebrow}</p><h2 className="mt-6 max-w-[14ch] text-4xl font-extrabold leading-[1.04] tracking-[-.05em] sm:text-5xl">{t.processTitle}</h2>
          <div className="mt-12 grid border-l border-t border-navy-deep/12 md:grid-cols-3">{t.steps.map(([number, title, body]) => <article key={number} className="min-h-[250px] border-b border-r border-navy-deep/12 p-7 sm:p-9"><span className="text-xs font-extrabold text-teal-700">{number}</span><h3 className="mt-12 text-xl font-extrabold tracking-[-.03em]">{title}</h3><p className="mt-4 text-sm leading-7 text-navy-deep/52">{body}</p></article>)}</div>
        </div>
      </section>

      <section className="studio-shell py-20 sm:py-28"><div className="flex flex-col items-start justify-between gap-8 rounded-[30px] bg-navy-deep px-7 py-10 text-white sm:px-12 sm:py-14 lg:flex-row lg:items-center"><div><h2 className="text-3xl font-extrabold tracking-[-.045em] sm:text-4xl">{t.ctaTitle}</h2><p className="mt-3 max-w-[52ch] text-sm leading-7 text-white/58">{t.ctaBody}</p></div><a href="#koleksi" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-mint px-5 py-3 text-sm font-extrabold text-navy-deep">{t.cta}<ArrowRight className="h-4 w-4" /></a></div></section>
    </main>
  );
}
