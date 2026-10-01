"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";
import Reveal from "@/components/Reveal";
import TemplateRenderer from "@/components/templates/TemplateRenderer";
import { TEMPLATE_LIBRARY, formatTemplatePrice } from "@/lib/template-library";

const FEATURED_IDS = ["senja-coffee", "luma-beauty", "nalar-consulting"];

export default function StudioTemplateShowcase() {
  const { lang } = useLang();
  const templates = FEATURED_IDS.map((id) => TEMPLATE_LIBRARY.find((template) => template.id === id)).filter(Boolean);
  const copy = lang === "id" ? {
    kicker: "Template pilihan", title: "Mulai cepat, tetap terasa dibuat khusus.",
    body: "Pilih desain yang paling dekat dengan bisnismu, isi konten lewat Pagiverse Studio, lalu kami rapikan sampai siap tayang.",
    price: "Mulai dari", preview: "Preview", use: "Pakai template", all: "Lihat semua template",
    included: ["Penyesuaian warna dan identitas brand", "Tampilan desktop dan mobile", "Bantuan sampai website siap tayang"],
  } : {
    kicker: "Selected templates", title: "Launch faster, without looking generic.",
    body: "Choose a design that feels close to your business, add your content in Pagiverse Studio, and let us refine it until launch-ready.",
    price: "Starting at", preview: "Preview", use: "Use template", all: "View all templates",
    included: ["Colors and visual identity tailored to your brand", "Desktop and mobile layouts", "Support until your website is ready to launch"],
  };

  return (
    <section id="harga" className="border-y studio-rule bg-white/55">
      <div className="studio-shell py-24 md:py-32">
        <Reveal className="grid gap-8 lg:grid-cols-[.95fr_1.05fr] lg:items-end">
          <div><p className="studio-kicker">{copy.kicker}</p><h2 className="mt-7 max-w-[13ch] text-balance text-4xl font-extrabold leading-[1.04] tracking-[-.05em] text-navy-deep sm:text-5xl">{copy.title}</h2></div>
          <div className="lg:justify-self-end"><p className="max-w-[54ch] text-sm leading-7 text-navy-deep/55">{copy.body}</p><ul className="mt-5 grid gap-2">{copy.included.map((item) => <li key={item} className="flex items-center gap-2 text-xs font-bold text-navy-deep/58"><Check className="h-3.5 w-3.5 text-teal-700" />{item}</li>)}</ul></div>
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {templates.map((template, index) => (
            <Reveal key={template.id} delay={index * 90}>
              <article className="overflow-hidden rounded-[22px] border studio-rule bg-white shadow-[0_24px_70px_-48px_rgba(12,27,51,.55)]">
                <div className="h-[300px] overflow-hidden bg-[#e8e5df]"><TemplateRenderer template={template} compact lang={lang} /></div>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-extrabold uppercase tracking-[.15em] text-teal-700">{template.categoryLabel[lang]}</p><h3 className="mt-2 text-xl font-extrabold tracking-[-.035em]">{template.name}</h3></div><p className="shrink-0 text-right text-[9px] font-bold uppercase tracking-wider text-navy-deep/35">{copy.price}<span className="mt-1 block text-xs normal-case tracking-normal text-navy-deep">{formatTemplatePrice(template.price, lang)}</span></p></div>
                  <p className="mt-4 text-xs leading-6 text-navy-deep/50">{template.description[lang]}</p>
                  <div className="mt-6 flex gap-2"><Link href={`/templates/${template.id}`} className="flex-1 rounded-full border border-navy-deep/15 px-3 py-2.5 text-center text-xs font-extrabold">{copy.preview}</Link><Link href={`/studio/${template.id}`} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-navy-deep px-3 py-2.5 text-xs font-extrabold text-white">{copy.use}<ArrowRight className="h-3.5 w-3.5" /></Link></div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 flex justify-center"><Link href="/templates" className="inline-flex items-center gap-2 rounded-full bg-mint px-6 py-3.5 text-sm font-extrabold text-navy-deep transition hover:-translate-y-0.5">{copy.all}<ArrowRight className="h-4 w-4" /></Link></Reveal>
      </div>
    </section>
  );
}
