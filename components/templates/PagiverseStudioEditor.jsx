"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronRight, Cloud, ImagePlus, Loader2, Monitor, RotateCcw, Smartphone, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLang } from "@/components/LanguageProvider";
import { EDITOR_GROUPS, formatTemplatePrice } from "@/lib/template-library";
import TemplateRenderer from "@/components/templates/TemplateRenderer";

const MAX_IMAGE_SIZE = 1.5 * 1024 * 1024;

function ImageField({ field, value, onChange, copy }) {
  const inputRef = useRef(null);
  const [error, setError] = useState("");

  function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError(copy.imageType);
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError(copy.imageSize);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setError("");
      onChange(String(reader.result));
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <button type="button" onClick={() => inputRef.current?.click()} className="group flex w-full items-center gap-3 rounded-xl border border-dashed border-navy-deep/20 bg-[#faf9f6] p-3 text-left transition hover:border-teal-700">
        {value ? <img src={value} alt="" className="h-14 w-14 rounded-lg object-cover" /> : <span className="inline-flex h-14 w-14 items-center justify-center rounded-lg bg-white text-navy-deep/35"><ImagePlus className="h-5 w-5" /></span>}
        <span><span className="block text-xs font-extrabold">{value ? copy.replaceImage : copy.chooseImage}</span><span className="mt-1 block text-[10px] text-navy-deep/40">{copy.imageHelp}</span></span>
      </button>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
      {value && <button type="button" onClick={() => onChange("")} className="mt-2 text-[10px] font-bold text-red-600">{copy.removeImage}</button>}
      {error && <p className="mt-2 text-[10px] font-semibold text-red-600">{error}</p>}
    </div>
  );
}

function FieldControl({ field, value, onChange, copy, lang }) {
  const common = "w-full rounded-xl border border-navy-deep/15 bg-white px-3.5 py-3 text-sm text-navy-deep outline-none transition placeholder:text-navy-deep/28 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/10";
  if (field.type === "image") return <ImageField field={field} value={value} onChange={onChange} copy={copy} />;
  if (field.type === "color") return (
    <div className="flex items-center gap-3 rounded-xl border border-navy-deep/15 bg-white p-2">
      <input type="color" value={value || "#0d7c66"} onChange={(event) => onChange(event.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border-0 bg-transparent" />
      <input type="text" value={value || ""} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent px-1 text-sm font-semibold uppercase outline-none" />
    </div>
  );
  if (field.type === "textarea") return <textarea rows={3} value={value || ""} onChange={(event) => onChange(event.target.value)} placeholder={field.placeholder?.[lang]} className={`${common} resize-y`} />;
  return <input type={field.type || "text"} value={value || ""} onChange={(event) => onChange(event.target.value)} placeholder={field.placeholder?.[lang]} className={common} />;
}

export default function PagiverseStudioEditor({ template }) {
  const { lang } = useLang();
  const storageKey = `pagiverse-draft-${template.id}`;
  const initialConfig = lang === "en" && template.defaultConfigEn ? template.defaultConfigEn : template.defaultConfig;
  const [config, setConfig] = useState(initialConfig);
  const [activeGroup, setActiveGroup] = useState("brand");
  const [device, setDevice] = useState("desktop");
  const [mobileTab, setMobileTab] = useState("edit");
  const [saved, setSaved] = useState(true);
  const [ready, setReady] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [customer, setCustomer] = useState({ name: "", email: "", whatsapp: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [projectId, setProjectId] = useState("");

  const copy = lang === "id" ? {
    exit: "Keluar", title: "Pagiverse Studio", draft: "Draft tersimpan", saving: "Menyimpan...", preview: "Preview", edit: "Edit",
    reset: "Mulai ulang", continue: "Tinjau pesanan", progress: "kelengkapan", required: "Wajib diisi", chooseImage: "Pilih foto", replaceImage: "Ganti foto", removeImage: "Hapus foto",
    imageType: "Gunakan file gambar PNG, JPG, atau WEBP.", imageSize: "Ukuran gambar maksimal 1.5 MB.", imageHelp: "PNG, JPG, WEBP · Maks. 1.5 MB", reviewTitle: "Periksa sebelum dikirim", reviewBody: "Pastikan isi website dan data yang bisa kami hubungi sudah benar.",
    websiteData: "Isi website", customerData: "Data pemesan", name: "Nama lengkap", email: "Email", wa: "Nomor WhatsApp", notes: "Catatan tambahan", notesHint: "Contoh: ingin website tayang sebelum tanggal tertentu",
    backEdit: "Kembali edit", submit: "Kirim ke Pagiverse", submitting: "Mengirim...", formError: "Lengkapi nama, email, dan nomor WhatsApp terlebih dahulu.",
    successTitle: "Project kamu sudah kami terima.", successBody: "Simpan Project ID ini. Tim Pagiverse akan menghubungimu melalui WhatsApp untuk langkah berikutnya.", projectLabel: "Project ID", browse: "Lihat template lain", home: "Kembali ke beranda",
    networkError: "Project belum bisa dikirim. Draft tetap tersimpan di perangkat ini. Silakan coba lagi atau hubungi Pagiverse.", price: "Nilai template",
  } : {
    exit: "Exit", title: "Pagiverse Studio", draft: "Draft saved", saving: "Saving...", preview: "Preview", edit: "Edit",
    reset: "Start over", continue: "Review order", progress: "complete", required: "Required", chooseImage: "Choose image", replaceImage: "Replace image", removeImage: "Remove image",
    imageType: "Use a PNG, JPG, or WEBP image.", imageSize: "Maximum image size is 1.5 MB.", imageHelp: "PNG, JPG, WEBP · Max. 1.5 MB", reviewTitle: "Review before sending", reviewBody: "Make sure your website content and contact details are correct.",
    websiteData: "Website content", customerData: "Customer details", name: "Full name", email: "Email", wa: "WhatsApp number", notes: "Additional notes", notesHint: "Example: I need the website live before a certain date",
    backEdit: "Back to editing", submit: "Send to Pagiverse", submitting: "Sending...", formError: "Please complete your name, email, and WhatsApp number.",
    successTitle: "We have received your project.", successBody: "Save this Project ID. The Pagiverse team will contact you on WhatsApp with the next steps.", projectLabel: "Project ID", browse: "Browse other templates", home: "Back to home",
    networkError: "We could not send the project yet. Your draft remains saved on this device. Please try again or contact Pagiverse.", price: "Template value",
  };

  useEffect(() => {
    try {
      const draft = localStorage.getItem(storageKey);
      if (draft) setConfig({ ...initialConfig, ...JSON.parse(draft) });
    } catch {}
    setReady(true);
  }, [storageKey]);

  useEffect(() => {
    if (!ready) return;
    setSaved(false);
    const timer = setTimeout(() => {
      try { localStorage.setItem(storageKey, JSON.stringify(config)); } catch {}
      setSaved(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [config, ready, storageKey]);

  const requiredFields = template.editableFields.filter((field) => field.required);
  const completion = Math.round((requiredFields.filter((field) => String(config[field.key] || "").trim()).length / requiredFields.length) * 100);
  const currentFields = useMemo(() => template.editableFields.filter((field) => field.group === activeGroup), [activeGroup, template.editableFields]);

  function updateConfig(key, value) {
    setConfig((current) => ({ ...current, [key]: value }));
  }

  function resetDraft() {
    if (!window.confirm(lang === "id" ? "Hapus semua perubahan dan kembali ke contoh awal?" : "Remove all changes and return to the original example?")) return;
    localStorage.removeItem(storageKey);
    setConfig(initialConfig);
  }

  async function submitProject(event) {
    event.preventDefault();
    if (!customer.name.trim() || !customer.email.trim() || !customer.whatsapp.trim()) {
      setSubmitError(copy.formError);
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const response = await fetch("/api/template-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id, configuration: config, customer }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || copy.networkError);
      setProjectId(data.projectId);
      localStorage.removeItem(storageKey);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : copy.networkError);
    } finally {
      setSubmitting(false);
    }
  }

  if (projectId) return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f5f1] px-5 py-16 text-navy-deep">
      <div className="w-full max-w-xl rounded-[30px] border border-navy-deep/12 bg-white p-7 text-center shadow-[0_30px_90px_-45px_rgba(12,27,51,.4)] sm:p-12">
        <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-mint/16 text-teal-700"><CheckCircle2 className="h-8 w-8" /></span>
        <p className="mt-7 text-xs font-extrabold uppercase tracking-[.18em] text-teal-700">{copy.projectLabel}</p>
        <p className="mt-2 text-4xl font-extrabold tracking-[-.05em]">{projectId}</p>
        <h1 className="mt-8 text-3xl font-extrabold tracking-[-.045em]">{copy.successTitle}</h1>
        <p className="mx-auto mt-4 max-w-[48ch] text-sm leading-7 text-navy-deep/52">{copy.successBody}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-2"><Link href="/templates" className="rounded-full border border-navy-deep/15 px-5 py-3 text-sm font-extrabold">{copy.browse}</Link><Link href="/" className="rounded-full bg-navy-deep px-5 py-3 text-sm font-extrabold text-white">{copy.home}</Link></div>
      </div>
    </main>
  );

  if (reviewing) return (
    <main className="min-h-screen bg-[#f1f0ec] text-navy-deep">
      <header className="border-b border-navy-deep/10 bg-white"><div className="studio-shell flex min-h-[72px] items-center justify-between gap-4"><button type="button" onClick={() => setReviewing(false)} className="inline-flex items-center gap-2 text-sm font-extrabold"><ArrowLeft className="h-4 w-4" />{copy.backEdit}</button><p className="text-xs font-bold text-navy-deep/40">{template.name} · {formatTemplatePrice(template.price, lang)}</p></div></header>
      <form onSubmit={submitProject} className="studio-shell grid gap-6 py-8 lg:grid-cols-[1.25fr_.75fr] lg:py-12">
        <section className="overflow-hidden rounded-[24px] border border-navy-deep/10 bg-white">
          <div className="border-b border-navy-deep/10 p-6 sm:p-8"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-teal-700">{copy.websiteData}</p><h1 className="mt-3 text-3xl font-extrabold tracking-[-.045em]">{copy.reviewTitle}</h1><p className="mt-3 text-sm text-navy-deep/48">{copy.reviewBody}</p></div>
          <div className="max-h-[720px] overflow-auto bg-[#dedbd5] p-2 sm:p-4"><div className="overflow-hidden rounded-xl bg-white"><TemplateRenderer template={template} config={config} lang={lang} /></div></div>
        </section>
        <aside className="h-fit rounded-[24px] border border-navy-deep/10 bg-white p-6 sm:p-8 lg:sticky lg:top-6">
          <p className="text-xs font-extrabold uppercase tracking-[.16em] text-teal-700">{copy.customerData}</p>
          <div className="mt-6 grid gap-4">
            {[{ key: "name", label: copy.name, type: "text" }, { key: "email", label: copy.email, type: "email" }, { key: "whatsapp", label: copy.wa, type: "tel" }].map((field) => <label key={field.key} className="grid gap-2 text-xs font-extrabold">{field.label}<input required type={field.type} value={customer[field.key]} onChange={(event) => setCustomer((current) => ({ ...current, [field.key]: event.target.value }))} className="rounded-xl border border-navy-deep/15 px-3.5 py-3 text-sm font-medium outline-none focus:border-teal-700" /></label>)}
            <label className="grid gap-2 text-xs font-extrabold">{copy.notes}<textarea rows={4} value={customer.notes} onChange={(event) => setCustomer((current) => ({ ...current, notes: event.target.value }))} placeholder={copy.notesHint} className="resize-y rounded-xl border border-navy-deep/15 px-3.5 py-3 text-sm font-medium outline-none focus:border-teal-700" /></label>
          </div>
          <div className="mt-6 flex items-center justify-between border-y border-navy-deep/10 py-4"><span className="text-xs font-bold text-navy-deep/42">{copy.price}</span><span className="font-extrabold">{formatTemplatePrice(template.price, lang)}</span></div>
          {submitError && <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-semibold leading-5 text-red-700">{submitError}</p>}
          <button type="submit" disabled={submitting} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy-deep px-5 py-3.5 text-sm font-extrabold text-white disabled:opacity-60">{submitting ? <><Loader2 className="h-4 w-4 animate-spin" />{copy.submitting}</> : <>{copy.submit}<ArrowRight className="h-4 w-4" /></>}</button>
        </aside>
      </form>
    </main>
  );

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-[#ebe9e4] text-navy-deep">
      <header className="z-30 flex h-[68px] shrink-0 items-center justify-between border-b border-navy-deep/10 bg-white px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3"><Link href={`/templates/${template.id}`} aria-label={copy.exit} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-navy-deep/12"><X className="h-4 w-4" /></Link><div className="min-w-0"><p className="truncate text-sm font-extrabold">{copy.title}</p><p className="truncate text-[10px] font-semibold text-navy-deep/40">{template.name}</p></div></div>
        <div className="hidden items-center gap-2 text-[10px] font-bold text-navy-deep/42 sm:flex"><Cloud className={`h-3.5 w-3.5 ${saved ? "text-teal-700" : "animate-pulse"}`} />{saved ? copy.draft : copy.saving}</div>
        <div className="flex items-center gap-2"><button type="button" onClick={resetDraft} className="hidden items-center gap-2 rounded-full px-3 py-2 text-xs font-extrabold text-navy-deep/45 hover:bg-[#f3f2ee] sm:inline-flex"><RotateCcw className="h-3.5 w-3.5" />{copy.reset}</button><button type="button" onClick={() => setReviewing(true)} className="inline-flex items-center gap-2 rounded-full bg-navy-deep px-4 py-2.5 text-xs font-extrabold text-white">{copy.continue}<ArrowRight className="h-3.5 w-3.5" /></button></div>
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[410px_minmax(0,1fr)]">
        <aside className={`${mobileTab === "edit" ? "flex" : "hidden"} min-h-0 flex-col border-r border-navy-deep/10 bg-white lg:flex`}>
          <div className="shrink-0 border-b border-navy-deep/10 px-5 py-5">
            <div className="flex items-center justify-between"><p className="text-xs font-extrabold">{completion}% {copy.progress}</p><span className="text-[10px] font-bold text-navy-deep/35">{requiredFields.length} {copy.required.toLowerCase()}</span></div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#eceae5]"><div className="h-full rounded-full bg-mint transition-[width]" style={{ width: `${completion}%` }} /></div>
            <div className="mt-5 flex gap-2 overflow-x-auto hide-scrollbar">{EDITOR_GROUPS.map((group) => <button key={group.id} type="button" onClick={() => setActiveGroup(group.id)} className={`shrink-0 rounded-full px-3.5 py-2 text-[10px] font-extrabold ${activeGroup === group.id ? "bg-navy-deep text-white" : "bg-[#f3f2ee] text-navy-deep/48"}`}>{group.label[lang]}</button>)}</div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
            <div className="mb-6"><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-teal-700">{EDITOR_GROUPS.find((group) => group.id === activeGroup)?.label[lang]}</p><p className="mt-2 text-xs leading-5 text-navy-deep/42">{lang === "id" ? "Perubahanmu langsung muncul di preview." : "Your changes appear in the preview instantly."}</p></div>
            <div className="grid gap-5">{currentFields.map((field) => <label key={field.key} className="grid gap-2"><span className="flex items-center justify-between text-xs font-extrabold">{field.label[lang]}{field.required && <span className="text-[9px] uppercase tracking-wider text-teal-700">{copy.required}</span>}</span><FieldControl field={field} value={config[field.key]} onChange={(value) => updateConfig(field.key, value)} copy={copy} lang={lang} /></label>)}</div>
            <button type="button" onClick={() => { const index = EDITOR_GROUPS.findIndex((group) => group.id === activeGroup); const next = EDITOR_GROUPS[Math.min(index + 1, EDITOR_GROUPS.length - 1)]; setActiveGroup(next.id); }} className="mt-8 inline-flex w-full items-center justify-between rounded-xl bg-[#f1f0ec] px-4 py-3 text-xs font-extrabold">{lang === "id" ? "Bagian berikutnya" : "Next section"}<ChevronRight className="h-4 w-4" /></button>
          </div>
        </aside>

        <section className={`${mobileTab === "preview" ? "flex" : "hidden"} min-w-0 flex-col lg:flex`}>
          <div className="hidden h-[54px] shrink-0 items-center justify-between border-b border-navy-deep/10 bg-[#f6f5f1] px-5 lg:flex"><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-navy-deep/35">{copy.preview}</p><div className="flex rounded-full bg-white p-1"><button type="button" onClick={() => setDevice("desktop")} className={`rounded-full p-2 ${device === "desktop" ? "bg-navy-deep text-white" : "text-navy-deep/38"}`}><Monitor className="h-3.5 w-3.5" /></button><button type="button" onClick={() => setDevice("mobile")} className={`rounded-full p-2 ${device === "mobile" ? "bg-navy-deep text-white" : "text-navy-deep/38"}`}><Smartphone className="h-3.5 w-3.5" /></button></div><span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-teal-700"><Check className="h-3 w-3" />Live</span></div>
          <div className="min-h-0 flex-1 overflow-auto p-2 sm:p-5 lg:p-7">
            <div className="mx-auto min-h-full overflow-hidden rounded-[16px] bg-white shadow-[0_22px_60px_-35px_rgba(12,27,51,.45)] transition-[width] duration-500" style={{ width: device === "mobile" ? "390px" : "100%", minWidth: device === "mobile" ? "360px" : undefined }}><TemplateRenderer template={template} config={config} lang={lang} deviceMode={device} /></div>
          </div>
        </section>
      </div>

      <nav className="grid h-[64px] shrink-0 grid-cols-2 border-t border-navy-deep/10 bg-white lg:hidden"><button type="button" onClick={() => setMobileTab("edit")} className={`text-xs font-extrabold ${mobileTab === "edit" ? "text-teal-700" : "text-navy-deep/35"}`}>{copy.edit}</button><button type="button" onClick={() => setMobileTab("preview")} className={`text-xs font-extrabold ${mobileTab === "preview" ? "text-teal-700" : "text-navy-deep/35"}`}>{copy.preview}</button></nav>
    </main>
  );
}
