"use client";

import { ArrowUpRight } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";
import Reveal from "@/components/Reveal";

const FALLBACK = {
  id: [
    { title: "Cepat & Modern", desc: "Teknologi terkini agar website ringan dan nyaman diakses." },
    { title: "Rapi di HP", desc: "Tampilan konsisten di ponsel, tablet, dan komputer." },
    { title: "Siap Ditemukan", desc: "Struktur SEO dasar untuk membantu visibilitas di Google." },
    { title: "Komunikasi Jelas", desc: "Proses transparan, revisi terarah, dan respons yang cepat." },
  ],
  en: [
    { title: "Fast & Modern", desc: "Current technology keeps your website fast and comfortable to use." },
    { title: "Mobile Ready", desc: "A consistent experience across phones, tablets, and computers." },
    { title: "Ready to Be Found", desc: "A solid SEO foundation helps improve visibility on Google." },
    { title: "Clear Communication", desc: "A transparent process, focused revisions, and prompt responses." },
  ],
};

export default function StudioAbout({ settings = {} }) {
  const { lang } = useLang();
  const isId = lang === "id";
  let principles = FALLBACK[lang];
  if (isId && settings.about_cards) {
    try { principles = JSON.parse(settings.about_cards); } catch {}
  }

  const copy = isId
    ? {
        kicker: settings.about_label || "Tentang Pagiverse",
        title: settings.about_title || "Partner digital untuk bisnis lokal yang ingin tampil serius.",
        paragraphs: [
          settings.about_p1 || "Pagiverse Studio merancang website dan aplikasi berdasarkan tujuan bisnis, bukan sekadar mengikuti tren visual.",
          settings.about_p2 || "Kami menyusun pesan, alur, dan tampilan agar calon pelanggan cepat memahami nilai bisnismu dan lebih yakin untuk mengambil langkah berikutnya.",
          settings.about_p3 || "Setiap proyek dikerjakan langsung, dikomunikasikan secara transparan, dan didampingi setelah tayang.",
        ],
        link: "Lihat cara kami bekerja",
      }
    : {
        kicker: "About Pagiverse",
        title: "A digital partner for local businesses ready to look serious.",
        paragraphs: [
          "Pagiverse Studio designs websites and applications around business goals, not visual trends alone.",
          "We shape the message, flow, and interface so customers understand your value and feel confident taking the next step.",
          "Every project is handled directly, communicated transparently, and supported after launch.",
        ],
        link: "See how we work",
      };

  return (
    <section id="tentang" className="studio-shell py-24 md:py-32">
      <div className="grid gap-14 lg:grid-cols-[.82fr_1.18fr] lg:gap-24">
        <Reveal>
          <p className="studio-kicker">{copy.kicker}</p>
          <h2 className="mt-7 max-w-[14ch] text-balance text-4xl font-extrabold leading-[1.04] tracking-[-.05em] text-navy-deep sm:text-5xl lg:text-[3.6rem]">
            {copy.title}
          </h2>
          <a href="#proses" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-teal-700 transition hover:gap-3">
            {copy.link} <ArrowUpRight className="h-4 w-4" />
          </a>
        </Reveal>

        <div>
          <Reveal className="max-w-[64ch] space-y-5 text-[1.05rem] leading-8 text-navy-deep/62">
            {copy.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </Reveal>
          <div className="mt-12 border-t studio-rule">
            {principles.map((item, index) => (
              <Reveal key={item.title || index} delay={index * 60} className="grid gap-2 border-b py-5 studio-rule sm:grid-cols-[.55fr_1fr] sm:items-center">
                <h3 className="font-bold text-navy-deep">{item.title}</h3>
                <p className="text-sm leading-6 text-navy-deep/52">{item.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
