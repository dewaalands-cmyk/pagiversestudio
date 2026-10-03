"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronRight, Cloud, ImagePlus, Loader2, Monitor, Plus, RotateCcw, Smartphone, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLang } from "@/components/LanguageProvider";
import NativeTemplateRenderer from "@/components/templates/NativeTemplateRenderer";
import { buildDefaultConfig, fieldHasValue, getEditorGroups, getFieldLabel, getStructuredValue, getTemplateFields, setStructuredValue } from "@/lib/template-library";

const EMPTY_CONFIGURATION = Object.freeze({});

function humanize(value) {
  return String(value).replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[-_]/g, " ").replace(/^./, (letter) => letter.toUpperCase());
}

function localized(value, lang) {
  if (typeof value === "object" && value) return value[lang] || value.id || value.en || "";
  return value || "";
}

function emptyValue(field) {
  if (field.default !== undefined) return JSON.parse(JSON.stringify(field.default));
  if (field.type === "array") return [];
  if (field.type === "boolean") return false;
  if (field.type === "image") return "";
  return "";
}

function newArrayItem(schema) {
  return Object.entries(schema?.fields || {}).reduce((item, [key, field]) => setStructuredValue(item, key, emptyValue(field)), {});
}

function ImageField({ field, value, onChange, copy }) {
  const inputRef = useRef(null);
  const [error, setError] = useState("");
  const source = typeof value === "object" && value ? value.src : value;
  const maxBytes = Math.min(Number(field.maxFileSizeMB) || 1.5, 8) * 1024 * 1024;

  function setSource(src) {
    onChange(typeof value === "object" && value ? { ...value, src } : src);
  }

  function handleFile(file) {
    if (!file) return;
    const accepted = field.accept || ["image/png", "image/jpeg", "image/webp"];
    if (!accepted.includes(file.type)) return setError(copy.imageType);
    if (file.size > maxBytes) return setError(copy.imageSize.replace("{size}", String(Math.min(Number(field.maxFileSizeMB) || 1.5, 8))));
    const reader = new FileReader();
    reader.onload = () => { setError(""); setSource(String(reader.result)); };
    reader.readAsDataURL(file);
  }

  return <div>
    <button type="button" onClick={() => inputRef.current?.click()} className="flex w-full items-center gap-3 rounded-xl border border-dashed border-navy-deep/20 bg-[#faf9f6] p-3 text-left transition hover:border-teal-700">
      {source ? <img src={source} alt="" className="h-14 w-14 rounded-lg object-cover" /> : <span className="inline-flex h-14 w-14 items-center justify-center rounded-lg bg-white text-navy-deep/35"><ImagePlus className="h-5 w-5" /></span>}
      <span><span className="block text-xs font-extrabold">{source ? copy.replaceImage : copy.chooseImage}</span><span className="mt-1 block text-[10px] text-navy-deep/40">PNG, JPG, WEBP</span></span>
    </button>
    <input ref={inputRef} type="file" accept={(field.accept || ["image/png", "image/jpeg", "image/webp"]).join(",")} className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
    {source && <button type="button" onClick={() => setSource("")} className="mt-2 text-[10px] font-bold text-red-600">{copy.removeImage}</button>}
    {error && <p className="mt-2 text-[10px] font-semibold text-red-600">{error}</p>}
  </div>;
}

function FieldControl({ field, value, onChange, copy, lang }) {
  const inputClass = "w-full rounded-xl border border-navy-deep/15 bg-white px-3.5 py-3 text-sm text-navy-deep outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/10";
  if (field.type === "image") return <ImageField field={field} value={value} onChange={onChange} copy={copy} />;
  if (field.type === "textarea") return <textarea rows={3} maxLength={field.maxLength} value={value || ""} onChange={(event) => onChange(event.target.value)} placeholder={localized(field.placeholder, lang)} className={`${inputClass} resize-y`} />;
  if (field.type === "boolean") return <button type="button" aria-pressed={Boolean(value)} onClick={() => onChange(!value)} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-xs font-extrabold ${value ? "border-teal-700 bg-teal-50 text-teal-800" : "border-navy-deep/15 bg-white text-navy-deep/50"}`}><span>{value ? copy.visible : copy.hidden}</span><span className={`h-5 w-9 rounded-full p-0.5 ${value ? "bg-teal-700" : "bg-navy-deep/15"}`}><span className={`block h-4 w-4 rounded-full bg-white transition ${value ? "translate-x-4" : ""}`} /></span></button>;
  if (field.type === "select") return <select value={value || ""} onChange={(event) => onChange(event.target.value)} className={inputClass}>{(field.options || []).map((option) => { const optionValue = typeof option === "string" ? option : option.value; return <option key={optionValue} value={optionValue}>{typeof option === "string" ? option : localized(option.label, lang)}</option>; })}</select>;
  if (field.type === "array") return <ArrayField field={field} value={value} onChange={onChange} copy={copy} lang={lang} />;
  return <input type={field.type === "phone" ? "tel" : field.type || "text"} maxLength={field.maxLength} value={value || ""} onChange={(event) => onChange(event.target.value)} placeholder={localized(field.placeholder, lang)} className={inputClass} />;
}

function ArrayField({ field, value, onChange, copy, lang }) {
  const items = Array.isArray(value) ? value : [];
  const maximum = field.maxItems || 24;
  const minimum = field.minItems || 0;
  return <div className="grid gap-3">
    {items.map((item, index) => <div key={index} className="rounded-2xl border border-navy-deep/12 bg-[#faf9f6] p-4">
      <div className="mb-4 flex items-center justify-between"><span className="text-[10px] font-extrabold uppercase tracking-wider text-navy-deep/40">{copy.item} {index + 1}</span><button type="button" disabled={items.length <= minimum} onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} className="rounded-lg p-2 text-red-600 disabled:opacity-25" aria-label={copy.removeItem}><Trash2 className="h-3.5 w-3.5" /></button></div>
      <div className="grid gap-4">{Object.entries(field.item?.fields || {}).map(([key, descriptor]) => <label key={key} className="grid gap-2"><span className="text-[11px] font-extrabold">{getFieldLabel(descriptor, lang, humanize(key))}</span><FieldControl field={descriptor} value={getStructuredValue(item, key)} onChange={(nextValue) => onChange(items.map((current, itemIndex) => itemIndex === index ? setStructuredValue(current, key, nextValue) : current))} copy={copy} lang={lang} /></label>)}</div>
    </div>)}
    {items.length < maximum && <button type="button" onClick={() => onChange([...items, newArrayItem(field.item)])} className="inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-navy-deep/20 px-4 py-3 text-xs font-extrabold text-navy-deep/55 hover:border-teal-700"><Plus className="h-3.5 w-3.5" />{copy.addItem}</button>}
  </div>;
}

export default function ManifestStudioEditor({ template, mode = "customer", adminProjectId = 0, initialConfiguration = EMPTY_CONFIGURATION }) {
  const { lang } = useLang();
  const adminMode = mode === "admin";
  const groups = useMemo(() => getEditorGroups(template), [template]);
  const fields = useMemo(() => getTemplateFields(template), [template]);
  const defaults = useMemo(() => buildDefaultConfig(template), [template]);
  const storageKey = `pagiverse-draft-${template.id}`;
  const initialConfig = useMemo(() => ({ ...defaults, ...(initialConfiguration || {}) }), [defaults, initialConfiguration]);
  const [config, setConfig] = useState(initialConfig);
  const [activeGroup, setActiveGroup] = useState(groups[0]?.id || "business");
  const [device, setDevice] = useState("desktop");
  const [mobileTab, setMobileTab] = useState("edit");
  const [saved, setSaved] = useState(true);
  const [ready, setReady] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [customer, setCustomer] = useState({ name: "", email: "", whatsapp: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [projectId, setProjectId] = useState("");
  const [adminSaving, setAdminSaving] = useState(false);
  const [adminMessage, setAdminMessage] = useState("");
  const copy = lang === "id" ? {
    exit: "Keluar", title: "Pagiverse Studio", draft: "Draft tersimpan", saving: "Menyimpan...", preview: "Preview", edit: "Edit", reset: "Mulai ulang", continue: "Tinjau project", progress: "kelengkapan", required: "Wajib", chooseImage: "Pilih foto", replaceImage: "Ganti foto", removeImage: "Hapus foto", imageType: "Gunakan PNG, JPG, atau WEBP.", imageSize: "Ukuran gambar maksimal {size} MB.", visible: "Ditampilkan", hidden: "Disembunyikan", item: "Item", addItem: "Tambah item", removeItem: "Hapus item", next: "Bagian berikutnya", liveHelp: "Perubahanmu langsung muncul di preview.", reviewTitle: "Periksa sebelum dikirim", reviewBody: "Pastikan isi website dan data kontak sudah benar.", websiteData: "Isi website", customerData: "Data pemesan", name: "Nama lengkap", email: "Email", wa: "Nomor WhatsApp", notes: "Catatan tambahan", notesHint: "Contoh: target waktu tayang", backEdit: "Kembali edit", submit: "Kirim ke Pagiverse", submitting: "Mengirim...", formError: "Lengkapi nama, email, dan nomor WhatsApp.", successTitle: "Project kamu sudah kami terima.", successBody: "Simpan Project ID ini. Tim Pagiverse akan menghubungimu melalui WhatsApp.", projectLabel: "Project ID", browse: "Lihat template lain", home: "Kembali ke beranda", networkError: "Project belum bisa dikirim. Draft tetap tersimpan di perangkat ini.",
  } : {
    exit: "Exit", title: "Pagiverse Studio", draft: "Draft saved", saving: "Saving...", preview: "Preview", edit: "Edit", reset: "Start over", continue: "Review project", progress: "complete", required: "Required", chooseImage: "Choose image", replaceImage: "Replace image", removeImage: "Remove image", imageType: "Use PNG, JPG, or WEBP.", imageSize: "Maximum image size is {size} MB.", visible: "Visible", hidden: "Hidden", item: "Item", addItem: "Add item", removeItem: "Remove item", next: "Next section", liveHelp: "Your changes appear in the preview instantly.", reviewTitle: "Review before sending", reviewBody: "Make sure the website content and contact details are correct.", websiteData: "Website content", customerData: "Customer details", name: "Full name", email: "Email", wa: "WhatsApp number", notes: "Additional notes", notesHint: "Example: preferred launch date", backEdit: "Back to editing", submit: "Send to Pagiverse", submitting: "Sending...", formError: "Complete your name, email, and WhatsApp number.", successTitle: "We have received your project.", successBody: "Save this Project ID. The Pagiverse team will contact you on WhatsApp.", projectLabel: "Project ID", browse: "Browse templates", home: "Back to home", networkError: "We could not send the project. Your draft remains saved on this device.",
  };

  useEffect(() => { if (adminMode) { setConfig(initialConfig); setReady(true); setSaved(true); return; } try { const draft = localStorage.getItem(storageKey); if (draft) setConfig({ ...defaults, ...JSON.parse(draft) }); } catch {} setReady(true); }, [adminMode, storageKey, defaults, initialConfig]);
  useEffect(() => { if (!ready) return; setSaved(false); if (adminMode) return; const timer = setTimeout(() => { try { localStorage.setItem(storageKey, JSON.stringify(config)); } catch {} setSaved(true); }, 500); return () => clearTimeout(timer); }, [adminMode, config, ready, storageKey]);

  const requiredFields = fields.filter((field) => field.required);
  const completion = requiredFields.length ? Math.round(requiredFields.filter((field) => fieldHasValue(field, config[field.key])).length / requiredFields.length * 100) : 100;
  const active = groups.find((group) => group.id === activeGroup) || groups[0];
  const currentFields = fields.filter((field) => field.group === activeGroup);
  const updateConfig = (key, value) => setConfig((current) => ({ ...current, [key]: value }));

  function resetDraft() { if (!window.confirm(adminMode ? "Batalkan perubahan yang belum disimpan?" : (lang === "id" ? "Hapus semua perubahan dan kembali ke contoh awal?" : "Remove all changes and return to the original example?"))) return; if (!adminMode) localStorage.removeItem(storageKey); setConfig(adminMode ? initialConfig : defaults); setSaved(true); setAdminMessage(""); }
  function nextGroup() { const index = groups.findIndex((group) => group.id === activeGroup); setActiveGroup(groups[Math.min(index + 1, groups.length - 1)].id); }
  async function submitProject(event) { event.preventDefault(); if (!customer.name.trim() || !customer.email.trim() || !customer.whatsapp.trim()) return setSubmitError(copy.formError); setSubmitting(true); setSubmitError(""); try { const response = await fetch("/api/template-projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ templateId: template.id, configuration: config, customer }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || copy.networkError); setProjectId(data.projectId); localStorage.removeItem(storageKey); } catch (error) { setSubmitError(error instanceof Error ? error.message : copy.networkError); } finally { setSubmitting(false); } }
  async function saveAdmin() { setAdminSaving(true); setAdminMessage(""); try { const response = await fetch(`/api/template-projects/${adminProjectId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ configuration: config }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Perubahan belum dapat disimpan."); setSaved(true); setAdminMessage("Perubahan berhasil disimpan."); } catch (error) { setAdminMessage(error instanceof Error ? error.message : "Perubahan belum dapat disimpan."); } finally { setAdminSaving(false); } }

  if (projectId) return <main className="flex min-h-screen items-center justify-center bg-[#f6f5f1] px-5 py-16 text-navy-deep"><div className="w-full max-w-xl rounded-[30px] border border-navy-deep/12 bg-white p-8 text-center sm:p-12"><CheckCircle2 className="mx-auto h-14 w-14 text-teal-700" /><p className="mt-7 text-xs font-extrabold uppercase tracking-[.18em] text-teal-700">{copy.projectLabel}</p><p className="mt-2 text-4xl font-extrabold">{projectId}</p><h1 className="mt-8 text-3xl font-extrabold">{copy.successTitle}</h1><p className="mt-4 text-sm leading-7 text-navy-deep/52">{copy.successBody}</p><div className="mt-9 flex justify-center gap-2"><Link href="/templates" className="rounded-full border px-5 py-3 text-sm font-extrabold">{copy.browse}</Link><Link href="/" className="rounded-full bg-navy-deep px-5 py-3 text-sm font-extrabold text-white">{copy.home}</Link></div></div></main>;

  if (reviewing) return <main className="min-h-screen bg-[#f1f0ec] text-navy-deep"><header className="border-b bg-white"><div className="studio-shell flex min-h-[72px] items-center justify-between"><button type="button" onClick={() => setReviewing(false)} className="inline-flex items-center gap-2 text-sm font-extrabold"><ArrowLeft className="h-4 w-4" />{copy.backEdit}</button><p className="text-xs font-bold text-navy-deep/40">{template.name}</p></div></header><form onSubmit={submitProject} className="studio-shell grid gap-6 py-8 lg:grid-cols-[1.25fr_.75fr]"><section className="overflow-hidden rounded-[24px] border bg-white"><div className="border-b p-6 sm:p-8"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-teal-700">{copy.websiteData}</p><h1 className="mt-3 text-3xl font-extrabold">{copy.reviewTitle}</h1><p className="mt-3 text-sm text-navy-deep/48">{copy.reviewBody}</p></div><div className="max-h-[720px] overflow-auto bg-[#dedbd5] p-3"><NativeTemplateRenderer template={template} config={config} /></div></section><aside className="h-fit rounded-[24px] border bg-white p-6 sm:p-8 lg:sticky lg:top-6"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-teal-700">{copy.customerData}</p><div className="mt-6 grid gap-4">{[{ key: "name", label: copy.name, type: "text" }, { key: "email", label: copy.email, type: "email" }, { key: "whatsapp", label: copy.wa, type: "tel" }].map((field) => <label key={field.key} className="grid gap-2 text-xs font-extrabold">{field.label}<input required type={field.type} value={customer[field.key]} onChange={(event) => setCustomer((current) => ({ ...current, [field.key]: event.target.value }))} className="rounded-xl border px-3.5 py-3 text-sm font-medium" /></label>)}<label className="grid gap-2 text-xs font-extrabold">{copy.notes}<textarea rows={4} value={customer.notes} onChange={(event) => setCustomer((current) => ({ ...current, notes: event.target.value }))} placeholder={copy.notesHint} className="rounded-xl border px-3.5 py-3 text-sm font-medium" /></label></div>{submitError && <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700">{submitError}</p>}<button type="submit" disabled={submitting} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy-deep px-5 py-3.5 text-sm font-extrabold text-white disabled:opacity-60">{submitting ? <><Loader2 className="h-4 w-4 animate-spin" />{copy.submitting}</> : <>{copy.submit}<ArrowRight className="h-4 w-4" /></>}</button></aside></form></main>;

  return <main className="flex h-screen flex-col overflow-hidden bg-[#ebe9e4] text-navy-deep"><header className="z-30 flex h-[68px] shrink-0 items-center justify-between border-b bg-white px-4 sm:px-6"><div className="flex min-w-0 items-center gap-3"><Link href={adminMode ? "/admin/template-projects" : `/templates/${template.id}`} aria-label={copy.exit} className="inline-flex h-9 w-9 items-center justify-center rounded-full border"><X className="h-4 w-4" /></Link><div><p className="text-sm font-extrabold">{adminMode ? "Edit website customer" : copy.title}</p><p className="text-[10px] text-navy-deep/40">{template.name}</p></div></div><div className="hidden items-center gap-2 text-[10px] font-bold text-navy-deep/42 sm:flex"><Cloud className={`h-3.5 w-3.5 ${saved ? "text-teal-700" : "animate-pulse"}`} />{adminMessage || (saved ? (adminMode ? "Tersimpan" : copy.draft) : "Perubahan belum disimpan")}</div><div className="flex gap-2"><button type="button" onClick={resetDraft} className="hidden items-center gap-2 rounded-full px-3 py-2 text-xs font-extrabold text-navy-deep/45 sm:inline-flex"><RotateCcw className="h-3.5 w-3.5" />{adminMode ? "Batalkan" : copy.reset}</button><button type="button" disabled={adminSaving || (adminMode && saved)} onClick={adminMode ? saveAdmin : () => setReviewing(true)} className="inline-flex items-center gap-2 rounded-full bg-navy-deep px-4 py-2.5 text-xs font-extrabold text-white disabled:opacity-50">{adminMode ? (adminSaving ? "Menyimpan..." : "Simpan perubahan") : copy.continue}<ArrowRight className="h-3.5 w-3.5" /></button></div></header><div className="grid min-h-0 flex-1 lg:grid-cols-[410px_minmax(0,1fr)]"><aside className={`${mobileTab === "edit" ? "flex" : "hidden"} min-h-0 flex-col border-r bg-white lg:flex`}><div className="shrink-0 border-b px-5 py-5"><div className="flex justify-between"><p className="text-xs font-extrabold">{completion}% {copy.progress}</p><span className="text-[10px] text-navy-deep/35">{requiredFields.length} {copy.required.toLowerCase()}</span></div><div className="mt-3 h-1.5 rounded-full bg-[#eceae5]"><div className="h-full rounded-full bg-mint" style={{ width: `${completion}%` }} /></div><div className="mt-5 flex gap-2 overflow-x-auto hide-scrollbar">{groups.map((group) => <button key={group.id} type="button" onClick={() => setActiveGroup(group.id)} className={`shrink-0 rounded-full px-3.5 py-2 text-[10px] font-extrabold ${activeGroup === group.id ? "bg-navy-deep text-white" : "bg-[#f3f2ee] text-navy-deep/48"}`}>{localized(group.label, lang)}</button>)}</div></div><div className="min-h-0 flex-1 overflow-y-auto px-5 py-6"><div className="mb-6"><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-teal-700">{localized(active?.label, lang)}</p><p className="mt-2 text-xs text-navy-deep/42">{copy.liveHelp}</p></div>{active?.visibilitySection ? <FieldControl field={{ type: "boolean" }} value={config[`sectionVisibility.${active.visibilitySection}`]} onChange={(value) => updateConfig(`sectionVisibility.${active.visibilitySection}`, value)} copy={copy} lang={lang} /> : <div className="grid gap-5">{currentFields.map((field) => <label key={field.key} className="grid gap-2"><span className="flex justify-between text-xs font-extrabold">{getFieldLabel(field, lang, humanize(field.key.split(".").pop()))}{field.required && <span className="text-[9px] uppercase text-teal-700">{copy.required}</span>}</span><FieldControl field={field} value={config[field.key]} onChange={(value) => updateConfig(field.key, value)} copy={copy} lang={lang} /></label>)}</div>}<button type="button" onClick={nextGroup} className="mt-8 inline-flex w-full items-center justify-between rounded-xl bg-[#f1f0ec] px-4 py-3 text-xs font-extrabold">{copy.next}<ChevronRight className="h-4 w-4" /></button></div></aside><section className={`${mobileTab === "preview" ? "flex" : "hidden"} min-w-0 flex-col lg:flex`}><div className="hidden h-[54px] shrink-0 items-center justify-between border-b bg-[#f6f5f1] px-5 lg:flex"><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-navy-deep/35">{copy.preview}</p><div className="flex rounded-full bg-white p-1"><button type="button" onClick={() => setDevice("desktop")} className={`rounded-full p-2 ${device === "desktop" ? "bg-navy-deep text-white" : "text-navy-deep/38"}`}><Monitor className="h-3.5 w-3.5" /></button><button type="button" onClick={() => setDevice("mobile")} className={`rounded-full p-2 ${device === "mobile" ? "bg-navy-deep text-white" : "text-navy-deep/38"}`}><Smartphone className="h-3.5 w-3.5" /></button></div><span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-teal-700"><Check className="h-3 w-3" />Live</span></div><div className="min-h-0 flex-1 overflow-auto p-2 sm:p-5 lg:p-7"><div className="mx-auto overflow-hidden rounded-[16px] bg-white shadow-xl transition-[width]" style={{ width: device === "mobile" ? "390px" : "100%", minWidth: device === "mobile" ? "360px" : undefined }}><NativeTemplateRenderer template={template} config={config} deviceMode={device} /></div></div></section></div><nav className="grid h-[64px] shrink-0 grid-cols-2 border-t bg-white lg:hidden"><button type="button" onClick={() => setMobileTab("edit")} className={`text-xs font-extrabold ${mobileTab === "edit" ? "text-teal-700" : "text-navy-deep/35"}`}>{copy.edit}</button><button type="button" onClick={() => setMobileTab("preview")} className={`text-xs font-extrabold ${mobileTab === "preview" ? "text-teal-700" : "text-navy-deep/35"}`}>{copy.preview}</button></nav></main>;
}
