"use strict";

(() => {
  const state = {
    schema: null,
    data:
      window.PAGIVERSE_DATA && typeof window.PAGIVERSE_DATA === "object"
        ? window.PAGIVERSE_DATA
        : {},
    language: "id",
  };

  const own = (object, key) =>
    Object.prototype.hasOwnProperty.call(object || {}, key);

  function nestedValue(object, path) {
    return path
      .split(".")
      .reduce(
        (value, key) =>
          value && typeof value === "object" ? value[key] : undefined,
        object,
      );
  }

  function getValue(path) {
    if (own(state.data, path)) return state.data[path];
    const nested = nestedValue(state.data, path);
    if (nested !== undefined) return nested;
    const descriptor = state.schema?.fields?.[path];
    return descriptor && own(descriptor, "default")
      ? descriptor.default
      : undefined;
  }

  function localized(value, key) {
    const candidate = key ? value?.[key] : value;
    if (
      candidate &&
      typeof candidate === "object" &&
      !Array.isArray(candidate)
    ) {
      return candidate[state.language] ?? candidate.id ?? candidate.en ?? "";
    }
    return candidate ?? "";
  }

  function imageSource(value) {
    if (typeof value === "string") return value;
    return value && typeof value.src === "string" ? value.src : "";
  }

  function imageAlt(value) {
    if (!value || typeof value !== "object") return "";
    return state.language === "en"
      ? value.altEn || value.altId || ""
      : value.altId || value.altEn || "";
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = String(text);
    return element;
  }

  function bindContent() {
    document.querySelectorAll("[data-bind]").forEach((element) => {
      const value = getValue(element.dataset.bind);
      if (value !== undefined && value !== null && typeof value !== "object") {
        element.textContent = String(value);
      }
    });

    document.querySelectorAll("[data-bind-src]").forEach((image) => {
      const value = getValue(image.dataset.bindSrc);
      const source = imageSource(value);
      if (source) image.src = source;
      image.alt = imageAlt(value);
      const point = value?.focalPoint;
      if (point) {
        const rawX = Number(point.x);
        const rawY = Number(point.y);
        if (Number.isFinite(rawX) && Number.isFinite(rawY)) {
          const x = rawX <= 1 ? rawX * 100 : rawX;
          const y = rawY <= 1 ? rawY * 100 : rawY;
          image.style.objectPosition = `${x}% ${y}%`;
        }
      }
    });
  }

  function renderPrinciples(container, items) {
    items.forEach((item, index) => {
      const article = createElement("article", "principle-card");
      article.append(
        createElement("span", "item-number", String(index + 1).padStart(2, "0")),
        createElement("h3", "", localized(item, "title")),
        createElement("p", "", localized(item, "description")),
      );
      container.append(article);
    });
  }

  function renderPractices(container, items) {
    items.forEach((item, index) => {
      const article = createElement("article", "practice-card");
      const heading = createElement("div", "practice-heading");
      heading.append(
        createElement("span", "item-number", String(index + 1).padStart(2, "0")),
        createElement("h2", "", localized(item, "title")),
      );
      article.append(
        heading,
        createElement("p", "practice-summary", localized(item, "description")),
      );
      container.append(article);
    });
  }

  function renderIndustries(container, items) {
    items.forEach((item) => {
      container.append(createElement("li", "industry-item", localized(item)));
    });
  }

  function renderApproach(container, items) {
    items.forEach((item, index) => {
      const article = createElement("article", "approach-step");
      article.append(
        createElement("span", "step-number", String(index + 1).padStart(2, "0")),
        createElement("h3", "", localized(item, "title")),
        createElement("p", "", localized(item, "description")),
      );
      container.append(article);
    });
  }

  function renderValues(container, items) {
    items.forEach((item) => {
      const article = createElement("article", "value-card");
      article.append(
        createElement("h3", "", localized(item, "title")),
        createElement("p", "", localized(item, "description")),
      );
      container.append(article);
    });
  }

  function initials(name) {
    return String(name || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }

  function renderTeam(container, items) {
    const limit = Number(container.dataset.limit || items.length);
    items.slice(0, limit).forEach((item) => {
      const article = createElement("article", "professional-card");
      const monogram = createElement("div", "professional-monogram", initials(item.name));
      monogram.setAttribute("aria-hidden", "true");
      const copy = createElement("div", "professional-copy");
      copy.append(
        createElement("p", "professional-role", localized(item, "role")),
        createElement("h2", "", item.name || ""),
        createElement("p", "professional-focus", localized(item, "focus")),
        createElement("p", "professional-bio", localized(item, "bio")),
      );
      article.append(monogram, copy);
      container.append(article);
    });
  }

  function renderInsights(container, items) {
    items.forEach((item, index) => {
      const article = createElement("article", "insight-card");
      const meta = createElement("div", "insight-meta");
      meta.append(
        createElement("span", "", localized(item, "category")),
        createElement("span", "", state.language === "en" ? "Sample insight" : "Wawasan demo"),
      );
      article.append(
        meta,
        createElement("h2", "", localized(item, "title")),
        createElement("p", "", localized(item, "excerpt")),
        createElement("span", "insight-index", String(index + 1).padStart(2, "0")),
      );
      container.append(article);
    });
  }

  function renderCollections() {
    document.querySelectorAll("[data-collection]").forEach((container) => {
      const path = container.dataset.collection;
      const items = getValue(path);
      container.replaceChildren();
      if (!Array.isArray(items)) return;
      if (path === "sections.homePrinciples.items") {
        renderPrinciples(container, items);
      } else if (path === "sections.services.items") {
        renderPractices(container, items);
      } else if (path === "sections.services.industries") {
        renderIndustries(container, items);
      } else if (path === "sections.about.approachItems") {
        renderApproach(container, items);
      } else if (path === "sections.about.values") {
        renderValues(container, items);
      } else if (path === "sections.team.items") {
        renderTeam(container, items);
      } else if (path === "sections.insights.items") {
        renderInsights(container, items);
      }
    });
  }

  function applyTheme() {
    const tokens = state.schema?.theme?.tokens || {};
    const names = ["primary", "secondary", "accent", "background", "surface", "text"];
    names.forEach((name) => {
      const value = getValue(`theme.${name}`) ?? tokens[name]?.default;
      if (typeof value === "string") {
        document.documentElement.style.setProperty(`--theme-${name}`, value);
      }
    });
  }

  function applyVisibility() {
    const visibility = state.data.sectionVisibility;
    if (!visibility || typeof visibility !== "object") return;
    Object.entries(visibility).forEach(([sectionId, visible]) => {
      document.querySelectorAll(`[data-section="${sectionId}"]`).forEach((element) => {
        element.hidden = visible === false;
      });
    });
  }

  function safeHttps(value) {
    try {
      const url = new URL(String(value || ""));
      return url.protocol === "https:" ? url.href : "";
    } catch (_error) {
      return "";
    }
  }

  function updateContactLinks() {
    const email = String(getValue("contact.email") || "").trim();
    const phone = String(getValue("contact.phone") || "").trim();
    document.querySelectorAll("[data-email-link]").forEach((link) => {
      link.href = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ? `mailto:${email}`
        : "contact.html";
    });
    document.querySelectorAll("[data-phone-link]").forEach((link) => {
      const cleaned = phone.replace(/[^+\d]/g, "");
      link.href = /^\+?\d{8,15}$/.test(cleaned) ? `tel:${cleaned}` : "contact.html";
    });
    document.querySelectorAll("[data-maps-link]").forEach((link) => {
      link.href = safeHttps(getValue("location.mapsUrl")) || "contact.html";
    });
    document.querySelectorAll("[data-linkedin-link]").forEach((link) => {
      link.href = safeHttps(getValue("social.linkedin")) || "contact.html";
    });
  }

  function updateMetadata() {
    const page = document.body.dataset.page || "home";
    const title =
      getValue(`seo.pages.${page}.title.${state.language}`) ||
      getValue(`seo.title.${state.language}`);
    const description =
      getValue(`seo.pages.${page}.description.${state.language}`) ||
      getValue(`seo.description.${state.language}`);
    if (title) document.title = String(title);
    const meta = document.querySelector('meta[name="description"]');
    if (meta && description) meta.content = String(description);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogTitle && title) ogTitle.content = String(title);
    if (ogDescription && description) ogDescription.content = String(description);
    const socialImage = imageSource(getValue("seo.ogImage"));
    if (ogImage && socialImage) ogImage.content = socialImage;
  }

  function localizeOptions() {
    document.querySelectorAll("option[data-label-id][data-label-en]").forEach((option) => {
      option.textContent =
        state.language === "en" ? option.dataset.labelEn : option.dataset.labelId;
    });
  }

  function renderOptionalLogo() {
    const logo = imageSource(getValue("business.logo"));
    const alt =
      getValue(`business.logoAlt.${state.language}`) || getValue("business.name") || "";
    document.querySelectorAll("[data-brand]").forEach((container) => {
      container.querySelectorAll(".brand-logo").forEach((image) => image.remove());
      container.classList.toggle("has-logo", Boolean(logo));
      const monogram = container.querySelector(".brand-monogram");
      if (monogram) monogram.hidden = Boolean(logo);
      if (!logo) return;
      const image = document.createElement("img");
      image.className = "brand-logo";
      image.src = logo;
      image.alt = String(alt);
      container.prepend(image);
    });
  }

  function setLanguage(language) {
    if (!state.schema?.languages?.supported?.includes(language)) return;
    state.language = language;
    document.documentElement.lang = language;
    try {
      window.localStorage.setItem("arkana-pradipta-language", language);
    } catch (_error) {
      // Storage is optional.
    }
    render();
  }

  function render() {
    document.documentElement.lang = state.language;
    bindContent();
    renderCollections();
    applyTheme();
    applyVisibility();
    updateContactLinks();
    updateMetadata();
    localizeOptions();
    renderOptionalLogo();
    document.querySelectorAll("[data-language-button]").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.languageButton === state.language),
      );
    });
  }

  function setupLanguage() {
    let saved = state.schema?.languages?.default || "id";
    try {
      saved = window.localStorage.getItem("arkana-pradipta-language") || saved;
    } catch (_error) {
      // Storage is optional.
    }
    state.language = state.schema.languages.supported.includes(saved)
      ? saved
      : state.schema.languages.default;
    document.querySelectorAll("[data-language-button]").forEach((button) => {
      button.addEventListener("click", () => setLanguage(button.dataset.languageButton));
    });
  }

  function setupNavigation() {
    const header = document.querySelector("[data-header]");
    const toggle = document.querySelector("[data-menu-toggle]");
    const navigation = document.querySelector("[data-navigation]");
    const closeNavigation = () => {
      navigation?.classList.remove("is-open");
      toggle?.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    };

    toggle?.addEventListener("click", () => {
      const open = !navigation.classList.contains("is-open");
      navigation.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("menu-open", open);
    });
    navigation?.querySelectorAll("a").forEach((link) =>
      link.addEventListener("click", closeNavigation),
    );
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeNavigation();
        toggle?.focus();
      }
    });
    const current = document.body.dataset.page;
    document.querySelector(`[data-nav="${current}"]`)?.setAttribute("aria-current", "page");
    const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 24);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  function setupReveal() {
    const elements = [...document.querySelectorAll("[data-reveal]")];
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 },
    );
    elements.forEach((element) => observer.observe(element));
  }

  function setupForms() {
    document.querySelectorAll("[data-pagiverse-form]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const status = form.querySelector("[data-form-status]");
        if (!form.reportValidity()) {
          if (status) {
            status.textContent =
              state.language === "en"
                ? "Please review the required fields."
                : "Periksa kembali kolom yang wajib diisi.";
          }
          return;
        }
        const values = Object.fromEntries(new FormData(form).entries());
        if (window.parent !== window) {
          window.parent.postMessage(
            {
              type: "pagiverse:form-submit",
              templateId: state.schema.id,
              formId: form.dataset.pagiverseForm,
              values,
            },
            window.location.origin,
          );
        }
        if (status) {
          status.textContent =
            state.language === "en"
              ? "Your enquiry is ready for Pagiverse Core to process."
              : "Permintaan Anda siap diproses oleh Pagiverse Core.";
        }
        form.reset();
      });
    });
  }

  async function loadSchema() {
    const response = await fetch("template.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Template schema unavailable");
    state.schema = await response.json();
  }

  function postReady() {
    if (window.parent === window) return;
    window.parent.postMessage(
      { type: "pagiverse:ready", templateId: state.schema.id },
      window.location.origin,
    );
  }

  window.addEventListener("message", (event) => {
    if (
      !state.schema ||
      event.source !== window.parent ||
      event.origin !== window.location.origin
    ) {
      return;
    }
    const payload = event.data;
    if (
      !payload ||
      payload.type !== "pagiverse:config" ||
      payload.templateId !== state.schema.id
    ) {
      return;
    }
    state.data =
      payload.configuration && typeof payload.configuration === "object"
        ? payload.configuration
        : {};
    render();
    window.parent.postMessage(
      {
        type: "pagiverse:applied",
        templateId: state.schema.id,
        revision: payload.revision,
      },
      window.location.origin,
    );
  });

  async function init() {
    try {
      await loadSchema();
      setupLanguage();
      setupNavigation();
      setupForms();
      render();
      setupReveal();
      postReady();
    } catch (error) {
      document.documentElement.classList.add("template-error");
      console.error(error);
    }
  }

  init();
})();
