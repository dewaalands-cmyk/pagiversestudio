"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowRight, Check } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";
import MarketplaceHeader from "@/components/templates/MarketplaceHeader";
import NativeTemplateRenderer from "@/components/templates/NativeTemplateRenderer";
import {
  TEMPLATE_COLLECTION_GROUPS,
  TEMPLATE_LIBRARY,
  formatTemplatePrice,
  getTemplateCategoryLabel,
  getTemplateCollectionGroup,
  getTemplateDescription,
} from "@/lib/template-library";

export default function CasaBraciGalleryClient() {
  const { lang } = useLang();
  const copy = lang === "id" ? {
    eyebrow: "Koleksi template asli",
    title: "Pilih fondasi, lalu buat sepenuhnya milik bisnismu.",
    body: "Setiap pilihan di sini berasal langsung dari repository template Pagiverse. Buka preview aslinya, lalu sesuaikan konten melalui Studio.",
    collectionNav: "Jelajahi berdasarkan bidang",
    templateCount: "template",
    starting: "Mulai dari",
    preview: "Lihat preview",
    use: "Gunakan template",
    benefits: ["Website asli multi-halaman", "Konten dapat disesuaikan", "Responsif untuk mobile"],
    processEyebrow: "Cara kerja",
    processTitle: "Dari template asli menuju website bisnismu.",
    steps: [
      ["01", "Lihat template", "Periksa tampilan, halaman, dan interaksi versi aslinya."],
      ["02", "Isi konten", "Ganti nama, tulisan, foto, menu, dan informasi bisnis."],
      ["03", "Tinjau hasil", "Lihat perubahan secara langsung sebelum mengirim project."],
    ],
  } : {
    eyebrow: "Original template collection",
    title: "Choose a foundation, then make it entirely yours.",
    body: "Every option here comes directly from the Pagiverse template repository. Preview the original site, then personalize its content in Studio.",
    collectionNav: "Browse by industry",
    templateCount: "templates",
    starting: "Starting at",
    preview: "View preview",
    use: "Use template",
    benefits: ["A real multi-page website", "Personalizable content", "Responsive on mobile"],
    processEyebrow: "How it works",
    processTitle: "From the original template to your business website.",
    steps: [
      ["01", "View the template", "Review the original design, pages, and interactions."],
      ["02", "Add your content", "Change the name, copy, photos, menu, and business details."],
      ["03", "Review the result", "See changes live before submitting your project."],
    ],
  };

  const collections = TEMPLATE_COLLECTION_GROUPS.map((group) => ({
    ...group,
    templates: TEMPLATE_LIBRARY.filter((template) => getTemplateCollectionGroup(template)?.id === group.id),
  })).filter((group) => group.templates.length > 0);

  return (
    <main className="min-h-screen bg-[#f6f5f1] text-navy-deep">
      <MarketplaceHeader backHref="/" />

      <section className="studio-shell py-14 sm:py-20 lg:py-24">
        <div className="grid gap-10 border-b border-navy-deep/12 pb-12 lg:grid-cols-[1.05fr_.65fr] lg:items-end lg:pb-16">
          <div>
            <p className="studio-kicker">{copy.eyebrow}</p>
            <h1 className="mt-6 max-w-[13ch] text-balance text-5xl font-extrabold leading-[.98] tracking-[-.06em] sm:text-6xl">{copy.title}</h1>
          </div>
          <div>
            <p className="max-w-[54ch] text-sm leading-7 text-navy-deep/58 sm:text-base">{copy.body}</p>
            <div className="mt-7 grid gap-2">
              {copy.benefits.map((benefit) => <span key={benefit} className="flex items-center gap-2 text-xs font-bold text-navy-deep/55"><Check className="h-3.5 w-3.5 text-teal-700" />{benefit}</span>)}
            </div>
          </div>
        </div>
      </section>

      <section id="koleksi" className="studio-shell pb-20 sm:pb-28">
        <div className="mb-12 border-y border-navy-deep/12 py-6 sm:mb-16 sm:py-7">
          <p className="text-xs font-extrabold uppercase tracking-[.16em] text-navy-deep/38">{copy.collectionNav}</p>
          <nav aria-label={copy.collectionNav} className="mt-5 grid gap-3 sm:grid-cols-2">
            {collections.map((group) => (
              <Link key={group.id} href={`#${group.id}`} className="group flex items-center justify-between rounded-2xl border border-navy-deep/12 bg-white px-5 py-4 transition hover:border-teal-700/55 hover:shadow-[0_16px_45px_-35px_rgba(12,27,51,.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2">
                <span>
                  <span className="block text-sm font-extrabold tracking-[-.02em]">{group.label[lang]}</span>
                  <span className="mt-1 block text-xs text-navy-deep/48">{group.templates.length} {copy.templateCount}</span>
                </span>
                <ArrowDownRight className="h-4 w-4 text-teal-700 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
              </Link>
            ))}
          </nav>
        </div>

        <div className="grid gap-20 sm:gap-24">
          {collections.map((group) => (
            <section key={group.id} id={group.id} className="scroll-mt-28">
              <div className="mb-7 max-w-2xl sm:mb-9">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                  <h2 className="text-3xl font-extrabold tracking-[-.045em] sm:text-4xl">{group.label[lang]}</h2>
                  <span className="text-xs font-extrabold uppercase tracking-[.14em] text-teal-700">{group.templates.length} {copy.templateCount}</span>
                </div>
                <p className="mt-3 text-sm leading-7 text-navy-deep/52 sm:text-base">{group.description[lang]}</p>
              </div>

              <div className="grid gap-6">
                {group.templates.map((template) => (
                  <article key={template.id} className="overflow-hidden rounded-[28px] border border-navy-deep/12 bg-white shadow-[0_24px_70px_-45px_rgba(12,27,51,.35)] lg:grid lg:grid-cols-[1.25fr_.75fr]">
                    <div className="min-h-[360px] overflow-hidden bg-[#dedad2]"><NativeTemplateRenderer template={template} compact /></div>
                    <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
                      <p className="text-[10px] font-extrabold uppercase tracking-[.17em] text-teal-700">{getTemplateCategoryLabel(template, lang)}</p>
                      <h3 className="mt-3 text-3xl font-extrabold tracking-[-.045em] sm:text-4xl">{template.name}</h3>
                      <p className="mt-5 text-sm leading-7 text-navy-deep/55">{getTemplateDescription(template, lang)}</p>
                      {Number.isFinite(template.price) && <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[.14em] text-navy-deep/38">{copy.starting}<span className="mt-1 block text-lg normal-case tracking-normal text-navy-deep">{formatTemplatePrice(template.price, lang)}</span></p>}
                      <div className="mt-8 flex flex-wrap gap-2">
                        <Link href={`/templates/${template.id}`} className="rounded-full border border-navy-deep/18 px-5 py-3 text-xs font-extrabold transition hover:border-navy-deep">{copy.preview}</Link>
                        <Link href={`/studio/${template.id}`} className="inline-flex items-center gap-2 rounded-full bg-navy-deep px-5 py-3 text-xs font-extrabold text-white transition hover:bg-[#173253]">{copy.use}<ArrowRight className="h-3.5 w-3.5" /></Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section id="cara-kerja" className="border-y border-navy-deep/12 bg-white">
        <div className="studio-shell py-20 sm:py-28">
          <p className="studio-kicker">{copy.processEyebrow}</p>
          <h2 className="mt-6 max-w-[15ch] text-4xl font-extrabold leading-[1.03] tracking-[-.05em] sm:text-5xl">{copy.processTitle}</h2>
          <div className="mt-12 grid border-l border-t border-navy-deep/12 md:grid-cols-3">
            {copy.steps.map(([number, title, body]) => <article key={number} className="min-h-[235px] border-b border-r border-navy-deep/12 p-7 sm:p-9"><span className="text-xs font-extrabold text-teal-700">{number}</span><h3 className="mt-10 text-xl font-extrabold tracking-[-.03em]">{title}</h3><p className="mt-4 text-sm leading-7 text-navy-deep/52">{body}</p></article>)}
          </div>
        </div>
      </section>
    </main>
  );
}
