"use client";

import Image from "next/image";
import { ArrowDownRight, MessageCircle } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";

const COPY = {
  id: {
    kicker: "Studio website dan web app",
    title: "Bisnis lebih dipercaya.",
    body: "Kami merancang website cepat, jelas, dan dipercaya calon pelanggan sejak kunjungan pertama.",
    work: "Lihat karya",
    consult: "Konsultasi dulu",
    proof: [
      ["4", "proyek nyata sudah tayang"],
      ["1x24 jam", "estimasi respons awal"],
      ["Berlanjut", "dukungan setelah tayang"],
    ],
    live: "Proyek yang sudah live",
    caseStudy: "Company profile dua bahasa",
    primaryAlt: "Website 3GRT Management karya Pagiverse Studio",
    secondaryAlt: "Website Muay Thai School Garut karya Pagiverse Studio",
  },
  en: {
    kicker: "Website and web app studio",
    title: "Make your business trusted.",
    body: "We design fast, clear websites that earn customer trust from the first visit.",
    work: "View our work",
    consult: "Talk to us",
    proof: [
      ["4", "real projects launched"],
      ["1 business day", "initial response"],
      ["Ongoing", "post-launch support"],
    ],
    live: "Projects already live",
    caseStudy: "Bilingual company profile",
    primaryAlt: "3GRT Management website by Pagiverse Studio",
    secondaryAlt: "Muay Thai School Garut website by Pagiverse Studio",
  },
};

export default function StudioHero({ settings = {} }) {
  const { lang } = useLang();
  const t = COPY[lang];
  const isId = lang === "id";
  const dynamicTitle = isId
    ? [settings.hero_h1, settings.hero_h1_accent, settings.hero_h1_end].filter(Boolean).join(" ")
    : "";
  const title = dynamicTitle || t.title;
  const body = (isId && settings.hero_desc) || t.body;

  return (
    <section className="overflow-hidden border-b studio-rule">
      <div className="studio-shell grid min-h-[760px] items-center gap-14 py-16 lg:grid-cols-[.88fr_1.12fr] lg:gap-16 lg:py-24">
        <div className="max-w-2xl">
          <p className="studio-kicker">{(isId && settings.hero_badge) || t.kicker}</p>
          <h1 className="mt-7 max-w-[11ch] text-balance text-[clamp(3.15rem,6.2vw,5.75rem)] font-extrabold leading-[.94] tracking-[-0.065em] text-navy-deep">
            {title}
          </h1>
          <p className="mt-7 max-w-[47ch] text-base font-medium leading-7 text-navy-deep/62 sm:text-lg">
            {body}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="#portfolio" className="inline-flex items-center justify-center gap-2 rounded-full bg-navy-deep px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#173253]">
              {t.work} <ArrowDownRight className="h-4 w-4" />
            </a>
            <a href="#kontak" className="inline-flex items-center justify-center gap-2 rounded-full border border-navy-deep/20 px-6 py-3.5 text-sm font-bold text-navy-deep transition hover:-translate-y-0.5 hover:border-mint">
              <MessageCircle className="h-4 w-4" /> {t.consult}
            </a>
          </div>
        </div>

        <div className="relative pb-8 sm:pl-8 lg:pl-0">
          <p className="mb-4 text-xs font-bold uppercase tracking-[.16em] text-navy-deep/45">{t.live}</p>
          <a href="https://3grtmanagement.vercel.app/" target="_blank" rel="noopener noreferrer" className="group relative block aspect-[16/10] overflow-hidden rounded-[1.35rem] border border-navy-deep/15 bg-[#dfe4e2] shadow-[0_30px_80px_rgba(12,27,51,.16)]">
            <Image src="/portfolio/screenshots/3grt-v2.jpg" alt={t.primaryAlt} fill priority sizes="(max-width: 1024px) 100vw, 54vw" className="object-cover object-top transition duration-700 group-hover:scale-[1.025]" />
          </a>
          <a href="https://muaythaischoolgarut.vercel.app/" target="_blank" rel="noopener noreferrer" className="group absolute -bottom-5 right-0 block w-[42%] overflow-hidden rounded-[1.1rem] border-[6px] border-[#f6f5f1] bg-white shadow-[0_20px_55px_rgba(12,27,51,.2)] sm:right-[-2%]">
            <div className="relative aspect-[4/3]">
              <Image src="/portfolio/screenshots/muaythai-v2.jpg" alt={t.secondaryAlt} fill priority sizes="(max-width: 1024px) 42vw, 22vw" className="object-cover object-top transition duration-700 group-hover:scale-[1.035]" />
            </div>
          </a>
          <div className="absolute -left-2 bottom-0 hidden w-[42%] rounded-[1.1rem] border border-navy-deep/10 bg-white/95 px-5 py-4 shadow-[0_16px_45px_rgba(12,27,51,.12)] backdrop-blur sm:block lg:-left-8">
            <p className="text-[11px] font-bold uppercase tracking-[.14em] text-teal-700">3GRT Management</p>
            <p className="mt-1 text-sm font-semibold text-navy-deep">{t.caseStudy}</p>
          </div>
        </div>
      </div>

      <div className="studio-shell grid border-t studio-rule sm:grid-cols-3">
        {t.proof.map(([value, label], index) => (
          <div key={label} className={`py-6 sm:px-7 ${index > 0 ? "border-t studio-rule sm:border-l sm:border-t-0" : ""}`}>
            <p className="text-lg font-extrabold tracking-tight text-navy-deep">{value}</p>
            <p className="mt-1 text-xs font-medium text-navy-deep/50">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
