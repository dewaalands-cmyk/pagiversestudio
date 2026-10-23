"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { useLang } from "@/components/LanguageProvider";
import Reveal from "@/components/Reveal";
import {
  TEMPLATE_LIBRARY,
  getTemplateCategoryLabel,
  getTemplateCollectionGroup,
  getTemplateThumbnail,
} from "@/lib/template-library";

const CURATED_IDS = [
  "casa-braci-heritage-001",
  "narasi-visual-corporate-001",
  "tata-tumbuh-advisory-001",
  "dapur-pesisir-tropical-001",
  "arkana-pradipta-partners-001",
  "rona-nusa-restaurant-001",
];

const CURATED_TEMPLATES = [
  ...CURATED_IDS.map((id) => TEMPLATE_LIBRARY.find((template) => template.id === id)).filter(Boolean),
  ...TEMPLATE_LIBRARY.filter((template) => !CURATED_IDS.includes(template.id)),
].slice(0, 6);

const FILTERS = [
  { id: "all", label: { id: "Semua", en: "All" } },
  { id: "company-profile", label: { id: "Company profile", en: "Company profile" } },
  { id: "restaurant", label: { id: "Restoran & kafe", en: "Restaurants & cafes" } },
].filter((filter) => filter.id === "all" || CURATED_TEMPLATES.some((template) => getTemplateCollectionGroup(template)?.id === filter.id));

function TemplatePreview({ template, lang }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="pg-template-image">
      {failed ? (
        <span className="pg-image-fallback">{template.name}</span>
      ) : (
        <Image
          src={CURATED_IDS.includes(template.id) ? `/studio-showcase/templates/${template.id}.jpg` : getTemplateThumbnail(template)}
          alt={`${lang === "id" ? "Tampilan template" : "Template preview:"} ${template.name}`}
          fill
          sizes="(max-width: 640px) 94vw, (max-width: 1000px) 47vw, 32vw"
          className="pg-preview-image"
          onError={() => setFailed(true)}
        />
      )}
      <span className="pg-preview-open" aria-hidden="true"><ArrowUpRight size={22} /></span>
    </div>
  );
}

export default function StudioTemplates() {
  const { lang } = useLang();
  const [filter, setFilter] = useState("all");
  const copy = lang === "en" ? {
    label: "A place to start",
    title: "Find your starting point.",
    body: "Choose a design that feels right. Make the words, images, and colors your own in the editor.",
    browse: "Explore all templates",
    preview: "Preview template",
    filters: "Filter templates",
  } : {
    label: "Mulai dari sini",
    title: "Temukan awal yang kamu suka.",
    body: "Pilih desain yang paling dekat dengan visimu. Sesuaikan tulisan, gambar, dan warnanya melalui editor.",
    browse: "Jelajahi semua template",
    preview: "Lihat template",
    filters: "Saring template",
  };
  const visibleTemplates = CURATED_TEMPLATES.filter((template) => filter === "all" || getTemplateCollectionGroup(template)?.id === filter);

  return (
    <section id="template" className="pg-templates" aria-labelledby="pg-templates-title">
      <div className="studio-shell">
        <Reveal className="pg-section-heading">
          <div>
            <p className="pg-eyebrow">{copy.label}</p>
            <h2 id="pg-templates-title">{copy.title}</h2>
          </div>
          <p className="pg-section-intro">{copy.body}</p>
        </Reveal>

        <div className="pg-filter" role="group" aria-label={copy.filters}>
          {FILTERS.map((item) => (
            <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>
              {item.label[lang] || item.label.id}
            </button>
          ))}
        </div>

        <div className="pg-template-grid">
          {visibleTemplates.map((template, index) => (
            <Reveal key={template.id} delay={(index % 3) * 65} className="pg-template-card">
              <Link href={`/templates/${template.id}`} aria-label={`${copy.preview}: ${template.name}`}>
                <TemplatePreview template={template} lang={lang} />
                <div className="pg-template-caption">
                  <h3>{template.name}</h3>
                  <span>{getTemplateCategoryLabel(template, lang)}</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="pg-section-footer">
          <Link href="/templates" className="pg-text-link">{copy.browse}<ArrowUpRight size={21} aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}
