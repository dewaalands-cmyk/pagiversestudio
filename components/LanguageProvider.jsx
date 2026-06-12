"use client";

// Context global untuk bahasa (ID / EN).
// Pakai useLang() di komponen mana pun untuk membaca atau mengubah bahasa.

import { createContext, useContext, useState } from "react";

const LanguageContext = createContext({ lang: "id", setLang: () => {} });

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("id");
  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
