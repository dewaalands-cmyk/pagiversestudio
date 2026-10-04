(() => {
  "use strict";

  const page = document.body.dataset.page || "home";
  let overrideData = window.PAGIVERSE_DATA || {};
  const storageKey = "casa-braci-language";
  const pageTitleLabels = {
    home: { id: "", en: "" },
    menu: { id: "Menu", en: "Menu" },
    story: { id: "Kisah Kami", en: "Our Story" },
    gallery: { id: "Galeri", en: "Gallery" },
    visit: { id: "Kunjungi Kami", en: "Visit Us" }
  };

  let config = { fields: {}, navigation: { items: [] }, sections: [], theme: { tokens: {} } };
  let language = readStorage() === "en" ? "en" : "id";

  function readStorage() {
    try { return localStorage.getItem(storageKey); } catch { return null; }
  }

  function writeStorage(value) {
    try { localStorage.setItem(storageKey, value); } catch {}
  }

  function nestedValue(source, path) {
    if (!source || typeof source !== "object") return undefined;
    if (Object.prototype.hasOwnProperty.call(source, path)) return source[path];
    return path.split(".").reduce((value, key) => value && value[key], source);
  }

  function field(path, fallback = "") {
    const override = nestedValue(overrideData, path);
    if (override !== undefined && override !== null) return override;
    const descriptor = config.fields?.[path];
    return descriptor?.default ?? fallback;
  }

  function sectionIsVisible(id) {
    const section = config.sections?.find((item) => item.id === id);
    if (!section) return true;
    if (section.required) return true;
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
    if (/^(?:\.\/)?assets\/[a-z0-9._/-]+$/i.test(source) && !source.split("/").includes("..")) return source;
    if (/^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(source)) return source;
    return safeExternalUrl(source, ["https:", "http:"]);
  }

  async function loadConfig() {
    try {
      const response = await fetch("template.json", { cache: "no-store" });
      if (!response.ok) return;
      config = await response.json();
    } catch {
      document.documentElement.classList.add("config-fallback");
    }
  }

  function applyTheme() {
    const root = document.documentElement;
    const tokens = config.theme?.tokens || {};
    ["primary", "secondary", "accent", "background", "surface", "text"].forEach((token) => {
      const override = nestedValue(overrideData, `theme.${token}`);
      const value = override || tokens[token]?.default;
      if (typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value)) {
        root.style.setProperty(`--${token}`, value);
      }
    });
  }

  function applySeo() {
    const ogImage = imageValue("seo.ogImage");
    const source = ogImage.src ? safeImageSource(ogImage.src) : "#";
    const meta = document.querySelector('meta[property="og:image"]');
    if (meta && source !== "#") meta.content = new URL(source, window.location.href).href;
  }

  function imageValue(path) {
    const value = field(path, {});
    return typeof value === "string" ? { src: value } : value || {};
  }

  function applyImage(image, path) {
    const value = imageValue(path);
    if (!value.src) return;
    const source = safeImageSource(value.src);
    if (source !== "#") image.src = source;
    image.dataset.altId = value.altId || image.dataset.altId || "";
    image.dataset.altEn = value.altEn || image.dataset.altEn || "";
    const x = Number(value.focalPoint?.x);
    const y = Number(value.focalPoint?.y);
    if (Number.isFinite(x) && Number.isFinite(y)) image.style.objectPosition = `${x}% ${y}%`;
  }

  function hydrateFields() {
    document.querySelectorAll("[data-pv-id]").forEach((element) => {
      element.dataset.id = String(field(element.dataset.pvId, element.dataset.id || element.textContent));
    });
    document.querySelectorAll("[data-pv-en]").forEach((element) => {
      element.dataset.en = String(field(element.dataset.pvEn, element.dataset.en || element.textContent));
    });
    document.querySelectorAll("img[data-pv-image]").forEach((image) => applyImage(image, image.dataset.pvImage));
    document.querySelectorAll("[data-section]").forEach((section) => {
      section.hidden = !sectionIsVisible(section.dataset.section);
    });
  }

  function navMarkup() {
    return (config.navigation?.items || []).filter((item) => {
      return !item.section || sectionIsVisible(item.section);
    }).map((item) => {
      const idLabel = field(item.labelFields?.id, item.id);
      const enLabel = field(item.labelFields?.en, item.id);
      const current = item.id === page ? ' aria-current="page"' : "";
      return `<a href="${item.target}"${current}><span data-i18n data-id="${escapeAttribute(idLabel)}" data-en="${escapeAttribute(enLabel)}">${escapeText(idLabel)}</span></a>`;
    }).join("");
  }

  function escapeText(value) {
    return String(value).replace(/[&<>]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[character]));
  }

  function escapeAttribute(value) {
    return escapeText(value).replace(/"/g, "&quot;");
  }

  function buildChrome() {
    const businessName = String(field("business.name", "Casa Braci"));
    const brandLogo = imageValue("business.logo");
    const brandLogoSource = brandLogo.src ? safeImageSource(brandLogo.src) : "#";
    const brandContent = brandLogoSource !== "#"
      ? `<img class="brand-logo" src="${escapeAttribute(brandLogoSource)}" alt="${escapeAttribute(brandLogo.altId || brandLogo.altEn || businessName)}">`
      : `<span>${escapeText(businessName)}</span><small>Bandung</small>`;
    const nav = navMarkup();
    const header = document.querySelector("[data-site-header]");
    if (header) {
      header.innerHTML = `
        <a class="skip-link" href="#main" data-i18n data-id="Lewati ke konten" data-en="Skip to content">Lewati ke konten</a>
        <header class="site-header">
          <div class="nav-shell">
            <a class="brand" href="index.html" aria-label="${escapeAttribute(businessName)} home">
              ${brandContent}
            </a>
            <nav class="desktop-nav" aria-label="Primary navigation">${nav}</nav>
            <div class="nav-actions">
              <button class="lang-toggle" type="button" data-lang-toggle aria-label="Switch to English">EN</button>
              <button class="menu-toggle" type="button" data-menu-toggle aria-expanded="false" aria-controls="mobile-menu">Menu</button>
            </div>
          </div>
        </header>
        <nav class="mobile-menu" id="mobile-menu" data-mobile-menu aria-label="Mobile navigation">${nav}</nav>`;
    }

    const footer = document.querySelector("[data-site-footer]");
    if (footer) {
      footer.innerHTML = `
        <footer class="site-footer">
          <div class="shell footer-grid">
            <div>
              <div class="footer-brand">${escapeText(businessName)}</div>
              <p class="footer-tagline" data-i18n data-pv-id="business.tagline.id" data-pv-en="business.tagline.en"></p>
              <p class="footer-copy" data-i18n data-pv-id="business.description.id" data-pv-en="business.description.en"></p>
            </div>
            <div class="footer-col">
              <strong data-i18n data-pv-id="sections.footer.explore.id" data-pv-en="sections.footer.explore.en"></strong>
              ${nav}
            </div>
            <div class="footer-col">
              <strong data-i18n data-pv-id="sections.footer.visit.id" data-pv-en="sections.footer.visit.en"></strong>
              <a data-location-link href="#">${escapeText(field("location.address", "Bandung"))}</a>
              <span data-i18n data-pv-id="sections.footer.hours.id" data-pv-en="sections.footer.hours.en"></span>
            </div>
          </div>
          <div class="shell footer-bottom">
            <span>© 2026 ${escapeText(businessName)}</span>
            <span data-i18n data-pv-id="sections.footer.demo.id" data-pv-en="sections.footer.demo.en"></span>
          </div>
        </footer>`;
    }

    const reservation = document.querySelector("[data-reservation-anchor]");
    if (reservation) {
      reservation.dataset.id = String(field("contact.reservationLabel.id", "Reservasi via WhatsApp"));
      reservation.dataset.en = String(field("contact.reservationLabel.en", "Reserve via WhatsApp"));
    }
  }

  function renderSignature() {
    const target = document.querySelector("[data-signature-list]");
    if (!target) return;
    const items = field("sections.home.signatureItems", []);
    target.replaceChildren(...items.map((item) => {
      const article = document.createElement("article");
      article.className = "signature-item";
      const title = document.createElement("h3");
      title.dataset.i18n = "";
      title.dataset.id = item.titleId || "";
      title.dataset.en = item.titleEn || "";
      const body = document.createElement("p");
      body.dataset.i18n = "";
      body.dataset.id = item.bodyId || "";
      body.dataset.en = item.bodyEn || "";
      article.append(title, body);
      return article;
    }));
  }

  function renderExperiences() {
    const target = document.querySelector("[data-experience-list]");
    if (!target) return;
    const items = field("sections.home.experiences", []);
    target.replaceChildren(...items.map((item, index) => {
      const article = document.createElement("article");
      article.className = "experience-item";
      article.style.setProperty("--item-offset", `${index * 2.6}rem`);
      const title = document.createElement("h3");
      title.dataset.i18n = "";
      title.dataset.id = item.titleId || "";
      title.dataset.en = item.titleEn || "";
      const body = document.createElement("p");
      body.dataset.i18n = "";
      body.dataset.id = item.bodyId || "";
      body.dataset.en = item.bodyEn || "";
      article.append(title, body);
      return article;
    }));
  }

  function renderMenu() {
    const target = document.querySelector("[data-menu-categories]");
    if (!target) return;
    const categories = field("sections.products.categories", []);
    target.replaceChildren(...categories.map((category) => {
      const section = document.createElement("section");
      section.className = "menu-category";
      const heading = document.createElement("h2");
      heading.dataset.i18n = "";
      heading.dataset.id = category.nameId || "";
      heading.dataset.en = category.nameEn || "";
      const list = document.createElement("div");
      list.className = "menu-list";
      (category.items || []).forEach((item) => {
        const article = document.createElement("article");
        article.className = "menu-item";
        const head = document.createElement("div");
        head.className = "menu-item-head";
        const name = document.createElement("h3");
        name.textContent = item.name || "";
        const price = document.createElement("strong");
        price.textContent = item.price || "";
        const description = document.createElement("p");
        description.dataset.i18n = "";
        description.dataset.id = item.descriptionId || "";
        description.dataset.en = item.descriptionEn || "";
        head.append(name, price);
        article.append(head, description);
        list.append(article);
      });
      section.append(heading, list);
      return section;
    }));
  }

  function renderTimeline() {
    const target = document.querySelector("[data-story-timeline]");
    if (!target) return;
    const items = field("sections.story.timeline", []);
    target.replaceChildren(...items.map((item) => {
      const article = document.createElement("article");
      const year = document.createElement("strong");
      year.textContent = item.year || "";
      const label = document.createElement("span");
      label.dataset.i18n = "";
      label.dataset.id = item.labelId || "";
      label.dataset.en = item.labelEn || "";
      article.append(year, label);
      return article;
    }));
  }

  function renderStoryParagraphs() {
    const target = document.querySelector("[data-story-paragraphs]");
    if (!target) return;
    const items = field("sections.story.paragraphs", []);
    target.replaceChildren(...items.map((item) => {
      const paragraph = document.createElement("p");
      paragraph.dataset.i18n = "";
      paragraph.dataset.id = item.id || "";
      paragraph.dataset.en = item.en || "";
      return paragraph;
    }));
  }

  function renderGallery() {
    const target = document.querySelector("[data-gallery-grid]");
    if (!target) return;
    const items = field("sections.gallery.items", []);
    target.replaceChildren(...items.map((item, index) => {
      const figure = document.createElement("figure");
      figure.className = `gallery-item gallery-item-${(index % 3) + 1}`;
      figure.dataset.reveal = "";
      const image = document.createElement("img");
      const source = safeImageSource(item.src);
      if (source !== "#") image.src = source;
      image.width = index % 3 === 2 ? 1024 : 1536;
      image.height = index % 3 === 2 ? 1536 : 1024;
      image.loading = index === 0 ? "eager" : "lazy";
      image.dataset.altId = item.altId || "";
      image.dataset.altEn = item.altEn || "";
      const x = Number(item.focalPoint?.x);
      const y = Number(item.focalPoint?.y);
      if (Number.isFinite(x) && Number.isFinite(y)) image.style.objectPosition = `${x}% ${y}%`;
      figure.append(image);
      return figure;
    }));
  }

  function renderVisitDetails() {
    const target = document.querySelector("[data-visit-details]");
    if (!target) return;
    const items = field("sections.location.details", []);
    target.replaceChildren(...items.map((item) => {
      const row = document.createElement("div");
      row.className = "detail-row";
      const label = document.createElement("strong");
      label.dataset.i18n = "";
      label.dataset.id = item.labelId || "";
      label.dataset.en = item.labelEn || "";
      const value = document.createElement("span");
      value.dataset.i18n = "";
      value.dataset.id = item.valueId || "";
      value.dataset.en = item.valueEn || "";
      row.append(label, value);
      return row;
    }));
  }

  function applyLanguage(nextLanguage) {
    language = nextLanguage === "en" ? "en" : "id";
    document.documentElement.lang = language;
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const value = language === "id" ? element.dataset.id : element.dataset.en;
      if (value !== undefined) element.textContent = value;
    });
    document.querySelectorAll("img[data-alt-id][data-alt-en]").forEach((image) => {
      image.alt = language === "id" ? image.dataset.altId : image.dataset.altEn;
    });
    document.querySelectorAll("[data-lang-toggle]").forEach((button) => {
      button.textContent = language === "id" ? "EN" : "ID";
      button.setAttribute("aria-label", language === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia");
    });
    const businessName = String(field("business.name", "Casa Braci"));
    const pageLabel = pageTitleLabels[page]?.[language];
    document.title = pageLabel ? `${pageLabel} | ${businessName}` : String(field("seo.title", businessName));
    const description = document.querySelector('meta[name="description"]');
    if (description && page === "home") description.content = String(field("seo.description", description.content));
    const message = String(field(`contact.whatsappMessage.${language}`, ""));
    const phone = String(field("contact.whatsapp", "")).replace(/\D/g, "").slice(0, 15);
    document.querySelectorAll("[data-wa-link]").forEach((link) => {
      link.href = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : "#";
    });
    document.querySelectorAll("[data-location-link]").forEach((link) => {
      link.href = safeExternalUrl(field("location.mapsUrl", "#"), ["https:"]);
      link.target = "_blank";
      link.rel = "noreferrer";
    });
    writeStorage(language);
  }

  function initNavigation() {
    document.addEventListener("click", (event) => {
      const langButton = event.target.closest("[data-lang-toggle]");
      if (langButton) applyLanguage(language === "id" ? "en" : "id");

      const menuButton = event.target.closest("[data-menu-toggle]");
      if (menuButton) {
        const menu = document.querySelector("[data-mobile-menu]");
        const isOpen = menu?.classList.toggle("is-open") || false;
        document.body.classList.toggle("menu-open", isOpen);
        menuButton.setAttribute("aria-expanded", String(isOpen));
        menuButton.textContent = isOpen ? (language === "id" ? "Tutup" : "Close") : "Menu";
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      const menu = document.querySelector("[data-mobile-menu]");
      const button = document.querySelector("[data-menu-toggle]");
      if (!menu?.classList.contains("is-open")) return;
      menu.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      button?.setAttribute("aria-expanded", "false");
      if (button) button.textContent = "Menu";
      button?.focus();
    });
  }

  function initMotion() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = document.querySelectorAll("[data-reveal]");
    items.forEach((item, index) => item.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 80}ms`));
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.16 });
    items.forEach((item) => observer.observe(item));
  }

  function renderTemplate() {
    applyTheme();
    applySeo();
    buildChrome();
    hydrateFields();
    renderSignature();
    renderExperiences();
    renderMenu();
    renderTimeline();
    renderStoryParagraphs();
    renderGallery();
    renderVisitDetails();
    hydrateFields();
    applyLanguage(language);
    initMotion();
  }

  async function init() {
    await loadConfig();
    renderTemplate();
    initNavigation();
    document.documentElement.classList.add("site-ready");
    window.parent.postMessage({ type: "pagiverse:ready", templateId: config.id }, window.location.origin);
  }

  window.addEventListener("message", (event) => {
    if (event.source !== window.parent) return;
    const payload = event.data;
    if (!payload || payload.type !== "pagiverse:config" || payload.templateId !== config.id) return;
    overrideData = payload.configuration && typeof payload.configuration === "object" ? payload.configuration : {};
    renderTemplate();
    window.parent.postMessage({
      type: "pagiverse:applied",
      templateId: config.id,
      revision: payload.revision,
    }, window.location.origin);
  });

  init();
})();
