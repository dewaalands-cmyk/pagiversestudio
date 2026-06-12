"use client";

// Tombol matahari/bulan untuk ganti mode terang & gelap.

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Menunggu komponen siap di browser agar ikon tidak "loncat" saat halaman dimuat.
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-9" aria-hidden="true" />;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Ganti tema terang atau gelap"
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-cloud-200 text-navy-deep transition-colors hover:bg-cloud-100 dark:border-white/10 dark:text-cloud-100 dark:hover:bg-white/5"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
