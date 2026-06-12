"use client";

import { useState } from "react";
import { MessageCircle, Instagram, Send, CheckCircle2, Loader2 } from "lucide-react";
import { WHATSAPP_TEXT, INSTAGRAM_HANDLE } from "./site-config";
import { useLang } from "./LanguageProvider";

const BUDGET_OPTIONS = [
  "< Rp 5 juta",
  "Rp 5–15 juta",
  "Rp 15–50 juta",
  "> Rp 50 juta",
  "Belum tahu",
];

const T = {
  id: {
    heading: "Punya proyek website atau aplikasi? Yuk ngobrol dulu.",
    sub: "Ceritakan kebutuhanmu lewat form di bawah atau chat langsung via WhatsApp.",
    wa: "Chat via WhatsApp",
    form_heading: "Kirim Inquiry",
    form_sub: "Kami biasanya membalas dalam 1×24 jam.",
    name: "Nama *",
    name_ph: "Nama kamu",
    email: "Email *",
    email_ph: "email@kamu.com",
    phone: "Nomor HP",
    phone_ph: "08xx-xxxx-xxxx",
    company: "Perusahaan / Brand",
    company_ph: "Nama bisnis kamu (opsional)",
    budget: "Estimasi Budget",
    message: "Ceritakan proyekmu",
    message_ph: "Apa yang ingin kamu bangun? Kebutuhan khusus?",
    send: "Kirim Pesan",
    sending: "Mengirim...",
    success_title: "Pesan Terkirim!",
    success_sub: "Terima kasih! Kami akan segera menghubungimu.",
    error: "Gagal mengirim. Coba lagi atau hubungi via WhatsApp.",
  },
  en: {
    heading: "Have a website or app project? Let's talk.",
    sub: "Tell us about your needs via the form below or chat directly via WhatsApp.",
    wa: "Chat via WhatsApp",
    form_heading: "Send Inquiry",
    form_sub: "We usually reply within 24 hours.",
    name: "Name *",
    name_ph: "Your name",
    email: "Email *",
    email_ph: "your@email.com",
    phone: "Phone Number",
    phone_ph: "+62 8xx-xxxx-xxxx",
    company: "Company / Brand",
    company_ph: "Your business name (optional)",
    budget: "Estimated Budget",
    message: "Tell us about your project",
    message_ph: "What do you want to build? Any specific requirements?",
    send: "Send Message",
    sending: "Sending...",
    success_title: "Message Sent!",
    success_sub: "Thank you! We'll get back to you soon.",
    error: "Failed to send. Please try again or contact us via WhatsApp.",
  },
};

export default function Contact({ settings = {} }) {
  const { lang } = useLang();
  const t = lang === "id" ? T.id : T.en;

  const heading = (lang === "id" && settings.contact_heading) || t.heading;
  const sub     = (lang === "id" && settings.contact_desc)    || t.sub;
  const cta     = (lang === "id" && settings.contact_cta)     || t.wa;

  const waNumber = settings.contact_whatsapp ?? "";
  const normalizedNumber = waNumber.replace(/^0/, "62").replace(/\D/g, "") || "6289502839893";
  const waUrl = `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(WHATSAPP_TEXT)}`;
  const igHandle = settings.contact_instagram || INSTAGRAM_HANDLE;
  const igUrl = `https://www.instagram.com/${igHandle.replace(/^@/, "")}/`;

  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "", budget_range: "", message: "",
  });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setForm({ name: "", email: "", phone: "", company: "", budget_range: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  const inputClass =
    "w-full rounded-xl border border-cloud-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm text-navy-deep dark:text-white placeholder-slate-muted dark:placeholder-slate-label focus:outline-none focus:ring-2 focus:ring-mint transition";

  return (
    <section id="kontak" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      {/* Hero CTA banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cloud-200 bg-navy-deep px-6 py-14 text-center dark:border-white/10 sm:px-12 mb-12">
        <div className="absolute inset-0 grid-pattern opacity-50" aria-hidden="true" />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">{heading}</h2>
          <p className="mt-4 leading-relaxed text-cloud-200">{sub}</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-mint px-7 py-3.5 font-semibold text-navy-deep transition-transform hover:-translate-y-0.5 sm:w-auto"
            >
              <MessageCircle className="h-5 w-5" /> {cta}
            </a>
            <a
              href={igUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/20 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white">
                <Instagram className="h-4 w-4" />
              </span>
              {igHandle}
            </a>
          </div>
        </div>
      </div>

      {/* Inquiry Form */}
      <div className="rounded-3xl border border-cloud-200 dark:border-white/10 bg-white dark:bg-navy-soft shadow-sm p-8 sm:p-10">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-navy-deep dark:text-white">{t.form_heading}</h3>
          <p className="mt-1 text-sm text-slate-muted dark:text-slate-label">{t.form_sub}</p>
        </div>

        {status === "success" ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <CheckCircle2 className="h-14 w-14 text-mint" />
            <h4 className="text-xl font-semibold text-navy-deep dark:text-white">{t.success_title}</h4>
            <p className="text-slate-muted dark:text-slate-label">{t.success_sub}</p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-4 text-sm text-mint hover:underline"
            >
              Kirim inquiry lain
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy-deep dark:text-white">{t.name}</label>
                <input
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder={t.name_ph}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy-deep dark:text-white">{t.email}</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder={t.email_ph}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy-deep dark:text-white">{t.phone}</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder={t.phone_ph}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy-deep dark:text-white">{t.company}</label>
                <input
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder={t.company_ph}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-deep dark:text-white">{t.budget}</label>
              <div className="flex flex-wrap gap-2">
                {BUDGET_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, budget_range: opt }))}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
                      form.budget_range === opt
                        ? "bg-mint border-mint text-navy-deep"
                        : "border-cloud-200 dark:border-white/10 text-slate-muted dark:text-slate-label hover:border-mint hover:text-mint"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-deep dark:text-white">{t.message}</label>
              <textarea
                name="message"
                rows={4}
                value={form.message}
                onChange={handleChange}
                placeholder={t.message_ph}
                className={inputClass + " resize-none"}
              />
            </div>

            {status === "error" && (
              <p className="text-sm text-red-500">{t.error}</p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex items-center gap-2 rounded-xl bg-mint px-8 py-3 font-semibold text-navy-deep transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === "loading" ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> {t.sending}</>
                ) : (
                  <><Send className="h-4 w-4" /> {t.send}</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
