"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, CheckCircle2, Loader2, Send } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";
import { useAnalytics } from "@/lib/useAnalytics";
import { INSTAGRAM_URL } from "@/components/site-config";
import Reveal from "@/components/Reveal";
import { focusProjectForm } from "./project-form";

const BUDGET_OPTIONS = [
  { value: "< Rp 3 juta", id: "< Rp 3 juta", en: "Under IDR 3M" },
  { value: "Rp 3-5 juta", id: "Rp 3-5 juta", en: "IDR 3-5M" },
  { value: "> Rp 5 juta", id: "> Rp 5 juta", en: "Above IDR 5M" },
  { value: "Belum tahu", id: "Belum tahu", en: "Not sure yet" },
];

export default function StudioContact({ settings = {} }) {
  const { lang } = useLang();
  const { trackFormSubmit } = useAnalytics();
  const [status, setStatus] = useState("idle");
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", budget_range: "", message: "" });

  const t = lang === "id"
    ? {
        kicker: "Mulai percakapan", title: settings.contact_heading || "Ceritakan apa yang ingin kamu bangun.", body: settings.contact_desc || "Tidak perlu brief yang sempurna. Cukup ceritakan bisnis, kebutuhan, dan targetmu. Kami akan membantu merapikan arahnya.", response: "Estimasi balasan 1x24 jam kerja", formCta: "Isi formulir proyek", ig: "Lihat Instagram", name: "Nama *", namePh: "Nama lengkap", email: "Email *", emailPh: "email@kamu.com", phone: "Nomor HP", phonePh: "08xx-xxxx-xxxx", company: "Perusahaan / Brand", companyPh: "Nama bisnis (opsional)", budget: "Estimasi budget", message: "Ceritakan proyekmu", messagePh: "Apa yang ingin dibangun dan target yang ingin dicapai?", send: "Kirim brief", sending: "Mengirim...", success: "Brief sudah terkirim", successBody: "Terima kasih. Kami akan segera menghubungimu.", again: "Kirim brief lain", error: "Pesan belum terkirim. Silakan coba lagi." }
    : {
        kicker: "Start a conversation", title: "Tell us what you want to build.", body: "You do not need a perfect brief. Tell us about the business, the need, and the goal. We will help shape the direction.", response: "Estimated response within one business day", formCta: "Fill in the project form", ig: "View Instagram", name: "Name *", namePh: "Full name", email: "Email *", emailPh: "your@email.com", phone: "Phone number", phonePh: "+62 8xx-xxxx-xxxx", company: "Company / Brand", companyPh: "Business name (optional)", budget: "Estimated budget", message: "Tell us about the project", messagePh: "What do you want to build and achieve?", send: "Send brief", sending: "Sending...", success: "Your brief was sent", successBody: "Thank you. We will get back to you soon.", again: "Send another brief", error: "The message was not sent. Please try again." };

  useEffect(() => {
    function reopenForm() { setStatus((current) => current === "success" ? "idle" : current); }
    window.addEventListener("pagiverse:focus-form", reopenForm);
    return () => window.removeEventListener("pagiverse:focus-form", reopenForm);
  }, []);

  useEffect(() => {
    function applyPackage() {
      const packageName = sessionStorage.getItem("inquiry_paket");
      const budget = sessionStorage.getItem("inquiry_budget");
      if (!packageName && !budget) return;
      setForm((current) => ({ ...current, budget_range: budget || current.budget_range, message: packageName ? `${lang === "id" ? "Halo, saya tertarik dengan paket" : "Hi, I am interested in the"} ${packageName}.` : current.message }));
      sessionStorage.removeItem("inquiry_paket");
      sessionStorage.removeItem("inquiry_budget");
    }
    applyPackage();
    window.addEventListener("hashchange", applyPackage);
    return () => window.removeEventListener("hashchange", applyPackage);
  }, [lang]);

  async function submit(event) {
    event.preventDefault();
    setStatus("loading");
    try {
      const response = await fetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!response.ok) throw new Error();
      trackFormSubmit("inquiry_form");
      setStatus("success");
      setForm({ name: "", email: "", phone: "", company: "", budget_range: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  const inputClass = "pg-contact__input w-full border-0 border-b border-navy-deep/25 bg-transparent px-0 py-3 text-base font-normal normal-case tracking-normal text-navy-deep outline-none placeholder:text-navy-deep/45 focus:border-teal-700 focus:ring-0";

  return (
    <section id="kontak" aria-labelledby="studio-contact-heading" className="pg-contact bg-[#f4f5f3] text-navy-deep">
      <div className="pg-contact__grid studio-shell grid gap-14 py-24 md:py-32 lg:grid-cols-[1fr_1fr] lg:gap-24">
        <Reveal className="pg-contact__intro">
          <h2 id="studio-contact-heading" className="pg-contact__title max-w-[12ch] text-balance text-5xl font-semibold leading-[1.02] tracking-[-.06em] sm:text-6xl lg:text-[clamp(3.5rem,5.2vw,5.4rem)]">{t.title}</h2>
          <p className="pg-contact__body mt-7 max-w-[39ch] text-base leading-7 text-navy-deep/65">{t.body}</p>
          <div className="pg-contact__links mt-10 flex flex-wrap gap-3">
            <a href="#form-proyek" onClick={focusProjectForm} className="inline-flex items-center gap-5 rounded-lg bg-mint px-5 py-3.5 text-sm font-semibold text-navy-deep transition hover:bg-[#30e2b5]">{t.formCta} <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-5 rounded-lg border border-navy-deep/20 px-5 py-3.5 text-sm font-semibold text-navy-deep transition hover:border-teal-700">{t.ig} <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
          </div>
        </Reveal>

        <div id="form-proyek" className="pg-contact__form border-t border-navy-deep/25 pt-8">
          <Reveal>
          {status === "success" ? (
            <div role="status" className="flex min-h-[480px] flex-col items-center justify-center text-center">
              <CheckCircle2 className="h-12 w-12 text-teal-700" aria-hidden="true" />
              <h3 className="mt-5 text-2xl font-bold">{t.success}</h3>
              <p className="mt-2 text-sm text-navy-deep/65">{t.successBody}</p>
              <button type="button" onClick={() => setStatus("idle")} className="mt-7 text-sm font-bold text-teal-700 hover:underline">{t.again}</button>
            </div>
          ) : (
            <form onSubmit={submit} aria-busy={status === "loading"} className="space-y-8">
              <div className="grid gap-7 sm:grid-cols-2">
                <label className="text-xs font-semibold text-navy-deep/80">{t.name}<input id="inquiry-name" required name="name" autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder={t.namePh} className={inputClass} /></label>
                <label className="text-xs font-semibold text-navy-deep/80">{t.email}<input required type="email" name="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder={t.emailPh} className={inputClass} /></label>
                <label className="text-xs font-semibold text-navy-deep/80">{t.phone}<input name="phone" autoComplete="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder={t.phonePh} className={inputClass} /></label>
                <label className="text-xs font-semibold text-navy-deep/80">{t.company}<input name="company" autoComplete="organization" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} placeholder={t.companyPh} className={inputClass} /></label>
              </div>
              <fieldset>
                <legend className="text-xs font-semibold text-navy-deep/80">{t.budget}</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {BUDGET_OPTIONS.map((option) => <button key={option.value} type="button" aria-pressed={form.budget_range === option.value} onClick={() => setForm({ ...form, budget_range: option.value })} className={`rounded-lg border px-4 py-2.5 text-xs font-semibold transition ${form.budget_range === option.value ? "border-navy-deep bg-navy-deep text-white" : "border-navy-deep/25 text-navy-deep/75 hover:border-teal-700 hover:text-navy-deep"}`}>{option[lang]}</button>)}
                </div>
              </fieldset>
              <label className="block text-xs font-semibold text-navy-deep/80">{t.message}<textarea name="message" rows={4} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder={t.messagePh} className={`${inputClass} resize-y`} /></label>
              {status === "error" && <p role="alert" className="text-sm text-red-700">{t.error}</p>}
              <button type="submit" disabled={status === "loading"} className="inline-flex w-full items-center justify-center gap-5 rounded-lg bg-navy-deep px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#173253] disabled:opacity-50 sm:w-auto">
                {status === "loading" ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />{t.sending}</> : <><Send className="h-4 w-4" aria-hidden="true" />{t.send}</>}
              </button>
            </form>
          )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
