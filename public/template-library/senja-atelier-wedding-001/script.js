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
    return path.split(".").reduce((value, key) => {
      return owns(value, key) ? value[key] : undefined;
    }, object);
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
    if (!clean) return "";
    if (/^https:\/\/[^\s]+$/i.test(clean)) return clean;
    if (/^blob:[^\s]+$/i.test(clean)) return clean;
    if (/^data:image\/(?:png|jpeg|webp|gif);base64,[a-z0-9+/=]+$/i.test(clean))
      return clean;
    if (
      /^(?:(?:\.\/)?assets\/[a-z0-9_/-]+\.(?:png|jpe?g|webp|avif)|thumbnail\.webp)$/i.test(
        clean,
      ) &&
      !clean.includes("..") &&
      !clean.includes("//")
    )
      return clean;
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
    const percent = (number) =>
      Math.max(0, Math.min(100, number <= 1 ? number * 100 : number));
    image.style.objectPosition = `${percent(rawX)}% ${percent(rawY)}%`;
  }

  function element(tag, className, value) {
    const node = document.createElement(tag);
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
        image.alt = source
          ? `Logo ${plainText(getValue("business.name"))}`
          : "";
      } else if (!image.dataset.bindAlt && source) {
        image.alt = imageAlt(value, image.alt);
      }
    });
    document.querySelectorAll("img[data-bind-alt]").forEach((image) => {
      const value = getValue(image.dataset.bindAlt);
      if (value !== undefined) image.alt = plainText(value);
    });
  }

  function renderGallery(container, items) {
    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      if (!item || typeof item !== "object") return;
      const article = element("article", "gallery-item");
      article.dataset.reveal = "";
      const media = element("figure", "gallery-item-media");
      const image = document.createElement("img");
      const source = imageSource(item.image);
      if (source) image.src = source;
      image.alt = imageAlt(item.image, item.imageAlt);
      image.width = 1200;
      image.height = 1500;
      image.loading = "lazy";
      image.decoding = "async";
      applyFocalPoint(image, item.image);
      media.append(image);
      const caption = element("div", "gallery-item-caption");
      caption.append(
        element("h3", "", item.title),
        element("p", "", item.location),
      );
      article.append(media, caption);
      fragment.append(article);
    });
    container.replaceChildren(fragment);
  }

  function renderServices(container, items) {
    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      if (!item || typeof item !== "object") return;
      const article = element("article", "service-item");
      article.dataset.reveal = "";
      article.append(
        element("h3", "", item.name),
        element("p", "", item.description),
      );
      fragment.append(article);
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

  function renderCollections() {
    document.querySelectorAll("[data-collection]").forEach((container) => {
      const value = getValue(container.dataset.collection);
      const items = Array.isArray(value) ? value : [];
      const limit = Number.parseInt(container.dataset.limit || "", 10);
      const visible =
        Number.isInteger(limit) && limit >= 0 ? items.slice(0, limit) : items;
      switch (container.dataset.collectionKind) {
        case "gallery":
          renderGallery(container, visible);
          break;
        case "services":
          renderServices(container, visible);
          break;
        case "testimonials":
          renderTestimonials(container, visible);
          break;
        default:
          container.replaceChildren();
      }
    });
  }

  function applyTheme() {
    const tokens = state.schema?.theme?.tokens || {};
    Object.entries(tokens).forEach(([name, descriptor]) => {
      if (!/^[a-z]+$/.test(name)) return;
      const color = descriptor?.editable
        ? getValue(`theme.${name}`) || descriptor.default
        : descriptor?.default;
      if (typeof color !== "string" || !/^#[\da-f]{6}$/i.test(color)) return;
      document.documentElement.style.setProperty(`--theme-${name}`, color);
      document.documentElement.style.setProperty(`--color-${name}`, color);
    });
  }

  function applyVisibility() {
    state.schema?.sections?.forEach((section) => {
      if (section.required) return;
      const flatKey = `sectionVisibility.${section.id}`;
      const flat = owns(state.data, flatKey)
        ? state.data[flatKey]
        : state.data?.sectionVisibility?.[section.id];
      const nested = state.data?.sections?.[section.id]?.visible;
      const visible = nested !== undefined ? nested : flat;
      document
        .querySelectorAll(`[data-section="${section.id}"]`)
        .forEach((node) => {
          node.hidden = visible === false;
        });
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
      : "contact.html";
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
      link.href = safeEmail ? `mailto:${safeEmail}` : "contact.html";
    });

    const instagram = safeHttps(getValue("social.instagram"));
    document.querySelectorAll("[data-instagram-link]").forEach((link) => {
      link.href = instagram || "contact.html";
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
    const page = document.body.dataset.page || "home";
    const base = page === "home" ? "seo" : `seo.pages.${page}`;
    const title = getValue(`${base}.title`);
    const description = getValue(`${base}.description`);
    if (typeof title === "string" && title.trim()) document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && typeof description === "string") meta.content = description;
    const image = imageSource(getValue("seo.ogImage"));
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && image) ogImage.content = image;
  }

  function setupReveal() {
    state.revealObserver?.disconnect();
    const nodes = [...document.querySelectorAll("[data-reveal]")];
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (
      window.parent !== window ||
      reduced ||
      !("IntersectionObserver" in window)
    ) {
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
      { threshold: 0.1 },
    );
    nodes.forEach((node) => state.revealObserver.observe(node));
  }

  function render() {
    renderText();
    renderImages();
    renderCollections();
    applyTheme();
    applyVisibility();
    updateLinks();
    updateMetadata();
    setupReveal();
  }

  function setupNavigation() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const navigation = document.querySelector("[data-navigation]");
    if (!toggle || !navigation) return;
    function setOpen(open) {
      navigation.classList.toggle("is-open", open);
      toggle.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
    }
    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
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

  async function init() {
    try {
      const response = await fetch("template.json", { cache: "no-store" });
      if (!response.ok) throw new Error("Template manifest unavailable");
      state.schema = await response.json();
      setupNavigation();
      render();
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
