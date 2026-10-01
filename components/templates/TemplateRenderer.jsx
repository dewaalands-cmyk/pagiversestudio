"use client";

import { ArrowRight, Clock3, Instagram, MapPin, MessageCircle, Star } from "lucide-react";

function safeLink(value, fallback = "#") {
  if (!value) return fallback;
  try {
    const url = new URL(value, "https://pagiverse.studio");
    return ["http:", "https:"].includes(url.protocol) ? value : fallback;
  } catch {
    return fallback;
  }
}

function whatsappLink(value, message) {
  const number = String(value || "").replace(/\D/g, "");
  if (!number) return "#";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export default function TemplateRenderer({ template, config = {}, compact = false, lang = "id", deviceMode = "auto" }) {
  const baseConfig = lang === "en" && template.defaultConfigEn ? template.defaultConfigEn : template.defaultConfig;
  const data = { ...baseConfig, ...config };
  const color = data.primaryColor || template.accent || "#0d7c66";
  const forceMobile = deviceMode === "mobile";
  const useImageGrid = Boolean(data.heroImageGrid && data.heroImage === template.defaultConfig.heroImage);
  const items = [1, 2, 3].map((number) => ({
    title: data[`item${number}Title`],
    description: data[`item${number}Description`],
    price: data[`item${number}Price`],
  })).filter((item) => item.title);

  const ui = lang === "id"
    ? { nav: ["Tentang", "Pilihan", "Kontak"], detail: "Lihat detail", hours: "Jam buka", address: "Lokasi", testimonial: "Kata pelanggan", follow: "Ikuti kami" }
    : { nav: ["About", "Explore", "Contact"], detail: "View details", hours: "Opening hours", address: "Location", testimonial: "Customer story", follow: "Follow us" };

  const ctaHref = whatsappLink(data.whatsapp, lang === "id" ? `Halo ${data.businessName}, saya ingin bertanya.` : `Hi ${data.businessName}, I would like to ask a question.`);
  const rootSize = compact ? "text-[7px]" : "text-[14px] sm:text-[15px]";

  return (
    <div className={`min-h-full overflow-hidden bg-[#fbfaf7] text-[#172235] ${rootSize}`} style={{ "--template-color": color }}>
      <header className={`flex items-center justify-between border-b border-black/10 ${compact ? "px-4 py-3" : "px-5 py-4 sm:px-9 lg:px-12"}`}>
        <div className="flex items-center gap-2.5">
          {data.logo ? (
            <img src={data.logo} alt="" className={`${compact ? "h-5 w-5" : "h-9 w-9"} rounded-full object-cover`} />
          ) : (
            <span className={`${compact ? "h-5 w-5 text-[8px]" : "h-9 w-9 text-sm"} inline-flex items-center justify-center rounded-full font-extrabold text-white`} style={{ backgroundColor: color }}>
              {String(data.businessName || "P").charAt(0)}
            </span>
          )}
          <span className={`${compact ? "text-[8px]" : "text-sm sm:text-base"} font-extrabold tracking-[-0.03em]`}>{data.businessName}</span>
        </div>
        <nav className={`items-center ${compact || forceMobile ? "hidden" : "hidden gap-7 sm:flex"}`}>
          {ui.nav.map((item) => <span key={item} className="text-xs font-semibold text-[#172235]/55">{item}</span>)}
        </nav>
        <a href={ctaHref} target="_blank" rel="noopener noreferrer" className={`${compact ? "px-2.5 py-1.5 text-[6px]" : "px-4 py-2.5 text-xs"} inline-flex items-center gap-1.5 rounded-full font-bold text-white`} style={{ backgroundColor: color }}>
          {data.cta}<ArrowRight className={compact ? "h-2 w-2" : "h-3.5 w-3.5"} />
        </a>
      </header>

      <section className={`grid items-stretch ${compact ? "min-h-[185px] grid-cols-[1.06fr_.94fr]" : forceMobile ? "min-h-[520px] grid-cols-1" : "min-h-[520px] lg:grid-cols-[1.03fr_.97fr]"}`}>
        <div className={`flex flex-col justify-center ${compact ? "p-5" : "px-6 py-16 sm:px-10 lg:px-14 lg:py-24"}`}>
          <p className={`${compact ? "text-[6px]" : "text-[11px]"} font-extrabold uppercase tracking-[.18em]`} style={{ color }}>{data.eyebrow}</p>
          <h1 className={`${compact ? "mt-3 text-[19px] leading-[1.02]" : "mt-6 max-w-[12ch] text-4xl leading-[1.02] sm:text-6xl lg:text-7xl"} font-extrabold tracking-[-.055em]`}>{data.headline}</h1>
          <p className={`${compact ? "mt-3 line-clamp-2 max-w-[27ch] text-[7px] leading-[1.5]" : "mt-7 max-w-[52ch] text-sm leading-7 text-[#172235]/60 sm:text-base"}`}>{data.description}</p>
          <a href={ctaHref} target="_blank" rel="noopener noreferrer" className={`${compact ? "mt-4 w-fit px-3 py-2 text-[6px]" : "mt-9 w-fit px-5 py-3 text-sm"} inline-flex items-center gap-2 rounded-full font-extrabold text-white`} style={{ backgroundColor: color }}>
            {data.cta}<ArrowRight className={compact ? "h-2 w-2" : "h-4 w-4"} />
          </a>
        </div>
        <div className={`${compact ? "m-2 ml-0 min-h-[172px] rounded-[12px]" : "min-h-[380px] lg:m-4 lg:ml-0 lg:rounded-[24px]"} relative overflow-hidden bg-[#e8e4dd]`}>
          {useImageGrid ? <div role="img" aria-label={data.businessName} className="absolute inset-0 bg-cover" style={{ backgroundImage: `url(${data.heroImage})`, backgroundSize: "200% 200%", backgroundPosition: data.heroImagePosition || "left top" }} /> : <img src={data.heroImage} alt={data.businessName} className="absolute inset-0 h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        </div>
      </section>

      <section className={`${compact ? "px-4 py-6" : "px-6 py-16 sm:px-10 lg:px-14 lg:py-24"}`}>
        <div className={`${compact ? "mb-4" : "mb-10 flex items-end justify-between gap-6"}`}>
          <div>
            <p className={`${compact ? "text-[6px]" : "text-[11px]"} font-extrabold uppercase tracking-[.18em]`} style={{ color }}>{ui.detail}</p>
            <h2 className={`${compact ? "mt-1.5 text-[14px]" : "mt-3 text-3xl sm:text-4xl"} font-extrabold tracking-[-.045em]`}>{data.sectionTitle}</h2>
          </div>
        </div>
        <div className={`grid border-l border-t border-black/10 ${forceMobile ? "grid-cols-1" : "grid-cols-3"}`}>
          {items.map((item, index) => (
            <article key={`${item.title}-${index}`} className={`${compact ? "min-h-[82px] p-3" : "min-h-[220px] p-6 sm:p-8"} flex flex-col border-b border-r border-black/10`}>
              <span className={`${compact ? "text-[6px]" : "text-xs"} font-extrabold opacity-35`}>0{index + 1}</span>
              <h3 className={`${compact ? "mt-4 text-[8px]" : "mt-10 text-lg sm:text-xl"} font-extrabold tracking-[-.03em]`}>{item.title}</h3>
              {!compact && <p className="mt-3 text-sm leading-6 text-[#172235]/55">{item.description}</p>}
              <p className={`${compact ? "mt-1 text-[6px]" : "mt-auto pt-8 text-sm"} font-extrabold`} style={{ color }}>{item.price}</p>
            </article>
          ))}
        </div>
      </section>

      {!compact && (
        <>
          <section className={`grid border-y border-black/10 bg-white ${forceMobile ? "grid-cols-1" : "sm:grid-cols-[1.1fr_.9fr]"}`}>
            <div className="px-6 py-14 sm:px-10 lg:px-14 lg:py-20">
              <div className="flex gap-1" style={{ color }}>{[0, 1, 2, 3, 4].map((star) => <Star key={star} className="h-4 w-4 fill-current" />)}</div>
              <p className="mt-7 max-w-[34ch] text-2xl font-bold leading-snug tracking-[-.035em] sm:text-3xl">“{data.testimonial}”</p>
              <p className="mt-5 text-xs font-extrabold uppercase tracking-[.16em] text-[#172235]/42">{ui.testimonial}</p>
            </div>
            <div className="grid content-center gap-6 border-t border-black/10 px-6 py-14 sm:border-l sm:border-t-0 sm:px-10 lg:px-14">
              <div className="flex gap-3"><Clock3 className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} /><div><p className="text-xs font-extrabold uppercase tracking-wider text-[#172235]/42">{ui.hours}</p><p className="mt-1 text-sm font-semibold">{data.hours}</p></div></div>
              <a href={safeLink(data.mapsUrl)} target="_blank" rel="noopener noreferrer" className="flex gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} /><div><p className="text-xs font-extrabold uppercase tracking-wider text-[#172235]/42">{ui.address}</p><p className="mt-1 text-sm font-semibold">{data.address}</p></div></a>
              <div className="flex gap-3"><Instagram className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} /><div><p className="text-xs font-extrabold uppercase tracking-wider text-[#172235]/42">{ui.follow}</p><p className="mt-1 text-sm font-semibold">{data.instagram}</p></div></div>
            </div>
          </section>
          <footer className="flex flex-col items-start justify-between gap-6 px-6 py-10 sm:flex-row sm:items-center sm:px-10 lg:px-14">
            <p className="font-extrabold">{data.businessName}</p>
            <a href={ctaHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-extrabold" style={{ color }}><MessageCircle className="h-4 w-4" />{data.cta}</a>
          </footer>
        </>
      )}
    </div>
  );
}
