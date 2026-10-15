(() => {
  "use strict";
  const state = {
    schema: null,
    configuration: {},
    category: "ALL",
    query: "",
    sort: "default",
    items: [],
    current: null,
    paused: false,
  };
  const q = (s, root = document) => root.querySelector(s);
  const qa = (s, root = document) => Array.from(root.querySelectorAll(s));
  const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const pathValue = (o, path) =>
    own(o || {}, path)
      ? o[path]
      : String(path)
          .split(".")
          .reduce(
            (v, k) =>
              v && typeof v === "object" && own(v, k) ? v[k] : undefined,
            o,
          );
  function safeUrl(input, purpose = "link") {
    if (typeof input !== "string" || !input.trim()) return "";
    const value = input.trim();
    if (
      purpose === "image" &&
      /^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/=\s]+$/i.test(value) &&
      value.length < 12000000
    )
      return value;
    if (/[\u0000-\u001f\\]/.test(value)) return "";
    try {
      const url = new URL(value, document.baseURI);
      if (
        !["https:", "http:"].includes(url.protocol) ||
        url.username ||
        url.password
      )
        return "";
      if (url.protocol === "http:" && url.origin !== location.origin) return "";
      return url.href;
    } catch {
      return "";
    }
  }
  function sanitize(value, field = {}) {
    if (field.type === "array") {
      if (!Array.isArray(value)) value = field.default || [];
      return value
        .slice(0, field.maxItems || 18)
        .map((item) =>
          Object.fromEntries(
            Object.entries(field.item?.fields || {}).map(([key, def]) => [
              key,
              sanitize(
                item && typeof item === "object" ? item[key] : undefined,
                def,
              ),
            ]),
          ),
        );
    }
    if (value === undefined || value === null) value = field.default;
    if (field.type === "image") {
      const image =
        typeof value === "string"
          ? { src: value }
          : value && typeof value === "object"
            ? value
            : {};
      const src = safeUrl(image.src, "image");
      return {
        src,
        alt: String(image.alt || "").slice(0, 160),
        focalPoint: {
          x: Math.min(
            100,
            Math.max(
              0,
              Number.isFinite(Number(image.focalPoint?.x))
                ? Number(image.focalPoint.x)
                : 50,
            ),
          ),
          y: Math.min(
            100,
            Math.max(
              0,
              Number.isFinite(Number(image.focalPoint?.y))
                ? Number(image.focalPoint.y)
                : 50,
            ),
          ),
        },
        fit: ["cover", "contain"].includes(image.fit) ? image.fit : "cover",
      };
    }
    if (field.type === "boolean") return value === true;
    const text = String(value ?? "").slice(0, field.maxLength || 1000);
    if (field.type === "select") {
      const opts = (field.options || []).map((o) =>
        typeof o === "string" ? o : o.value,
      );
      return opts.includes(text)
        ? text
        : String(field.default || opts[0] || "");
    }
    if (field.type === "url") return safeUrl(text);
    return text;
  }
  function get(path) {
    const def = state.schema?.fields?.[path];
    if (!def) return "";
    return sanitize(pathValue(state.configuration, path), def);
  }
  function image(el, value) {
    if (!el) return;
    const img = sanitize(value, { type: "image" });
    if (img.src) {
      el.src = img.src;
      el.hidden = false;
    } else {
      el.removeAttribute("src");
      el.hidden = true;
    }
    el.alt = img.alt;
    el.style.objectPosition = img.focalPoint.x + "% " + img.focalPoint.y + "%";
    el.style.objectFit = img.fit;
  }
  function bindings() {
    qa("[data-bind]").forEach(
      (el) => (el.textContent = String(get(el.dataset.bind))),
    );
    qa("[data-bind-src]").forEach((el) => image(el, get(el.dataset.bindSrc)));
    qa("[data-placeholder]").forEach(
      (el) => (el.placeholder = String(get(el.dataset.placeholder))),
    );
    document.title = String(get("seo.title"));
    q('meta[name="description"]').content = String(get("seo.description"));
    q('meta[property="og:title"]').content = document.title;
    q('meta[property="og:description"]').content = String(
      get("seo.description"),
    );
    q('meta[property="og:image"]').content =
      get("seo.ogImage")?.src || "thumbnail.webp";
    qa(".brand").forEach((el) =>
      el.setAttribute("aria-label", String(get("business.name")) + ", BERANDA"),
    );
  }
  function sections() {
    (state.schema.sections || []).forEach((section) => {
      const value = pathValue(
        state.configuration,
        "sectionVisibility." + section.id,
      );
      const visible =
        section.required ||
        !(
          value === false ||
          (value === undefined && section.visibleByDefault === false)
        );
      qa('[data-section="' + section.id + '"]').forEach(
        (el) => (el.hidden = !visible),
      );
    });
    qa("main>[data-section],footer[data-section]")
      .filter((el) => !el.hidden)
      .forEach((el, index) => {
        el.classList.toggle("dark", index % 2 === 0);
        el.classList.toggle("light", index % 2 !== 0);
      });
    (state.schema.navigation?.items || []).forEach((nav) => {
      const target = q(nav.target);
      qa('[data-nav="' + nav.id + '"]').forEach(
        (el) =>
          (el.hidden =
            !!target?.hidden ||
            (nav.hideable &&
              pathValue(
                state.configuration,
                "navigationVisibility." + nav.id,
              ) === false)),
      );
    });
  }
  const node = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = String(text);
    return el;
  };
  function aboutAndFaq() {
    const list = q('[data-collection="sections.about.items"]');
    list.replaceChildren(
      ...get("sections.about.items").map((item, i) => {
        const a = node("article", "reveal");
        a.append(
          node("span", "service-number", String(i + 1).padStart(2, "0")),
          node("h3", "", item.title),
          node("p", "", item.description),
        );
        return a;
      }),
    );
    q('[data-collection="sections.faq.items"]').replaceChildren(
      ...get("sections.faq.items").map((item) => {
        const d = node("details");
        d.append(
          node("summary", "", item.question),
          node("p", "", item.answer),
        );
        return d;
      }),
    );
  }
  function amountValue(value) {
    const text = String(value).trim();
    const amount = /^\d{1,12}$/.test(text) ? Number(text) : 0;
    return Number.isSafeInteger(amount) && amount > 0 ? amount : 0;
  }
  function money(value) {
    const amount = amountValue(value);
    return amount > 0
      ? new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
        }).format(amount)
      : String(get("sections.products.noPriceLabel"));
  }
  function normalized(value) {
    return String(value)
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }
  function catalog() {
    state.items = get("sections.products.items");
    const categories = new Set(state.items.map((v) => v.category));
    if (state.category !== "ALL" && !categories.has(state.category))
      state.category = "ALL";
    qa("[data-filter]").forEach((button) => {
      button.disabled =
        button.dataset.filter !== "ALL" &&
        !categories.has(button.dataset.filter);
      const active = button.dataset.filter === state.category;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    let visible = state.items
      .map((v, index) => ({ ...v, _index: index }))
      .filter(
        (item) =>
          (state.category === "ALL" || item.category === state.category) &&
          normalized([item.name, item.variant, item.year].join(" ")).includes(
            normalized(state.query),
          ),
      );
    const amount = (item) => amountValue(item.price);
    if (state.sort === "priceAsc")
      visible.sort((a, b) => amount(a) - amount(b));
    if (state.sort === "priceDesc")
      visible.sort((a, b) => amount(b) - amount(a));
    if (state.sort === "yearDesc")
      visible.sort((a, b) => Number(b.year) - Number(a.year));
    q("#inventory-status").textContent =
      visible.length + " " + get("sections.products.resultLabel");
    const cards = visible.map((item) => {
      const article = node("article", "vehicle");
      const photo = node("button", "vehicle-photo");
      photo.type = "button";
      photo.dataset.vehicle = String(item._index);
      photo.setAttribute(
        "aria-label",
        get("sections.products.detailLabel") + " " + item.name,
      );
      const pic = node("img");
      pic.width = 1200;
      pic.height = 800;
      pic.loading = "lazy";
      pic.decoding = "async";
      image(pic, item.image);
      photo.append(pic);
      const info = node("div", "vehicle-info");
      const meta = node("p", "vehicle-meta");
      meta.append(node("span", "", item.category), node("span", "", item.year));
      const specs = node(
        "p",
        "specs",
        item.variant + " / " + item.mileage + " / " + item.transmission,
      );
      const bottom = node("div", "vehicle-bottom");
      const price = node("p", "price");
      price.append(
        node("small", "", get("sections.products.priceLabel")),
        document.createTextNode(money(item.price)),
      );
      const detail = node(
        "button",
        "text-link",
        get("sections.products.detailLabel"),
      );
      detail.type = "button";
      detail.dataset.vehicle = String(item._index);
      detail.setAttribute(
        "aria-label",
        get("sections.products.detailLabel") + " " + item.name,
      );
      bottom.append(price, detail);
      info.append(meta, node("h3", "", item.name), specs, bottom);
      article.append(photo, info);
      return article;
    });
    q("#vehicle-grid").replaceChildren(...cards);
    q("#vehicle-grid").setAttribute("aria-busy", "false");
    q("#inventory-empty").hidden = visible.length !== 0;
    updateAccent();
  }
  const dialog = q("#vehicle-dialog");
  function detail(index) {
    const item = state.items[index];
    if (!item) return;
    state.current = item;
    image(q("#dialog-image"), item.image);
    q("#dialog-title").textContent = item.name;
    q("#dialog-category").textContent = item.category;
    q("#dialog-variant").textContent = item.variant;
    q("#dialog-price").textContent = money(item.price);
    q("#dialog-description").textContent = item.description;
    const specs = q("#dialog-specs");
    specs.replaceChildren();
    [
      ["category", item.category],
      ["year", item.year],
      ["mileage", item.mileage],
      ["transmission", item.transmission],
      ["fuel", item.fuel],
    ].forEach(([label, value]) => {
      const div = node("div");
      div.append(
        node("dt", "", get("sections.products.dialog." + label + "Label")),
        node("dd", "", value),
      );
      specs.append(div);
    });
    dialog.showModal();
    document.body.classList.add("dialog-open");
    refreshLinks();
    updateAccent();
  }
  function closeDialog() {
    if (dialog.open) dialog.close();
  }
  function phone() {
    let raw = String(get("contact.whatsapp")).replace(/[\s()+.-]/g, "");
    if (raw.startsWith("0")) raw = "62" + raw.slice(1);
    return /^[1-9]\d{7,14}$/.test(raw) ? raw : "";
  }
  function whatsapp(kind) {
    const p = phone();
    if (!p) return "";
    let message = String(get("contact.whatsappMessage"));
    if (kind === "trade")
      message += " Saya ingin mendiskusikan tukar tambah mobil.";
    if (kind === "unit" && state.current)
      message +=
        " Saya tertarik dengan " +
        state.current.name +
        " " +
        state.current.variant +
        " tahun " +
        state.current.year +
        ". Mohon detail kondisi dan ketersediaannya.";
    return "https://wa.me/" + p + "?text=" + encodeURIComponent(message);
  }
  function refreshLinks() {
    qa("[data-whatsapp]").forEach((link) => {
      const url = whatsapp(link.dataset.whatsapp);
      link.href = url || "#contact";
      if (url) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      } else {
        link.removeAttribute("target");
        link.removeAttribute("rel");
      }
    });
    const maps = get("location.mapsUrl");
    const map = q("[data-map-link]");
    map.href = maps || "#location";
    if (maps) {
      map.target = "_blank";
      map.rel = "noopener noreferrer";
    } else {
      map.removeAttribute("target");
      map.removeAttribute("rel");
    }
  }
  function demoFeedback(message) {
    closeDialog();
    const feedback = q("#demo-feedback");
    feedback.textContent = message;
    feedback.hidden = false;
    feedback.focus({ preventScroll: true });
    q("#contact").scrollIntoView({
      behavior: reduced.matches ? "instant" : "smooth",
      block: "center",
    });
  }
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  function motionState() {
    document.documentElement.classList.toggle(
      "motion-ready",
      !reduced.matches && window.parent === window,
    );
    document.body.classList.toggle(
      "motion-paused",
      state.paused || reduced.matches,
    );
    const toggle = q("[data-motion-toggle]");
    toggle.setAttribute("aria-pressed", String(state.paused));
    toggle.classList.toggle("is-paused", state.paused);
    q("[data-motion-label]").textContent = get(
      "sections.hero." + (state.paused ? "resumeLabel" : "pauseLabel"),
    );
  }
  let revealObserver;
  function reveals() {
    revealObserver?.disconnect();
    const elements = qa(".reveal");
    if (reduced.matches || state.paused || window.parent !== window) {
      elements.forEach((el) => {
        el.classList.remove("reveal-pending");
        el.classList.add("is-visible");
      });
      return;
    }
    revealObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            entry.target.classList.remove("reveal-pending");
            revealObserver.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );
    elements.forEach((el) => {
      if (!el.classList.contains("is-visible")) {
        el.classList.add("reveal-pending");
        revealObserver.observe(el);
      }
    });
  }
  const floating = q("[data-floating-contact]");
  function onScreen(el) {
    const rect = el.getBoundingClientRect();
    return (
      !el.hidden &&
      getComputedStyle(el).display !== "none" &&
      rect.bottom > 64 &&
      rect.top < innerHeight &&
      rect.right > 0 &&
      rect.left < innerWidth
    );
  }
  function updateAccent() {
    if (document.body.classList.contains("menu-open")) {
      qa(".accent-active").forEach((el) =>
        el.classList.remove("accent-active"),
      );
      q(".nav-contact").classList.add("accent-active");
      floating.hidden = true;
      return;
    }
    const actions = qa("[data-accent]");
    actions.forEach((el) => el.classList.remove("accent-active"));
    if (dialog.open) {
      q("#dialog-contact").classList.add("accent-active");
      floating.hidden = true;
      return;
    }
    const visible = actions.filter(
      (el) => el !== floating && !dialog.contains(el) && onScreen(el),
    );
    visible.sort(
      (a, b) =>
        Math.abs(a.getBoundingClientRect().top - innerHeight * 0.55) -
        Math.abs(b.getBoundingClientRect().top - innerHeight * 0.55),
    );
    floating.hidden = visible.length > 0;
    if (visible[0]) visible[0].classList.add("accent-active");
    else floating.classList.add("accent-active");
  }
  const accentObserver = new IntersectionObserver(() => updateAccent(), {
    threshold: [0, 0.01, 0.25, 0.5, 0.75, 1],
    rootMargin: "-64px 0px 0px 0px",
  });
  function render() {
    closeDialog();
    bindings();
    sections();
    aboutAndFaq();
    catalog();
    refreshLinks();
    motionState();
    reveals();
    qa("[data-accent]")
      .filter((el) => el !== floating)
      .forEach((el) => accentObserver.observe(el));
    updateAccent();
  }
  function menu(open) {
    q("#site-nav").classList.toggle("is-open", open);
    q("[data-menu-toggle]").setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
    q("main").inert = open;
    q("footer").inert = open;
    updateAccent();
  }
  q("[data-menu-toggle]").addEventListener("click", () =>
    menu(q("[data-menu-toggle]").getAttribute("aria-expanded") !== "true"),
  );
  q("#site-nav").addEventListener("click", (event) => {
    if (event.target.closest("a")) menu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      menu(false);
      closeDialog();
    }
  });
  q("#vehicle-search").addEventListener("input", (event) => {
    state.query = event.target.value;
    catalog();
  });
  q("#vehicle-sort").addEventListener("change", (event) => {
    state.sort = event.target.value;
    catalog();
  });
  qa("[data-filter]").forEach((button) =>
    button.addEventListener("click", () => {
      state.category = button.dataset.filter;
      catalog();
    }),
  );
  q("[data-reset-filter]").addEventListener("click", () => {
    state.query = "";
    state.category = "ALL";
    q("#vehicle-search").value = "";
    catalog();
    q("#vehicle-search").focus();
  });
  q("#vehicle-grid").addEventListener("click", (event) => {
    const button = event.target.closest("[data-vehicle]");
    if (button) detail(Number(button.dataset.vehicle));
  });
  q("[data-close-dialog]").addEventListener("click", closeDialog);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom
      )
        closeDialog();
    }
  });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
    updateAccent();
  });
  qa("[data-whatsapp]").forEach((link) =>
    link.addEventListener("click", (event) => {
      if (!whatsapp(link.dataset.whatsapp)) {
        event.preventDefault();
        demoFeedback(String(get("sections.contact.demoMessage")));
      }
    }),
  );
  q("[data-map-link]").addEventListener("click", (event) => {
    if (!get("location.mapsUrl")) {
      event.preventDefault();
      demoFeedback(
        String(get("sections.location.demoMessage")) ||
          "LOKASI DEMO. TAUTAN PETA BELUM DIATUR.",
      );
    }
  });
  q("[data-motion-toggle]").addEventListener("click", () => {
    state.paused = !state.paused;
    motionState();
    if (state.paused) reveals();
  });
  reduced.addEventListener("change", () => {
    motionState();
    reveals();
  });
  window.addEventListener("resize", () => {
    if (innerWidth >= 900) menu(false);
    updateAccent();
  });
  window.addEventListener("message", (event) => {
    if (event.source !== window.parent || event.origin !== location.origin)
      return;
    const payload = event.data;
    if (
      !payload ||
      payload.type !== "pagiverse:config" ||
      payload.templateId !== state.schema?.id
    )
      return;
    state.configuration =
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
      location.origin,
    );
  });
  async function init() {
    const response = await fetch("template.json", { cache: "no-store" });
    if (!response.ok) throw new Error("SCHEMA TIDAK TERSEDIA");
    state.schema = await response.json();
    state.configuration =
      window.PAGIVERSE_DATA && typeof window.PAGIVERSE_DATA === "object"
        ? window.PAGIVERSE_DATA
        : {};
    render();
    if (window.parent !== window)
      window.parent.postMessage(
        { type: "pagiverse:ready", templateId: state.schema.id },
        location.origin,
      );
    document.documentElement.dataset.ready = "true";
  }
  init().catch((error) => {
    console.error(error);
    q("#vehicle-grid").replaceChildren(
      node(
        "p",
        "error-state",
        "KOLEKSI BELUM DAPAT DIMUAT. MUAT ULANG HALAMAN.",
      ),
    );
    q("#vehicle-grid").setAttribute("aria-busy", "false");
  });
})();
