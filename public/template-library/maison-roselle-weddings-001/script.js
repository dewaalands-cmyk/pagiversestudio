(() => {
  "use strict";

  const state = {
    schema: null,
    data:
      window.PAGIVERSE_DATA && typeof window.PAGIVERSE_DATA === "object"
        ? window.PAGIVERSE_DATA
        : {},
    revealObserver: null,
  };

  const owns = (object, key) =>
    object !== null &&
    typeof object === "object" &&
    Object.prototype.hasOwnProperty.call(object, key);

  function nestedValue(object, path) {
    return String(path)
      .split(".")
      .reduce((value, key) => (owns(value, key) ? value[key] : undefined), object);
  }

  function getValue(path) {
    if (owns(state.data, path)) return state.data[path];
    const nested = nestedValue(state.data, path);
    if (nested !== undefined) return nested;
    return state.schema?.fields?.[path]?.default;
  }

  function plainText(value) {
    return value === undefined || value === null ? "" : String(value);
  }

  function imageSource(value) {
    const source = typeof value === "string" ? value : value?.src;
    if (typeof source !== "string") return "";
    const clean = source.trim();
    if (!clean || /^javascript:/i.test(clean)) return "";
    if (/^https:\/\/[^\s]+$/i.test(clean)) return clean;
    if (/^blob:[^\s]+$/i.test(clean)) return clean;
    if (/^data:image\/(?:png|jpeg|webp|gif|avif);base64,[a-z0-9+/=]+$/i.test(clean)) return clean;
    if (
      /^(?:(?:\.\/)?assets\/[a-z0-9_/-]+\.(?:png|jpe?g|webp|avif)|thumbnail\.webp)$/i.test(clean) &&
      !clean.includes("..") &&
      !clean.includes("//")
    ) {
      return clean;
    }
    return "";
  }

  function imageAlt(value, fallback) {
    if (typeof fallback === "string" && fallback.trim()) return fallback.trim();
    return value && typeof value === "object" ? plainText(value.alt) : "";
  }

  function applyFocalPoint(image, value) {
    const point = value && typeof value === "object" ? value.focalPoint : null;
    if (!point) {
      image.style.removeProperty("object-position");
      return;
    }
    const rawX = Number(point.x);
    const rawY = Number(point.y);
    if (!Number.isFinite(rawX) || !Number.isFinite(rawY)) return;
    const percent = (number) => Math.max(0, Math.min(100, number <= 1 ? number * 100 : number));
    image.style.objectPosition = `${percent(rawX)}% ${percent(rawY)}%`;
  }

  function element(tagName, className, value) {
    const node = document.createElement(tagName);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = plainText(value);
    return node;
  }

  function renderText() {
    document.querySelectorAll("[data-bind]").forEach((node) => {
      const value = getValue(node.dataset.bind);
      if (value === undefined || typeof value === "object") return;
      node.textContent = plainText(value);
    });
  }

  function renderImages() {
    document.querySelectorAll("img[data-bind-src]").forEach((image) => {
      const value = getValue(image.dataset.bindSrc);
      const source = imageSource(value);
      if (source) {
        image.src = source;
        image.hidden = false;
        applyFocalPoint(image, value);
      } else if (image.dataset.bindSrc === "business.logo") {
        image.hidden = true;
      }

      if (image.dataset.bindSrc === "business.logo") {
        image.alt = source ? `Logo ${plainText(getValue("business.name"))}` : "";
        document.querySelectorAll("[data-brand-fallback]").forEach((fallback) => {
          fallback.hidden = Boolean(source);
        });
      } else if (!image.dataset.bindAlt && source) {
        image.alt = imageAlt(value, image.alt);
      }
    });

    document.querySelectorAll("img[data-bind-alt]").forEach((image) => {
      const value = getValue(image.dataset.bindAlt);
      if (value !== undefined) image.alt = plainText(value);
    });
  }

  function renderServices(container, items) {
    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      if (!item || typeof item !== "object") return;
      const article = element("article", "service-item");
      article.dataset.reveal = "";
      article.append(
        element("span", "service-index"),
        element("h3", "", item.name),
        element("p", "", item.description),
      );
      fragment.append(article);
    });
    container.replaceChildren(fragment);
  }

  function renderGallery(container, items) {
    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      if (!item || typeof item !== "object") return;
      const figure = element("figure", "gallery-item");
      figure.dataset.reveal = "";
      const image = document.createElement("img");
      const source = imageSource(item.image);
      if (source) image.src = source;
      image.alt = imageAlt(item.image, item.imageAlt);
      image.width = 1200;
      image.height = 1500;
      image.loading = "lazy";
      image.decoding = "async";
      applyFocalPoint(image, item.image);
      const caption = document.createElement("figcaption");
      caption.append(element("h3", "", item.title), element("p", "", item.detail));
      figure.append(image, caption);
      fragment.append(figure);
    });
    container.replaceChildren(fragment);
  }

  function renderProcess(container, items) {
    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      if (!item || typeof item !== "object") return;
      const listItem = element("li", "process-item");
      listItem.dataset.reveal = "";
      listItem.append(element("h3", "", item.name), element("p", "", item.description));
      fragment.append(listItem);
    });
    container.replaceChildren(fragment);
  }

  function renderTestimonials(container, items) {
    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      if (!item || typeof item !== "object") return;
      const article = element("article", "testimonial-item");
      article.dataset.reveal = "";
      article.append(
        element("blockquote", "", `“${plainText(item.quote)}”`),
        element("p", "testimonial-attribution", item.name),
      );
      fragment.append(article);
    });
    container.replaceChildren(fragment);
  }

  const faqSignatures = new WeakMap();

  function renderFaq(container, items) {
    const maxItems = state.schema?.fields?.[container.dataset.collection]?.maxItems;
    const entries = items
      .filter((item) => item && typeof item === "object")
      .slice(0, Number.isInteger(maxItems) ? Math.max(0, maxItems) : items.length)
      .map((item) => [plainText(item.question), plainText(item.answer)]);
    const signature = JSON.stringify(entries);
    if (faqSignatures.get(container) === signature) return;

    const fragment = document.createDocumentFragment();
    entries.forEach(([question, answer], index) => {
      const details = element("details", "faq-item");
      details.dataset.reveal = "";
      if (index === 0) details.open = true;
      details.append(element("summary", "", question), element("p", "", answer));
      fragment.append(details);
    });
    container.replaceChildren(fragment);
    faqSignatures.set(container, signature);
  }

  function renderCollections() {
    document.querySelectorAll("[data-collection]").forEach((container) => {
      const value = getValue(container.dataset.collection);
      const items = Array.isArray(value) ? value : [];
      switch (container.dataset.collectionKind) {
        case "services":
          renderServices(container, items);
          break;
        case "gallery":
          renderGallery(container, items);
          break;
        case "process":
          renderProcess(container, items);
          break;
        case "testimonials":
          renderTestimonials(container, items);
          break;
        case "faq":
          renderFaq(container, items);
          break;
        default:
          container.replaceChildren();
      }
    });
  }

  function applyEditableTheme() {
    const tokens = state.schema?.theme?.tokens || {};
    Object.entries(tokens).forEach(([name, descriptor]) => {
      if (!descriptor?.editable || !/^[a-z]+$/.test(name)) return;
      const color = getValue(`theme.${name}`) || descriptor.default;
      if (typeof color !== "string" || !/^#[\da-f]{6}$/i.test(color)) return;
      document.documentElement.style.setProperty(`--theme-${name}`, color);
    });
  }

  function applyVisibility() {
    const targets = new Map();
    state.schema?.sections?.forEach((section) => {
      const flatKey = `sectionVisibility.${section.id}`;
      const flat = owns(state.data, flatKey)
        ? state.data[flatKey]
        : state.data?.sectionVisibility?.[section.id];
      const nested = state.data?.sections?.[section.id]?.visible;
      const configured = nested !== undefined ? nested : flat;
      const visible = section.required
        ? true
        : typeof configured === "boolean"
          ? configured
          : section.visibleByDefault !== false;
      document.querySelectorAll(`[data-section="${section.id}"]`).forEach((node) => {
        node.hidden = !visible;
        if (node.id) targets.set(`#${node.id}`, visible);
      });
    });
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      const target = link.getAttribute("href");
      if (!targets.has(target)) return;
      const item = state.schema?.navigation?.items?.find((entry) => entry.target === target);
      const hiddenByNavigation = item?.hideable && (
        getValue(`navigation.${item.id}.hidden`) === true ||
        getValue(`navigation.${item.id}.visible`) === false ||
        getValue(`navigation.items.${item.id}.visible`) === false
      );
      link.hidden = !targets.get(target) || hiddenByNavigation;
    });
  }
  function whatsappNumber(value) {
    const normalized = plainText(value).replace(/[\s().-]/g, "");
    if (!/^\+?\d{8,15}$/.test(normalized)) return "";
    let digits = normalized.replace(/^\+/, "");
    if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
    return /^\d{8,15}$/.test(digits) ? digits : "";
  }

  function safeHttps(value) {
    try {
      const url = new URL(plainText(value));
      return url.protocol === "https:" ? url.href : "";
    } catch (_error) {
      return "";
    }
  }

  function updateLinks() {
    const phone = whatsappNumber(getValue("contact.whatsapp"));
    const message = plainText(getValue("contact.whatsappMessage"));
    const whatsapp = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : "#consultasi";
    document.querySelectorAll("[data-whatsapp-link]").forEach((link) => {
      link.href = whatsapp;
      if (phone) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      } else {
        link.removeAttribute("target");
        link.removeAttribute("rel");
      }
    });

    const email = plainText(getValue("contact.email")).trim();
    const safeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
    document.querySelectorAll("[data-email-link]").forEach((link) => {
      link.href = safeEmail ? `mailto:${safeEmail}` : "#consultasi";
    });

    const instagram = safeHttps(getValue("social.instagram"));
    document.querySelectorAll("[data-instagram-link]").forEach((link) => {
      link.href = instagram || "#consultasi";
      if (instagram) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      } else {
        link.removeAttribute("target");
        link.removeAttribute("rel");
      }
    });
  }

  function updateMetadata() {
    const title = getValue("seo.title");
    const description = getValue("seo.description");
    if (typeof title === "string" && title.trim()) {
      document.title = title;
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.content = title;
    }
    const meta = document.querySelector('meta[name="description"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (typeof description === "string" && description.trim()) {
      if (meta) meta.content = description;
      if (ogDescription) ogDescription.content = description;
    }
    const ogImage = imageSource(getValue("seo.ogImage"));
    const imageMeta = document.querySelector('meta[property="og:image"]');
    if (imageMeta && ogImage) imageMeta.content = ogImage;
  }

  function setupReveal() {
    state.revealObserver?.disconnect();
    const nodes = [...document.querySelectorAll("[data-reveal]")];
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (window.parent !== window || reduced || !("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("is-visible"));
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
      { threshold: 0.12, rootMargin: "0px 0px -6%" },
    );
    nodes.forEach((node) => state.revealObserver.observe(node));
  }

  function render() {
    renderText();
    renderImages();
    renderCollections();
    applyEditableTheme();
    applyVisibility();
    updateLinks();
    updateMetadata();
    setupReveal();
  }

  function setupNavigation() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const navigation = document.querySelector("[data-navigation]");
    if (!toggle || !navigation || toggle.dataset.initialized) return;
    toggle.dataset.initialized = "true";

    function setOpen(open) {
      navigation.classList.toggle("is-open", open);
      toggle.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
      if (open) navigation.querySelector("a")?.focus();
    }

    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  function validationMessage(field) {
    if (field.validity.valueMissing) return "Kolom ini wajib diisi.";
    if (field.validity.typeMismatch) return "Masukkan format yang valid.";
    if (field.validity.tooLong) return `Maksimal ${field.maxLength} karakter.`;
    if (field.validity.rangeUnderflow) return "Pilih tanggal yang belum berlalu.";
    return "Periksa kembali nilai pada kolom ini.";
  }

  function validateField(field) {
    const error = document.getElementById(`${field.id}-error`);
    const valid = field.checkValidity();
    field.setAttribute("aria-invalid", String(!valid));
    if (error) error.textContent = valid ? "" : validationMessage(field);
    return valid;
  }

  function formValues(form) {
    return Object.fromEntries(
      [...new FormData(form).entries()].map(([key, value]) => [key, plainText(value)]),
    );
  }

  function setupForms() {
    document.querySelectorAll("[data-pagiverse-form]").forEach((form) => {
      if (form.dataset.initialized) return;
      form.dataset.initialized = "true";

      const dateField = form.querySelector('input[type="date"]');
      if (dateField) dateField.min = new Date().toISOString().slice(0, 10);

      form.querySelectorAll("input, select, textarea").forEach((field) => {
        field.addEventListener("blur", () => validateField(field));
        field.addEventListener("input", () => {
          if (field.getAttribute("aria-invalid") === "true") validateField(field);
        });
      });

      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const fields = [...form.querySelectorAll("input, select, textarea")];
        const invalid = fields.filter((field) => !validateField(field));
        const status = form.querySelector("[data-form-status]");
        const submit = form.querySelector('button[type="submit"]');

        if (invalid.length) {
          if (status) {
            status.dataset.state = "error";
            status.textContent = plainText(
              getValue("sections.contact.invalidMessage") || "Periksa kembali kolom yang wajib diisi.",
            );
          }
          invalid[0].focus();
          return;
        }

        const values = formValues(form);
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

        if (!window.PagiverseForms || typeof window.PagiverseForms.submit !== "function") {
          if (status) {
            status.dataset.state = "info";
            status.textContent = plainText(
              getValue("sections.contact.integrationNote") ||
                "Pengiriman formulir memerlukan Pagiverse Core. Isian Anda tetap tersimpan di halaman ini.",
            );
          }
          return;
        }

        const originalLabel = submit?.textContent || "";
        if (submit) {
          submit.disabled = true;
          submit.textContent = plainText(getValue("sections.contact.sendingLabel") || "Mengirim...");
        }
        form.setAttribute("aria-busy", "true");
        if (status) {
          status.dataset.state = "info";
          status.textContent = plainText(getValue("sections.contact.sendingMessage") || "Mengirim permintaan konsultasi...");
        }

        try {
          await window.PagiverseForms.submit(form.dataset.pagiverseForm, new FormData(form));
          form.reset();
          fields.forEach((field) => field.removeAttribute("aria-invalid"));
          if (status) {
            status.dataset.state = "success";
            status.textContent = plainText(
              getValue("sections.contact.successMessage") || "Permintaan konsultasi berhasil dikirim.",
            );
          }
        } catch (_error) {
          if (status) {
            status.dataset.state = "error";
            status.textContent = plainText(
              getValue("sections.contact.errorMessage") || "Permintaan belum terkirim. Silakan coba lagi atau gunakan WhatsApp.",
            );
          }
        } finally {
          form.removeAttribute("aria-busy");
          if (submit) {
            submit.disabled = false;
            submit.textContent = originalLabel;
          }
        }
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
    setupForms();
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
      const response = await fetch("template.json", { cache: "no-store" });
      if (!response.ok) throw new Error("Template manifest unavailable");
      state.schema = await response.json();
      setupNavigation();
      render();
      setupForms();
      postReady();
    } catch (error) {
      document.querySelectorAll("[data-reveal]").forEach((node) => {
        node.classList.add("is-visible");
      });
      console.error(error);
    }
  }

  init();
})();
