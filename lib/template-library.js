import catalog from "@/lib/template-catalog.generated.json";

const CATEGORY_LABELS = {
  restaurant: { id: "Restoran", en: "Restaurant" },
  cafe: { id: "Kafe", en: "Cafe" },
  hospitality: { id: "Hospitality", en: "Hospitality" },
  retail: { id: "Retail", en: "Retail" },
  services: { id: "Jasa", en: "Services" },
  "business-consulting": { id: "Konsultan Bisnis", en: "Business Consulting" },
};

export const TEMPLATE_COLLECTION_GROUPS = [
  {
    id: "restaurant",
    label: { id: "Website Restoran", en: "Restaurant Websites" },
    description: {
      id: "Template untuk restoran, rumah makan, dan pengalaman kuliner.",
      en: "Templates for restaurants, dining venues, and culinary experiences.",
    },
    categories: ["restaurant", "cafe"],
  },
  {
    id: "company-profile",
    label: { id: "Website Company Profile", en: "Company Profile Websites" },
    description: {
      id: "Template untuk firma, konsultan, dan bisnis jasa profesional.",
      en: "Templates for firms, consultancies, and professional service businesses.",
    },
    categories: ["services", "business-consulting"],
  },
];

const GROUP_LABELS = {
  business: { id: "Identitas bisnis", en: "Business identity" },
  theme: { id: "Warna", en: "Colors" },
  navigation: { id: "Navigasi", en: "Navigation" },
  contact: { id: "Kontak", en: "Contact" },
  location: { id: "Lokasi", en: "Location" },
  social: { id: "Media sosial", en: "Social media" },
  seo: { id: "SEO", en: "SEO" },
};

export const TEMPLATE_LIBRARY = catalog.templates;

export const TEMPLATE_CATEGORIES = [
  { id: "all", label: { id: "Semua", en: "All" } },
  ...Array.from(new Set(TEMPLATE_LIBRARY.map((template) => template.category))).map((id) => ({
    id,
    label: CATEGORY_LABELS[id] || { id, en: id },
  })),
];

export function getTemplateById(id) {
  return TEMPLATE_LIBRARY.find((template) => template.id === id);
}

export function getTemplateDescription(template, lang = "id") {
  if (!template) return "";
  if (typeof template.description === "object") return template.description[lang] || template.description.id || "";
  return lang === "en" && template.descriptionEn ? template.descriptionEn : template.description;
}

export function getTemplateCategoryLabel(template, lang = "id") {
  if (!template) return "";
  const label = template.categoryLabel || CATEGORY_LABELS[template.category];
  if (typeof label === "string") return label;
  return label?.[lang] || label?.id || template.category;
}

export function getTemplateCollectionGroup(template) {
  return TEMPLATE_COLLECTION_GROUPS.find((group) => group.categories.includes(template?.category));
}

export function getTemplateThumbnail(template) {
  return `${template.publicPath}/${template.thumbnail}`;
}

export function getTemplateEntry(template) {
  return `${template.publicPath}/${template.entry}`;
}

export function getFieldLabel(field, lang = "id", fallback = "") {
  if (typeof field?.label === "object") return field.label[lang] || field.label.id || fallback;
  return field?.label || fallback;
}

export function getTemplateFields(template) {
  return Object.entries(template?.fields || {}).map(([key, descriptor]) => ({
    ...descriptor,
    key,
    group: descriptor.group || inferFieldGroup(key),
  }));
}

export function buildDefaultConfig(template) {
  const defaults = Object.fromEntries(
    getTemplateFields(template)
      .filter((field) => field.default !== undefined)
      .map((field) => [field.key, structuredCloneValue(field.default)]),
  );
  for (const section of template?.sections || []) {
    if (!section.required) defaults[`sectionVisibility.${section.id}`] = section.visibleByDefault !== false;
  }
  return defaults;
}

export function getEditorGroups(template) {
  const sections = new Map((template?.sections || []).map((section) => [section.id, section.label]));
  const ids = [];
  for (const field of getTemplateFields(template)) {
    if (!ids.includes(field.group)) ids.push(field.group);
  }
  for (const section of template?.sections || []) {
    if (!section.required && !ids.includes(`visibility-${section.id}`)) ids.push(`visibility-${section.id}`);
  }
  return ids.map((id) => {
    if (id.startsWith("visibility-")) {
      const sectionId = id.slice("visibility-".length);
      const sectionLabel = sections.get(sectionId) || sectionId;
      return { id, label: { id: `Tampilan ${sectionLabel}`, en: `${sectionLabel} visibility` }, visibilitySection: sectionId };
    }
    return { id, label: GROUP_LABELS[id] || { id: sections.get(id) || humanize(id), en: sections.get(id) || humanize(id) } };
  });
}

export function fieldHasValue(field, value) {
  if (field.type === "array") return Array.isArray(value) && value.length >= (field.minItems || 0);
  if (field.type === "image") return Boolean(typeof value === "string" ? value : value?.src);
  if (field.type === "boolean") return typeof value === "boolean";
  return String(value ?? "").trim().length > 0;
}

export function sanitizeTemplateConfiguration(template, value) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const result = {};
  for (const field of getTemplateFields(template)) {
    if (!Object.prototype.hasOwnProperty.call(source, field.key)) continue;
    const sanitized = sanitizeValue(field, source[field.key]);
    if (sanitized !== undefined) result[field.key] = sanitized;
  }
  for (const section of template?.sections || []) {
    if (section.required) continue;
    const key = `sectionVisibility.${section.id}`;
    if (typeof source[key] === "boolean") result[key] = source[key];
  }
  return result;
}

function inferFieldGroup(key) {
  const [namespace, sectionId] = key.split(".");
  if (namespace === "sections") return sectionId || "content";
  return namespace || "content";
}

function humanize(value) {
  return String(value)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/^./, (character) => character.toUpperCase());
}

function structuredCloneValue(value) {
  return value && typeof value === "object" ? JSON.parse(JSON.stringify(value)) : value;
}

export function getStructuredValue(source, path) {
  if (!source || typeof source !== "object") return undefined;
  if (Object.prototype.hasOwnProperty.call(source, path)) return source[path];
  return path.split(".").reduce((value, key) => value && typeof value === "object" ? value[key] : undefined, source);
}

export function setStructuredValue(source, path, value) {
  const result = structuredCloneValue(source && typeof source === "object" ? source : {});
  const keys = path.split(".");
  let target = result;
  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      target[key] = value;
      return;
    }
    if (!target[key] || typeof target[key] !== "object" || Array.isArray(target[key])) target[key] = {};
    target = target[key];
  });
  return result;
}

function sanitizeValue(field, value) {
  if (field.type === "boolean") return typeof value === "boolean" ? value : undefined;
  if (field.type === "array") {
    if (!Array.isArray(value)) return undefined;
    const maximum = Math.max(field.minItems || 0, field.maxItems || 24);
    return value.slice(0, maximum).map((item) => sanitizeArrayItem(field.item, item)).filter(Boolean);
  }
  if (field.type === "image") return sanitizeImage(value, field);
  if (field.type === "color") return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value : undefined;
  if (field.type === "select") {
    const allowed = (field.options || []).map((option) => typeof option === "string" ? option : option.value);
    return allowed.includes(value) ? value : undefined;
  }
  if (typeof value !== "string") return undefined;
  const limit = field.maxLength || (field.type === "textarea" ? 5000 : 500);
  const text = value.trim().slice(0, limit);
  if (field.type === "phone") return text.replace(/[^0-9+\-\s()]/g, "").slice(0, limit);
  if (field.type === "url") {
    try {
      const url = new URL(text);
      const allowed = field.allowedProtocols || ["https:"];
      return allowed.includes(url.protocol) ? url.href : undefined;
    } catch {
      return undefined;
    }
  }
  return text;
}

function sanitizeArrayItem(itemSchema, value) {
  if (!itemSchema?.fields || !value || typeof value !== "object" || Array.isArray(value)) return undefined;
  let result = {};
  for (const [key, descriptor] of Object.entries(itemSchema.fields)) {
    const sanitized = sanitizeValue(descriptor, getStructuredValue(value, key));
    if (sanitized !== undefined) result = setStructuredValue(result, key, sanitized);
  }
  return result;
}

function sanitizeImage(value, field) {
  const scalar = typeof value === "string";
  const source = scalar ? { src: value } : value;
  if (!source || typeof source !== "object" || Array.isArray(source)) return undefined;
  const src = String(source.src || "").trim();
  const isSafeData = /^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(src);
  const isSafeAsset = /^(?:\.\/)?assets\/[a-z0-9._/-]+$/i.test(src) && !src.split("/").includes("..");
  let isSafeRemote = false;
  try {
    isSafeRemote = ["https:", "http:"].includes(new URL(src).protocol);
  } catch {}
  if (src && !isSafeData && !isSafeAsset && !isSafeRemote) return undefined;
  if (scalar) return src;

  const fallback = field.default && typeof field.default === "object" ? field.default : {};
  const focalPoint = source.focalPoint && typeof source.focalPoint === "object" ? source.focalPoint : fallback.focalPoint;
  return {
    src,
    altId: String(source.altId || fallback.altId || "").slice(0, 180),
    altEn: String(source.altEn || fallback.altEn || "").slice(0, 180),
    focalPoint: {
      x: Math.min(100, Math.max(0, Number(focalPoint?.x) || 50)),
      y: Math.min(100, Math.max(0, Number(focalPoint?.y) || 50)),
    },
  };
}

export function formatTemplatePrice(price, lang = "id") {
  if (!Number.isFinite(price)) return "";
  if (lang === "id") return `Rp${new Intl.NumberFormat("id-ID").format(price)}`;
  return new Intl.NumberFormat(lang === "id" ? "id-ID" : "en-US", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
}
