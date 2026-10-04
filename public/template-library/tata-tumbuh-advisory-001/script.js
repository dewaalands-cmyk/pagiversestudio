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
    const descriptor =
      state.schema && state.schema.fields ? state.schema.fields[path] : null;
    return descriptor && own(descriptor, "default")
      ? descriptor.default
      : undefined;
  }

  function localized(value, key) {
    const candidate = key ? value && value[key] : value;
    if (
      candidate &&
      typeof candidate === "object" &&
      !Array.isArray(candidate)
    ) {
      return candidate[state.language] ?? candidate.id ?? candidate.en ?? "";
    }
    return candidate ?? "";
  }

  function localizedPath(path) {
    return path && path.endsWith(".id")
      ? `${path.slice(0, -3)}.${state.language}`
      : path;
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

  function setTextBindings() {
    document.querySelectorAll("[data-bind]").forEach((element) => {
      const value = getValue(element.dataset.bind);
      if (value !== undefined && value !== null && typeof value !== "object")
        element.textContent = String(value);
    });

    document.querySelectorAll("[data-bind-src]").forEach((image) => {
      const descriptor = getValue(image.dataset.bindSrc);
      const source = imageSource(descriptor);
      if (source) image.src = source;
      const altPath = localizedPath(image.dataset.bindAlt || "");
      const declaredAlt = altPath ? getValue(altPath) : undefined;
      image.alt =
        typeof declaredAlt === "string" ? declaredAlt : imageAlt(descriptor);
      if (descriptor && descriptor.focalPoint) {
        const x = Number(descriptor.focalPoint.x);
        const y = Number(descriptor.focalPoint.y);
        if (Number.isFinite(x) && Number.isFinite(y)) {
          const xPercent = x <= 1 ? x * 100 : x;
          const yPercent = y <= 1 ? y * 100 : y;
          image.style.objectPosition = `${xPercent}% ${yPercent}%`;
        }
      }
    });
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = String(text);
    return element;
  }

  function renderSignals(container, items) {
    items.forEach((item) => {
      const article = createElement("article", "problem-signal");
      article.append(createElement("h3", "", localized(item, "title")));
      article.append(createElement("p", "", localized(item, "body")));
      container.append(article);
    });
  }

  function renderServices(container, items) {
    const detailed = container.dataset.mode === "detailed";
    items.forEach((item) => {
      if (detailed) {
        const article = createElement("article", "service-detail");
        article.append(createElement("h2", "", localized(item, "title")));
        const body = createElement("div", "service-detail-body");
        body.append(
          createElement("p", "summary", localized(item, "description")),
        );
        if (Array.isArray(item.scope)) {
          const scope = createElement("ul", "scope-list");
          item.scope.forEach((entry) =>
            scope.append(createElement("li", "", localized(entry))),
          );
          body.append(scope);
        } else {
          body.append(
            createElement("p", "scope-copy", localized(item, "scope")),
          );
        }
        article.append(body);
        container.append(article);
      } else {
        const article = createElement("article", "service-card");
        article.append(createElement("h3", "", localized(item, "title")));
        article.append(createElement("p", "", localized(item, "description")));
        container.append(article);
      }
    });
  }

  function renderApproach(container, items) {
    const detailed = container.classList.contains("process-list");
    items.forEach((item, index) => {
      const entry = createElement(
        "li",
        detailed ? "process-step" : "approach-item",
      );
      if (detailed)
        entry.append(
          createElement(
            "span",
            "step-index",
            String(index + 1).padStart(2, "0"),
          ),
        );
      entry.append(createElement("h3", "", localized(item, "title")));
      entry.append(createElement("p", "", localized(item, "description")));
      container.append(entry);
    });
  }

  function renderSimpleItems(container, items, className) {
    items.forEach((item) => {
      const article = createElement("article", className);
      article.append(createElement("h3", "", localized(item, "title")));
      article.append(
        createElement(
          "p",
          "",
          localized(item, "description") || localized(item, "body"),
        ),
      );
      container.append(article);
    });
  }

  function renderTeam(container, items) {
    const limit = Number(container.dataset.limit || items.length);
    items.slice(0, limit).forEach((item) => {
      const figure = createElement("figure", "team-member");
      const image = document.createElement("img");
      image.src = imageSource(item.image);
      image.alt = imageAlt(item.image) || localized(item, "imageAlt");
      image.width = 1024;
      image.height = 1280;
      image.loading = "lazy";
      const caption = document.createElement("figcaption");
      caption.append(createElement("h3", "", item.name || ""));
      caption.append(createElement("p", "role", localized(item, "role")));
      caption.append(createElement("p", "bio", localized(item, "bio")));
      figure.append(image, caption);
      container.append(figure);
    });
  }

  function renderInsights(container, items) {
    items.forEach((item) => {
      const article = createElement("article", "insight-item");
      article.append(
        createElement("p", "insight-category", localized(item, "category")),
      );
      article.append(createElement("h2", "", localized(item, "title")));
      article.append(createElement("p", "", localized(item, "summary")));
      container.append(article);
    });
  }

  function renderList(container, items) {
    items.forEach((item) =>
      container.append(
        createElement(
          "li",
          "",
          localized(item, "text") ||
            localized(item, "title") ||
            localized(item),
        ),
      ),
    );
  }

  function renderFaq(container, items) {
    items.forEach((item) => {
      const details = createElement("details", "faq-item");
      details.append(createElement("summary", "", localized(item, "question")));
      details.append(createElement("p", "", localized(item, "answer")));
      container.append(details);
    });
  }

  function renderCollections() {
    document.querySelectorAll("[data-collection]").forEach((container) => {
      const path = container.dataset.collection;
      const items = getValue(path);
      container.replaceChildren();
      if (!Array.isArray(items) || items.length === 0) return;
      if (path === "sections.about.signals") renderSignals(container, items);
      else if (path === "sections.services.items")
        renderServices(container, items);
      else if (path === "sections.approach.items")
        renderApproach(container, items);
      else if (path === "sections.outputs.items")
        renderSimpleItems(container, items, "output-item");
      else if (path === "sections.team.items") renderTeam(container, items);
      else if (path === "sections.values.items")
        renderSimpleItems(container, items, "value-item");
      else if (path === "sections.engagements.items")
        renderSimpleItems(container, items, "engagement-item");
      else if (path === "sections.principles.items")
        renderSimpleItems(container, items, "principle-item");
      else if (path === "sections.insights.items")
        renderInsights(container, items);
      else if (path === "sections.faq.items") renderFaq(container, items);
      else renderList(container, items);
    });
  }

  function applyTheme() {
    const primary = getValue("theme.primary");
    const secondary = getValue("theme.secondary");
    const accent = getValue("theme.accent");
    if (typeof primary === "string")
      document.documentElement.style.setProperty("--navy-900", primary);
    if (typeof secondary === "string")
      document.documentElement.style.setProperty("--navy-800", secondary);
    if (typeof accent === "string")
      document.documentElement.style.setProperty("--accent", accent);
  }

  function applyVisibility() {
    const visibility = state.data.sectionVisibility;
    if (!visibility || typeof visibility !== "object") return;
    Object.entries(visibility).forEach(([sectionId, visible]) => {
      if (visible === false)
        document
          .querySelectorAll(`[data-section="${sectionId}"]`)
          .forEach((element) => {
            element.hidden = true;
          });
    });
  }

  function safePhone(value) {
    const digits = String(value || "").replace(/\D/g, "");
    return /^\d{8,15}$/.test(digits) ? digits : "";
  }

  function updateWhatsappLinks() {
    const phone = safePhone(getValue("contact.whatsapp"));
    const message = getValue(`contact.whatsappMessage.${state.language}`) || "";
    document.querySelectorAll("[data-whatsapp-link]").forEach((link) => {
      link.href = phone
        ? `https://wa.me/${phone}?text=${encodeURIComponent(String(message))}`
        : "contact.html";
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
    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta && description)
      descriptionMeta.content = String(description);
    const socialImage = imageSource(getValue("seo.ogImage"));
    const socialMeta = document.querySelector('meta[property="og:image"]');
    if (socialMeta && socialImage) socialMeta.content = socialImage;
  }

  function renderOptionalBranding() {
    const logo = imageSource(getValue("business.logo"));
    const alt =
      getValue(`business.logoAlt.${state.language}`) ||
      getValue("business.name") ||
      "";
    document.querySelectorAll(".brand, .footer-brand").forEach((container) => {
      container
        .querySelectorAll(".brand-logo")
        .forEach((image) => image.remove());
      const mark = container.querySelector(".brand-mark");
      if (mark) mark.hidden = Boolean(logo);
      if (!logo) return;
      const image = document.createElement("img");
      image.className = "brand-logo";
      image.src = logo;
      image.alt = String(alt);
      container.prepend(image);
    });
  }

  function renderFooterDetails() {
    document.querySelectorAll(".site-footer").forEach((footer) => {
      let copyright = footer.querySelector(".footer-copyright");
      if (!copyright) {
        copyright = createElement("p", "footer-copyright");
        footer.append(copyright);
      }
      const legal =
        getValue(`sections.footer.copyright.${state.language}`) || "";
      const label =
        getValue(`sections.footer.demoLabel.${state.language}`) || "";
      copyright.textContent = label ? `${legal} ${label}` : legal;
    });
  }

  function renderFormDescription() {
    const form = document.querySelector(".contact-form");
    if (!form) return;
    let description = form.querySelector(".form-description");
    if (!description) {
      description = createElement("p", "form-description");
      const heading = form.querySelector("h2");
      if (heading) heading.insertAdjacentElement("afterend", description);
    }
    description.textContent = String(
      getValue(`sections.contact.formDescription.${state.language}`) || "",
    );
  }

  function localizeSelects() {
    document.querySelectorAll("option[data-label-id]").forEach((option) => {
      option.textContent =
        option.dataset[state.language === "en" ? "labelEn" : "labelId"] || "";
    });
    const topic = document.querySelector("#topic");
    if (topic) {
      const labels =
        state.language === "en"
          ? [
              "Choose a topic",
              "Internal management strategy",
              "Financial management",
              "Operational excellence",
              "Inventory management",
            ]
          : [
              "Pilih topik",
              "Strategi manajemen internal",
              "Manajemen keuangan",
              "Keunggulan operasional",
              "Manajemen persediaan",
            ];
      [...topic.options].forEach((option, index) => {
        option.textContent = labels[index] || option.textContent;
      });
    }
  }

  function render() {
    document.documentElement.lang = state.language;
    setTextBindings();
    renderCollections();
    applyTheme();
    applyVisibility();
    updateWhatsappLinks();
    updateMetadata();
    renderOptionalBranding();
    renderFooterDetails();
    renderFormDescription();
    localizeSelects();
    document.querySelectorAll("[data-language-button]").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.languageButton === state.language),
      );
    });
  }

  function setLanguage(language) {
    if (!["id", "en"].includes(language)) return;
    state.language = language;
    try {
      window.localStorage.setItem("tata-tumbuh-language", language);
    } catch (_error) {
      /* storage is optional */
    }
    render();
  }

  function setupLanguage() {
    let saved = "id";
    try {
      saved = window.localStorage.getItem("tata-tumbuh-language") || "id";
    } catch (_error) {
      /* storage is optional */
    }
    state.language = ["id", "en"].includes(saved) ? saved : "id";
    document
      .querySelectorAll("[data-language-button]")
      .forEach((button) =>
        button.addEventListener("click", () =>
          setLanguage(button.dataset.languageButton),
        ),
      );
  }

  function setupNavigation() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const navigation = document.querySelector("[data-navigation]");
    if (toggle && navigation) {
      toggle.addEventListener("click", () => {
        const open = !navigation.classList.contains("is-open");
        navigation.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", String(open));
      });
      navigation.querySelectorAll("a").forEach((link) =>
        link.addEventListener("click", () => {
          navigation.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        }),
      );
    }
    const current = document.body.dataset.page;
    const active = document.querySelector(`[data-nav="${current}"]`);
    if (active) active.setAttribute("aria-current", "page");
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
        let valid = true;
        form.querySelectorAll("[required]").forEach((field) => {
          const error = form.querySelector(`#${field.id}-error`);
          let message = "";
          if (!field.value.trim())
            message =
              state.language === "en"
                ? "This field is required."
                : "Kolom ini wajib diisi.";
          else if (field.type === "email" && !field.validity.valid)
            message =
              state.language === "en"
                ? "Enter a valid email address."
                : "Masukkan alamat email yang valid.";
          if (error) error.textContent = message;
          field.setAttribute("aria-invalid", String(Boolean(message)));
          if (message) valid = false;
        });
        const status = form.querySelector(".form-status");
        if (!valid) {
          if (status)
            status.textContent =
              state.language === "en"
                ? "Please review the highlighted fields."
                : "Periksa kembali kolom yang ditandai.";
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
        if (status)
          status.textContent =
            state.language === "en"
              ? "Your request is ready for Pagiverse Core to process."
              : "Permintaan Anda siap diproses oleh Pagiverse Core.";
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
    )
      return;
    const payload = event.data;
    if (
      !payload ||
      payload.type !== "pagiverse:config" ||
      payload.templateId !== state.schema.id
    )
      return;
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
