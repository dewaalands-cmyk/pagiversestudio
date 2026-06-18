"use client";

import { useRef } from "react";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { useLang } from "./LanguageProvider";

const konten = {
  id: { label: "Portfolio", judul: "Karya yang sudah tayang", subjudul: "Beberapa website yang kami bangun dan kini sudah online. Klik untuk melihatnya langsung.", lihat: "Lihat Website" },
  en: { label: "Portfolio", judul: "Work that's live", subjudul: "Some of the websites we've built and are now live. Click to see them.", lihat: "View Website" },
};

const fallbackProyek = [
  { nama: "Teman Deadline", gambar: "/portfolio/teman-deadline.jpg", link: "https://temandeadline.vercel.app/", kategori: "Landing Page • Jasa", deskripsi: "Website jasa pengerjaan tugas yang tampil rapi dan meyakinkan, dengan fokus pada kepercayaan dan kemudahan menghubungi." },
  { nama: "Muay Thai School Garut", gambar: "/portfolio/muaythai-garut.jpg", link: "https://muaythaischoolgarut.vercel.app/", kategori: "Company Profile • Olahraga", deskripsi: "Profil resmi sekolah Muay Thai di Garut — menampilkan program latihan, pelatih, galeri, dan informasi pendaftaran member." },
  { nama: "3GRT Management", gambar: "/portfolio/3grt-management.jpg", link: "https://3grtmanagement.vercel.app/", kategori: "Company Profile • Event Organizer", deskripsi: "Website company profile dwibahasa untuk penyelenggara event combat sport, dirancang premium untuk skala nasional." },
  { nama: "KashFlow", gambar: "/portfolio/kashflow-app.svg", link: "https://kashflow-omega.vercel.app/", kategori: "Web App • Akuntansi & Keuangan", deskripsi: "Buku kas digital untuk bisnis — catat pemasukan & pengeluaran, pantau arus kas real-time, dan buat laporan keuangan dalam hitungan detik." },
];

export default function Portfolio({ settings = {}, dbItems = [] }) {
  const { lang } = useLang();
  const t = konten[lang];
  const scrollRef = useRef(null);

  const label    = (lang === "id" && settings.portfolio_label)    || t.label;
  const judul    = (lang === "id" && settings.portfolio_title)    || t.judul;
  const subjudul = (lang === "id" && settings.portfolio_subtitle) || t.subjudul;

  // Item dari database (admin)
  const dbProyek = dbItems.map((item) => ({
    nama: item.title,
    gambar: item.image_url ?? "",
    link: item.link ?? "#",
    kategori: item.category ?? "",
    deskripsi: item.description ?? "",
    technologies: item.technologies ?? "",
  }));

  // Gabung: DB dulu, lalu showcase yang belum ada di DB (dedupe by nama)
  const dbNames = new Set(dbProyek.map((p) => p.nama.trim().toLowerCase()));
  const proyek = [
    ...dbProyek,
    ...fallbackProyek.filter((p) => !dbNames.has(p.nama.trim().toLowerCase())),
  ];

  function slide(dir) {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector("[data-card]");
    const amount = card ? card.offsetWidth + 28 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

  return (
    <section id="portfolio" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-wider text-teal-700 dark:text-mint">
          {label}
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-deep dark:text-white md:text-4xl">
          {judul}
        </h2>
        <p className="mt-4 leading-relaxed text-slate-muted dark:text-slate-label">
          {subjudul}
        </p>
      </div>

      <div className="relative mt-12">
        {/* Tombol Prev */}
        {proyek.length > 1 && (
          <button
            type="button"
            onClick={() => slide(-1)}
            aria-label="Sebelumnya"
            className="absolute -left-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-cloud-200 bg-white p-2.5 text-navy-deep shadow-md transition-all hover:-translate-y-1/2 hover:scale-110 hover:border-mint hover:text-mint dark:border-white/10 dark:bg-navy-soft dark:text-white md:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Track slider */}
        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-7 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {proyek.map((p, i) => (
            <a
              key={i}
              data-card
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex w-[300px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-cloud-200 bg-white transition-all hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-navy-soft sm:w-[340px]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-navy-deep">
                {p.gambar ? (
                  <img
                    src={p.gambar}
                    alt={p.nama}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-contain p-6 transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white/30 text-sm font-medium">{p.nama}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col p-6">
                {p.kategori && (
                  <span className="text-xs font-medium uppercase tracking-wider text-teal-700 dark:text-mint">
                    {p.kategori}
                  </span>
                )}
                <h3 className="mt-2 text-lg font-semibold text-navy-deep dark:text-white">{p.nama}</h3>
                {p.deskripsi && (
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-muted dark:text-slate-label">
                    {p.deskripsi}
                  </p>
                )}
                {p.technologies && (
                  <p className="mt-2 text-xs text-slate-400 dark:text-slate-label">{p.technologies}</p>
                )}
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-deep transition-colors group-hover:text-teal-600 dark:text-white dark:group-hover:text-mint">
                  {t.lihat} <ExternalLink className="h-4 w-4" />
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* Tombol Next */}
        {proyek.length > 1 && (
          <button
            type="button"
            onClick={() => slide(1)}
            aria-label="Berikutnya"
            className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-cloud-200 bg-white p-2.5 text-navy-deep shadow-md transition-all hover:-translate-y-1/2 hover:scale-110 hover:border-mint hover:text-mint dark:border-white/10 dark:bg-navy-soft dark:text-white md:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      <p className="mt-2 text-center text-xs text-slate-muted dark:text-slate-label md:hidden">
        ← Geser untuk lihat lainnya →
      </p>
    </section>
  );
}
