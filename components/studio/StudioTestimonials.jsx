"use client";

import { Quote } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";
import Reveal from "@/components/Reveal";

const FALLBACK = [
  {
    nama: "Coach Yunas",
    jabatan: "Owner Muay Thai School Garut & 3GRT Management",
    isi: {
      id: "Pagiverse Studio mengerjakan dua website kami dari nol. Komunikasinya enak, setiap revisi direspon cepat, dan hasilnya jauh lebih rapi dari yang saya bayangkan.",
      en: "Pagiverse Studio built both of our websites from scratch. Communication was easy, revisions were handled quickly, and the results were far more polished than I expected.",
    },
  },
  {
    nama: "Cahya",
    jabatan: "Owner Teman Deadline",
    isi: {
      id: "Prosesnya cepat, tepat waktu, dan tampilannya bikin usaha saya terlihat lebih kredibel di mata klien.",
      en: "The process was fast and on schedule, and the new look made my business feel far more credible to clients.",
    },
  },
];

function initials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export default function StudioTestimonials({ dbItems = [] }) {
  const { lang } = useLang();
  const items = dbItems.length
    ? dbItems.map((item) => {
        const known = FALLBACK.find((testimonial) => testimonial.nama.toLowerCase() === item.client_name?.trim().toLowerCase());
        return { nama: item.client_name, jabatan: item.client_company || known?.jabatan || "", isi: lang === "en" && known ? known.isi.en : item.content };
      })
    : FALLBACK.map((item) => ({ ...item, isi: item.isi[lang] }));

  return (
    <section className="studio-shell py-24 md:py-32">
      <Reveal className="grid gap-8 lg:grid-cols-[.55fr_1.45fr] lg:items-end">
        <div>
          <p className="studio-kicker">{lang === "id" ? "Suara klien" : "Client voices"}</p>
          <h2 className="mt-7 max-w-[11ch] text-balance text-4xl font-extrabold leading-[1.04] tracking-[-.05em] text-navy-deep sm:text-5xl">
            {lang === "id" ? "Kepercayaan dibangun dari pengalaman nyata." : "Trust is built through real experience."}
          </h2>
        </div>
        <p className="max-w-[46ch] text-sm leading-7 text-navy-deep/55 lg:justify-self-end">
          {lang === "id" ? "Kami lebih suka membiarkan hasil kerja dan pengalaman klien berbicara." : "We prefer to let the work and our clients' experience speak for us."}
        </p>
      </Reveal>

      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {items.slice(0, 4).map((item, index) => (
          <Reveal key={`${item.nama}-${index}`} delay={index * 70} className={`${index % 2 === 1 ? "md:mt-12" : ""} border-t-2 border-navy-deep pt-7`}>
            <Quote className="h-8 w-8 text-mint" fill="currentColor" />
            <blockquote className="mt-7 line-clamp-4 text-xl font-semibold leading-8 tracking-[-.025em] text-navy-deep sm:text-2xl sm:leading-9">
              “{item.isi}”
            </blockquote>
            <div className="mt-8 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-deep text-xs font-extrabold text-mint">{initials(item.nama)}</div>
              <div>
                <p className="text-sm font-bold text-navy-deep">{item.nama}</p>
                {item.jabatan && <p className="mt-0.5 text-xs leading-5 text-navy-deep/48">{item.jabatan}</p>}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
