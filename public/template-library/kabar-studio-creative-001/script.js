(() => {
  "use strict";
  const TEMPLATE_ID = "kabar-studio-creative-001";
  const SYSTEM_MESSAGES = Object.freeze({
    invalidMessage: "Periksa kembali kolom yang ditandai.",
    demoStatus: "Brief sudah diperiksa. Ini demo; pesan belum dikirim.",
    requiredMessage: "Kolom ini wajib diisi.",
    emailMessage: "Masukkan alamat email yang valid.",
    shortMessage: "Ceritakan proyek Anda minimal 15 karakter.",
    longMessage: "Isian melebihi batas karakter.",
    fieldMessage: "Periksa kembali isian ini.",
  });
  const FALLBACK = {
    id: "kabar-studio-creative-001",
    fields: {
      "business.name": {
        type: "text",
        label: "Nama agensi",
        required: true,
        maxLength: 60,
        default: "KABAR STUDIO",
      },
      "business.tagline": {
        type: "text",
        label: "Tagline",
        maxLength: 96,
        default: "Ide kuat. Karya bersuara.",
      },
      "business.demoLabel": {
        type: "text",
        label: "Label edisi",
        maxLength: 32,
        default: "Edisi contoh",
      },
      "navigation.menu.label": {
        type: "text",
        label: "Label menu",
        maxLength: 20,
        default: "Menu",
      },
      "navigation.gallery.label": {
        type: "text",
        label: "Navigasi karya",
        maxLength: 24,
        default: "Karya",
      },
      "navigation.services.label": {
        type: "text",
        label: "Navigasi layanan",
        maxLength: 24,
        default: "Layanan",
      },
      "navigation.about.label": {
        type: "text",
        label: "Navigasi studio",
        maxLength: 24,
        default: "Studio",
      },
      "navigation.contact.label": {
        type: "text",
        label: "Navigasi kontak",
        maxLength: 24,
        default: "Mulai proyek",
      },
      "sections.hero.kicker": {
        type: "text",
        label: "Pengantar hero",
        maxLength: 60,
        default: "Biro ide & karya",
      },
      "sections.hero.heading": {
        type: "text",
        label: "Judul banner hero",
        required: true,
        maxLength: 12,
        default: "KABAR",
      },
      "sections.hero.description": {
        type: "textarea",
        label: "Deskripsi hero",
        maxLength: 240,
        default:
          "Kami merangkai branding, website, dan kampanye menjadi satu cerita yang terasa utuh.",
      },
      "sections.hero.primaryCta.label": {
        type: "text",
        label: "CTA utama hero",
        maxLength: 30,
        default: "Mulai proyek",
      },
      "sections.hero.secondaryCta.label": {
        type: "text",
        label: "CTA karya",
        maxLength: 30,
        default: "Lihat karya",
      },
      "sections.hero.byline": {
        type: "text",
        label: "Catatan hero",
        maxLength: 160,
        default:
          "Studio independen untuk merek yang punya sesuatu untuk dikatakan.",
      },
      "sections.about.heading": {
        type: "text",
        label: "Judul studio",
        maxLength: 100,
        default: "Satu studio. Banyak sudut pandang.",
      },
      "sections.about.mark": {
        type: "text",
        label: "Monogram studio",
        maxLength: 8,
        default: "Ks.",
      },
      "sections.about.markCaption": {
        type: "text",
        label: "Keterangan monogram",
        maxLength: 70,
        default: "Pikiran terbuka. Arah bersama.",
      },
      "sections.about.body": {
        type: "textarea",
        label: "Cerita studio",
        maxLength: 500,
        default:
          "Kami percaya merek yang kuat lahir dari ide yang jelas. Dari strategi dan identitas hingga pengalaman digital dan kampanye, kami menjaga setiap bagian berbicara dalam bahasa yang sama.",
      },
      "sections.about.secondaryBody": {
        type: "textarea",
        label: "Cara bekerja studio",
        maxLength: 400,
        default:
          "Tim kecil, percakapan dekat, dan keterlibatan dari awal sampai akhir. Kami bekerja bersama Anda untuk membentuk karya yang relevan dengan kebutuhan bisnis.",
      },
      "sections.about.ctaLabel": {
        type: "text",
        label: "CTA layanan studio",
        maxLength: 30,
        default: "Kenali layanan",
      },
      "sections.gallery.intro": {
        type: "text",
        label: "Pengantar karya",
        maxLength: 60,
        default: "Karya pilihan",
      },
      "sections.gallery.demoLabel": {
        type: "text",
        label: "Pemberitahuan demo karya",
        maxLength: 120,
        default: "Seluruh proyek berikut adalah konsep demo.",
      },
      "sections.gallery.heading": {
        type: "text",
        label: "Judul banner karya",
        maxLength: 12,
        default: "KARYA",
      },
      "sections.gallery.filterAll": {
        type: "text",
        label: "Filter semua",
        maxLength: 24,
        default: "Semua",
      },
      "sections.gallery.filterBranding": {
        type: "text",
        label: "Filter branding",
        maxLength: 24,
        default: "Branding",
      },
      "sections.gallery.filterWebsite": {
        type: "text",
        label: "Filter website",
        maxLength: 24,
        default: "Website",
      },
      "sections.gallery.filterCampaign": {
        type: "text",
        label: "Filter kampanye",
        maxLength: 24,
        default: "Kampanye",
      },
      "sections.gallery.emptyLabel": {
        type: "text",
        label: "Pesan karya kosong",
        maxLength: 150,
        default: "Belum ada karya di pilihan ini.",
      },
      "sections.gallery.countLabel": {
        type: "text",
        label: "Label jumlah proyek",
        maxLength: 24,
        default: "proyek",
      },
      "sections.gallery.detailLabel": {
        type: "text",
        label: "Label detail proyek",
        maxLength: 40,
        default: "Lihat detail proyek",
      },
      "sections.gallery.briefLabel": {
        type: "text",
        label: "Judul brief proyek",
        maxLength: 50,
        default: "Brief konsep",
      },
      "sections.gallery.approachLabel": {
        type: "text",
        label: "Judul pendekatan proyek",
        maxLength: 50,
        default: "Pendekatan",
      },
      "sections.gallery.deliverablesLabel": {
        type: "text",
        label: "Judul keluaran proyek",
        maxLength: 50,
        default: "Lingkup konsep",
      },
      "sections.gallery.dialogCloseLabel": {
        type: "text",
        label: "Label tutup detail",
        maxLength: 50,
        default: "Tutup detail proyek",
      },
      "sections.services.heading": {
        type: "text",
        label: "Judul layanan",
        maxLength: 100,
        default: "Dari gagasan sampai jadi.",
      },
      "sections.services.description": {
        type: "textarea",
        label: "Deskripsi layanan",
        maxLength: 260,
        default:
          "Tiga keahlian, satu arah kreatif. Mulai dari kebutuhan yang paling penting untuk merek Anda.",
      },
      "sections.services.mark": {
        type: "text",
        label: "Tanda layanan",
        maxLength: 12,
        default: "Craft.",
      },
      "sections.process.heading": {
        type: "text",
        label: "Judul proses",
        maxLength: 110,
        default: "Karya dimulai dari percakapan.",
      },
      "sections.contact.kicker": {
        type: "text",
        label: "Pengantar kontak",
        maxLength: 70,
        default: "Ada ide di kepala?",
      },
      "sections.contact.heading": {
        type: "text",
        label: "Judul kontak",
        required: true,
        maxLength: 100,
        default: "Mari buat kabar baik.",
      },
      "sections.contact.description": {
        type: "textarea",
        label: "Deskripsi kontak",
        maxLength: 300,
        default:
          "Ceritakan apa yang sedang Anda bangun. Kami mulai dari tujuan, lalu menemukan bentuknya bersama.",
      },
      "sections.contact.demoNotice": {
        type: "textarea",
        label: "Pemberitahuan demo formulir",
        maxLength: 240,
        default:
          "Ini website demo. Formulir belum terhubung ke pengiriman pesan.",
      },
      "sections.contact.form.nameLabel": {
        type: "text",
        label: "Label nama",
        maxLength: 60,
        default: "Nama Anda",
      },
      "sections.contact.form.emailLabel": {
        type: "text",
        label: "Label email",
        maxLength: 60,
        default: "Email",
      },
      "sections.contact.form.serviceLabel": {
        type: "text",
        label: "Label kebutuhan",
        maxLength: 60,
        default: "Kebutuhan Anda",
      },
      "sections.contact.form.servicePlaceholder": {
        type: "text",
        label: "Pilihan kosong layanan",
        maxLength: 60,
        default: "Pilih layanan",
      },
      "sections.contact.form.optionBranding": {
        type: "text",
        label: "Pilihan branding",
        maxLength: 60,
        default: "Branding",
      },
      "sections.contact.form.optionWebsite": {
        type: "text",
        label: "Pilihan website",
        maxLength: 60,
        default: "Website",
      },
      "sections.contact.form.optionCampaign": {
        type: "text",
        label: "Pilihan kampanye",
        maxLength: 60,
        default: "Kampanye",
      },
      "sections.contact.form.optionFull": {
        type: "text",
        label: "Pilihan full-service",
        maxLength: 60,
        default: "Paket full-service",
      },
      "sections.contact.form.messageLabel": {
        type: "text",
        label: "Label cerita proyek",
        maxLength: 100,
        default: "Sedikit cerita tentang proyek",
      },
      "sections.contact.form.submitLabel": {
        type: "text",
        label: "Tombol brief",
        maxLength: 40,
        default: "Susun brief",
      },
      "sections.footer.copyright": {
        type: "text",
        label: "Hak cipta",
        maxLength: 160,
        default: "© 2026 KABAR STUDIO. Identitas dan karya contoh.",
      },
      "sections.footer.backLabel": {
        type: "text",
        label: "Tautan kembali",
        maxLength: 40,
        default: "Kembali ke atas",
      },
      "seo.title": {
        type: "text",
        label: "Judul mesin pencari",
        maxLength: 120,
        default: "KABAR STUDIO | Branding, Website & Kampanye",
      },
      "seo.description": {
        type: "textarea",
        label: "Deskripsi mesin pencari",
        maxLength: 280,
        default:
          "KABAR STUDIO. Agensi kreatif full-service untuk branding, website, dan kampanye. Identitas dan proyek contoh.",
      },
      "contact.email": {
        type: "email",
        label: "Email kontak (opsional)",
        maxLength: 120,
        default: "",
      },
      "business.logo": {
        type: "image",
        label: "Logo agensi (opsional)",
        accept: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"],
        maxFileSizeMB: 5,
        focalPoint: false,
        default: { src: "", alt: "" },
      },
      "sections.gallery.items": {
        type: "array",
        label: "Proyek konsep demo",
        minItems: 0,
        maxItems: 6,
        default: [
          {
            id: "akar",
            title: "AKAR",
            category: "branding",
            label: "Konsep Branding · Kopi",
            description:
              "Konsep demo identitas kopi lokal yang menghubungkan cerita asal, karakter rasa, dan kebiasaan menikmati kopi.",
            brief:
              "AKAR adalah merek kopi fiktif. Konsep demo ini mengeksplorasi identitas yang terasa akrab, tegas, dan mudah dikenali.",
            approach:
              "Kami memakai huruf padat, ilustrasi sederhana, dan bahasa yang langsung untuk menyatukan kemasan dengan pengalaman di kedai.",
            deliverables:
              "Strategi merek konsep\nIdentitas visual\nDesain kemasan\nArahan materi kedai",
            image: {
              src: "assets/akar.webp",
              alt: "Visual konsep demo merek kopi fiktif AKAR dengan kemasan dan identitas editorial.",
              focalPoint: { x: 50, y: 50 },
            },
            imageAlt:
              "Visual konsep demo merek kopi fiktif AKAR dengan kemasan dan identitas editorial.",
            badge: "NEW",
          },
          {
            id: "ruang",
            title: "RUANG",
            category: "website",
            label: "Konsep Website · Seni",
            description:
              "Konsep demo website pameran seni yang memberi karya, seniman, dan informasi kunjungan ruang untuk berbicara.",
            brief:
              "RUANG adalah pameran seni fiktif. Website konsep ini membantu pengunjung mengenal karya dan merencanakan kunjungan.",
            approach:
              "Kami menyusun alur dari gambaran pameran menuju karya, cerita seniman, lalu informasi kunjungan dalam tata letak editorial.",
            deliverables:
              "Struktur informasi\nDesain antarmuka\nWebsite responsif konsep\nArahan konten pameran",
            image: {
              src: "assets/ruang.webp",
              alt: "Visual konsep demo website pameran seni fiktif RUANG dengan komposisi karya dan tipografi editorial.",
              focalPoint: { x: 50, y: 50 },
            },
            imageAlt:
              "Visual konsep demo website pameran seni fiktif RUANG dengan komposisi karya dan tipografi editorial.",
            badge: "NEW",
          },
          {
            id: "sora",
            title: "SORA",
            category: "campaign",
            label: "Konsep Kampanye · Fashion",
            description:
              "Konsep demo kampanye fashion yang merangkai gerak, siluet, dan pesan singkat menjadi satu cerita koleksi.",
            brief:
              "SORA adalah label fashion fiktif. Konsep demo ini memperkenalkan koleksi imajiner melalui cerita tentang ekspresi sehari-hari.",
            approach:
              "Kami menggabungkan komposisi berani, potret bergerak, dan judul singkat agar setiap materi terasa sebagai bagian dari kampanye yang sama.",
            deliverables:
              "Ide kampanye konsep\nArahan kreatif\nKey visual\nRangkaian konten digital",
            image: {
              src: "assets/sora.webp",
              alt: "Visual konsep demo kampanye label fashion fiktif SORA yang menampilkan siluet dan komposisi editorial.",
              focalPoint: { x: 50, y: 50 },
            },
            imageAlt:
              "Visual konsep demo kampanye label fashion fiktif SORA yang menampilkan siluet dan komposisi editorial.",
            badge: "NEW",
          },
        ],
        item: {
          fields: {
            id: { type: "text", label: "ID proyek", maxLength: 40 },
            title: { type: "text", label: "Nama proyek", maxLength: 48 },
            category: {
              type: "select",
              label: "Kategori filter",
              options: ["branding", "website", "campaign"],
              default: "branding",
            },
            label: { type: "text", label: "Label kategori", maxLength: 80 },
            description: {
              type: "textarea",
              label: "Ringkasan proyek",
              maxLength: 200,
            },
            brief: { type: "textarea", label: "Brief konsep", maxLength: 700 },
            approach: { type: "textarea", label: "Pendekatan", maxLength: 800 },
            deliverables: {
              type: "textarea",
              label: "Lingkup konsep",
              maxLength: 500,
            },
            image: {
              type: "image",
              label: "Gambar proyek",
              accept: ["image/png", "image/jpeg", "image/webp"],
              maxFileSizeMB: 8,
              focalPoint: true,
              default: { src: "", alt: "", focalPoint: { x: 50, y: 50 } },
            },
            imageAlt: {
              type: "text",
              label: "Deskripsi gambar",
              maxLength: 180,
            },
            badge: {
              type: "text",
              label: "Penanda proyek",
              maxLength: 3,
              default: "NEW",
              editable: false,
            },
          },
        },
      },
      "sections.services.items": {
        type: "array",
        label: "Daftar layanan",
        minItems: 1,
        maxItems: 6,
        default: [
          {
            name: "Branding",
            description:
              "Kami membantu merek menemukan arah, suara, dan bentuk yang mudah dikenali.",
            details:
              "Strategi dan posisi merek\nIdentitas visual\nPedoman merek\nKemasan dan materi cetak",
          },
          {
            name: "Website",
            description:
              "Kami merancang website yang menjelaskan cerita merek dan memudahkan orang mengambil langkah berikutnya.",
            details:
              "Struktur dan pengalaman pengguna\nDesain antarmuka\nPengembangan website responsif\nArahan konten website",
          },
          {
            name: "Kampanye",
            description:
              "Kami menyatukan ide, visual, dan pesan untuk membawa cerita merek ke berbagai kanal.",
            details:
              "Konsep kampanye\nArahan kreatif\nKey visual\nKonten digital dan media sosial",
          },
        ],
        item: {
          fields: {
            name: { type: "text", label: "Nama layanan", maxLength: 70 },
            description: {
              type: "textarea",
              label: "Deskripsi layanan",
              maxLength: 300,
            },
            details: {
              type: "textarea",
              label: "Rincian layanan",
              maxLength: 500,
            },
          },
        },
      },
      "sections.process.items": {
        type: "array",
        label: "Tahapan kerja",
        minItems: 0,
        maxItems: 6,
        default: [
          {
            title: "Dengarkan",
            description:
              "Kami mengenali kebutuhan, audiens, dan konteks merek melalui percakapan serta bahan yang tersedia.",
          },
          {
            title: "Temukan Arah",
            description:
              "Kami merumuskan gagasan utama dan menyepakati arah visual, pesan, serta lingkup pekerjaan.",
          },
          {
            title: "Bentuk Karya",
            description:
              "Kami mengembangkan konsep menjadi desain dan pengalaman, lalu meninjau detailnya bersama.",
          },
          {
            title: "Siap Bersuara",
            description:
              "Kami menyiapkan hasil akhir dan panduan penggunaan agar karya siap dipakai di kanal yang disepakati.",
          },
        ],
        item: {
          fields: {
            title: { type: "text", label: "Nama tahap", maxLength: 70 },
            description: {
              type: "textarea",
              label: "Penjelasan tahap",
              maxLength: 300,
            },
          },
        },
      },
      "seo.ogImage": {
        type: "image",
        label: "Gambar berbagi",
        accept: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"],
        maxFileSizeMB: 5,
        focalPoint: false,
        default: {
          src: "thumbnail.webp",
          alt: "KABAR STUDIO — contoh agensi kreatif",
        },
      },
    },
    sections: [
      {
        id: "hero",
        label: "Hero",
        required: true,
        visibleByDefault: true,
        fields: [
          "sections.hero.kicker",
          "sections.hero.heading",
          "sections.hero.description",
          "sections.hero.primaryCta.label",
          "sections.hero.secondaryCta.label",
          "sections.hero.byline",
        ],
      },
      {
        id: "about",
        label: "Studio",
        required: false,
        visibleByDefault: true,
        fields: [
          "sections.about.heading",
          "sections.about.mark",
          "sections.about.markCaption",
          "sections.about.body",
          "sections.about.secondaryBody",
          "sections.about.ctaLabel",
        ],
      },
      {
        id: "gallery",
        label: "Karya",
        required: false,
        visibleByDefault: true,
        fields: [
          "sections.gallery.intro",
          "sections.gallery.demoLabel",
          "sections.gallery.heading",
          "sections.gallery.filterAll",
          "sections.gallery.filterBranding",
          "sections.gallery.filterWebsite",
          "sections.gallery.filterCampaign",
          "sections.gallery.emptyLabel",
          "sections.gallery.countLabel",
          "sections.gallery.detailLabel",
          "sections.gallery.briefLabel",
          "sections.gallery.approachLabel",
          "sections.gallery.deliverablesLabel",
          "sections.gallery.dialogCloseLabel",
          "sections.gallery.items",
        ],
      },
      {
        id: "services",
        label: "Layanan",
        required: false,
        visibleByDefault: true,
        fields: [
          "sections.services.heading",
          "sections.services.description",
          "sections.services.mark",
          "sections.services.items",
        ],
      },
      {
        id: "process",
        label: "Proses",
        required: false,
        visibleByDefault: true,
        fields: ["sections.process.heading", "sections.process.items"],
      },
      {
        id: "contact",
        label: "Kontak",
        required: true,
        visibleByDefault: true,
        fields: [
          "sections.contact.kicker",
          "sections.contact.heading",
          "sections.contact.description",
          "sections.contact.demoNotice",
          "sections.contact.form.nameLabel",
          "sections.contact.form.emailLabel",
          "sections.contact.form.serviceLabel",
          "sections.contact.form.servicePlaceholder",
          "sections.contact.form.optionBranding",
          "sections.contact.form.optionWebsite",
          "sections.contact.form.optionCampaign",
          "sections.contact.form.optionFull",
          "sections.contact.form.messageLabel",
          "sections.contact.form.submitLabel",
        ],
      },
      {
        id: "footer",
        label: "Footer",
        required: true,
        visibleByDefault: true,
        fields: ["sections.footer.copyright", "sections.footer.backLabel"],
      },
    ],
    navigation: {
      items: [
        {
          id: "gallery",
          labelField: "navigation.gallery.label",
          target: "#gallery",
          hideable: true,
        },
        {
          id: "services",
          labelField: "navigation.services.label",
          target: "#services",
          hideable: true,
        },
        {
          id: "about",
          labelField: "navigation.about.label",
          target: "#about",
          hideable: true,
        },
        {
          id: "contact",
          labelField: "navigation.contact.label",
          target: "#contact",
          hideable: false,
        },
      ],
    },
  };
  const owns = (object, key) =>
    object !== null &&
    typeof object === "object" &&
    Object.prototype.hasOwnProperty.call(object, key);
  const isRecord = (value) =>
    value !== null && typeof value === "object" && !Array.isArray(value);
  const state = {
    schema: FALLBACK,
    data: isRecord(window.PAGIVERSE_DATA) ? window.PAGIVERSE_DATA : {},
    filter: "all",
    projects: [],
    signatures: new Map(),
    selectedKey: "",
    dialogSignature: "",
    dialogSource: null,
    initialized: false,
  };
  const forbiddenKeys = new Set(["__proto__", "prototype", "constructor"]);
  function nested(source, path) {
    return String(path)
      .split(".")
      .reduce(
        (value, key) =>
          !forbiddenKeys.has(key) && owns(value, key) ? value[key] : undefined,
        source,
      );
  }
  function configured(path) {
    return owns(state.data, path) ? state.data[path] : nested(state.data, path);
  }
  function value(path) {
    const current = configured(path);
    return current === undefined ? state.schema.fields[path]?.default : current;
  }
  function plain(value, maxLength = 2000) {
    if (
      value === undefined ||
      value === null ||
      (typeof value !== "string" && typeof value !== "number")
    )
      return "";
    return String(value)
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
      .slice(0, maxLength);
  }
  function text(path) {
    const field = state.schema.fields[path];
    const current = plain(value(path), field?.maxLength || 2000);
    return field?.required && !current.trim()
      ? plain(field.default, field.maxLength)
      : current;
  }
  function safeURL(input) {
    const source = typeof input === "string" ? input.trim() : "";
    if (
      !source ||
      /[\u0000-\u0020\u007f\\]/.test(source) ||
      source.startsWith("//")
    )
      return "";
    try {
      const absolute = /^[a-z][a-z0-9+.-]*:/i.test(source);
      const url = new URL(source, document.baseURI);
      if (
        !["http:", "https:"].includes(url.protocol) ||
        url.username ||
        url.password
      )
        return "";
      if (!absolute && url.origin !== window.location.origin) return "";
      return absolute ? url.href : source;
    } catch (_) {
      return "";
    }
  }
  function focalNumber(input) {
    const number = Number(input);
    return Number.isFinite(number) ? Math.max(0, Math.min(100, number)) : 50;
  }
  function normalizedImage(input, alt = "") {
    const item = isRecord(input) ? input : { src: input };
    return {
      src: safeURL(item.src),
      alt: plain(alt || item.alt, 180),
      focalPoint: {
        x: focalNumber(item.focalPoint?.x),
        y: focalNumber(item.focalPoint?.y),
      },
    };
  }
  function setImage(image, input, alt = "") {
    const item = normalizedImage(input, alt);
    if (item.src) {
      if (image.getAttribute("src") !== item.src) image.src = item.src;
      image.hidden = false;
    } else {
      image.removeAttribute("src");
      image.hidden = true;
    }
    image.alt = item.alt;
    image.style.objectPosition =
      item.focalPoint.x + "% " + item.focalPoint.y + "%";
    return item;
  }
  function element(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = plain(content);
    return node;
  }
  function normalizeCollection(path) {
    const schema = state.schema.fields[path];
    let items = value(path);
    if (!Array.isArray(items)) items = schema.default || [];
    items = items.filter(isRecord);
    if (items.length < (schema.minItems || 0)) items = schema.default || [];
    const usedKeys = new Set();
    return items
      .slice(0, schema.maxItems)
      .filter(isRecord)
      .map((item, index) => {
        const result = {};
        Object.entries(schema.item.fields).forEach(([key, field]) => {
          const raw = owns(item, key) ? item[key] : field.default;
          if (field.type === "image")
            result[key] = normalizedImage(raw, item.imageAlt);
          else if (field.type === "select")
            result[key] = field.options.includes(raw)
              ? raw
              : field.default || field.options[0];
          else result[key] = plain(raw, field.maxLength || 2000);
        });
        if (path === "sections.gallery.items") {
          const base =
            result.id.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) ||
            "project-" + (index + 1);
          let key = base;
          let duplicate = 1;
          while (usedKeys.has(key)) key = base + "-" + ++duplicate;
          usedKeys.add(key);
          result.key = key;
          result.badge = "NEW";
        }
        return result;
      });
  }
  function renderBindings() {
    document.querySelectorAll("[data-bind]").forEach((node) => {
      const content = text(node.dataset.bind);
      if (node.textContent !== content) node.textContent = content;
    });
    document
      .querySelectorAll("[data-bind-src]")
      .forEach((image) => setImage(image, value(image.dataset.bindSrc)));
    document.querySelectorAll("[data-bind-alt]").forEach((image) => {
      image.alt = text(image.dataset.bindAlt);
    });
    const logo = document.querySelector("[data-brand-logo]");
    if (logo)
      setImage(logo, value("business.logo"), "Logo " + text("business.name"));
    const close = document.querySelector("[data-close-dialog]");
    if (close)
      close.setAttribute(
        "aria-label",
        text("sections.gallery.dialogCloseLabel"),
      );
  }
  function projectCard(project, highlight = false) {
    const card = element(
      "article",
      "project-card" + (highlight ? " project-card-highlight" : ""),
    );
    card.dataset.projectKey = project.key;
    card.dataset.category = project.category;
    const button = element("button", "project-open");
    button.type = "button";
    button.dataset.projectTrigger = project.key;
    button.setAttribute(
      "aria-label",
      text("sections.gallery.detailLabel") +
        ": " +
        project.title +
        " " +
        project.badge,
    );
    const imageBox = element("div", "project-image");
    const image = document.createElement("img");
    image.width = 1200;
    image.height = 900;
    image.loading = highlight ? "eager" : "lazy";
    image.decoding = "async";
    setImage(image, project.image, project.imageAlt);
    imageBox.append(image);
    const titleRow = element("div", "project-title-row");
    titleRow.append(
      element(highlight ? "h2" : "h3", "", project.title),
      document.createTextNode(" "),
      element("span", "new-badge", project.badge),
    );
    button.append(imageBox, titleRow);
    card.append(
      button,
      element("p", "project-category", project.label),
      element("p", "project-description", project.description),
    );
    return card;
  }
  function rememberFocus(container) {
    const active = document.activeElement;
    if (!container.contains(active)) return null;
    const trigger = active.closest("[data-project-trigger]");
    if (trigger) return { project: trigger.dataset.projectTrigger };
    const service = active.closest("[data-service-id]");
    if (service) return { service: service.dataset.serviceId };
    return null;
  }
  function restoreFocus(container, saved) {
    if (!saved) return;
    const candidates = container.querySelectorAll(
      saved.project ? "[data-project-trigger]" : "[data-service-id]",
    );
    const node = Array.from(candidates).find((item) =>
      saved.project
        ? item.dataset.projectTrigger === saved.project
        : item.dataset.serviceId === saved.service,
    );
    const target = saved.project ? node : node?.querySelector("summary");
    if (target && !target.closest("[hidden]"))
      target.focus({ preventScroll: true });
  }
  function renderProjects(items) {
    const container = document.querySelector(
      '[data-collection="sections.gallery.items"]',
    );
    if (!container) return;
    const signature = JSON.stringify(items);
    if (state.signatures.get("projects") !== signature) {
      const focus = rememberFocus(container);
      const fragment = document.createDocumentFragment();
      items.forEach((item) => fragment.append(projectCard(item)));
      container.replaceChildren(fragment);
      state.signatures.set("projects", signature);
      restoreFocus(container, focus);
    }
    document.querySelectorAll("[data-highlight]").forEach((container) => {
      const item = items[Number(container.dataset.highlight)];
      const signature = JSON.stringify(item || null);
      if (state.signatures.get(container) !== signature) {
        const focus = rememberFocus(container);
        container.replaceChildren(...(item ? [projectCard(item, true)] : []));
        container.hidden = !item;
        state.signatures.set(container, signature);
        restoreFocus(container, focus);
      }
    });
    applyFilter();
    const dialog = document.querySelector(".project-dialog");
    if (dialog?.open) {
      const selected = items.find((item) => item.key === state.selectedKey);
      if (selected) renderDialog(selected);
      else dialog.close();
    }
  }
  function applyFilter() {
    const buttons = Array.from(document.querySelectorAll("[data-filter]"));
    const counts = {
      all: state.projects.length,
      branding: 0,
      website: 0,
      campaign: 0,
    };
    state.projects.forEach((item) => {
      counts[item.category] += 1;
    });
    if (
      !owns(counts, state.filter) ||
      (state.filter !== "all" && counts[state.filter] === 0)
    )
      state.filter = "all";
    let visibleCount = 0;
    document
      .querySelectorAll(
        '[data-collection="sections.gallery.items"] > .project-card',
      )
      .forEach((card) => {
        const show =
          state.filter === "all" || card.dataset.category === state.filter;
        card.hidden = !show;
        if (show) visibleCount += 1;
      });
    buttons.forEach((button) => {
      const category = button.dataset.filter;
      const count = counts[category] || 0;
      const active = category === state.filter;
      button.disabled = category !== "all" && count === 0;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
      button.setAttribute(
        "aria-label",
        button.textContent +
          " (" +
          count +
          " " +
          text("sections.gallery.countLabel") +
          ")",
      );
    });
    const count = document.querySelector("[data-project-count]");
    if (count)
      count.textContent =
        visibleCount + " " + text("sections.gallery.countLabel");
    const empty = document.querySelector("[data-project-empty]");
    if (empty) empty.hidden = visibleCount > 0;
  }
  function renderServices(items) {
    const container = document.querySelector(
      '[data-collection="sections.services.items"]',
    );
    const signature = JSON.stringify(items);
    if (!container || state.signatures.get("services") === signature) return;
    const open = new Set(
      Array.from(container.querySelectorAll("details[open]")).map(
        (node) => node.dataset.serviceId,
      ),
    );
    const focus = rememberFocus(container);
    const fragment = document.createDocumentFragment();
    items.forEach((item, index) => {
      const details = element("details", "service-item");
      details.dataset.serviceId = String(index);
      details.open = open.has(String(index));
      const summary = document.createElement("summary");
      const plus = element("span", "service-plus", "+");
      plus.setAttribute("aria-hidden", "true");
      summary.append(element("span", "service-title", item.name), plus);
      details.append(
        summary,
        element("p", "service-description", item.description),
        element("p", "service-details", item.details),
      );
      fragment.append(details);
    });
    container.replaceChildren(fragment);
    state.signatures.set("services", signature);
    restoreFocus(container, focus);
  }
  function renderProcess(items) {
    const container = document.querySelector(
      '[data-collection="sections.process.items"]',
    );
    const signature = JSON.stringify(items);
    if (!container || state.signatures.get("process") === signature) return;
    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      const step = element("article", "process-step");
      step.append(
        element("h3", "", item.title),
        element("p", "", item.description),
      );
      fragment.append(step);
    });
    container.replaceChildren(fragment);
    state.signatures.set("process", signature);
  }
  function renderDialog(project) {
    const container = document.querySelector("[data-dialog-content]");
    if (!container) return;
    const signature = JSON.stringify([
      project,
      text("sections.gallery.briefLabel"),
      text("sections.gallery.approachLabel"),
      text("sections.gallery.deliverablesLabel"),
    ]);
    if (state.dialogSignature === signature) return;
    const imageBox = element("div", "dialog-image");
    const image = document.createElement("img");
    image.width = 1200;
    image.height = 900;
    setImage(image, project.image, project.imageAlt);
    imageBox.append(image);
    const title = element("h2", "", project.title);
    title.id = "project-dialog-title";
    const titleRow = element("div", "project-title-row");
    titleRow.append(title, element("span", "new-badge", project.badge));
    const children = [
      imageBox,
      element("p", "project-category", project.label),
      titleRow,
      element("p", "project-description", project.description),
    ];
    [
      ["brief", "briefLabel"],
      ["approach", "approachLabel"],
      ["deliverables", "deliverablesLabel"],
    ].forEach(([key, label]) => {
      if (project[key])
        children.push(
          element("h3", "dialog-subheading", text("sections.gallery." + label)),
          element("p", "", project[key]),
        );
    });
    container.replaceChildren(...children);
    state.dialogSignature = signature;
  }
  function sectionVisible(section) {
    if (section.required) return true;
    const nestedValue = configured("sections." + section.id + ".visible");
    const flatValue = configured("sectionVisibility." + section.id);
    return (nestedValue !== undefined ? nestedValue : flatValue) !== false;
  }
  function renderVisibility() {
    const visibility = {};
    state.schema.sections.forEach((section) => {
      visibility[section.id] = sectionVisible(section);
      document.querySelectorAll("[data-section]").forEach((node) => {
        if (node.dataset.section === section.id)
          node.hidden = !visibility[section.id];
      });
    });
    state.schema.navigation.items.forEach((item) => {
      const hidden =
        item.hideable &&
        (configured("navigation." + item.id + ".hidden") === true ||
          configured("navigation." + item.id + ".visible") === false ||
          visibility[item.target.slice(1)] === false ||
          !text(item.labelField).trim());
      document.querySelectorAll("[data-nav-id]").forEach((link) => {
        if (link.dataset.navId === item.id) {
          link.hidden = hidden;
          link.setAttribute("href", item.target);
        }
      });
    });
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      if (link.hasAttribute("data-nav-id")) return;
      const sectionId = link.getAttribute("href").slice(1);
      if (owns(visibility, sectionId))
        link.hidden = visibility[sectionId] === false;
    });
  }
  function updateLinksAndMetadata() {
    const email = text("contact.email").trim();
    const validEmail =
      /^[A-Z0-9.!#$%&'*+\-/=?^_\x60{|}~]+@[A-Z0-9](?:[A-Z0-9.-]*[A-Z0-9])?\.[A-Z]{2,}$/i.test(
        email,
      ) && !/[\r\n]/.test(email);
    document.querySelectorAll("[data-email-link]").forEach((link) => {
      link.hidden = !validEmail;
      if (validEmail)
        link.href = "mailto:" + encodeURIComponent(email).replace(/%40/g, "@");
      else link.removeAttribute("href");
    });
    const title = text("seo.title") || text("business.name");
    const description = text("seo.description");
    document.title = title;
    [
      ['meta[name="description"]', description],
      ['meta[property="og:title"]', title],
      ['meta[property="og:description"]', description],
    ].forEach(([selector, content]) => {
      document.querySelector(selector)?.setAttribute("content", content);
    });
    const image = normalizedImage(value("seo.ogImage")).src;
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      if (image)
        ogImage.setAttribute("content", new URL(image, document.baseURI).href);
      else ogImage.removeAttribute("content");
    }
  }
  function render() {
    renderBindings();
    state.projects = normalizeCollection("sections.gallery.items");
    renderProjects(state.projects);
    renderServices(normalizeCollection("sections.services.items"));
    renderProcess(normalizeCollection("sections.process.items"));
    renderVisibility();
    updateLinksAndMetadata();
    document
      .querySelectorAll("[data-reveal]")
      .forEach((node) => node.classList.add("is-visible"));
  }
  function setupInteractions() {
    if (state.initialized) return;
    state.initialized = true;
    const toggle = document.querySelector("[data-menu-toggle]");
    const navigation = document.querySelector("[data-navigation]");
    function setMenu(open, restore = false) {
      if (!toggle || !navigation) return;
      navigation.hidden = !open;
      navigation.classList.toggle("is-open", open);
      toggle.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      if (restore) toggle.focus();
    }
    toggle?.addEventListener("click", () =>
      setMenu(toggle.getAttribute("aria-expanded") !== "true"),
    );
    navigation?.addEventListener("click", (event) => {
      if (event.target.closest("a")) setMenu(false);
    });
    document.addEventListener("click", (event) => {
      if (
        toggle?.getAttribute("aria-expanded") === "true" &&
        !navigation.contains(event.target) &&
        !toggle.contains(event.target)
      )
        setMenu(false);
      const filter = event.target.closest("[data-filter]");
      if (filter && !filter.disabled) {
        state.filter = filter.dataset.filter;
        applyFilter();
      }
      const trigger = event.target.closest("[data-project-trigger]");
      if (!trigger) return;
      const project = state.projects.find(
        (item) => item.key === trigger.dataset.projectTrigger,
      );
      const dialog = document.querySelector(".project-dialog");
      if (!project || !dialog || dialog.open) return;
      state.selectedKey = project.key;
      state.dialogSource = trigger;
      renderDialog(project);
      dialog.showModal();
    });
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        toggle?.getAttribute("aria-expanded") === "true"
      )
        setMenu(false, true);
    });
    const dialog = document.querySelector(".project-dialog");
    document
      .querySelector("[data-close-dialog]")
      ?.addEventListener("click", () => dialog?.close());
    dialog?.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (
        event.clientX < box.left ||
        event.clientX > box.right ||
        event.clientY < box.top ||
        event.clientY > box.bottom
      )
        dialog.close();
    });
    dialog?.addEventListener("close", () => {
      const source = state.dialogSource?.isConnected
        ? state.dialogSource
        : Array.from(document.querySelectorAll("[data-project-trigger]")).find(
            (node) =>
              node.dataset.projectTrigger === state.selectedKey &&
              !node.closest("[hidden]"),
          );
      if (source && !source.closest("[hidden]"))
        source.focus({ preventScroll: true });
      state.dialogSource = null;
      state.selectedKey = "";
    });
  }
  function setupForm() {
    const form = document.querySelector(
      '[data-pagiverse-form="project-inquiry"]',
    );
    if (!form) return;
    const fields = Array.from(form.querySelectorAll("input, select, textarea"));
    function validate(field) {
      const trimmed = field.value.trim();
      const tooShort = field.tagName === "TEXTAREA" && trimmed.length < 15;
      const validService =
        field.name !== "service" ||
        ["branding", "website", "campaign", "full-service"].includes(
          field.value,
        );
      const tooLong = field.maxLength > 0 && trimmed.length > field.maxLength;
      const valid =
        field.checkValidity() &&
        !!trimmed &&
        !tooShort &&
        !tooLong &&
        validService;
      let message = "";
      if (!trimmed) message = SYSTEM_MESSAGES.requiredMessage;
      else if (field.validity.typeMismatch)
        message = SYSTEM_MESSAGES.emailMessage;
      else if (tooShort) message = SYSTEM_MESSAGES.shortMessage;
      else if (tooLong) message = SYSTEM_MESSAGES.longMessage;
      else if (!valid) message = SYSTEM_MESSAGES.fieldMessage;
      field.setAttribute("aria-invalid", String(!valid));
      const error = document.getElementById(field.id + "-error");
      if (error) error.textContent = valid ? "" : message;
      return valid;
    }
    fields.forEach((field) => {
      field.addEventListener("blur", () => validate(field));
      field.addEventListener("input", () => {
        if (field.getAttribute("aria-invalid") === "true") validate(field);
      });
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const invalid = fields.filter((field) => !validate(field));
      const status = form.querySelector(".form-status");
      if (invalid.length) {
        if (status) {
          status.textContent = SYSTEM_MESSAGES.invalidMessage;
          status.dataset.state = "error";
        }
        invalid[0].focus();
        return;
      }
      const values = Object.fromEntries(
        fields.map((field) => [
          field.name,
          plain(
            field.value.trim(),
            field.maxLength > 0 ? field.maxLength : 120,
          ),
        ]),
      );
      const detail = {
        templateId: TEMPLATE_ID,
        formId: "project-inquiry",
        values,
      };
      form.dispatchEvent(
        new CustomEvent("pagiverse:form-submit", {
          bubbles: true,
          cancelable: true,
          detail,
        }),
      );
      if (window.parent !== window)
        window.parent.postMessage(
          { type: "pagiverse:form-submit", ...detail },
          window.location.origin,
        );
      if (status) {
        status.textContent = SYSTEM_MESSAGES.demoStatus;
        status.dataset.state = "info";
      }
    });
  }
  window.addEventListener("message", (event) => {
    if (
      window.parent === window ||
      event.source !== window.parent ||
      event.origin !== window.location.origin
    )
      return;
    const payload = event.data;
    if (
      !isRecord(payload) ||
      payload.type !== "pagiverse:config" ||
      payload.templateId !== TEMPLATE_ID ||
      !isRecord(payload.configuration)
    )
      return;
    state.data = payload.configuration;
    render();
    window.parent.postMessage(
      {
        type: "pagiverse:applied",
        templateId: TEMPLATE_ID,
        revision: payload.revision,
      },
      window.location.origin,
    );
  });
  async function init() {
    setupInteractions();
    setupForm();
    render();
    try {
      const response = await fetch("template.json", { cache: "no-store" });
      if (!response.ok) throw new Error("Template schema unavailable");
      const schema = await response.json();
      if (
        schema.id !== TEMPLATE_ID ||
        !schema.fields ||
        !Array.isArray(schema.sections) ||
        !schema.navigation?.items
      )
        throw new Error("Invalid template schema");
      state.schema = schema;
      render();
    } catch (error) {
      console.warn("KABAR uses bundled template defaults.", error);
    }
    if (window.parent !== window)
      window.parent.postMessage(
        { type: "pagiverse:ready", templateId: TEMPLATE_ID },
        window.location.origin,
      );
  }
  init();
})();
