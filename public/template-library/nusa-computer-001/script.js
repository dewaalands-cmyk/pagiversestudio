// Pagiverse Standard 1 bindings adapted from Website Blank v1. Commerce below is a disclosed extension.
const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj || {}, key);
const forbidden = new Set(["__proto__", "prototype", "constructor"]);
let schema,
  configuration =
    window.PAGIVERSE_DATA && typeof window.PAGIVERSE_DATA === "object"
      ? window.PAGIVERSE_DATA
      : {};
let commerce;
let pending;
let rendering = false;
let renderedConfiguration;
const renderedCollections = new WeakMap();
function lookup(object, field) {
  if (own(object, field)) return object[field];
  let value = object;
  for (const key of field.split(".")) {
    if (
      forbidden.has(key) ||
      !value ||
      typeof value !== "object" ||
      !own(value, key)
    )
      return undefined;
    value = value[key];
  }
  return value;
}
function safeURL(value, image = false) {
  const source = String(value || "").trim();
  if (!source) return "";
  if (
    image &&
    /^(?:\.\/)?assets\/[a-z0-9._/-]+$/i.test(source) &&
    !source.split("/").includes("..")
  )
    return source;
  if (!image && /^#[a-z][a-z0-9_-]*$/i.test(source)) return source;
  if (
    image &&
    source.length < 7000000 &&
    /^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(source)
  )
    return source;
  try {
    const url = new URL(source);
    if (url.username || url.password) return "";
    if (["https:", "http:"].includes(url.protocol)) return url.href;
    if (!image && ["mailto:", "tel:"].includes(url.protocol)) return url.href;
  } catch {}
  return "";
}
function descriptorValue(descriptor, value) {
  const fallback = descriptor.default;
  if (value === undefined) return fallback;
  if (descriptor.editable === false) return fallback;
  switch (descriptor.type) {
    case "array": {
      if (!Array.isArray(value)) return fallback || [];
      return value
        .slice(0, descriptor.maxItems || 24)
        .filter(
          (item) => item && typeof item === "object" && !Array.isArray(item),
        )
        .map((item) => {
          const result = {};
          for (const [key, desc] of Object.entries(
            descriptor.item?.fields || {},
          )) {
            if (forbidden.has(key)) continue;
            const v = descriptorValue(desc, item[key]);
            if (v !== undefined) result[key] = v;
          }
          return result;
        });
    }
    case "image": {
      const info =
        typeof value === "string"
          ? { src: value }
          : value && typeof value === "object"
            ? value
            : {};
      const src = safeURL(info.src, true);
      if (!src) return { src: "", alt: "" };
      const coordinate = (n) =>
        Number.isFinite(Number(n)) ? Math.max(0, Math.min(100, Number(n))) : 50;
      return {
        src,
        alt: String(info.alt || "").slice(0, 180),
        focalPoint: {
          x: coordinate(info.focalPoint?.x),
          y: coordinate(info.focalPoint?.y),
        },
        crop: ["cover", "contain"].includes(info.crop) ? info.crop : "contain",
      };
    }
    case "boolean":
      return typeof value === "boolean" ? value : fallback;
    case "color":
      return /^#[0-9a-f]{6}$/i.test(String(value)) ? String(value) : fallback;
    case "select": {
      const values = (descriptor.options || []).map((o) =>
        typeof o === "object" ? o.value : o,
      );
      return values.includes(value) ? value : fallback;
    }
    default: {
      const text = String(value ?? "").slice(0, descriptor.maxLength || 500);
      if (descriptor.required && !text.trim()) return fallback;
      return text;
    }
  }
}
function value(field) {
  const d = schema.fields[field];
  return d ? descriptorValue(d, lookup(configuration, field)) : undefined;
}
function applyImage(node, input) {
  const info = typeof input === "string" ? { src: input } : input || {};
  const source = safeURL(info.src, true);
  if (!source) {
    node.hidden = true;
    node.removeAttribute("src");
    node.removeAttribute("srcset");
    node.alt = String(info.alt || "");
    return;
  }
  node.hidden = false;
  if (node.getAttribute("src") !== source) {
    node.removeAttribute("srcset");
    node.removeAttribute("sizes");
    node.src = source;
  }
  node.alt = String(info.alt || "");
  const coordinate = (n) =>
    Number.isFinite(Number(n)) ? Math.max(0, Math.min(100, Number(n))) : 50;
  node.style.objectPosition =
    coordinate(info.focalPoint?.x) +
    "% " +
    coordinate(info.focalPoint?.y) +
    "%";
  if (["cover", "contain"].includes(info.crop))
    node.style.objectFit = info.crop;
}
function renderCollections() {
  for (const container of document.querySelectorAll("[data-collection]")) {
    const field = container.dataset.collection;
    const items = value(field);
    const template = Array.from(
      document.querySelectorAll("template[data-collection-template]"),
    ).find((node) => node.dataset.collectionTemplate === field);
    if (!template || !Array.isArray(items)) continue;
    // Repeated preview messages must not replace native disclosure state or focus.
    const signature = JSON.stringify(items);
    if (renderedCollections.get(container) === signature) continue;
    const fragment = document.createDocumentFragment();
    for (const item of items) {
      const clone = template.content.cloneNode(true);
      clone.querySelectorAll("[data-item-text]").forEach((node) => {
        node.textContent = String(item[node.dataset.itemText] ?? "");
      });
      clone
        .querySelectorAll("[data-item-image]")
        .forEach((node) => applyImage(node, item[node.dataset.itemImage]));
      clone.querySelectorAll("[data-item-link]").forEach((node) => {
        const href = safeURL(item[node.dataset.itemLink]);
        if (href) node.setAttribute("href", href);
        else node.removeAttribute("href");
        if (/^https?:/i.test(href)) {
          node.rel = "noopener noreferrer";
        }
      });
      clone.querySelectorAll("[data-item-category]").forEach((node) => {
        const category = item[node.dataset.itemCategory];
        if (
          ["all", "Laptop", "PC Desktop", "Komponen", "Aksesori"].includes(
            category,
          )
        )
          node.dataset.category = category;
        else node.removeAttribute("data-category");
      });
      fragment.append(clone);
    }
    container.replaceChildren(fragment);
    renderedCollections.set(container, signature);
  }
}
function meta(name, content, property = false) {
  const attr = property ? "property" : "name";
  let node = document.head.querySelector("meta[" + attr + '="' + name + '"]');
  if (!node) {
    node = document.createElement("meta");
    node.setAttribute(attr, name);
    document.head.append(node);
  }
  node.content = String(content || "");
}
function contrastOnWhite(color) {
  const rgb = color
    .slice(1)
    .match(/../g)
    .map((n) => parseInt(n, 16) / 255)
    .map((n) => (n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4));
  const l = rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  return 1.05 / (l + 0.05);
}
function renderSignature() {
  const content = Object.keys(schema.fields).map((field) => value(field));
  const visibility = schema.sections.map((section) =>
    section.required ||
    (lookup(configuration, "sectionVisibility." + section.id) ??
      section.visibleByDefault) !== false,
  );
  return JSON.stringify([content, visibility]);
}
function render() {
  const signature = renderSignature();
  // The parent still receives pagiverse:applied for every revision below.
  // Unchanged configuration must leave interactive DOM nodes intact.
  if (signature === renderedConfiguration) {
    window.PAGIVERSE_DATA = configuration;
    return;
  }
  rendering = true;
  document.querySelectorAll("[data-bind]").forEach((node) => {
    const v = value(node.dataset.bind);
    if (v !== undefined) node.textContent = String(v);
  });
  document
    .querySelectorAll("[data-bind-src]")
    .forEach((node) => applyImage(node, value(node.dataset.bindSrc)));
  document.querySelectorAll("[data-bind-placeholder]").forEach((node) => {
    node.placeholder = String(value(node.dataset.bindPlaceholder) || "");
  });
  document.querySelectorAll("[data-bind-label]").forEach((node) => {
    node.setAttribute(
      "aria-label",
      String(value(node.dataset.bindLabel) || ""),
    );
  });
  for (const section of schema.sections) {
    const hidden =
      !section.required &&
      (lookup(configuration, "sectionVisibility." + section.id) ??
        section.visibleByDefault) === false;
    document
      .querySelectorAll('[data-section="' + section.id + '"]')
      .forEach((node) => (node.hidden = hidden));
  }
  for (const item of schema.navigation.items || []) {
    const section = schema.sections.find((s) => s.id === item.section);
    const hidden =
      !!section &&
      !section.required &&
      (lookup(configuration, "sectionVisibility." + section.id) ??
        section.visibleByDefault) === false;
    document
      .querySelectorAll('[data-nav="' + item.id + '"]')
      .forEach((node) => {
        node.hidden = hidden;
        const copy = value(item.labelField);
        if (copy !== undefined) {
          const label = node.querySelector("[data-bind]");
          if (label) label.textContent = String(copy);
          else node.textContent = String(copy);
        }
      });
  }
  document.querySelectorAll("[data-section-link]").forEach((node) => {
    const id = node.dataset.sectionLink;
    node.hidden = !!Array.from(
      document.querySelectorAll('[data-section="' + id + '"]'),
    ).find((section) => section.hidden);
  });
  const tokens = {
    primary: "--color-pricing-blue",
    accent: "--color-apple-blue",
    background: "--color-gallery-white",
    surface: "--color-studio-mist",
    text: "--color-ink",
    secondary: "--color-slate",
  };
  for (const [name, token] of Object.entries(schema.theme?.tokens || {})) {
    let color = token.editable
      ? value("theme." + name) || token.default
      : token.default;
    if (!/^#[0-9a-f]{6}$/i.test(color)) continue;
    if (["primary", "accent"].includes(name) && contrastOnWhite(color) < 4.5)
      color = token.default;
    document.documentElement.style.setProperty(
      tokens[name] || "--theme-" + name,
      color,
    );
    document.documentElement.style.setProperty("--" + name, color);
  }
  document.querySelectorAll("[data-optional-band]").forEach((band) => {
    const sections = Array.from(band.querySelectorAll("[data-section]"));
    band.hidden = sections.length > 0 && sections.every((node) => node.hidden);
  });
  document
    .querySelectorAll(".brand")
    .forEach((node) =>
      node.setAttribute(
        "aria-label",
        String(value("business.name") || schema.name) + ", beranda",
      ),
    );
  renderCollections();
  document.title = String(value("seo.title") || schema.name);
  meta("description", value("seo.description"));
  meta("og:title", value("seo.title"), true);
  meta("og:description", value("seo.description"), true);
  const og = value("seo.ogImage");
  meta("og:image", safeURL(typeof og === "string" ? og : og?.src, true), true);
  window.PAGIVERSE_DATA = configuration;
  commerce?.applyConfiguration(configuration, schema);
  renderedConfiguration = signature;
  rendering = false;
}
window.addEventListener("message", (event) => {
  const payload = event.data;
  if (
    event.source !== window.parent ||
    event.origin !== location.origin ||
    payload?.type !== "pagiverse:config" ||
    payload.templateId !== "nusa-computer-001"
  )
    return;
  if (!schema || !commerce) {
    pending = {
      configuration: payload.configuration,
      revision: payload.revision,
    };
    return;
  }
  configuration =
    payload.configuration &&
    typeof payload.configuration === "object" &&
    !Array.isArray(payload.configuration)
      ? payload.configuration
      : {};
  render();
  window.parent.postMessage(
    {
      type: "pagiverse:applied",
      templateId: schema.id,
      revision: payload.revision,
    },
    location.origin,
  );
});
try {
  const response = await fetch(new URL("template.json", import.meta.url), {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Template schema unavailable");
  schema = await response.json();
  window.PAGIVERSE_MANIFEST = schema;
  render();
  commerce = await import("./assets/runtime/commerce.js");
  commerce.applyConfiguration(configuration, schema);
  await import("./assets/runtime/app.js");
  if (pending) {
    configuration =
      pending.configuration && typeof pending.configuration === "object"
        ? pending.configuration
        : {};
    render();
    window.parent.postMessage(
      {
        type: "pagiverse:applied",
        templateId: schema.id,
        revision: pending.revision,
      },
      location.origin,
    );
    pending = undefined;
  }
  if (window.parent !== window)
    window.parent.postMessage(
      { type: "pagiverse:ready", templateId: schema.id },
      location.origin,
    );
  window.PagiverseTemplate = Object.freeze({
    id: schema.id,
    getValue: (field) => value(field),
  });
} catch (error) {
  console.error("NUSA template initialization failed", error);
}
