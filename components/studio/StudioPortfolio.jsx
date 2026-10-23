"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "@/components/LanguageProvider";
import Reveal from "@/components/Reveal";

const FALLBACK = [
  { nama: "3GRT Management", gambar: "/portfolio/screenshots/3grt-v2.jpg", link: "https://3grtmanagement.vercel.app/", kategori: { id: "Company profile / Event", en: "Company profile / Events" } },
  { nama: "Muay Thai School Garut", gambar: "/portfolio/screenshots/muaythai-v2.jpg", link: "https://muaythaischoolgarut.vercel.app/", kategori: { id: "Company profile / Olahraga", en: "Company profile / Sports" } },
  { nama: "Teman Deadline", gambar: "/portfolio/teman-deadline.jpg", link: "https://temandeadline.vercel.app/", kategori: { id: "Landing page / Jasa", en: "Landing page / Services" } },
  { nama: "KashFlow", gambar: "/portfolio/screenshots/kashflow-v2.jpg", link: "https://kashflow-omega.vercel.app/", kategori: { id: "Web app / Keuangan", en: "Web app / Finance" } },
];

function safeExternalUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function safeImageUrl(value) {
  const source = String(value || "").trim();
  if (source.startsWith("/") && !source.startsWith("//") && !source.includes("\\")) return source;
  return safeExternalUrl(source);
}

function WorkPreview({ project, lang }) {
  const [source, setSource] = useState(project.gambar);

  return (
    <div className="pg-work-image">
      {source ? (
        <Image
          src={source}
          alt={`${lang === "id" ? "Tampilan website" : "Website preview for"} ${project.nama}`}
          fill
          sizes="(max-width: 700px) 89vw, 53vw"
          unoptimized={Boolean(safeExternalUrl(source))}
          className="pg-preview-image"
          onError={() => setSource((current) => current !== project.fallbackImage ? project.fallbackImage || "" : "")}
        />
      ) : (
        <span className="pg-image-fallback">{project.nama}</span>
      )}
      {project.link && <span className="pg-preview-open" aria-hidden="true"><ArrowUpRight size={24} /></span>}
    </div>
  );
}

export default function StudioPortfolio({ dbItems = [] }) {
  const { lang } = useLang();
  const trackRef = useRef(null);
  const [position, setPosition] = useState({ start: true, end: false });
  const dbProjects = (Array.isArray(dbItems) ? dbItems : []).filter((item) => typeof item?.title === "string" && item.title.trim()).map((item) => {
    const known = FALLBACK.find((project) => project.nama.toLowerCase() === item.title.trim().toLowerCase());
    return {
      nama: item.title.trim(),
      gambar: safeImageUrl(item.image_url) || known?.gambar || "",
      fallbackImage: known?.gambar || "",
      link: safeExternalUrl(item.link) || known?.link || "",
      kategori: lang === "en" && known ? known.kategori.en : item.category || known?.kategori[lang] || "",
    };
  });
  const dbNames = new Set(dbProjects.map((item) => item.nama.toLowerCase()));
  const projects = [
    ...dbProjects,
    ...FALLBACK.filter((item) => !dbNames.has(item.nama.toLowerCase())).map((item) => ({ ...item, fallbackImage: item.gambar, kategori: item.kategori[lang] })),
  ];
  const copy = lang === "en" ? {
    label: "Selected work",
    title: "Different ideas. Distinct identities.",
    body: "A few websites we have worked on.",
    view: "Visit website",
    previous: "Previous project",
    next: "Next project",
    gallery: "Website portfolio",
  } : {
    label: "Portfolio",
    title: "Beragam ide. Karakternya sendiri.",
    body: "Beberapa website yang sudah kami kerjakan.",
    view: "Buka website",
    previous: "Proyek sebelumnya",
    next: "Proyek berikutnya",
    gallery: "Galeri portfolio website",
  };

  const updatePosition = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const start = track.scrollLeft <= 2;
    const end = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    setPosition((previous) => previous.start === start && previous.end === end ? previous : { start, end });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    updatePosition();
    const observer = new ResizeObserver(updatePosition);
    observer.observe(track);
    return () => observer.disconnect();
  }, [updatePosition, projects.length]);

  function move(direction) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector(".pg-work-card");
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    const distance = (card?.getBoundingClientRect().width || track.clientWidth * 0.8) + gap;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({ left: direction * distance, behavior: reducedMotion ? "instant" : "smooth" });
  }

  return (
    <section id="portfolio" className="pg-portfolio" aria-labelledby="pg-portfolio-title">
      <div className="studio-shell">
        <Reveal className="pg-section-heading">
          <div>
            <p className="pg-eyebrow">{copy.label}</p>
            <h2 id="pg-portfolio-title">{copy.title}</h2>
          </div>
          <div className="pg-work-heading-side">
            <p className="pg-section-intro">{copy.body}</p>
            <div className="pg-gallery-controls">
              <button type="button" onClick={() => move(-1)} disabled={position.start} aria-label={copy.previous} aria-controls="pg-work-track"><ArrowLeft size={22} /></button>
              <button type="button" onClick={() => move(1)} disabled={position.end} aria-label={copy.next} aria-controls="pg-work-track"><ArrowRight size={22} /></button>
            </div>
          </div>
        </Reveal>
      </div>

      <div id="pg-work-track" ref={trackRef} className="pg-work-track" onScroll={updatePosition} role="region" aria-label={copy.gallery} tabIndex={0}>
        {projects.map((project, index) => {
          const content = <>
            <WorkPreview key={project.gambar} project={project} lang={lang} />
            <div className="pg-work-caption">
              <div>
                <p>{project.kategori}</p>
                <h3>{project.nama}</h3>
              </div>
              {project.link && <span className="pg-work-visit">{copy.view}<ArrowUpRight size={18} aria-hidden="true" /></span>}
            </div>
          </>;
          return (
            <article className="pg-work-card" key={`${project.nama}-${index}`}>
              {project.link ? <a href={project.link} target="_blank" rel="noopener noreferrer">{content}</a> : content}
            </article>
          );
        })}
      </div>
    </section>
  );
}
