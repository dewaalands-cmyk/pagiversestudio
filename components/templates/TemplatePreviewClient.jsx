"use client";

import Link from "next/link";
import { ArrowRight, Check, Monitor, Smartphone, Tablet } from "lucide-react";
import { useState } from "react";
import { useLang } from "@/components/LanguageProvider";
import { formatTemplatePrice, getTemplateCategoryLabel, getTemplateDescription } from "@/lib/template-library";
import MarketplaceHeader from "@/components/templates/MarketplaceHeader";
import TemplateRenderer from "@/components/templates/NativeTemplateRenderer";

const DEVICES = {
  desktop: { width: "100%", Icon: Monitor },
  tablet: { width: "780px", Icon: Tablet },
  mobile: { width: "390px", Icon: Smartphone },
};

export default function TemplatePreviewClient({ template }) {
  const { lang } = useLang();
  const [device, setDevice] = useState("desktop");
  const hasPrice = Number.isFinite(template.price);
  const t = lang === "id" ? {
    back: "Semua template", preview: "Preview langsung", choose: "Pakai template ini", starting: "Mulai dari",
    note: "Harga termasuk penyesuaian konten dan brand", devices: { desktop: "Desktop", tablet: "Tablet", mobile: "Mobile" },
    benefit: ["Bebas ganti teks dan foto", "Warna mengikuti brand", "Dibantu sampai siap tayang"],
  } : {
    back: "All templates", preview: "Live preview", choose: "Use this template", starting: "Starting at",
    note: "Price includes content and brand personalization", devices: { desktop: "Desktop", tablet: "Tablet", mobile: "Mobile" },
    benefit: ["Change every text and photo", "Colors tailored to your brand", "Support until launch-ready"],
  };

  return (
    <main className="min-h-screen bg-[#eceae5] text-navy-deep">
      <MarketplaceHeader backHref="/templates" backLabel={t.back} />
      <section className="border-b border-navy-deep/12 bg-[#f6f5f1]">
        <div className="studio-shell grid gap-7 py-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-teal-700">{getTemplateCategoryLabel(template, lang)} · {t.preview}</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-.045em] sm:text-4xl">{template.name}</h1><p className="mt-3 max-w-[62ch] text-sm leading-6 text-navy-deep/50">{getTemplateDescription(template, lang)}</p></div>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center lg:justify-end">
            {hasPrice && <div className="mr-2"><p className="text-[10px] font-bold uppercase tracking-wider text-navy-deep/35">{t.starting}</p><p className="text-lg font-extrabold">{formatTemplatePrice(template.price, lang)}</p><p className="text-[10px] text-navy-deep/40">{t.note}</p></div>}
            <Link href={`/studio/${template.id}`} className="inline-flex items-center gap-2 rounded-full bg-navy-deep px-5 py-3 text-sm font-extrabold text-white">{t.choose}<ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      <section className="studio-shell py-6 sm:py-10">
        <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-navy-deep/10 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex rounded-full bg-[#efeee9] p-1">
            {Object.entries(DEVICES).map(([key, { Icon }]) => <button key={key} type="button" onClick={() => setDevice(key)} className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-extrabold transition ${device === key ? "bg-navy-deep text-white" : "text-navy-deep/48 hover:text-navy-deep"}`}><Icon className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t.devices[key]}</span></button>)}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 px-2">{t.benefit.map((item) => <span key={item} className="inline-flex items-center gap-1.5 text-[11px] font-bold text-navy-deep/50"><Check className="h-3 w-3 text-teal-700" />{item}</span>)}</div>
        </div>

        <div className="overflow-x-auto rounded-[24px] border border-navy-deep/12 bg-[#d7d4ce] p-2 sm:p-4">
          <div className="mx-auto overflow-hidden rounded-[16px] bg-white shadow-[0_24px_70px_-28px_rgba(12,27,51,.35)] transition-[width] duration-500" style={{ width: DEVICES[device].width, minWidth: device === "mobile" ? "360px" : undefined }}>
            <TemplateRenderer template={template} lang={lang} deviceMode={device} />
          </div>
        </div>
      </section>

      <div className="sticky bottom-4 z-40 mx-auto mb-6 flex w-[min(92%,620px)] items-center justify-between gap-4 rounded-full border border-white/20 bg-navy-deep/96 px-5 py-3 text-white shadow-2xl backdrop-blur">
        <div className="min-w-0"><p className="truncate text-xs font-extrabold">{template.name}</p>{hasPrice && <p className="text-[10px] text-white/48">{formatTemplatePrice(template.price, lang)}</p>}</div>
        <Link href={`/studio/${template.id}`} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-mint px-4 py-2.5 text-xs font-extrabold text-navy-deep">{t.choose}<ArrowRight className="h-3.5 w-3.5" /></Link>
      </div>
    </main>
  );
}
