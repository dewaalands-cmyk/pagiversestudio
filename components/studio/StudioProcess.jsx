"use client";

import Image from "next/image";
import { useLang } from "@/components/LanguageProvider";
import Reveal from "@/components/Reveal";

const COPY = {
  id: {
    kicker: "Proses kerja",
    title: "Terstruktur dari brief sampai website tayang.",
    body: "Setiap keputusan punya alasan. Kamu selalu tahu apa yang sedang dikerjakan, mengapa, dan kapan hasilnya bisa ditinjau.",
    steps: [
      ["Pahami kebutuhan", "Kami menggali target bisnis, audiens, prioritas, dan batasan proyek."],
      ["Susun arah", "Struktur konten, referensi visual, dan ruang lingkup disepakati lebih dulu."],
      ["Bangun dan uji", "Desain dikembangkan responsif, diuji, lalu diperbaiki berdasarkan feedback."],
      ["Tayang dan dampingi", "Website diluncurkan dengan rapi dan tetap mendapat dukungan setelahnya."],
    ],
  },
  en: {
    kicker: "Our process",
    title: "Structured from the first brief to launch.",
    body: "Every decision has a reason. You always know what is being done, why it matters, and when to review it.",
    steps: [
      ["Understand the need", "We uncover business goals, audience, priorities, and project constraints."],
      ["Define the direction", "Content structure, visual references, and scope are agreed first."],
      ["Build and test", "The design is developed responsively, tested, and improved through feedback."],
      ["Launch and support", "Your website launches cleanly and remains supported afterwards."],
    ],
  },
};

export default function StudioProcess() {
  const { lang } = useLang();
  const t = COPY[lang];

  return (
    <section id="proses" className="studio-shell py-24 md:py-32">
      <div className="grid items-start gap-14 lg:grid-cols-[1.08fr_.92fr] lg:gap-20">
        <Reveal className="relative overflow-hidden rounded-[1.35rem] bg-navy-deep">
          <Image src="/studio-process-v2.jpg" alt={lang === "id" ? "Meja kerja perencanaan desain Pagiverse Studio" : "Pagiverse Studio design planning workspace"} width={1672} height={941} sizes="(max-width: 1024px) 100vw, 52vw" className="h-auto w-full object-cover" />
        </Reveal>

        <div>
          <Reveal>
            <p className="studio-kicker">{t.kicker}</p>
            <h2 className="mt-7 max-w-[13ch] text-balance text-4xl font-extrabold leading-[1.04] tracking-[-.05em] text-navy-deep sm:text-5xl">
              {t.title}
            </h2>
            <p className="mt-6 max-w-[48ch] text-sm leading-7 text-navy-deep/55">{t.body}</p>
          </Reveal>
          <ol className="mt-10 border-t studio-rule">
            {t.steps.map(([title, body], index) => (
              <Reveal key={title} delay={index * 65} className="grid grid-cols-[2.2rem_1fr] gap-3 border-b py-5 studio-rule">
                <span className="pt-0.5 text-xs font-extrabold text-teal-700">0{index + 1}</span>
                <div>
                  <h3 className="font-bold text-navy-deep">{title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-navy-deep/52">{body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
