"use client";

// Context global untuk bahasa (ID / EN).
// Pakai useLang() di komponen mana pun untuk membaca atau mengubah bahasa.

import { createContext, useContext, useEffect, useState } from "react";

const LanguageContext = createContext({ lang: "id", setLang: () => {} });

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("id");

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = lang === "id"
      ? "Pagiverse Studio | Jasa Pembuatan Website Profesional di Garut"
      : "Pagiverse Studio | Professional Website Design in Garut";

    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.setAttribute(
        "content",
        lang === "id"
          ? "Pagiverse Studio membantu UMKM dan brand lokal punya website yang cepat, rapi, dan mudah ditemukan di Google. Konsultasi gratis via WhatsApp."
          : "Pagiverse Studio designs fast, polished websites and web apps that help local businesses earn trust and grow."
      );
    }
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
