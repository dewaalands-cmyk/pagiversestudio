(() => {
  "use strict";

  const state = {
    schema: null,
    data: {},
    portfolioFilter: "all",
    revealObserver: null,
  };

  const own = (object, key) =>
    Object.prototype.hasOwnProperty.call(object, key);

  function pathValue(source, path) {
    return String(path)
      .split(".")
      .reduce((value, key) => {
        if (value && typeof value === "object" && own(value, key))
          return value[key];
        return undefined;
      }, source);
  }

  function getValue(path) {
    if (state.data && own(state.data, path)) return state.data[path];
    const nested = pathValue(state.data, path);
    if (nested !== undefined) return nested;
    return state.schema?.fields?.[path]?.default;
  }

  function textValue(value) {
    if (value === undefined || value === null) return "";
    return String(value);
  }

  function imageSource(value) {
    const source = typeof value === "string" ? value : value?.src;
    if (typeof source !== "string" || !source.trim()) return "";
    const trimmed = source.trim();
    if (/^javascript:/i.test(trimmed)) return "";
    if (/^(https?:|data:image\/|blob:)/i.test(trimmed)) return trimmed;
    if (/^(?:\.\/)?(?:assets\/|thumbnail\.webp)/i.test(trimmed)) return trimmed;
    return "";
  }

  function imageAlt(value, fallback) {
    if (typeof fallback === "string" && fallback.trim()) return fallback.trim();
    if (value && typeof value === "object" && typeof value.alt === "string")
      return value.alt;
    return "";
  }

  function applyFocalPoint(image, value) {
    const focal = value && typeof value === "object" ? value.focalPoint : null;
    if (!focal) return;
    const x = Number(focal.x);
    const y = Number(focal.y);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      image.style.objectPosition = `${Math.min(100, Math.max(0, x))}% ${Math.min(100, Math.max(0, y))}%`;
    }
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = textValue(text);
    return element;
  }

  function renderTextBindings() {
    document.querySelectorAll("[data-bind]").forEach((element) => {
      const value = getValue(element.dataset.bind);
      if (value === undefined) return;
      element.textContent = textValue(value);
    });
  }

  function renderImageBindings() {
    document.querySelectorAll("[data-bind-src]").forEach((image) => {
      const value = getValue(image.dataset.bindSrc);
      const source = imageSource(value);
      if (source) {
        image.src = source;
        image.hidden = false;
        applyFocalPoint(image, value);
      } else if (image.dataset.bindSrc === "business.logo") {
        image.hidden = true;
      }
    });
    document.querySelectorAll("[data-bind-alt]").forEach((image) => {
      const value = getValue(image.dataset.bindAlt);
      if (value !== undefined) image.alt = textValue(value);
    });

    const logo = imageSource(getValue("business.logo"));
    document.querySelectorAll(".brand").forEach((brand) => {
      const mark = brand.querySelector(".brand-mark");
      const logoImage = brand.querySelector(".brand-logo");
      if (mark) mark.hidden = Boolean(logo && logoImage);
    });
  }

  function renderPortfolio(container, items) {
    const limit = Number.parseInt(container.dataset.limit || "", 10);
    const limitedItems = Number.isFinite(limit) ? items.slice(0, limit) : items;
    const filterable = container.dataset.filterable === "true";
    const activeItems =
      filterable && state.portfolioFilter !== "all"
        ? limitedItems.filter(
            (item) => textValue(item.category) === state.portfolioFilter,
          )
        : limitedItems;
    const fragment = document.createDocumentFragment();

    activeItems.forEach((item) => {
      const article = createElement("article", "portfolio-card");
      article.dataset.category = textValue(item.category);
      article.dataset.reveal = "";

      const media = createElement("figure", "portfolio-card-media");
      const image = document.createElement("img");
      const source = imageSource(item.image);
      if (source) image.src = source;
      image.alt = imageAlt(item.image, item.imageAlt);
      image.width = 1600;
      image.height = 1067;
      image.loading = "lazy";
      image.decoding = "async";
      applyFocalPoint(image, item.image);
      media.append(image);

      const copy = createElement("div", "portfolio-card-copy");
      const meta = createElement("p", "portfolio-card-meta");
      const category = createElement("span", "", item.category);
      const client = createElement("span", "", item.client);
      const location = createElement("span", "", item.location);
      [category, client, location]
        .filter((node) => node.textContent)
        .forEach((node) => meta.append(node));
      const heading = createElement("h3", "", item.title);
      const summary = createElement(
        "p",
        "portfolio-card-summary",
        item.summary,
      );
      copy.append(meta, heading);
      if (summary.textContent) copy.append(summary);
      article.append(media, copy);
      fragment.append(article);
    });

    if (!activeItems.length) {
      fragment.append(
        createElement(
          "div",
          "empty-state",
          "Belum ada proyek pada kategori ini.",
        ),
      );
    }
    container.replaceChildren(fragment);
  }

  function renderServices(container, items) {
    const limit = Number.parseInt(container.dataset.limit || "", 10);
    const visibleItems = Number.isFinite(limit) ? items.slice(0, limit) : items;
    const fragment = document.createDocumentFragment();
    visibleItems.forEach((item) => {
      const article = createElement("article", "service-item");
      article.dataset.reveal = "";
      const heading = createElement("h3", "", item.name);
      const copy = createElement("div", "service-item-copy");
      const description = createElement("p", "", item.description);
      const deliverable = createElement(
        "span",
        "service-deliverable",
        item.deliverable,
      );
      copy.append(description);
      if (deliverable.textContent) copy.append(deliverable);
      article.append(heading, copy);
      fragment.append(article);
    });
    if (!visibleItems.length)
      fragment.append(
        createElement("div", "empty-state", "Layanan belum ditambahkan."),
      );
    container.replaceChildren(fragment);
  }

  function renderProcess(container, items) {
    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      const article = createElement("article", "process-item");
      article.dataset.reveal = "";
      article.append(
        createElement("h3", "", item.title),
        createElement("p", "", item.description),
      );
      fragment.append(article);
    });
    if (!items.length)
      fragment.append(
        createElement("div", "empty-state", "Tahapan kerja belum ditambahkan."),
      );
    container.replaceChildren(fragment);
  }

  function renderValues(container, items) {
    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      const article = createElement("article", "value-item");
      article.dataset.reveal = "";
      article.append(
        createElement("h3", "", item.title),
        createElement("p", "", item.description),
      );
      fragment.append(article);
    });
    if (!items.length)
      fragment.append(
        createElement("div", "empty-state", "Nilai kerja belum ditambahkan."),
      );
    container.replaceChildren(fragment);
  }

  function renderSectors(container, items) {
    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      const value = typeof item === "string" ? item : item?.value;
      if (value) fragment.append(createElement("span", "sector-item", value));
    });
    if (!fragment.childNodes.length)
      fragment.append(
        createElement("div", "empty-state", "Sektor belum ditambahkan."),
      );
    container.replaceChildren(fragment);
  }

  function renderTestimonials(container, items) {
    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      const article = createElement("article", "testimonial-item");
      article.dataset.reveal = "";
      const quote = createElement(
        "blockquote",
        "",
        `“${textValue(item.quote)}”`,
      );
      const attribution = createElement("div", "testimonial-attribution");
      attribution.append(createElement("strong", "", item.name));
      const detail = [item.role, item.company].filter(Boolean).join(", ");
      if (detail) attribution.append(createElement("span", "", detail));
      article.append(quote, attribution);
      fragment.append(article);
    });
    if (!items.length)
      fragment.append(
        createElement("div", "empty-state", "Testimoni belum ditambahkan."),
      );
    container.replaceChildren(fragment);
  }

  function renderFaq(container, items) {
    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      const details = createElement("details", "faq-item");
      details.dataset.reveal = "";
      details.append(
        createElement("summary", "", item.question),
        createElement("p", "", item.answer),
      );
      fragment.append(details);
    });
    if (!items.length)
      fragment.append(
        createElement("div", "empty-state", "Pertanyaan belum ditambahkan."),
      );
    container.replaceChildren(fragment);
  }

  function renderCollections() {
    document.querySelectorAll("[data-collection]").forEach((container) => {
      const items = getValue(container.dataset.collection);
      const list = Array.isArray(items) ? items : [];
      switch (container.dataset.collectionView) {
        case "portfolio":
          renderPortfolio(container, list);
          break;
        case "services":
          renderServices(container, list);
          break;
        case "process":
          renderProcess(container, list);
          break;
        case "values":
          renderValues(container, list);
          break;
        case "sectors":
          renderSectors(container, list);
          break;
        case "testimonials":
          renderTestimonials(container, list);
          break;
        case "faq":
          renderFaq(container, list);
          break;
        default:
          container.replaceChildren(
            createElement(
              "div",
              "empty-state",
              "Tampilan koleksi belum tersedia.",
            ),
          );
      }
    });
  }

  function updatePortfolioFilterUi() {
    document
      .querySelectorAll("[data-portfolio-filter] .filter-button")
      .forEach((button) => {
        const active = button.dataset.filterValue === state.portfolioFilter;
        button.setAttribute("aria-pressed", String(active));
      });
    const status = document.querySelector("[data-filter-status]");
    const grid = document.querySelector('[data-filterable="true"]');
    if (status && grid) {
      const count = grid.querySelectorAll(".portfolio-card").length;
      const label =
        state.portfolioFilter === "all"
          ? "semua kategori"
          : state.portfolioFilter;
      status.textContent = `${count} proyek dalam ${label}.`;
    }
  }

  function renderPortfolioFilters() {
    const container = document.querySelector("[data-portfolio-filter]");
    if (!container) return;
    const items = getValue("sections.gallery.items");
    const categories = Array.isArray(items)
      ? [
          ...new Set(
            items.map((item) => textValue(item.category)).filter(Boolean),
          ),
        ]
      : [];
    if (
      state.portfolioFilter !== "all" &&
      !categories.includes(state.portfolioFilter)
    )
      state.portfolioFilter = "all";
    const choices = [
      {
        value: "all",
        label:
          textValue(getValue("sections.gallery.filterAllLabel")) || "Semua",
      },
      ...categories.map((category) => ({ value: category, label: category })),
    ];
    const fragment = document.createDocumentFragment();
    choices.forEach((choice) => {
      const button = createElement("button", "filter-button", choice.label);
      button.type = "button";
      button.dataset.filterValue = choice.value;
      button.setAttribute(
        "aria-pressed",
        String(choice.value === state.portfolioFilter),
      );
      button.addEventListener("click", () => {
        state.portfolioFilter = choice.value;
        document
          .querySelectorAll(
            '[data-collection-view="portfolio"][data-filterable="true"]',
          )
          .forEach((grid) => {
            const portfolioItems = getValue(grid.dataset.collection);
            renderPortfolio(
              grid,
              Array.isArray(portfolioItems) ? portfolioItems : [],
            );
          });
        updatePortfolioFilterUi();
        setupReveal();
      });
      fragment.append(button);
    });
    container.replaceChildren(fragment);
    updatePortfolioFilterUi();
  }

  function applyTheme() {
    const root = document.documentElement;
    ["primary", "secondary", "accent", "background", "surface", "text"].forEach(
      (token) => {
        const configured = getValue(`theme.${token}`);
        const fallback = state.schema?.theme?.tokens?.[token]?.default;
        const value = configured || fallback;
        if (value) root.style.setProperty(`--color-${token}`, textValue(value));
      },
    );
  }

  function applySectionVisibility() {
    state.schema?.sections?.forEach((section) => {
      if (section.required) return;
      const flatVisibility = state.data?.sectionVisibility?.[section.id];
      const nestedVisibility = state.data?.sections?.[section.id]?.visible;
      const visible =
        nestedVisibility !== undefined ? nestedVisibility : flatVisibility;
      document
        .querySelectorAll(`[data-section="${section.id}"]`)
        .forEach((element) => {
          element.hidden = visible === false;
        });
    });
  }

  function safePhone(value) {
    const digits = textValue(value).replace(/\D/g, "");
    return /^\d{8,15}$/.test(digits) ? digits : "";
  }

  function safeHttpsUrl(value) {
    try {
      const url = new URL(textValue(value));
      return url.protocol === "https:" ? url.href : "";
    } catch (_error) {
      return "";
    }
  }

  function updateContactLinks() {
    const phone = safePhone(getValue("contact.whatsapp"));
    const message = textValue(getValue("contact.whatsappMessage"));
    document.querySelectorAll("[data-whatsapp-link]").forEach((link) => {
      link.href = phone
        ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
        : "contact.html";
    });

    const email = textValue(getValue("contact.email")).trim();
    const safeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
    document.querySelectorAll("[data-email-link]").forEach((link) => {
      link.href = safeEmail ? `mailto:${safeEmail}` : "contact.html";
    });

    const directPhone = safePhone(getValue("contact.phone"));
    document.querySelectorAll("[data-phone-link]").forEach((link) => {
      link.href = directPhone ? `tel:+${directPhone}` : "contact.html";
    });

    document.querySelectorAll("[data-external-link]").forEach((link) => {
      const url = safeHttpsUrl(getValue(link.dataset.externalLink));
      link.href = url || "contact.html";
    });
  }

  function updateMetadata() {
    const page = document.body.dataset.page || "home";
    const pageSeoPaths = {
      portfolio: {
        title: "seo.pages.portfolio.title",
        description: "seo.pages.portfolio.description",
      },
      services: {
        title: "seo.pages.services.title",
        description: "seo.pages.services.description",
      },
      about: {
        title: "seo.pages.about.title",
        description: "seo.pages.about.description",
      },
      contact: {
        title: "seo.pages.contact.title",
        description: "seo.pages.contact.description",
      },
    };
    const title = pageSeoPaths[page]
      ? getValue(pageSeoPaths[page].title)
      : getValue("seo.title");
    const description = pageSeoPaths[page]
      ? getValue(pageSeoPaths[page].description)
      : getValue("seo.description");
    if (title) document.title = textValue(title);
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && description)
      metaDescription.content = textValue(description);
    const socialImage = imageSource(getValue("seo.ogImage"));
    const socialMeta = document.querySelector('meta[property="og:image"]');
    if (socialMeta && socialImage) socialMeta.content = socialImage;
  }

  function updateActiveNavigation() {
    const page = document.body.dataset.page || "home";
    document.querySelectorAll("[data-nav]").forEach((link) => {
      if (link.dataset.nav === page) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function render() {
    renderTextBindings();
    renderImageBindings();
    renderCollections();
    renderPortfolioFilters();
    applyTheme();
    applySectionVisibility();
    updateContactLinks();
    updateMetadata();
    updateActiveNavigation();
    setupReveal();
  }

  function closeNavigation() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const navigation = document.querySelector("[data-navigation]");
    if (!toggle || !navigation) return;
    navigation.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "Menu";
    document.body.classList.remove("menu-open");
  }

  function setupNavigation() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const navigation = document.querySelector("[data-navigation]");
    if (!toggle || !navigation) return;
    toggle.addEventListener("click", () => {
      const open = !navigation.classList.contains("is-open");
      navigation.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "Tutup" : "Menu";
      document.body.classList.toggle("menu-open", open);
    });
    navigation
      .querySelectorAll("a")
      .forEach((link) => link.addEventListener("click", closeNavigation));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNavigation();
    });
  }

  function setupReveal() {
    if (state.revealObserver) state.revealObserver.disconnect();
    const elements = [...document.querySelectorAll("[data-reveal]")];
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }
    state.revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 },
    );
    elements.forEach((element) => state.revealObserver.observe(element));
  }

  function validateField(field) {
    const value = field.value.trim();
    if (field.required && !value) return "Kolom ini wajib diisi.";
    if (field.type === "email" && value && !field.validity.valid)
      return "Masukkan alamat email yang valid.";
    if (field.type === "date" && value && !field.validity.valid)
      return "Masukkan tanggal yang valid.";
    return "";
  }

  function setupForms() {
    document.querySelectorAll("[data-pagiverse-form]").forEach((form) => {
      if (form.dataset.initialized === "true") return;
      form.dataset.initialized = "true";

      form.querySelectorAll("input, select, textarea").forEach((field) => {
        field.addEventListener("blur", () => {
          const message = validateField(field);
          const error = form.querySelector(`#${field.id}-error`);
          if (error) error.textContent = message;
          field.setAttribute("aria-invalid", String(Boolean(message)));
        });
      });

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        let valid = true;
        const firstInvalid = [];
        form.querySelectorAll("input, select, textarea").forEach((field) => {
          const message = validateField(field);
          const error = form.querySelector(`#${field.id}-error`);
          if (error) error.textContent = message;
          field.setAttribute("aria-invalid", String(Boolean(message)));
          if (message) {
            valid = false;
            firstInvalid.push(field);
          }
        });

        const status = form.querySelector(".form-status");
        if (!valid) {
          if (status) {
            status.textContent = "Periksa kembali kolom yang ditandai.";
            status.className = "form-status is-error";
          }
          firstInvalid[0]?.focus();
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
            "Permintaan Anda siap diproses oleh Pagiverse Core.";
          status.className = "form-status is-success";
        }
        form.reset();
        form
          .querySelectorAll("[aria-invalid]")
          .forEach((field) => field.setAttribute("aria-invalid", "false"));
      });
    });
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

  async function loadSchema() {
    const response = await fetch("template.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Template schema unavailable");
    state.schema = await response.json();
  }

  async function init() {
    try {
      document.documentElement.classList.add("is-loading");
      await loadSchema();
      setupNavigation();
      setupForms();
      render();
      document.documentElement.classList.remove("is-loading");
      postReady();
    } catch (error) {
      document.documentElement.classList.remove("is-loading");
      document.documentElement.classList.add("template-error");
      document
        .querySelectorAll("[data-reveal]")
        .forEach((element) => element.classList.add("is-visible"));
      console.error(error);
    }
  }

  init();
})();
