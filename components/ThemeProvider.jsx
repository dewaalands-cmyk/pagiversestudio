"use client";

// Pembungkus dari library next-themes.
// "attribute: class" artinya mode gelap diaktifkan lewat class "dark" di <html>,
// persis seperti yang diatur di tailwind.config.js.

import { ThemeProvider as NextThemesProvider } from "next-themes";

export default function ThemeProvider({ children }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  );
}
