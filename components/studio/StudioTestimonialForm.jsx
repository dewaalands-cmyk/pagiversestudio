"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, Loader2, Send, Star } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";
import { useAnalytics } from "@/lib/useAnalytics";

export default function StudioTestimonialForm() {
  const { lang } = useLang();
  const { trackFormSubmit } = useAnalytics();
  const [status, setStatus] = useState("idle");
  const [form, setForm] = useState({ client_name: "", client_company: "", rating: 5, content: "" });
  const t = lang === "id"
    ? { summary: "Sudah pernah bekerja dengan Pagiverse? Bagikan pengalamanmu", intro: "Testimoni akan ditampilkan setelah diverifikasi.", name: "Nama *", company: "Perusahaan / Brand", rating: "Rating", story: "Cerita kamu *", storyPh: "Bagaimana pengalaman bekerja bersama Pagiverse Studio?", send: "Kirim testimoni", sending: "Mengirim...", success: "Terima kasih, testimonimu sudah kami terima.", error: "Testimoni belum terkirim. Coba lagi." }
    : { summary: "Worked with Pagiverse before? Share your experience", intro: "Testimonials are displayed after verification.", name: "Name *", company: "Company / Brand", rating: "Rating", story: "Your story *", storyPh: "How was your experience working with Pagiverse Studio?", send: "Submit testimonial", sending: "Sending...", success: "Thank you, we have received your testimonial.", error: "The testimonial was not sent. Please try again." };

  async function submit(event) {
    event.preventDefault();
    if (!form.client_name.trim() || !form.content.trim()) return;
    setStatus("loading");
    try {
      const response = await fetch("/api/testimonies", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!response.ok) throw new Error();
      trackFormSubmit("testimonial_form");
      setStatus("success");
      setForm({ client_name: "", client_company: "", rating: 5, content: "" });
    } catch {
      setStatus("error");
    }
  }

  const inputClass = "w-full rounded-xl border border-navy-deep/15 bg-transparent px-4 py-3 text-sm text-navy-deep outline-none placeholder:text-navy-deep/35 focus:border-mint focus:ring-2 focus:ring-mint/15";

  return (
    <section id="testimoni" className="border-b studio-rule bg-navy-deep text-white">
      <div className="studio-shell pb-16">
        <details className="group border-t border-white/14 py-2">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-6 text-sm font-bold marker:hidden">
            <span>{t.summary}</span>
            <ChevronDown className="h-5 w-5 shrink-0 transition group-open:rotate-180" />
          </summary>
          <div className="pb-8">
            {status === "success" ? (
              <div className="flex items-center gap-3 rounded-xl border border-mint/25 bg-mint/10 p-5 text-sm font-semibold"><CheckCircle2 className="h-5 w-5 text-mint" />{t.success}</div>
            ) : (
              <form onSubmit={submit} className="grid gap-5 rounded-[1.25rem] bg-[#f6f5f1] p-6 text-navy-deep sm:grid-cols-2 sm:p-8">
                <p className="text-sm text-navy-deep/55 sm:col-span-2">{t.intro}</p>
                <label className="text-sm font-bold">{t.name}<input required name="client_name" value={form.client_name} onChange={(event) => setForm({ ...form, client_name: event.target.value })} className={`${inputClass} mt-2`} /></label>
                <label className="text-sm font-bold">{t.company}<input name="client_company" value={form.client_company} onChange={(event) => setForm({ ...form, client_company: event.target.value })} className={`${inputClass} mt-2`} /></label>
                <fieldset className="sm:col-span-2">
                  <legend className="text-sm font-bold">{t.rating}</legend>
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setForm({ ...form, rating: value })} aria-label={`${value} ${lang === "id" ? "bintang" : "stars"}`}><Star className={`h-6 w-6 ${value <= form.rating ? "fill-mint text-mint" : "text-navy-deep/20"}`} /></button>)}
                  </div>
                </fieldset>
                <label className="text-sm font-bold sm:col-span-2">{t.story}<textarea required name="content" rows={4} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder={t.storyPh} className={`${inputClass} mt-2 resize-none`} /></label>
                {status === "error" && <p className="text-sm text-red-500 sm:col-span-2">{t.error}</p>}
                <button type="submit" disabled={status === "loading"} className="inline-flex items-center justify-center gap-2 rounded-full bg-navy-deep px-6 py-3 text-sm font-bold text-white sm:col-span-2 sm:justify-self-start">
                  {status === "loading" ? <><Loader2 className="h-4 w-4 animate-spin" />{t.sending}</> : <><Send className="h-4 w-4" />{t.send}</>}
                </button>
              </form>
            )}
          </div>
        </details>
      </div>
    </section>
  );
}
