"use strict";

(() => {
  const SCHEMA_URL = new URL(
    "template.json",
    document.currentScript?.src || document.baseURI,
  );
  const state = {
    schema: null,
    defaults: {},
    configuration: {},
    data: {},
    language: "id",
  };

  const LANGUAGE_STORAGE_KEY = "naratama-language";
  const BLOCKED_KEYS = new Set(["__proto__", "prototype", "constructor"]);

  const own = (object, key) =>
    Object.prototype.hasOwnProperty.call(object || {}, key);

  function isPlainObject(value) {
    return (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.getPrototypeOf(value) === Object.prototype
    );
  }

  function cloneValue(value) {
    if (Array.isArray(value)) return value.map(cloneValue);
    if (!isPlainObject(value)) return value;
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !BLOCKED_KEYS.has(key))
        .map(([key, child]) => [key, cloneValue(child)]),
    );
  }

  function nestedValue(object, path) {
    if (own(object, path)) return object[path];
    return path
      .split(".")
      .reduce(
        (value, key) =>
          !BLOCKED_KEYS.has(key) && value && typeof value === "object"
            ? value[key]
            : undefined,
        object,
      );
  }

  function setNestedValue(object, path, value) {
    const parts = String(path || "").split(".").filter(Boolean);
    if (!parts.length || parts.some((part) => BLOCKED_KEYS.has(part))) return;
    let cursor = object;
    parts.slice(0, -1).forEach((part) => {
      if (!isPlainObject(cursor[part])) cursor[part] = {};
      cursor = cursor[part];
    });
    cursor[parts.at(-1)] = cloneValue(value);
  }

  function expandFlatKeys(source) {
    if (!isPlainObject(source)) return {};
    const expanded = {};
    Object.entries(source).forEach(([key, value]) => {
      if (BLOCKED_KEYS.has(key)) return;
      const normalized = isPlainObject(value) ? expandFlatKeys(value) : cloneValue(value);
      if (key.includes(".")) setNestedValue(expanded, key, normalized);
      else expanded[key] = normalized;
    });
    return expanded;
  }

  function deepMerge(base, override) {
    if (!isPlainObject(override)) return cloneValue(override);
    const result = isPlainObject(base) ? cloneValue(base) : {};
    Object.entries(override).forEach(([key, value]) => {
      if (BLOCKED_KEYS.has(key)) return;
      result[key] =
        isPlainObject(result[key]) && isPlainObject(value)
          ? deepMerge(result[key], value)
          : cloneValue(value);
    });
    return result;
  }

  function normalizeConfiguration(payload) {
    if (!isPlainObject(payload)) return {};
    let result = {};
    ["data", "configuration", "values"].forEach((wrapper) => {
      if (isPlainObject(payload[wrapper])) {
        result = deepMerge(result, expandFlatKeys(payload[wrapper]));
      }
    });
    const direct = Object.fromEntries(
      Object.entries(payload).filter(
        ([key]) => !["data", "configuration", "values"].includes(key),
      ),
    );
    return deepMerge(result, expandFlatKeys(direct));
  }

  function buildDefaults(schema) {
    const defaults = {};
    Object.entries(schema?.fields || {}).forEach(([path, descriptor]) => {
      if (descriptor && own(descriptor, "default")) {
        setNestedValue(defaults, path, descriptor.default);
      }
    });
    (schema?.sections || []).forEach((section) => {
      if (section?.id && own(section, "visibleByDefault")) {
        setNestedValue(
          defaults,
          `sectionVisibility.${section.id}`,
          section.visibleByDefault !== false,
        );
      }
    });
    return defaults;
  }

  function rebuildData(configuration) {
    state.configuration = normalizeConfiguration(configuration);
    state.data = deepMerge(state.defaults, state.configuration);
  }

  function getValue(path) {
    const nested = nestedValue(state.data, path);
    if (nested !== undefined) return nested;
    const descriptor = state.schema?.fields?.[path];
    return descriptor && own(descriptor, "default")
      ? descriptor.default
      : undefined;
  }

  function localized(value, key) {
    const candidate = key ? nestedValue(value, key) : value;
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
    const localizedAlt = localized(value.alt);
    if (localizedAlt) return String(localizedAlt);
    return state.language === "en"
      ? value.altEn || value.altId || ""
      : value.altId || value.altEn || "";
  }

  function safeAssetUrl(value) {
    const source = String(value || "").trim();
    if (!source || /[\u0000-\u001f\u007f]/.test(source)) return "";
    if (/^data:/i.test(source)) {
      return /^data:image\/(?:avif|gif|jpeg|png|svg\+xml|webp);/i.test(source)
        ? source
        : "";
    }
    if (/^blob:/i.test(source)) return source;
    if (!/^[a-z][a-z\d+.-]*:/i.test(source) && !source.startsWith("//")) {
      return source;
    }
    try {
      const url = new URL(source, document.baseURI);
      return ["https:", "http:"].includes(url.protocol) ? url.href : "";
    } catch (_error) {
      return "";
    }
  }

  function textValue(value) {
    const candidate = localized(value);
    return ["string", "number", "boolean"].includes(typeof candidate)
      ? String(candidate)
      : "";
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = String(text);
    return element;
  }

  function itemText(item, ...keys) {
    for (const key of keys) {
      const value = nestedValue(item, key);
      if (value !== undefined && value !== null) return textValue(value);
    }
    return "";
  }

  function itemRaw(item, ...keys) {
    for (const key of keys) {
      const value = nestedValue(item, key);
      if (value !== undefined && value !== null) return value;
    }
    return undefined;
  }

  function appendText(parent, tag, className, value) {
    if (value === undefined || value === null || String(value) === "") return;
    parent.append(createElement(tag, className, value));
  }

  function bindContent() {
    document.querySelectorAll("[data-bind]").forEach((element) => {
      const value = getValue(element.dataset.bind);
      if (value !== undefined && value !== null) element.textContent = textValue(value);
    });

    document.querySelectorAll("[data-bind-src]").forEach((image) => {
      const value = getValue(image.dataset.bindSrc);
      const source = safeAssetUrl(imageSource(value));
      if (source) image.src = source;
      if (!own(image.dataset, "fallbackAlt")) image.dataset.fallbackAlt = image.alt || "";
      const explicitAlt = image.dataset.bindAlt
        ? textValue(getValue(image.dataset.bindAlt))
        : "";
      image.alt = explicitAlt || imageAlt(value) || image.dataset.fallbackAlt || "";
      const point = value?.focalPoint;
      if (point) {
        const rawX = Number(point.x);
        const rawY = Number(point.y);
        if (Number.isFinite(rawX) && Number.isFinite(rawY)) {
          const x = Math.max(0, Math.min(100, rawX <= 1 ? rawX * 100 : rawX));
          const y = Math.max(0, Math.min(100, rawY <= 1 ? rawY * 100 : rawY));
          image.style.objectPosition = `${x}% ${y}%`;
        }
      }
    });

    document.querySelectorAll("img[data-bind-alt]:not([data-bind-src])").forEach((image) => {
      const value = getValue(image.dataset.bindAlt);
      if (value !== undefined) image.alt = textValue(value);
    });
  }

  function renderPrinciples(container, items) {
    items.forEach((item) => {
      const article = createElement("article", "expertise-item");
      appendText(article, "span", "item-index", itemText(item, "label", "eyebrow"));
      article.append(
        createElement("h3", "", itemText(item, "title", "heading", "name")),
        createElement("p", "", itemText(item, "description", "body", "summary")),
      );
      container.append(article);
    });
  }

  function renderPractices(container, items) {
    items.forEach((item) => {
      const article = createElement("article", "service-card");
      appendText(
        article,
        "span",
        "expertise-meta",
        itemText(item, "eyebrow", "label"),
      );
      appendText(article, "h3", "", itemText(item, "title", "heading", "name"));
      appendText(
        article,
        "p",
        "service-description",
        itemText(item, "description", "body", "summary"),
      );
      const details = itemRaw(item, "points", "features", "areas");
      if (Array.isArray(details) && details.length) {
        const list = createElement("ul", "service-points");
        details.forEach((detail) => appendText(list, "li", "", textValue(detail)));
        article.append(list);
      }
      container.append(article);
    });
  }

  function renderIndustries(container, items) {
    items.forEach((item) => {
      container.append(createElement("li", "industry-item", localized(item)));
    });
  }

  function renderApproach(container, items) {
    items.forEach((item) => {
      const article = createElement("article", "process-card");
      appendText(article, "span", "process-number", itemText(item, "step", "label"));
      article.append(
        createElement("h3", "", itemText(item, "title", "heading", "name")),
        createElement("p", "", itemText(item, "description", "body", "summary")),
      );
      container.append(article);
    });
  }

  function renderValues(container, items) {
    items.forEach((item) => {
      const article = createElement("article", "process-card value-card");
      appendText(article, "span", "item-index", itemText(item, "label", "eyebrow"));
      article.append(
        createElement("h3", "", itemText(item, "title", "heading", "name")),
        createElement("p", "", itemText(item, "description", "body", "summary")),
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
      const article = createElement("article", "profile-card");
      const name = itemText(item, "name");
      const rawImage = itemRaw(item, "image", "photo");
      const source = safeAssetUrl(imageSource(rawImage));
      if (source) {
        const image = document.createElement("img");
        image.className = "profile-image";
        image.src = source;
        image.alt = itemText(item, "imageAlt", "photoAlt") || imageAlt(rawImage) || name;
        image.width = Number(item.imageWidth) || 720;
        image.height = Number(item.imageHeight) || 900;
        image.loading = "lazy";
        image.decoding = "async";
        article.append(image);
      } else {
        const monogram = createElement("div", "profile-monogram", initials(name));
        monogram.setAttribute("aria-hidden", "true");
        article.append(monogram);
      }
      const copy = createElement("div", "profile-copy");
      copy.append(
        createElement("p", "profile-role", itemText(item, "role", "position")),
        createElement("h3", "", name),
        createElement("p", "profile-focus", itemText(item, "focus", "expertise")),
        createElement("p", "profile-bio", itemText(item, "bio", "description")),
      );
      article.append(copy);
      container.append(article);
    });
  }

  function renderInsights(container, items) {
    items.forEach((item) => {
      const article = createElement("article", "insight-card");
      const meta = createElement("div", "insight-meta");
      meta.append(
        createElement("span", "insight-category", itemText(item, "category", "type")),
        createElement("span", "", itemText(item, "date", "readingTime")),
      );
      article.append(
        meta,
        createElement("h3", "", itemText(item, "title", "heading")),
        createElement("p", "", itemText(item, "excerpt", "description", "summary")),
      );
      container.append(article);
    });
  }

  function renderTestimonials(container, items) {
    items.forEach((item) => {
      const article = createElement("article", "testimonial-card");
      const quote = createElement("blockquote", "testimonial-quote");
      appendText(quote, "p", "", itemText(item, "quote", "text", "testimonial"));
      article.append(quote);
      appendText(article, "p", "testimonial-name", itemText(item, "name", "client"));
      appendText(article, "p", "testimonial-role", itemText(item, "role", "position", "company"));
      container.append(article);
    });
  }

  function renderCollections() {
    document.querySelectorAll("[data-collection]").forEach((container) => {
      const path = container.dataset.collection;
      const items = getValue(path);
      container.replaceChildren();
      if (!Array.isArray(items)) return;
      const renderer = container.dataset.render;
      if (renderer === "strategy" || path === "sections.homePrinciples.items") {
        renderPrinciples(container, items);
      } else if (renderer === "practices" || path === "sections.services.items") {
        renderPractices(container, items);
      } else if (path === "sections.services.industries") {
        renderIndustries(container, items);
      } else if (renderer === "process" || path === "sections.about.approachItems") {
        renderApproach(container, items);
      } else if (renderer === "principles" || path === "sections.about.values") {
        renderValues(container, items);
      } else if (renderer === "team" || path === "sections.team.items") {
        renderTeam(container, items);
      } else if (renderer === "insights" || path === "sections.insights.items") {
        renderInsights(container, items);
      } else if (renderer === "testimonials" || path === "sections.testimonials.items") {
        renderTestimonials(container, items);
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
    const visibility = getValue("sectionVisibility");
    if (!visibility || typeof visibility !== "object") return;
    document.querySelectorAll("[data-section]").forEach((element) => {
      const visible = nestedValue(visibility, element.dataset.section);
      if (visible !== undefined) {
        element.hidden = [false, 0, "0", "false", "hidden"].includes(visible);
      }
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
      link.href = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !/[\r\n]/.test(email)
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
    document.querySelectorAll("a[target='_blank']").forEach((link) => {
      link.rel = "noopener noreferrer";
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
    const rawLogo = getValue("business.logo");
    const logo = safeAssetUrl(imageSource(rawLogo));
    const alt =
      getValue(`business.logoAlt.${state.language}`) ||
      imageAlt(rawLogo) ||
      getValue("business.name") ||
      "";
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
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (_error) {
      // Storage is optional.
    }
    render();
    document.querySelectorAll("[data-pagiverse-form]").forEach((form) => {
      if (form.dataset.validationAttempted !== "true") return;
      [...form.elements]
        .filter((field) => field.name)
        .forEach(validateField);
      updateFormStatus(
        form,
        "error",
        state.language === "en"
          ? "Please review the highlighted fields."
          : "Periksa kembali kolom yang ditandai.",
      );
    });
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
    document.querySelectorAll("[data-lang]").forEach((element) => {
      element.hidden = element.dataset.lang !== state.language;
    });
    document.querySelectorAll("[data-language-button]").forEach((button) => {
      const active = button.dataset.languageButton === state.language;
      button.setAttribute(
        "aria-pressed",
        String(active),
      );
      button.classList.toggle("is-active", active);
    });
  }

  function setupLanguage() {
    let saved = "id";
    try {
      saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY) || saved;
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
    const desktop = window.matchMedia("(min-width: 901px)");
    const isOpen = () => Boolean(navigation?.classList.contains("is-open"));
    const closeNavigation = (restoreFocus = false) => {
      navigation?.classList.remove("is-open");
      toggle?.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
      if (restoreFocus) toggle?.focus();
    };

    toggle?.addEventListener("click", () => {
      const open = !isOpen();
      navigation.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("menu-open", open);
      if (open) {
        window.requestAnimationFrame(() => navigation.querySelector("a, button")?.focus());
      }
    });
    navigation?.querySelectorAll("a").forEach((link) =>
      link.addEventListener("click", closeNavigation),
    );
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isOpen()) closeNavigation(true);
    });
    document.addEventListener("pointerdown", (event) => {
      if (
        isOpen() &&
        !navigation?.contains(event.target) &&
        !toggle?.contains(event.target)
      ) {
        closeNavigation();
      }
    });

    const closeAtDesktop = (event) => {
      if (event.matches) closeNavigation();
    };
    if (typeof desktop.addEventListener === "function") {
      desktop.addEventListener("change", closeAtDesktop);
    } else {
      desktop.addListener(closeAtDesktop);
    }

    const current = document.body.dataset.page;
    const aliases = {
      services: "practices",
      "practice-areas": "practices",
      team: "professionals",
      consultation: "contact",
    };
    const active = aliases[current] || current;
    document.querySelectorAll("[data-nav]").forEach((link) => {
      link.removeAttribute("aria-current");
      if (link.dataset.nav === active) link.setAttribute("aria-current", "page");
    });
    if (header && "IntersectionObserver" in window) {
      const sentinel = createElement("span", "header-sentinel");
      sentinel.setAttribute("aria-hidden", "true");
      Object.assign(sentinel.style, {
        position: "absolute",
        top: "24px",
        left: "0",
        width: "1px",
        height: "1px",
        pointerEvents: "none",
      });
      header.before(sentinel);
      const headerObserver = new IntersectionObserver(([entry]) => {
        header.classList.toggle("is-scrolled", !entry.isIntersecting);
      });
      headerObserver.observe(sentinel);
    }
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

  function validPhone(value) {
    const phone = String(value || "").trim();
    if (!/^[+\d][\d\s().-]{6,24}$/.test(phone)) return false;
    return /^\+?\d{8,15}$/.test(phone.replace(/[^+\d]/g, ""));
  }

  function fieldErrorElement(field) {
    const describedIds = String(field.getAttribute("aria-describedby") || "")
      .split(/\s+/)
      .filter(Boolean);
    const describedError = describedIds
      .map((id) => document.getElementById(id))
      .find((element) => element?.classList.contains("field-error"));
    return (
      describedError ||
      (field.id ? document.getElementById(`${field.id}-error`) : null) ||
      field.closest(".field-group")?.querySelector(".field-error") ||
      null
    );
  }

  function validationMessage(field) {
    const english = state.language === "en";
    const empty =
      field.type === "checkbox" || field.type === "radio"
        ? !field.checked
        : !String(field.value || "").trim();
    if (field.required && empty) {
      return english ? "This field is required." : "Kolom ini wajib diisi.";
    }
    if (!empty && field.type === "email" && field.validity.typeMismatch) {
      return english
        ? "Enter a valid email address."
        : "Masukkan alamat email yang valid.";
    }
    if (!empty && /phone/i.test(field.name) && !validPhone(field.value)) {
      return english
        ? "Enter a valid telephone number."
        : "Masukkan nomor telepon yang valid.";
    }
    if (field.validity.tooLong) {
      return english
        ? `Use no more than ${field.maxLength} characters.`
        : `Gunakan maksimal ${field.maxLength} karakter.`;
    }
    if (field.validity.patternMismatch || field.validity.badInput) {
      return english ? "Review this field's format." : "Periksa kembali format kolom ini.";
    }
    return "";
  }

  function validateField(field) {
    field.setCustomValidity("");
    const message = validationMessage(field);
    field.setCustomValidity(message);
    field.toggleAttribute("aria-invalid", Boolean(message));
    const error = fieldErrorElement(field);
    if (error) error.textContent = message;
    return !message;
  }

  function updateFormStatus(form, kind, message) {
    const status = form.querySelector("[data-form-status]");
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("is-error", kind === "error");
    status.classList.toggle("is-success", kind === "success");
  }

  function serializeForm(form) {
    const values = {};
    [...form.elements].forEach((field) => {
      if (!field.name || field.disabled || ["submit", "button", "reset"].includes(field.type)) {
        return;
      }
      const value =
        field.type === "checkbox" || field.type === "radio"
          ? field.checked
            ? field.value || true
            : false
          : field.value;
      if (own(values, field.name)) {
        values[field.name] = Array.isArray(values[field.name])
          ? [...values[field.name], value]
          : [values[field.name], value];
      } else {
        values[field.name] = value;
      }
    });
    return values;
  }

  function parentTargetOrigin() {
    if (window.parent === window) return "";
    try {
      const referrer = new URL(document.referrer);
      if (["https:", "http:"].includes(referrer.protocol)) return referrer.origin;
    } catch (_error) {
      // A referrer is optional; use the template origin when it is network-served.
    }
    return ["https:", "http:"].includes(window.location.protocol)
      ? window.location.origin
      : "";
  }

  function setupForms() {
    document.querySelectorAll("[data-pagiverse-form]").forEach((form) => {
      form.noValidate = true;
      const fields = [...form.elements].filter(
        (field) => field.name && !["submit", "button", "reset"].includes(field.type),
      );
      fields.forEach((field) => {
        const handleChange = () => {
          if (form.dataset.validationAttempted === "true") validateField(field);
          else {
            field.setCustomValidity("");
            field.removeAttribute("aria-invalid");
            const error = fieldErrorElement(field);
            if (error) error.textContent = "";
          }
        };
        field.addEventListener("input", handleChange);
        field.addEventListener("change", handleChange);
      });

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        form.dataset.validationAttempted = "true";
        const valid = fields.map(validateField).every(Boolean);
        if (!valid) {
          updateFormStatus(
            form,
            "error",
            state.language === "en"
              ? "Please review the highlighted fields."
              : "Periksa kembali kolom yang ditandai.",
          );
          fields.find((field) => field.getAttribute("aria-invalid") === "true")?.focus();
          form.reportValidity();
          return;
        }

        const targetOrigin = parentTargetOrigin();
        if (targetOrigin) {
          window.parent.postMessage(
            {
              type: "pagiverse:form-submit",
              templateId: state.schema.id,
              formId: form.dataset.pagiverseForm,
              values: serializeForm(form),
            },
            targetOrigin,
          );
        }
        updateFormStatus(
          form,
          "success",
          state.language === "en"
            ? "Validation complete. Pagiverse Core handles submission and integrations when this template is published."
            : "Validasi selesai. Pagiverse Core menangani pengiriman dan integrasi saat template diterbitkan.",
        );
        form.reset();
        delete form.dataset.validationAttempted;
        fields.forEach((field) => {
          field.setCustomValidity("");
          field.removeAttribute("aria-invalid");
          const error = fieldErrorElement(field);
          if (error) error.textContent = "";
        });
      });
    });
  }

  async function loadSchema() {
    const response = await fetch(SCHEMA_URL, { cache: "no-store" });
    if (!response.ok) throw new Error("Template schema unavailable");
    state.schema = await response.json();
    state.defaults = buildDefaults(state.schema);
    rebuildData(window.PAGIVERSE_DATA || {});
  }

  function postReady() {
    const targetOrigin = parentTargetOrigin();
    if (!targetOrigin) return;
    window.parent.postMessage(
      { type: "pagiverse:ready", templateId: state.schema.id },
      targetOrigin,
    );
  }

  window.addEventListener("message", (event) => {
    const targetOrigin = parentTargetOrigin();
    if (
      !state.schema ||
      !targetOrigin ||
      event.source !== window.parent ||
      event.origin !== targetOrigin
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
    rebuildData(payload.configuration || payload.data || payload.values || {});
    render();
    window.parent.postMessage(
      {
        type: "pagiverse:applied",
        templateId: state.schema.id,
        revision: payload.revision,
      },
      targetOrigin,
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
