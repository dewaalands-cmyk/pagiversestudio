/** @type {import('tailwindcss').Config} */
module.exports = {
  // 'class' artinya dark mode diaktifkan lewat class "dark" di <html>.
  // Ini yang dipakai next-themes untuk toggle gelap/terang.
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Warna brand Pagiverse Studio (dari brand kit)
      colors: {
        navy: {
          deep: "#0C1B33",   // Navy Deep
          soft: "#162D47",   // Navy lebih terang (untuk card di dark mode)
        },
        mint: "#00D4A0",     // Mint Accent
        cloud: {
          50: "#F5F8FC",
          100: "#EFF3F8",
          200: "#DDE3EA",
        },
        slate: {
          muted: "#7B8D9E",  // teks abu-abu
          label: "#AAB4C0",
        },
      },
      // Font Sora sebagai font utama
      fontFamily: {
        sora: ["Sora", "system-ui", "sans-serif"],
      },
      // Animasi untuk efek muncul saat halaman dibuka
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
      },
    },
  },
  plugins: [],
};
