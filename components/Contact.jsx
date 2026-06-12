"use client";

import { MessageCircle, Instagram } from "lucide-react";
import { WHATSAPP_TEXT, INSTAGRAM_URL, INSTAGRAM_HANDLE } from "./site-config";
import { useLang } from "./LanguageProvider";

const defaults = {
  judul: "Punya proyek website atau aplikasi? Yuk ngobrol dulu.",
  p: "Ceritakan kebutuhanmu lewat WhatsApp — gratis, tanpa kewajiban. Kami bantu pikirkan solusi terbaik untuk bisnismu.",
  cta: "Chat via WhatsApp",
};
const en_defaults = {
  judul: "Have a website or app project? Let's talk.",
  p: "Tell us about your needs via WhatsApp — free, no obligation. We'll help you find the best solution for your business.",
  cta: "Chat via WhatsApp",
};

export default function Contact({ settings = {} }) {
  const { lang } = useLang();
  const isId = lang === "id";

  const judul = (isId && settings.contact_heading) || (isId ? defaults.judul : en_defaults.judul);
  const p     = (isId && settings.contact_desc)    || (isId ? defaults.p     : en_defaults.p);
  const cta   = (isId && settings.contact_cta)     || (isId ? defaults.cta   : en_defaults.cta);

  // Build WA URL from settings number or fallback
  const waNumber = settings.contact_whatsapp ?? "";
  const normalizedNumber = waNumber.replace(/^0/, "62").replace(/\D/g, "") || "6289502839893";
  const waUrl = `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(WHATSAPP_TEXT)}`;

  const igHandle = settings.contact_instagram || INSTAGRAM_HANDLE;
  const igSlug = igHandle.replace(/^@/, "");
  const igUrl = `https://www.instagram.com/${igSlug}/`;

  return (
    <section id="kontak" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-cloud-200 bg-navy-deep px-6 py-14 text-center dark:border-white/10 sm:px-12">
        <div className="absolute inset-0 grid-pattern opacity-50" aria-hidden="true" />

        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            {judul}
          </h2>
          <p className="mt-4 leading-relaxed text-cloud-200">{p}</p>

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
    </section>
  );
}
