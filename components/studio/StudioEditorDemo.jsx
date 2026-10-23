"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Check, Monitor, RotateCcw, Smartphone } from "lucide-react";
import NativeTemplateRenderer from "@/components/templates/NativeTemplateRenderer";
import { getTemplateThumbnail } from "@/lib/template-library";
import { useLang } from "@/components/LanguageProvider";

const COPY = {
  id: { steps: ["Pilih yang kamu suka.", "Ubah jadi milikmu.", "Lihat. Pastikan. Siap."], descriptions: ["Mulai dari desain yang dekat dengan karakter bisnismu. Struktur dan tampilannya sudah disiapkan.", "Ganti nama, tulisan, foto, dan warna. Setiap perubahan langsung terlihat di sebelahnya.", "Cek tampilannya di komputer dan HP. Kirim hasil edit untuk kami tinjau sebelum website ditayangkan."], demo: "Coba langsung di sini", name: "Nama bisnis", heading: "Judul pembuka", reset: "Atur ulang contoh", desktop: "Tampilan komputer", mobile: "Tampilan HP", open: "Lanjut di editor", hint: "Contoh interaktif. Perubahan di sini hanya untuk mencoba.", accent: "Warna aksen", preview: "Pratinjau website", review: "Siap dilihat dari setiap layar.", reviewBody: "Buka editor lengkap untuk mengganti foto, mengatur halaman, dan menyimpan hasil editmu." },
  en: { steps: ["Find your starting point.", "Make it your own.", "Look. Check. Ready."], descriptions: ["Start with a design that fits your business. The layout and structure are already in place.", "Change the name, words, images, and colors. See every change appear beside you.", "Check desktop and mobile. Send your edits for our review before your website goes live."], demo: "Try it right here", name: "Business name", heading: "Opening headline", reset: "Reset example", desktop: "Desktop preview", mobile: "Mobile preview", open: "Continue in editor", hint: "Interactive example. Changes here are just for trying it out.", accent: "Accent color", preview: "Website preview", review: "Ready to see on every screen.", reviewBody: "Open the full editor to replace images, arrange pages, and save your changes." }
};

export default function StudioEditorDemo({ templates = [] }) {
  const { lang } = useLang();
  const t = COPY[lang];
  const [selected, setSelected] = useState(0);
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState({});
  const [device, setDevice] = useState("desktop");
  const [ready, setReady] = useState(false);
  const ref = useRef(null);
  const stageRef = useRef(null);
  const template = templates[selected];
  const headingKey = useMemo(() => Object.keys(template?.fields || {}).find((key) => key === `sections.hero.heading.${lang}`) || Object.keys(template?.fields || {}).find((key) => /^sections\.hero\.(heading|title)/.test(key)), [template, lang]);
  const previewConfig = useMemo(() => {
    const localized = { ...config };
    for (const key of Object.keys(template?.fields || {})) {
      if (!key.endsWith(".id")) continue;
      const english = key.slice(0, -3) + ".en";
      if (!template.fields[english]) continue;
      const source = lang === "en" ? english : key;
      const text = config[source] ?? template.fields[source].default;
      if (text !== undefined) { localized[key] = text; localized[english] = text; }
    }
    return localized;
  }, [config, template, lang]);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setReady(true); observer.disconnect(); } }, { rootMargin: "200px" });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => node.style.setProperty("--demo-scale", String(entry.contentRect.width / (device === "mobile" ? 390 : 1200))));
    observer.observe(node);
    return () => observer.disconnect();
  }, [device]);
  if (!template) return null;
  const nameKey = "business.name";
  function selectTemplate(index) { setSelected(index); setConfig({}); }
  function value(key) { return config[key] ?? template.fields?.[key]?.default ?? ""; }
  return <div ref={ref} className="pg-editor-story">
    <div className="pg-editor-steps" role="group" aria-label={lang === "id" ? "Cara menggunakan editor" : "Using the editor"}>{t.steps.map((title, index) => <button key={title} type="button" id={`pg-step-${index}`} aria-controls="pg-demo-panel" aria-pressed={step === index} onClick={() => setStep(index)} className={step === index ? "is-active" : ""}><span>{title}</span><p>{t.descriptions[index]}</p></button>)}</div>
    <div className="pg-editor-window" id="pg-demo-panel" role="region" aria-labelledby={`pg-step-${step}`}>
      <div className="pg-editor-toolbar"><span className="pg-editor-wordmark">pagiverse<span> / editor</span></span><span>{t.demo}</span><div className="pg-device-switch"><button type="button" aria-label={t.desktop} aria-pressed={device === "desktop"} onClick={() => setDevice("desktop")}><Monitor size={17} /></button><button type="button" aria-label={t.mobile} aria-pressed={device === "mobile"} onClick={() => setDevice("mobile")}><Smartphone size={17} /></button></div></div>
      <div className="pg-editor-ui"><div className="pg-editor-controls" key={`${step}-${selected}`}>
        {step === 0 ? <div className="pg-demo-picks">{templates.map((item, index) => <button key={item.id} type="button" onClick={() => selectTemplate(index)} aria-pressed={selected === index}><span className="pg-demo-pick-image"><Image src={`/studio-showcase/templates/${item.id}.jpg`} alt={item.name} fill sizes="220px" /></span><span>{item.name}{selected === index && <Check size={15} />}</span></button>)}<button className="pg-demo-next" type="button" onClick={() => setStep(1)}>{t.steps[1]} <ArrowUpRight size={16} /></button></div> : step === 1 ? <><label>{t.name}<input value={value(nameKey)} maxLength={60} onChange={(event) => setConfig((current) => ({ ...current, [nameKey]: event.target.value }))} /></label><label>{t.heading}<textarea value={value(headingKey)} maxLength={54} rows={3} onChange={(event) => setConfig((current) => ({ ...current, [headingKey]: event.target.value }))} /></label><fieldset><legend>{t.accent}</legend><div className="pg-demo-colors">{["#c79b61", "#497d68", "#8e4050", "#485f88"].map((color) => <button key={color} type="button" aria-label={`${t.accent} ${color}`} aria-pressed={config["theme.accent"] === color} style={{ background: color }} onClick={() => setConfig((current) => ({ ...current, "theme.accent": color }))}>{config["theme.accent"] === color && <Check size={14} />}</button>)}</div></fieldset><button type="button" className="pg-demo-reset" onClick={() => setConfig({})}><RotateCcw size={13} />{t.reset}</button></> : <div className="pg-demo-review"><Monitor size={26} /><h3>{t.review}</h3><p>{t.reviewBody}</p><a href={`/studio/${template.id}`}>{t.open}<ArrowUpRight size={16} /></a></div>}
      </div><div className="pg-editor-canvas" aria-label={t.preview}><div ref={stageRef} className={`pg-demo-stage ${device === "mobile" ? "is-mobile" : ""}`}><div className="pg-demo-viewport" style={{ width: device === "mobile" ? 390 : 1200 }}>{ready ? <NativeTemplateRenderer template={template} config={previewConfig} deviceMode={device} /> : <Image src={getTemplateThumbnail(template)} alt={template.name} fill sizes="800px" />}</div></div></div></div>
      <div className="pg-editor-footnote"><span>{t.hint}</span><a href={`/studio/${template.id}`}>{t.open}<ArrowUpRight size={14} /></a></div>
    </div>
  </div>;
}
