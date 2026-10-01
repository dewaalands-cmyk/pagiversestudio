"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";
import Reveal from "@/components/Reveal";

const FALLBACK = [
  { nama: "3GRT Management", gambar: "/portfolio/screenshots/3grt-v2.jpg", link: "https://3grtmanagement.vercel.app/", kategori: { id: "Company Profile / Event Organizer", en: "Company Profile / Event Organizer" }, deskripsi: { id: "Company profile dua bahasa untuk event combat sport, dirancang agar terlihat siap bekerja di skala nasional.", en: "A bilingual company profile for a combat sports organizer, designed to look ready for national-scale partnerships." } },
  { nama: "Teman Deadline", gambar: "/portfolio/teman-deadline.jpg", link: "https://temandeadline.vercel.app/", kategori: { id: "Landing Page / Jasa", en: "Landing Page / Services" }, deskripsi: { id: "Landing page jasa yang menata informasi penting dan membangun rasa percaya sebelum calon klien menghubungi.", en: "A service landing page that organizes key information and builds trust before prospective clients get in touch." } },
  { nama: "Muay Thai School Garut", gambar: "/portfolio/screenshots/muaythai-v2.jpg", link: "https://muaythaischoolgarut.vercel.app/", kategori: { id: "Company Profile / Olahraga", en: "Company Profile / Sports" }, deskripsi: { id: "Website resmi sekolah Muay Thai dengan program, pelatih, galeri, dan jalur pendaftaran yang mudah dipahami.", en: "An official Muay Thai school website with clear programs, coaches, galleries, and membership registration." } },
  { nama: "KashFlow", gambar: "/portfolio/screenshots/kashflow-v2.jpg", link: "https://kashflow-omega.vercel.app/", kategori: { id: "Web App / Keuangan", en: "Web App / Finance" }, deskripsi: { id: "Aplikasi buku kas digital untuk transaksi, laporan, dan pengelolaan keuangan bisnis sehari-hari.", en: "A digital cashbook for everyday transactions, reporting, and business financial management." } },
];

function clean(value = "") {
  return value.replace(/[\u2013\u2014]/g, "-").replace(/[\u2022\u00b7]/g, "/");
}

export default function StudioPortfolio({ settings = {}, dbItems = [] }) {
  const { lang } = useLang();
  const dbProjects = dbItems.map((item) => {
    const known = FALLBACK.find((project) => project.nama.toLowerCase() === item.title?.trim().toLowerCase());
    return {
      nama: item.title,
      gambar: item.image_url || known?.gambar || "",
      link: item.link || known?.link || "#",
      kategori: lang === "en" && known ? known.kategori.en : item.category || known?.kategori[lang] || "",
      deskripsi: lang === "en" && known ? known.deskripsi.en : item.description || known?.deskripsi[lang] || "",
    };
  });
  const dbNames = new Set(dbProjects.map((item) => item.nama.trim().toLowerCase()));
  const projects = [
    ...dbProjects,
    ...FALLBACK.filter((item) => !dbNames.has(item.nama.toLowerCase())).map((item) => ({ ...item, kategori: item.kategori[lang], deskripsi: item.deskripsi[lang] })),
  ];

  const copy = lang === "id"
    ? {
        kicker: settings.portfolio_label || "Portfolio terpilih",
        title: settings.portfolio_title || "Bukti kerja yang bisa kamu buka sendiri.",
        body: settings.portfolio_subtitle || "Bukan konsep fiktif. Ini website yang sudah tayang dan dipakai oleh bisnis nyata.",
        view: "Buka website",
      }
    : {
        kicker: "Selected work",
        title: "Real work you can open and explore.",
        body: "Not fictional concepts. These websites are live and used by real businesses.",
        view: "Visit website",
      };

  return (
    <section id="portfolio" className="border-y studio-rule bg-navy-deep text-white">
      <div className="studio-shell py-24 md:py-32">
        <Reveal className="grid gap-7 md:grid-cols-[1fr_.7fr] md:items-end">
          <div>
            <p className="studio-kicker !text-mint">{copy.kicker}</p>
            <h2 className="mt-7 max-w-[13ch] text-balance text-4xl font-extrabold leading-[1.03] tracking-[-.052em] sm:text-5xl lg:text-[3.6rem]">{copy.title}</h2>
          </div>
          <p className="max-w-[46ch] text-sm leading-7 text-white/57 md:justify-self-end">{copy.body}</p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-12">
          {projects.map((project, index) => {
            const featured = index === 0;
            return (
              <Reveal key={`${project.nama}-${index}`} delay={(index % 3) * 65} className={featured ? "md:col-span-12" : "md:col-span-4"}>
                <a href={project.link} target="_blank" rel="noopener noreferrer" className="group block">
                  <div className={`relative overflow-hidden rounded-[1.15rem] border border-white/12 bg-[#132840] ${featured ? "aspect-[16/8]" : "aspect-[4/3]"}`}>
                    {project.gambar ? (
                      <Image src={project.gambar} alt={`${lang === "id" ? "Tampilan website" : "Website preview for"} ${project.nama}`} fill sizes={featured ? "(max-width: 768px) 100vw, 80rem" : "(max-width: 768px) 100vw, 27rem"} className="object-cover object-top transition duration-700 group-hover:scale-[1.025]" />
                    ) : (
                      <div className="flex h-full items-center justify-center p-8 text-center text-white/45">{project.nama}</div>
                    )}
                  </div>
                  <div className={`mt-5 ${featured ? "grid gap-4 md:grid-cols-[1fr_.75fr_auto] md:items-start" : ""}`}>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[.13em] text-mint">{clean(project.kategori)}</p>
                      <h3 className="mt-2 text-xl font-bold tracking-[-.025em] sm:text-2xl">{project.nama}</h3>
                    </div>
                    {project.deskripsi && <p className={`${featured ? "md:mt-0" : "mt-3"} text-sm leading-6 text-white/54`}>{clean(project.deskripsi)}</p>}
                    <span className={`${featured ? "md:justify-self-end" : "mt-4"} inline-flex items-center gap-2 text-sm font-bold text-white transition group-hover:text-mint`}>
                      {copy.view} <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
