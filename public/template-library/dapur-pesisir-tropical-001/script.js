(() => {
  "use strict";

  const storageKey = "dapur-pesisir-language";
  const page = document.body.dataset.page || "home";
  const overrideData = window.PAGIVERSE_DATA || {};
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const previewTheme = new URLSearchParams(window.location.search).get("theme");

  if (previewTheme === "dark" || previewTheme === "light") {
    document.documentElement.dataset.theme = previewTheme;
  }

  let config = {
    fields: {},
    navigation: { items: [] },
    sections: [],
    theme: { tokens: {} }
  };
  let language = readStorage() === "en" ? "en" : "id";

  function readStorage() {
    try {
      return localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  }

  function writeStorage(value) {
    try {
      localStorage.setItem(storageKey, value);
    } catch {
      // The template remains usable when storage is unavailable.
    }
  }

  function nestedValue(source, path) {
    if (!source || typeof source !== "object") return undefined;
    if (Object.prototype.hasOwnProperty.call(source, path)) return source[path];
    return path.split(".").reduce((value, key) => value && value[key], source);
  }

  function field(path, fallback = "") {
    const override = nestedValue(overrideData, path);
    if (override !== undefined && override !== null) return override;
    return config.fields?.[path]?.default ?? fallback;
  }

  function imageValue(path) {
    const value = field(path, {});
    return typeof value === "string" ? { src: value } : (value || {});
  }

  function sectionIsVisible(id) {
    const section = config.sections?.find((item) => item.id === id);
    if (!section || section.required) return true;
    const override = nestedValue(overrideData, `sectionVisibility.${id}`);
    return typeof override === "boolean" ? override : section.visibleByDefault !== false;
  }

  function safeExternalUrl(value, protocols = ["https:"]) {
    try {
      const url = new URL(String(value), window.location.href);
      return protocols.includes(url.protocol) ? url.href : "#";
    } catch {
      return "#";
    }
  }

  function safeImageSource(value) {
    const source = String(value || "").trim();
    if (/^(?:\.\/)?assets\/[a-z0-9._/-]+$/i.test(source)) return source;
    return safeExternalUrl(source, ["https:", "http:"]);
  }

  function validPhone(value) {
    const digits = String(value || "").replace(/\D/g, "");
    return /^\d{8,15}$/.test(digits) ? digits : "";
  }

  async function loadConfig() {
    try {
      const response = await fetch("template.json", { cache: "no-store" });
      if (!response.ok) throw new Error("Template configuration unavailable");
      config = await response.json();
    } catch {
      document.documentElement.classList.add("config-fallback");
    }
  }

  function applyTheme() {
    const tokens = config.theme?.tokens || {};
    ["primary", "secondary", "accent"].forEach((token) => {
      const override = nestedValue(overrideData, `theme.${token}`);
      const value = override || tokens[token]?.default;
      if (typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value)) {
        document.documentElement.style.setProperty(`--${token}`, value);
      }
    });
  }

  function applyImage(image, path) {
    const value = imageValue(path);
    if (value.src) {
      const source = safeImageSource(value.src);
      if (source !== "#") image.src = source;
    }

    image.dataset.altId = value.altId || image.dataset.altId || image.alt || "";
    image.dataset.altEn = value.altEn || image.dataset.altEn || image.alt || "";

    const x = Number(value.focalPoint?.x);
    const y = Number(value.focalPoint?.y);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      image.style.objectPosition = `${Math.min(100, Math.max(0, x))}% ${Math.min(100, Math.max(0, y))}%`;
    }
  }

  function hydrateFields() {
    document.querySelectorAll("[data-pv-id]").forEach((element) => {
      const value = String(field(element.dataset.pvId, element.dataset.id || element.textContent || ""));
      element.dataset.id = value;
      if (!element.hasAttribute("data-i18n") && !element.dataset.pvEn) element.textContent = value;
    });

    document.querySelectorAll("[data-pv-en]").forEach((element) => {
      element.dataset.en = String(field(element.dataset.pvEn, element.dataset.en || element.textContent || ""));
    });

    document.querySelectorAll("img[data-pv-image]").forEach((image) => {
      applyImage(image, image.dataset.pvImage);
    });

    document.querySelectorAll("[data-section]").forEach((section) => {
      section.hidden = !sectionIsVisible(section.dataset.section);
    });

    const businessName = String(field("business.name", "Dapur Pesisir"));
    document.querySelectorAll("[data-business-copyright]").forEach((element) => {
      element.textContent = `© 2026 ${businessName}`;
    });
  }

  function createI18nElement(tag, idText, enText, className = "") {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.dataset.i18n = "";
    element.dataset.id = String(idText || "");
    element.dataset.en = String(enText || idText || "");
    element.textContent = element.dataset.id;
    return element;
  }

  function renderFeaturedItems() {
    const target = document.querySelector("[data-feature-list]");
    const items = field("sections.products.featuredItems", []);
    if (!target || !Array.isArray(items) || items.length === 0) return;

    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      const article = document.createElement("article");
      article.className = "feature-item";

      const heading = createI18nElement("h3", item.nameId, item.nameEn);
      const price = document.createElement("span");
      price.className = "feature-price";
      price.textContent = String(item.price || "");
      const description = createI18nElement("p", item.descriptionId, item.descriptionEn);

      article.append(heading, price, description);
      fragment.append(article);
    });

    const existingButton = target.querySelector(".button");
    target.replaceChildren(fragment);
    if (existingButton) target.append(existingButton);
  }

  function renderMenuGroups() {
    const target = document.querySelector("[data-menu-groups]");
    const groups = field("sections.products.categories", []);
    if (!target || !Array.isArray(groups) || groups.length === 0) return;

    const fragment = document.createDocumentFragment();
    groups.forEach((group) => {
      const section = document.createElement("section");
      section.className = "menu-group";
      section.dataset.reveal = "";
      const heading = createI18nElement("h2", group.nameId, group.nameEn);
      const list = document.createElement("div");
      list.className = "menu-items";

      (Array.isArray(group.items) ? group.items : []).forEach((item) => {
        const article = document.createElement("article");
        article.className = "menu-item";
        const name = createI18nElement("h3", item.nameId || item.name, item.nameEn || item.name);
        const price = document.createElement("span");
        price.textContent = String(item.price || "");
        const description = createI18nElement("p", item.descriptionId, item.descriptionEn);
        article.append(name, price, description);
        list.append(article);
      });

      section.append(heading, list);
      fragment.append(section);
    });

    target.replaceChildren(fragment);
  }

  function renderPrinciples() {
    const target = document.querySelector("[data-principle-list]");
    const items = field("sections.about.principles", []);
    if (!target || !Array.isArray(items) || items.length === 0) return;

    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      const article = document.createElement("article");
      article.className = "principle";
      article.dataset.reveal = "";
      article.append(
        createI18nElement("h3", item.titleId, item.titleEn),
        createI18nElement("p", item.bodyId, item.bodyEn)
      );
      fragment.append(article);
    });
    target.replaceChildren(fragment);
  }

  function renderGallery() {
    const target = document.querySelector("[data-gallery-grid]");
    const items = field("sections.gallery.items", []);
    if (!target || !Array.isArray(items) || items.length === 0) return;

    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      const source = safeImageSource(item.src);
      if (source === "#") return;
      const figure = document.createElement("figure");
      figure.dataset.reveal = "";
      const image = document.createElement("img");
      image.src = source;
      image.width = 1536;
      image.height = 1024;
      image.loading = "lazy";
      image.decoding = "async";
      image.dataset.altId = item.altId || "";
      image.dataset.altEn = item.altEn || item.altId || "";
      image.alt = image.dataset.altId;

      const x = Number(item.focalPoint?.x);
      const y = Number(item.focalPoint?.y);
      if (Number.isFinite(x) && Number.isFinite(y)) {
        image.style.objectPosition = `${Math.min(100, Math.max(0, x))}% ${Math.min(100, Math.max(0, y))}%`;
      }

      figure.append(image);
      fragment.append(figure);
    });
    target.replaceChildren(fragment);
  }

  function renderGalleryPreview() {
    const target = document.querySelector("[data-gallery-preview]");
    const items = field("sections.gallery.items", []);
    if (!target || !Array.isArray(items) || items.length < 3) return;
    const preferred = [items[3], items[4], items[6] || items[5]].filter(Boolean);
    const fragment = document.createDocumentFragment();

    preferred.forEach((item) => {
      const source = safeImageSource(item.src);
      if (source === "#") return;
      const figure = document.createElement("figure");
      figure.dataset.reveal = "";
      const image = document.createElement("img");
      image.src = source;
      image.width = 1536;
      image.height = 1024;
      image.loading = "lazy";
      image.decoding = "async";
      image.dataset.altId = item.altId || "";
      image.dataset.altEn = item.altEn || item.altId || "";
      image.alt = image.dataset.altId;
      figure.append(image);
      fragment.append(figure);
    });
    target.replaceChildren(fragment);
  }

  function hydrateNavigationLabels() {
    (config.navigation?.items || []).forEach((item) => {
      if (!/^[a-z0-9._/-]+$/i.test(item.target || "")) return;
      document.querySelectorAll(`nav a[href="${item.target}"] [data-i18n], .footer-col a[href="${item.target}"][data-i18n]`).forEach((label) => {
        label.dataset.id = String(field(item.labelFields?.id, label.dataset.id || label.textContent || ""));
        label.dataset.en = String(field(item.labelFields?.en, label.dataset.en || label.textContent || ""));
      });
    });
  }

  function renderDynamicContent() {
    renderFeaturedItems();
    renderMenuGroups();
    renderPrinciples();
    renderGallery();
    renderGalleryPreview();
  }

  function applyPageMetadata() {
    const titlePath = `seo.pages.${page}.title.${language}`;
    const descriptionPath = `seo.pages.${page}.description.${language}`;
    const titleFallback = document.body.dataset[`title${language === "id" ? "Id" : "En"}`] || document.title;
    const descriptionFallback = document.body.dataset[`description${language === "id" ? "Id" : "En"}`] || "";
    const title = String(field(titlePath, titleFallback));
    const description = String(field(descriptionPath, descriptionFallback));
    document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && description) meta.content = description;

    const socialImage = imageValue("seo.ogImage");
    const socialMeta = document.querySelector('meta[property="og:image"]');
    if (socialMeta && socialImage.src) {
      const source = safeImageSource(socialImage.src);
      if (source !== "#") socialMeta.content = new URL(source, window.location.href).href;
    }
  }

  function updateContactLinks() {
    const phone = validPhone(field("contact.whatsapp", "6281234567890"));
    const messagePath = language === "id" ? "contact.whatsappMessage.id" : "contact.whatsappMessage.en";
    const fallback = language === "id"
      ? "Halo Dapur Pesisir, saya ingin melakukan reservasi meja."
      : "Hello Dapur Pesisir, I would like to reserve a table.";
    const message = encodeURIComponent(String(field(messagePath, fallback)));
    const url = phone ? `https://wa.me/${phone}?text=${message}` : "#";
    document.querySelectorAll("[data-wa-link]").forEach((link) => {
      link.href = url;
      if (!phone) link.setAttribute("aria-disabled", "true");
      else link.removeAttribute("aria-disabled");
    });

    const mapUrl = safeExternalUrl(field("location.mapsUrl", "#"), ["https:"]);
    document.querySelectorAll("[data-location-link]").forEach((link) => {
      link.href = mapUrl;
      if (mapUrl === "#") link.removeAttribute("target");
    });
  }

  function applyLanguage() {
    document.documentElement.lang = language;
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const value = element.dataset[language];
      if (value !== undefined) element.textContent = value;
    });

    document.querySelectorAll("[data-placeholder-id]").forEach((element) => {
      element.placeholder = language === "id" ? element.dataset.placeholderId : element.dataset.placeholderEn;
    });

    document.querySelectorAll("img[data-alt-id]").forEach((image) => {
      image.alt = language === "id" ? image.dataset.altId : image.dataset.altEn;
    });

    document.querySelectorAll("[data-lang-toggle]").forEach((button) => {
      const nextLanguage = language === "id" ? "en" : "id";
      button.textContent = nextLanguage.toUpperCase();
      button.setAttribute("aria-label", nextLanguage === "en" ? "Switch to English" : "Ganti ke Bahasa Indonesia");
    });

    const menuButton = document.querySelector("[data-menu-toggle]");
    if (menuButton) {
      const open = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.textContent = open ? (language === "id" ? "Tutup" : "Close") : "Menu";
    }

    applyPageMetadata();
    updateContactLinks();
  }

  function setupLanguageToggle() {
    document.querySelectorAll("[data-lang-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        language = language === "id" ? "en" : "id";
        writeStorage(language);
        applyLanguage();
      });
    });
  }

  function setupMobileMenu() {
    const button = document.querySelector("[data-menu-toggle]");
    const menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) return;

    function setOpen(open) {
      button.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
      button.textContent = open
        ? (language === "id" ? "Tutup" : "Close")
        : (language === "id" ? "Menu" : "Menu");
    }

    button.addEventListener("click", () => {
      setOpen(button.getAttribute("aria-expanded") !== "true");
    });

    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        button.focus();
      }
    });
  }

  function setupReveal() {
    if (reducedMotion.matches || !("IntersectionObserver" in window)) return;
    document.documentElement.classList.add("reveal-ready");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.12 });

    document.querySelectorAll("[data-reveal]").forEach((element) => observer.observe(element));
  }

  function setDateMinimum() {
    const dateInput = document.querySelector('input[name="date"]');
    if (!dateInput) return;
    const today = new Date();
    const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    dateInput.min = localDate;
  }

  function setupReservationForm() {
    const form = document.querySelector("[data-reservation-form]");
    if (!form) return;
    const status = form.querySelector("[data-form-status]");
    const submit = form.querySelector('button[type="submit"]');

    function clearErrors() {
      form.querySelectorAll("[data-field-error]").forEach((error) => { error.textContent = ""; });
      form.querySelectorAll("[aria-invalid='true']").forEach((input) => input.setAttribute("aria-invalid", "false"));
    }

    function errorFor(input, message) {
      input.setAttribute("aria-invalid", "true");
      const error = form.querySelector(`[data-field-error="${input.name}"]`);
      if (error) error.textContent = message;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      clearErrors();
      let valid = true;

      form.querySelectorAll("[required]").forEach((input) => {
        if (String(input.value).trim()) return;
        valid = false;
        errorFor(input, language === "id" ? "Bagian ini wajib diisi." : "This field is required.");
      });

      const phoneInput = form.elements.namedItem("phone");
      if (phoneInput && phoneInput.value && !validPhone(phoneInput.value)) {
        valid = false;
        errorFor(phoneInput, language === "id" ? "Masukkan nomor WhatsApp yang valid." : "Enter a valid WhatsApp number.");
      }

      if (!valid) {
        status.textContent = language === "id" ? "Periksa kembali kolom yang ditandai." : "Please check the highlighted fields.";
        status.classList.remove("is-success");
        form.querySelector("[aria-invalid='true']")?.focus();
        return;
      }

      submit.disabled = true;
      status.textContent = language === "id" ? "Menyiapkan permintaan reservasi..." : "Preparing your reservation request...";
      status.classList.remove("is-success");

      window.setTimeout(() => {
        submit.disabled = false;
        status.textContent = language === "id"
          ? "Form demo siap. Pagiverse Core akan menangani pengiriman saat template dipasang."
          : "Demo form ready. Pagiverse Core will handle submission when the template is installed.";
        status.classList.add("is-success");
      }, reducedMotion.matches ? 0 : 480);
    });
  }

  async function init() {
    await loadConfig();
    applyTheme();
    renderDynamicContent();
    hydrateFields();
    hydrateNavigationLabels();
    applyLanguage();
    setupLanguageToggle();
    setupMobileMenu();
    setDateMinimum();
    setupReservationForm();
    setupReveal();
  }

  init();
})();
