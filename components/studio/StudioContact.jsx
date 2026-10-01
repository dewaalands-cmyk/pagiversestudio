"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, CheckCircle2, Loader2, Send } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";
import { useAnalytics } from "@/lib/useAnalytics";
import { getLocalizedWhatsAppUrl, INSTAGRAM_URL } from "@/components/site-config";
import Reveal from "@/components/Reveal";

const BUDGET_OPTIONS = [
  { value: "< Rp 3 juta", id: "< Rp 3 juta", en: "Under IDR 3M" },
  { value: "Rp 3-5 juta", id: "Rp 3-5 juta", en: "IDR 3-5M" },
  { value: "> Rp 5 juta", id: "> Rp 5 juta", en: "Above IDR 5M" },
  { value: "Belum tahu", id: "Belum tahu", en: "Not sure yet" },
];

export default function StudioContact({ settings = {} }) {
  const { lang } = useLang();
  const { trackFormSubmit } = useAnalytics();
  const whatsappUrl = getLocalizedWhatsAppUrl(lang);
  const [status, setStatus] = useState("idle");
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", budget_range: "", message: "" });

  const t = lang === "id"
    ? {
        kicker: "Mulai percakapan", title: settings.contact_heading || "Ceritakan apa yang ingin kamu bangun.", body: settings.contact_desc || "Tidak perlu brief yang sempurna. Cukup ceritakan bisnis, kebutuhan, dan targetmu. Kami akan membantu merapikan arahnya.", response: "Estimasi balasan 1x24 jam kerja", wa: "Chat via WhatsApp", ig: "Lihat Instagram", name: "Nama *", namePh: "Nama lengkap", email: "Email *", emailPh: "email@kamu.com", phone: "Nomor HP", phonePh: "08xx-xxxx-xxxx", company: "Perusahaan / Brand", companyPh: "Nama bisnis (opsional)", budget: "Estimasi budget", message: "Ceritakan proyekmu", messagePh: "Apa yang ingin dibangun dan target yang ingin dicapai?", send: "Kirim brief", sending: "Mengirim...", success: "Brief sudah terkirim", successBody: "Terima kasih. Kami akan segera menghubungimu.", again: "Kirim brief lain", error: "Pesan belum terkirim. Silakan coba lagi." }
    : {
        kicker: "Start a conversation", title: "Tell us what you want to build.", body: "You do not need a perfect brief. Tell us about the business, the need, and the goal. We will help shape the direction.", response: "Estimated response within one business day", wa: "Chat on WhatsApp", ig: "View Instagram", name: "Name *", namePh: "Full name", email: "Email *", emailPh: "your@email.com", phone: "Phone number", phonePh: "+62 8xx-xxxx-xxxx", company: "Company / Brand", companyPh: "Business name (optional)", budget: "Estimated budget", message: "Tell us about the project", messagePh: "What do you want to build and achieve?", send: "Send brief", sending: "Sending...", success: "Your brief was sent", successBody: "Thank you. We will get back to you soon.", again: "Send another brief", error: "The message was not sent. Please try again." };

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

  const inputClass = "w-full border-0 border-b border-white/18 bg-transparent px-0 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-mint focus:ring-0";

  return (
    <section id="kontak" className="bg-navy-deep text-white">
      <div className="studio-shell grid gap-14 py-24 md:py-32 lg:grid-cols-[.78fr_1.22fr] lg:gap-24">
        <Reveal>
          <p className="studio-kicker !text-mint">{t.kicker}</p>
          <h2 className="mt-7 max-w-[12ch] text-balance text-4xl font-extrabold leading-[1.03] tracking-[-.052em] sm:text-5xl lg:text-[3.6rem]">{t.title}</h2>
          <p className="mt-6 max-w-[43ch] text-sm leading-7 text-white/57">{t.body}</p>
          <p className="mt-8 text-xs font-bold uppercase tracking-[.14em] text-mint">{t.response}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-mint px-5 py-3 text-sm font-bold text-navy-deep transition hover:bg-[#30e2b5]">{t.wa} <ArrowUpRight className="h-4 w-4" /></a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:border-mint">{t.ig} <ArrowUpRight className="h-4 w-4" /></a>
          </div>
        </Reveal>

        <Reveal className="rounded-[1.35rem] border border-white/12 bg-white/[.055] p-6 sm:p-9">
          {status === "success" ? (
            <div className="flex min-h-[480px] flex-col items-center justify-center text-center">
              <CheckCircle2 className="h-12 w-12 text-mint" />
              <h3 className="mt-5 text-2xl font-bold">{t.success}</h3>
              <p className="mt-2 text-sm text-white/55">{t.successBody}</p>
              <button type="button" onClick={() => setStatus("idle")} className="mt-7 text-sm font-bold text-mint hover:underline">{t.again}</button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-7">
              <div className="grid gap-7 sm:grid-cols-2">
                <label className="text-xs font-bold uppercase tracking-[.12em] text-white/52">{t.name}<input required name="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder={t.namePh} className={inputClass} /></label>
                <label className="text-xs font-bold uppercase tracking-[.12em] text-white/52">{t.email}<input required type="email" name="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder={t.emailPh} className={inputClass} /></label>
                <label className="text-xs font-bold uppercase tracking-[.12em] text-white/52">{t.phone}<input name="phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder={t.phonePh} className={inputClass} /></label>
                <label className="text-xs font-bold uppercase tracking-[.12em] text-white/52">{t.company}<input name="company" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} placeholder={t.companyPh} className={inputClass} /></label>
              </div>
              <fieldset>
                <legend className="text-xs font-bold uppercase tracking-[.12em] text-white/52">{t.budget}</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {BUDGET_OPTIONS.map((option) => <button key={option.value} type="button" onClick={() => setForm({ ...form, budget_range: option.value })} className={`rounded-full border px-4 py-2 text-xs font-bold transition ${form.budget_range === option.value ? "border-mint bg-mint text-navy-deep" : "border-white/16 text-white/64 hover:border-mint hover:text-white"}`}>{option[lang]}</button>)}
                </div>
              </fieldset>
              <label className="block text-xs font-bold uppercase tracking-[.12em] text-white/52">{t.message}<textarea name="message" rows={4} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder={t.messagePh} className={`${inputClass} resize-none`} /></label>
              {status === "error" && <p className="text-sm text-red-300">{t.error}</p>}
              <button type="submit" disabled={status === "loading"} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-mint px-6 py-3.5 text-sm font-bold text-navy-deep transition hover:bg-[#30e2b5] disabled:opacity-50 sm:w-auto">
                {status === "loading" ? <><Loader2 className="h-4 w-4 animate-spin" />{t.sending}</> : <><Send className="h-4 w-4" />{t.send}</>}
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
