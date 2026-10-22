(() => {
  "use strict";
  const TEMPLATE_ID = "sela-studio-design-001";
  const state = {
    schema: null,
    data: {},
    filter: "Semua",
    pending: null,
    projectOpener: null,
    brief: "",
    paused: false,
  };
  const signatures = new WeakMap();
  const own = (object, key) =>
    Object.prototype.hasOwnProperty.call(object, key);
  const isRecord = (value) =>
    Boolean(value && typeof value === "object" && !Array.isArray(value));
  const plain = (value) =>
    typeof value === "string" || typeof value === "number" ? String(value) : "";
  const query = (selector) => document.querySelector(selector);
  const all = (selector) => document.querySelectorAll(selector);

  function pathValue(source, path) {
    return path
      .split(".")
      .reduce(
        (value, key) =>
          isRecord(value) && own(value, key) ? value[key] : undefined,
        source,
      );
  }

  function safeImage(value) {
    const raw =
      typeof value === "string" ? value : isRecord(value) ? value.src : "";
    if (typeof raw !== "string") return "";
    const source = raw.trim();
    if (!source || /[\u0000-\u001f\u007f\\]/.test(source)) return "";
    if (
      /^data:image\/(?:png|jpeg|webp|avif);base64,[A-Za-z0-9+/=]+$/i.test(
        source,
      )
    )
      return source;
    try {
      if (/^https:\/\//i.test(source)) {
        const url = new URL(source);
        return url.protocol === "https:" && !url.username && !url.password
          ? url.href
          : "";
      }
      if (source.startsWith("blob:")) {
        const blob = new URL(source);
        return blob.origin === window.location.origin ? source : "";
      }
      const decoded = decodeURIComponent(source);
      if (
        decoded.includes("..") ||
        decoded.startsWith("//") ||
        /[?#]/.test(decoded)
      )
        return "";
      if (
        /^(?:\.\/)?assets\/[A-Za-z0-9 _./()-]+\.(?:png|jpe?g|webp|avif|svg)$/i.test(
          decoded,
        ) ||
        /^(?:\.\/)?thumbnail\.webp$/i.test(decoded)
      )
        return source;
      if (
        /^\/(?!\/)[A-Za-z0-9 _./()-]+\.(?:png|jpe?g|webp|avif|svg)$/i.test(
          decoded,
        )
      )
        return source;
    } catch (_) {
      return "";
    }
    return "";
  }

  function normalize(value, descriptor = {}) {
    if (descriptor.type === "array") {
      const list = Array.isArray(value)
        ? value
        : Array.isArray(descriptor.default)
          ? descriptor.default
          : [];
      return list.slice(0, descriptor.maxItems || 24).map((item) => {
        const result = {};
        Object.entries(descriptor.item?.fields || {}).forEach(
          ([key, field]) => {
            result[key] = normalize(
              isRecord(item) ? item[key] : undefined,
              field,
            );
          },
        );
        return result;
      });
    }
    if (descriptor.type === "image") {
      const source = safeImage(value);
      if (!source)
        return descriptor.required && safeImage(descriptor.default)
          ? descriptor.default
          : "";
      const image = isRecord(value) ? value : {};
      const focal = isRecord(image.focalPoint) ? image.focalPoint : {};
      const coordinate = (n) =>
        Number.isFinite(Number(n)) ? Math.min(100, Math.max(0, Number(n))) : 50;
      return {
        src: source,
        alt: plain(image.alt).slice(0, 180),
        focalPoint: { x: coordinate(focal.x), y: coordinate(focal.y) },
        crop:
          image.crop === "contain" || image.fit === "contain"
            ? "contain"
            : "cover",
      };
    }
    if (descriptor.type === "boolean")
      return typeof value === "boolean" ? value : Boolean(descriptor.default);
    const fallback = descriptor.default === undefined ? "" : descriptor.default;
    let result = plain(
      value === undefined || value === null ? fallback : value,
    );
    if (descriptor.required && !result.trim()) result = plain(fallback);
    if (
      descriptor.type === "select" &&
      Array.isArray(descriptor.options) &&
      !descriptor.options.includes(result)
    )
      result = descriptor.options[0] || "";
    return result.slice(0, descriptor.maxLength || 2000);
  }

  function get(path) {
    const descriptor = state.schema?.fields?.[path];
    if (!descriptor) return undefined;
    const configured = own(state.data, path)
      ? state.data[path]
      : pathValue(state.data, path);
    return normalize(
      configured === undefined ? descriptor.default : configured,
      descriptor,
    );
  }

  function element(tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = plain(value);
    return node;
  }

  function setImage(image, value, fallbackAlt = "") {
    if (!image) return;
    const source = safeImage(value);
    if (!source) {
      image.removeAttribute("src");
      image.hidden = true;
      return;
    }
    if (image.getAttribute("src") !== source) image.setAttribute("src", source);
    image.hidden = false;
    image.alt = isRecord(value) ? plain(value.alt) || fallbackAlt : fallbackAlt;
    const focal =
      isRecord(value) && isRecord(value.focalPoint)
        ? value.focalPoint
        : { x: 50, y: 50 };
    image.style.objectPosition =
      String(focal.x ?? 50) + "% " + String(focal.y ?? 50) + "%";
    image.style.objectFit =
      isRecord(value) && value.crop === "contain" ? "contain" : "cover";
  }

  function renderBindings() {
    all("[data-bind]").forEach((node) => {
      const value = get(node.dataset.bind);
      if (value !== undefined && node.textContent !== plain(value))
        node.textContent = plain(value);
    });
    all("[data-bind-src]").forEach((image) =>
      setImage(
        image,
        get(image.dataset.bindSrc),
        image.dataset.bindSrc === "business.logo" ? get("business.name") : "",
      ),
    );
    all("[data-bind-alt]").forEach((image) => {
      const value = get(image.dataset.bindAlt);
      if (value !== undefined) image.alt = plain(value);
    });
    [
      ["data-bind-placeholder", "placeholder"],
      ["data-bind-title", "title"],
      ["data-bind-aria-label", "aria-label"],
    ].forEach(([binding, attribute]) => {
      all("[" + binding + "]").forEach((node) => {
        const value = get(node.getAttribute(binding));
        if (value !== undefined) node.setAttribute(attribute, plain(value));
      });
    });
    const hasLogo = Boolean(safeImage(get("business.logo")));
    all("[data-brand-mark], .brand-mark, [data-brand-fallback]").forEach(
      (node) => {
        node.hidden = hasLogo;
      },
    );
  }

  function createProject(item, index) {
    const card = element("article", "project-card");
    card.dataset.category = item.category;
    const button = element("button", "project-trigger");
    button.type = "button";
    button.dataset.project = String(index);
    button.setAttribute(
      "aria-label",
      get("sections.gallery.projectLabel") + " — " + item.title,
    );
    button.setAttribute("aria-haspopup", "dialog");
    const frame = element("div", "project-image");
    const image = element("img");
    image.loading = "lazy";
    image.decoding = "async";
    image.width = 1200;
    image.height = 900;
    setImage(image, item.image, item.title);
    frame.append(image);
    const metadata = element("div", "project-meta");
    const name = element("div", "project-name");
    name.append(
      element("h3", "", item.title),
      element("span", "project-category", item.category),
    );
    const arrow = element("span", "project-arrow", "↗");
    arrow.setAttribute("aria-hidden", "true");
    metadata.append(name, element("span", "project-year", item.year), arrow);
    button.append(frame, metadata);
    card.append(button);
    return card;
  }

  function renderCollection(container, items) {
    const kind = container.dataset.collectionKind;
    const signature = JSON.stringify([
      items,
      kind === "gallery" ? get("sections.gallery.projectLabel") : null,
    ]);
    if (signatures.get(container) === signature) return;
    const fragment = document.createDocumentFragment();
    if (kind === "gallery")
      items.forEach((item, index) =>
        fragment.append(createProject(item, index)),
      );
    if (kind === "collage")
      items.slice(0, 4).forEach((item, index) => {
        const card = element(
          "a",
          "collage-card collage-card--" + String(index + 1),
        );
        card.href = "#karya";
        card.dataset.heroGalleryLink = "";
        card.setAttribute("aria-label", item.title);
        const image = element("img");
        image.width = 1200;
        image.height = 900;
        image.decoding = "async";
        if (index > 1) image.loading = "lazy";
        setImage(image, item.image, item.title);
        card.append(image, element("span", "collage-caption", item.title));
        fragment.append(card);
      });
    if (kind === "services")
      items.forEach((item, index) => {
        const details = element("details", "service-row");
        const summary = element("summary");
        const symbol = element("span", "service-symbol", "+");
        symbol.setAttribute("aria-hidden", "true");
        summary.append(
          element("span", "service-number", String(index + 1).padStart(2, "0")),
          element("h3", "", item.title),
          symbol,
        );
        details.append(summary, element("p", "", item.description));
        fragment.append(details);
      });
    if (kind === "process")
      items.forEach((item, index) => {
        const row = element("li", "process-item");
        row.append(
          element("span", "step-number", String(index + 1).padStart(2, "0")),
          element("h3", "", item.title),
          element("p", "", item.description),
        );
        fragment.append(row);
      });
    container.replaceChildren(fragment);
    signatures.set(container, signature);
  }

  function applyFilter() {
    const items = get("sections.gallery.items") || [];
    const known = ["Semua", "Branding", "Digital", "Art direction"];
    if (!known.includes(state.filter)) state.filter = "Semua";
    let count = 0;
    all('[data-collection-kind="gallery"] .project-card').forEach((card) => {
      const visible =
        state.filter === "Semua" || card.dataset.category === state.filter;
      card.hidden = !visible;
      if (visible) count += 1;
    });
    all("[data-filter]").forEach((button) => {
      const active = button.dataset.filter === state.filter;
      button.setAttribute("aria-pressed", String(active));
      button.classList.toggle("is-active", active);
    });
    all("[data-gallery-empty]").forEach((node) => {
      node.hidden = count !== 0;
    });
    all("[data-work-count]").forEach((node) => {
      node.textContent = String(items.length).padStart(2, "0");
    });
  }

  function renderCollections() {
    all("[data-collection]").forEach((container) => {
      const items = get(container.dataset.collection);
      renderCollection(container, Array.isArray(items) ? items : []);
    });
    applyFilter();
  }

  function sectionVisible(section) {
    if (section.required) return true;
    const byMap = state.data.sectionVisibility?.[section.id];
    const flatMap = state.data["sectionVisibility." + section.id];
    const nested = pathValue(state.data, "sections." + section.id + ".visible");
    const flat = state.data["sections." + section.id + ".visible"];
    return (
      (flat !== undefined
        ? flat
        : nested !== undefined
          ? nested
          : flatMap !== undefined
            ? flatMap
            : byMap) !== false
    );
  }

  function applyVisibility() {
    state.schema.sections.forEach((section) => {
      const visible = sectionVisible(section);
      all('[data-section="' + section.id + '"]').forEach((node) => {
        node.hidden = !visible;
      });
      all('[data-nav-section="' + section.id + '"]').forEach((node) => {
        const item = state.schema.navigation.items.find(
          (entry) => entry.id === section.id,
        );
        const configuredItems = state.data.navigation?.items;
        const itemSetting = Array.isArray(configuredItems)
          ? configuredItems.find((entry) => entry?.id === section.id)
          : undefined;
        const configured = state.data.navigation?.[section.id]?.visible;
        node.hidden =
          !visible ||
          Boolean(
            item?.hideable &&
            (configured === false || itemSetting?.visible === false),
          );
      });
    });
    const gallery = state.schema.sections.find(
      (section) => section.id === "gallery",
    );
    const visible = sectionVisible(gallery);
    all(
      '[data-hero-gallery-link], [data-section="hero"] a[href="#karya"]',
    ).forEach((node) => {
      node.hidden = !visible;
    });
  }

  function updateMetadata() {
    const title = get("seo.title");
    const description = get("seo.description");
    if (title) document.title = title;
    [
      ['meta[name="description"]', description],
      ['meta[property="og:title"]', title],
      ['meta[property="og:description"]', description],
      ['meta[property="og:image"]', safeImage(get("seo.ogImage"))],
    ].forEach(([selector, value]) => {
      const node = query(selector);
      if (node && value) node.content = value;
    });
  }

  function render() {
    renderBindings();
    renderCollections();
    applyVisibility();
    updateMetadata();
    updateMotion();
    const menu = query("[data-menu-toggle]");
    const label = menu?.querySelector(
      '[data-menu-label], [data-bind="navigation.menuLabel"]',
    );
    if (label)
      label.textContent = get(
        menu.getAttribute("aria-expanded") === "true"
          ? "navigation.closeLabel"
          : "navigation.menuLabel",
      );
    all(".brand").forEach((node) =>
      node.setAttribute("aria-label", get("business.name") + " — beranda"),
    );
  }

  function closeNavigation(returnFocus = false) {
    const navigation = query("[data-navigation]");
    const toggle = query("[data-menu-toggle]");
    if (!navigation || !toggle) return;
    const wasOpen = toggle.getAttribute("aria-expanded") === "true";
    navigation.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    const label = toggle.querySelector(
      '[data-menu-label], [data-bind="navigation.menuLabel"]',
    );
    if (label) label.textContent = get("navigation.menuLabel");
    document.body.classList.remove("menu-open");
    if (returnFocus && wasOpen) toggle.focus();
  }

  function setupNavigation() {
    const navigation = query("[data-navigation]");
    const toggle = query("[data-menu-toggle]");
    if (!navigation || !toggle) return;
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      navigation.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      const label = toggle.querySelector(
        '[data-menu-label], [data-bind="navigation.menuLabel"]',
      );
      if (label)
        label.textContent = get(
          open ? "navigation.closeLabel" : "navigation.menuLabel",
        );
      document.body.classList.toggle("menu-open", open);
    });
    navigation.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeNavigation();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNavigation(true);
    });
    window
      .matchMedia("(min-width: 1101px)")
      .addEventListener("change", (event) => {
        if (event.matches) closeNavigation();
      });
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  function updateMotion() {
    const paused = state.paused || reducedMotion.matches;
    document.body.classList.toggle("motion-paused", paused);
    const toggle = query("[data-motion-toggle]");
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(paused));
      toggle.disabled = reducedMotion.matches;
      if (reducedMotion.matches)
        toggle.title = "Gerak dinonaktifkan sesuai pengaturan perangkat.";
      else toggle.removeAttribute("title");
    }
    all("[data-motion-label]").forEach((node) => {
      node.textContent =
        get(
          paused
            ? "sections.hero.motionPlayLabel"
            : "sections.hero.motionPauseLabel",
        ) || "";
    });
  }

  function setupMotion() {
    try {
      state.paused = localStorage.getItem(TEMPLATE_ID + ":motion") === "paused";
    } catch (_) {
      /* Storage may be disabled in previews. */
    }
    query("[data-motion-toggle]")?.addEventListener("click", () => {
      state.paused = !state.paused;
      try {
        localStorage.setItem(
          TEMPLATE_ID + ":motion",
          state.paused ? "paused" : "playing",
        );
      } catch (_) {
        /* Optional preference only. */
      }
      updateMotion();
    });
    reducedMotion.addEventListener("change", updateMotion);
  }

  function openProject(index, opener) {
    const item = (get("sections.gallery.items") || [])[index];
    const dialog = query("[data-project-dialog]");
    if (!item || !dialog) return;
    state.projectOpener = opener;
    setImage(query("[data-project-image]"), item.image, item.title);
    [
      ["[data-project-title]", item.title],
      [
        "[data-project-category]",
        [item.category, item.year].filter(Boolean).join(" / "),
      ],
      ["[data-project-description]", item.description],
    ].forEach(([selector, value]) => {
      const node = query(selector);
      if (node) node.textContent = value;
    });
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    document.body.classList.add("dialog-open");
  }

  function setupProjects() {
    document.addEventListener("click", (event) => {
      const filter = event.target.closest("[data-filter]");
      if (filter) {
        state.filter = filter.dataset.filter;
        applyFilter();
      }
      const trigger = event.target.closest("[data-project]");
      if (trigger) openProject(Number(trigger.dataset.project), trigger);
    });
    const dialog = query("[data-project-dialog]");
    if (!dialog) return;
    query("[data-dialog-close]")?.addEventListener("click", () =>
      dialog.close(),
    );
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", () => {
      document.body.classList.remove("dialog-open");
      if (
        state.projectOpener?.isConnected &&
        !state.projectOpener.closest("[hidden]")
      )
        state.projectOpener.focus();
    });
  }

  function fieldError(field) {
    const value = field.value.trim();
    if (field.required && !value) return "Kolom ini wajib diisi.";
    if (field.maxLength > 0 && value.length > field.maxLength)
      return "Isian melebihi batas karakter.";
    if (field.type === "email" && value && !field.validity.valid)
      return "Masukkan alamat email yang valid.";
    return "";
  }

  function showFieldError(field) {
    const message = fieldError(field);
    const node = document.getElementById(field.id + "-error");
    if (node) node.textContent = message;
    field.setAttribute("aria-invalid", String(Boolean(message)));
    return message;
  }

  function setupBrief() {
    const form = query('[data-pagiverse-form="project-brief"]');
    if (!form) return;
    const controls = [...form.querySelectorAll("input, textarea, select")];
    controls.forEach((field) => {
      field.addEventListener("blur", () => showFieldError(field));
      field.addEventListener("input", () => {
        if (field.getAttribute("aria-invalid") === "true")
          showFieldError(field);
      });
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const invalid = controls.filter((field) =>
        Boolean(showFieldError(field)),
      );
      if (invalid.length) {
        invalid[0].focus();
        return;
      }
      const formValue = (name) =>
        plain(form.elements.namedItem(name)?.value).trim();
      state.brief = [
        get("business.name") + " — Brief proyek",
        "",
        get("sections.contact.nameLabel") + ": " + formValue("name"),
        get("sections.contact.emailLabel") + ": " + formValue("email"),
        get("sections.contact.projectLabel") + ": " + formValue("project"),
        "",
        get("sections.contact.messageLabel") + ":",
        formValue("message"),
        "",
        get("sections.contact.demoNote"),
      ].join("\n");
      const summary = query("[data-brief-summary]");
      if (summary) summary.textContent = state.brief;
      const result = query("[data-brief-result]");
      if (result) {
        result.hidden = false;
        if (!result.hasAttribute("tabindex")) result.tabIndex = -1;
        result.focus();
      }
    });
    query("[data-brief-download]")?.addEventListener("click", () => {
      if (!state.brief) return;
      const url = URL.createObjectURL(
        new Blob([state.brief], { type: "text/plain;charset=utf-8" }),
      );
      const link = element("a");
      link.href = url;
      link.download = "brief-proyek.txt";
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }

  function acknowledge(payload) {
    if (window.parent !== window)
      window.parent.postMessage(
        {
          type: "pagiverse:applied",
          templateId: TEMPLATE_ID,
          revision: payload.revision,
        },
        window.location.origin,
      );
  }

  function acceptConfiguration(payload) {
    state.data = isRecord(payload.configuration) ? payload.configuration : {};
    render();
    acknowledge(payload);
  }

  window.addEventListener("message", (event) => {
    if (
      event.source !== window.parent ||
      event.origin !== window.location.origin
    )
      return;
    const payload = event.data;
    if (
      !isRecord(payload) ||
      payload.type !== "pagiverse:config" ||
      payload.templateId !== TEMPLATE_ID
    )
      return;
    if (!state.schema) {
      state.pending = payload;
      return;
    }
    acceptConfiguration(payload);
  });

  async function init() {
    try {
      const response = await fetch("template.json", { cache: "no-store" });
      if (!response.ok) throw new Error("Template schema unavailable");
      const manifest = await response.json();
      if (manifest.id !== TEMPLATE_ID || manifest.pagiverseStandard !== 1)
        throw new Error("Invalid template manifest");
      state.schema = manifest;
      state.data = isRecord(window.PAGIVERSE_DATA) ? window.PAGIVERSE_DATA : {};
      setupNavigation();
      setupMotion();
      setupProjects();
      setupBrief();
      if (state.pending) {
        const pending = state.pending;
        state.pending = null;
        acceptConfiguration(pending);
      } else render();
      document.documentElement.dataset.templateReady = "true";
      if (window.parent !== window)
        window.parent.postMessage(
          { type: "pagiverse:ready", templateId: TEMPLATE_ID },
          window.location.origin,
        );
    } catch (error) {
      document.documentElement.dataset.templateError = "true";
      console.error("Sela Studio could not initialize.", error);
    }
  }
  init();
})();
