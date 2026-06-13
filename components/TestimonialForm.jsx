"use client";

import { useState } from "react";
import { Star, Send, CheckCircle2, Loader2 } from "lucide-react";
import { useLang } from "./LanguageProvider";

const T = {
  id: {
    label: "Bagikan Pengalaman",
    heading: "Ceritakan Pengalaman Kamu",
    sub: "Testimoni kamu membantu kami berkembang dan membantu bisnis lain menemukan partner digital yang tepat.",
    name: "Nama *",
    name_ph: "Nama lengkap kamu",
    company: "Perusahaan / Brand",
    company_ph: "Nama bisnis kamu (opsional)",
    rating: "Rating",
    message: "Cerita kamu *",
    message_ph: "Bagaimana pengalaman kamu bekerja sama dengan Pagiverse Studio?",
    send: "Kirim Testimoni",
    sending: "Mengirim...",
    success_title: "Terima Kasih!",
    success_sub: "Testimoni kamu sudah kami terima dan akan ditampilkan setelah diverifikasi.",
    send_another: "Kirim testimoni lain",
    error: "Gagal mengirim. Coba lagi sebentar.",
    pending_note: "Testimoni akan ditampilkan setelah diverifikasi oleh tim kami.",
  },
  en: {
    label: "Share Your Experience",
    heading: "Tell Us About Your Experience",
    sub: "Your testimonial helps us grow and helps other businesses find the right digital partner.",
    name: "Name *",
    name_ph: "Your full name",
    company: "Company / Brand",
    company_ph: "Your business name (optional)",
    rating: "Rating",
    message: "Your story *",
    message_ph: "How was your experience working with Pagiverse Studio?",
    send: "Submit Testimonial",
    sending: "Sending...",
    success_title: "Thank You!",
    success_sub: "We've received your testimonial and it will be displayed after verification.",
    send_another: "Submit another testimonial",
    error: "Failed to send. Please try again.",
    pending_note: "Testimonial will be shown after verification by our team.",
  },
};

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`h-7 w-7 transition-colors ${
              n <= (hovered || value)
                ? "fill-yellow-400 text-yellow-400"
                : "text-cloud-200 dark:text-white/20"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function TestimonialForm() {
  const { lang } = useLang();
  const t = lang === "id" ? T.id : T.en;

  const [form, setForm] = useState({
    client_name: "",
    client_company: "",
    rating: 5,
    content: "",
  });
  const [status, setStatus] = useState("idle");

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.client_name.trim() || !form.content.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/testimonies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setForm({ client_name: "", client_company: "", rating: 5, content: "" });
    } catch {
      setStatus("error");
    }
  }

  const inputClass =
    "w-full rounded-xl border border-cloud-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm text-navy-deep dark:text-white placeholder-slate-muted dark:placeholder-slate-label focus:outline-none focus:ring-2 focus:ring-mint transition";

  return (
    <section id="testimoni" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-cloud-200 dark:border-white/10 bg-white dark:bg-navy-soft shadow-sm overflow-hidden">

        <div className="relative bg-gradient-to-br from-teal-700 to-navy-deep px-8 py-10 sm:px-12">
          <div className="absolute inset-0 grid-pattern opacity-30" aria-hidden="true" />
          <div className="relative">
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 mb-3">
              {t.label}
            </span>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">{t.heading}</h2>
            <p className="mt-2 text-white/70 text-sm">{t.sub}</p>
          </div>
        </div>

        <div className="p-8 sm:p-12">
          {status === "success" ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <CheckCircle2 className="h-14 w-14 text-mint" />
              <h4 className="text-xl font-semibold text-navy-deep dark:text-white">{t.success_title}</h4>
              <p className="text-slate-muted dark:text-slate-label">{t.success_sub}</p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-4 text-sm text-mint hover:underline"
              >
                {t.send_another}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl mx-auto">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-navy-deep dark:text-white">{t.name}</label>
                  <input
                    name="client_name"
                    required
                    value={form.client_name}
                    onChange={handleChange}
                    placeholder={t.name_ph}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-navy-deep dark:text-white">{t.company}</label>
                  <input
                    name="client_company"
                    value={form.client_company}
                    onChange={handleChange}
                    placeholder={t.company_ph}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-navy-deep dark:text-white">{t.rating}</label>
                <StarRating value={form.rating} onChange={(n) => setForm((prev) => ({ ...prev, rating: n }))} />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy-deep dark:text-white">{t.message}</label>
                <textarea
                  name="content"
                  required
                  rows={4}
                  value={form.content}
                  onChange={handleChange}
                  placeholder={t.message_ph}
                  className={inputClass + " resize-none"}
                />
              </div>

              <p className="text-xs text-slate-muted dark:text-slate-label">{t.pending_note}</p>

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
      </div>
    </section>
  );
}
