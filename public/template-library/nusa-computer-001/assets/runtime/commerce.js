import {
  products,
  productById,
  productDefaults,
  replaceProducts,
} from "./products.js";
import * as storeConfig from "./settings.js";

const settings = storeConfig.settings || storeConfig.default || {};
const CART_KEY = "nusa-computer-001-cart-v1";
const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});
const money = (value) => currency.format(value);
const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
const owns = (object, key) =>
  object !== null &&
  typeof object === "object" &&
  Object.prototype.hasOwnProperty.call(object, key);
let commerceConfiguration = {};
let commerceSchema = null;
let currentProductId = "";
function ownPath(object, path) {
  const parts = path.split(".");
  if (
    parts.some((part) =>
      ["__proto__", "constructor", "prototype"].includes(part),
    )
  )
    return undefined;
  if (owns(object, path)) return object[path];
  let current = object;
  for (const part of parts) {
    if (!owns(current, part)) return undefined;
    current = current[part];
  }
  return current;
}
function fieldValue(path, fallback) {
  const configured = ownPath(commerceConfiguration, path);
  if (configured !== undefined) return configured;
  const fields =
    commerceSchema && owns(commerceSchema, "fields")
      ? commerceSchema.fields
      : {};
  const descriptor = owns(fields, path)
    ? fields[path]
    : storeConfig.commerceTextFields?.[path];
  return owns(descriptor, "default") ? descriptor.default : fallback;
}
function text(path, fallback = "") {
  const value = fieldValue(path, fallback);
  const descriptor = storeConfig.commerceTextFields?.[path];
  return typeof value === "string" || typeof value === "number"
    ? String(value)
        .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
        .slice(0, descriptor?.maxLength || 240)
    : fallback;
}
const ui = (name, fallback = "") =>
  escapeHtml(text("sections.products.ui." + name, fallback));
const cartText = (name, fallback = "") =>
  escapeHtml(text("sections.about.cart." + name, fallback));
const builderText = (name, fallback = "") =>
  escapeHtml(text("sections.about.builder." + name, fallback));
function imageMarkup(product, width, height, lazy = false) {
  const image = product.image;
  const style =
    "object-fit:" +
    image.crop +
    ";object-position:" +
    image.focalPoint.x +
    "% " +
    image.focalPoint.y +
    "%";
  return (
    '<img src="' +
    escapeHtml(image.src) +
    '" alt="' +
    escapeHtml(image.alt || product.name) +
    '" style="' +
    escapeHtml(style) +
    '" ' +
    (lazy ? 'loading="lazy" ' : "") +
    'width="' +
    width +
    '" height="' +
    height +
    '">'
  );
}
const normalizeQty = (value) =>
  Math.min(99, Math.max(1, Math.floor(Number(value) || 1)));
let cart = [];
let category = "all";
let shopperName = "";
let build = {
  cpu: "",
  motherboard: "",
  ram: "",
  gpu: "",
  storage: "",
  psu: "",
  case: "",
};
const slots = [
  { key: "cpu", title: "Prosesor", required: true },
  { key: "motherboard", title: "Motherboard", required: true },
  { key: "ram", title: "Memori", required: true },
  { key: "gpu", title: "Kartu grafis", required: false },
  { key: "storage", title: "Penyimpanan", required: true },
  { key: "psu", title: "Catu daya", required: true },
  { key: "case", title: "Casing", required: true },
];
const dialogIds = ["product-dialog", "cart-dialog", "builder-dialog"];
const live = document.createElement("div");
live.className = "commerce-sr-only";
live.setAttribute("role", "status");
live.setAttribute("aria-live", "polite");
document.body.append(live);
function announce(message) {
  live.textContent = "";
  requestAnimationFrame(() => {
    live.textContent = message;
  });
}
function restoreCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    if (!Array.isArray(saved)) return;
    const merged = new Map();
    saved.slice(0, 100).forEach((item) => {
      if (
        !item ||
        !productById.has(item.id) ||
        !Number.isFinite(Number(item.qty)) ||
        Number(item.qty) < 1
      )
        return;
      merged.set(
        item.id,
        Math.min(99, (merged.get(item.id) || 0) + normalizeQty(item.qty)),
      );
    });
    cart = Array.from(merged, ([id, qty]) => ({ id, qty }));
  } catch {
    cart = [];
  }
}
function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    /* Cart remains available for this visit. */
  }
  updateCartCount();
}
function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = String(count);
  });
  document
    .querySelectorAll("[data-open-cart]")
    .forEach((el) =>
      el.setAttribute("aria-label", "Buka keranjang, " + count + " barang"),
    );
}
function addItems(ids) {
  ids.forEach((id) => {
    if (!productById.has(id)) return;
    const existing = cart.find((item) => item.id === id);
    if (existing) existing.qty = Math.min(99, existing.qty + 1);
    else cart.push({ id, qty: 1 });
  });
  saveCart();
}
function openDialog(id) {
  dialogIds.forEach((other) => {
    const el = document.getElementById(other);
    if (other !== id && el?.open) el.close();
  });
  const dialog = document.getElementById(id);
  if (dialog && !dialog.open) dialog.showModal();
}
function renderCatalog() {
  const grid = document.getElementById("catalog-grid");
  if (!grid) return;
  const query = (document.getElementById("catalog-search")?.value || "")
    .trim()
    .toLocaleLowerCase("id-ID");
  const sort = document.getElementById("catalog-sort")?.value || "featured";
  const visible = products.filter(
    (product) =>
      (category === "all" || product.category === category) &&
      [product.name, product.category, product.spec]
        .join(" ")
        .toLocaleLowerCase("id-ID")
        .includes(query),
  );
  if (["price-asc", "price-low", "lowest"].includes(sort))
    visible.sort((a, b) => a.price - b.price);
  if (["price-desc", "price-high", "highest"].includes(sort))
    visible.sort((a, b) => b.price - a.price);
  if (sort === "name")
    visible.sort((a, b) => a.name.localeCompare(b.name, "id"));
  const count = document.getElementById("catalog-count");
  if (count)
    count.textContent =
      visible.length + " " + text("sections.products.ui.productUnit", "produk");
  grid.innerHTML = visible.length
    ? visible
        .map(
          (product) =>
            '<article class="product-card"><button class="product-media" type="button" data-detail="' +
            escapeHtml(product.id) +
            '" aria-label="Lihat ' +
            escapeHtml(product.name) +
            '">' +
            imageMarkup(product, 520, 420, true) +
            '</button><div class="product-card-body"><p class="product-category">' +
            escapeHtml(product.category) +
            (product.tag
              ? ' <span class="product-tag">' +
                escapeHtml(product.tag) +
                "</span>"
              : "") +
            '</p><h3><button type="button" class="product-title" data-detail="' +
            escapeHtml(product.id) +
            '">' +
            escapeHtml(product.name) +
            '</button></h3><p class="product-spec">' +
            escapeHtml(product.spec) +
            '</p><p class="product-price">' +
            money(product.price) +
            '</p><div class="product-actions"><button type="button" class="commerce-primary" data-add="' +
            escapeHtml(product.id) +
            '" aria-label="Tambah ' +
            escapeHtml(product.name) +
            ' ke keranjang">' +
            ui("add", "Tambah") +
            '</button><button type="button" class="commerce-link" data-detail="' +
            escapeHtml(product.id) +
            '">' +
            ui("detail", "Lihat detail") +
            ' <span aria-hidden="true">↗</span></button></div></div></article>',
        )
        .join("")
    : '<div class="catalog-empty"><h3>' +
      ui("emptyHeading", "Belum menemukan yang cocok.") +
      "</h3><p>" +
      ui("emptyBody", "Coba kata kunci lain atau lihat semua kategori.") +
      '</p><button type="button" class="commerce-link" data-reset-catalog>' +
      ui("reset", "Reset pencarian") +
      "</button></div>";
}
function showProduct(id) {
  const product = productById.get(id);
  const content = document.getElementById("product-content");
  if (!product || !content) return;
  currentProductId = id;
  content.innerHTML =
    '<div class="detail-layout"><div class="detail-media">' +
    imageMarkup(product, 680, 600) +
    '</div><div class="detail-copy"><p class="commerce-eyebrow">' +
    escapeHtml(product.category) +
    "</p><h2>" +
    escapeHtml(product.name) +
    '</h2><p class="detail-description">' +
    escapeHtml(product.description) +
    '</p><ul class="detail-specs">' +
    product.details
      .map((detail) => "<li>" + escapeHtml(detail) + "</li>")
      .join("") +
    '</ul><p class="detail-price">' +
    money(product.price) +
    '</p><p class="commerce-note">' +
    ui(
      "demoNote",
      "Harga dan konfigurasi demo. Konfirmasi produk akhir dengan toko.",
    ) +
    (product.illustration
      ? " " + ui("illustrationNote", "Gambar merupakan ilustrasi visual.")
      : "") +
    '</p><button type="button" class="commerce-primary" data-add="' +
    escapeHtml(product.id) +
    '">' +
    ui("addToCart", "Tambah ke keranjang") +
    "</button></div></div>";
  openDialog("product-dialog");
}
function totalCart() {
  return cart.reduce(
    (sum, item) => sum + (productById.get(item.id)?.price || 0) * item.qty,
    0,
  );
}
function orderSummary() {
  const lines = [
    text("sections.about.cart.summaryPrefix", "PESANAN") +
      " " +
      settings.storeName.toLocaleUpperCase("id-ID"),
    "",
  ];
  if (shopperName.trim())
    lines.push("Nama: " + shopperName.trim().replace(/[\r\n]+/g, " "), "");
  cart.forEach((item, index) => {
    const product = productById.get(item.id);
    if (product)
      lines.push(
        index + 1 + ". " + product.name,
        "   " +
          item.qty +
          " × " +
          money(product.price) +
          " = " +
          money(product.price * item.qty),
      );
  });
  lines.push(
    "",
    text("sections.about.cart.subtotal", "Subtotal") +
      ": " +
      money(totalCart()),
    "",
    text(
      "sections.about.cart.summaryNote",
      "Harga demo. Ongkir, ketersediaan, dan konfigurasi akhir perlu dikonfirmasi dengan toko.",
    ),
    "Ringkasan ini belum mengirim atau mengonfirmasi pesanan.",
  );
  return lines.join("\n");
}
function configuredWhatsapp() {
  const number = String(settings.whatsapp || "").replace(/[+\s()-]/g, "");
  return /^[1-9]\d{7,14}$/.test(number) ? number : "";
}
function refreshSummary() {
  const textarea = document.getElementById("order-summary");
  if (textarea) textarea.value = orderSummary();
  const wa = document.getElementById("whatsapp-order");
  if (wa)
    wa.href =
      "https://wa.me/" +
      configuredWhatsapp() +
      "?text=" +
      encodeURIComponent(orderSummary());
}
function renderCart(focusSelector) {
  const content = document.getElementById("cart-content");
  if (!content) return;
  if (!cart.length) {
    content.innerHTML =
      '<div class="cart-heading"><p class="commerce-eyebrow">' +
      cartText("eyebrow") +
      "</p><h2>" +
      cartText("heading") +
      '</h2></div><div class="cart-empty"><h3>' +
      cartText("emptyHeading") +
      "</h3><p>" +
      cartText("emptyBody") +
      '</p><button type="button" class="commerce-primary" data-close>' +
      cartText("explore") +
      '</button></div><p id="cart-status" class="commerce-status" role="status" aria-live="polite"></p>';
    requestAnimationFrame(() => content.querySelector("[data-close]")?.focus());
    return;
  }
  const number = configuredWhatsapp();
  const items = cart
    .map((item) => {
      const product = productById.get(item.id);
      if (!product) return "";
      const id = escapeHtml(product.id),
        name = escapeHtml(product.name);
      return (
        '<article class="cart-item"><div class="cart-item-media">' +
        imageMarkup(product, 160, 140) +
        '</div><div class="cart-item-copy"><h3>' +
        name +
        "</h3><p>" +
        money(product.price) +
        '</p><div class="cart-item-actions"><div class="quantity-control"><button type="button" data-qty="' +
        id +
        '" data-step="-1" aria-label="Kurangi jumlah ' +
        name +
        '" ' +
        (item.qty === 1 ? "disabled" : "") +
        '>−</button><input type="number" inputmode="numeric" min="1" max="99" step="1" value="' +
        item.qty +
        '" data-quantity="' +
        id +
        '" aria-label="Jumlah ' +
        name +
        '"><button type="button" data-qty="' +
        id +
        '" data-step="1" aria-label="Tambah jumlah ' +
        name +
        '" ' +
        (item.qty === 99 ? "disabled" : "") +
        '>+</button></div><button type="button" class="commerce-link remove-link" data-remove="' +
        id +
        '" aria-label="Hapus ' +
        name +
        '">' +
        cartText("remove") +
        '</button></div></div><p class="cart-line-total">' +
        money(product.price * item.qty) +
        "</p></article>"
      );
    })
    .join("");
  const waUrl = escapeHtml(
    "https://wa.me/" + number + "?text=" + encodeURIComponent(orderSummary()),
  );
  content.innerHTML =
    '<div class="cart-heading"><p class="commerce-eyebrow">' +
    cartText("eyebrow") +
    "</p><h2>" +
    cartText("heading") +
    "</h2><p>" +
    cartText("description") +
    '</p></div><div class="cart-layout"><div class="cart-items">' +
    items +
    '<button type="button" class="commerce-link cart-clear" data-clear-cart>' +
    cartText("clear") +
    '</button></div><aside class="order-panel"><div class="subtotal-row"><span>' +
    cartText("subtotal") +
    "</span><strong>" +
    money(totalCart()) +
    '</strong></div><p class="commerce-note">' +
    cartText("priceNote") +
    '</p><label class="commerce-label" for="shopper-name">' +
    cartText("shopperName") +
    " <span>(" +
    cartText("optional") +
    ')</span></label><input id="shopper-name" class="commerce-input" maxlength="80" autocomplete="name" placeholder="' +
    cartText("namePlaceholder") +
    '" value="' +
    escapeHtml(shopperName) +
    '"><label class="commerce-label" for="order-summary">' +
    cartText("summary") +
    '</label><textarea id="order-summary" class="order-summary" readonly rows="9" spellcheck="false">' +
    escapeHtml(orderSummary()) +
    '</textarea><div class="summary-actions">' +
    (number
      ? '<a id="whatsapp-order" class="commerce-primary" href="' +
        waUrl +
        '" target="_blank" rel="noopener">' +
        cartText("whatsapp") +
        "</a>"
      : '<button type="button" class="commerce-primary" data-copy-order>' +
        cartText("copy") +
        "</button>") +
    '<button type="button" class="commerce-link" data-download-order>' +
    cartText("download") +
    "</button>" +
    (number
      ? '<button type="button" class="commerce-link" data-copy-order>' +
        cartText("copy") +
        "</button>"
      : "") +
    '</div><p class="commerce-note">' +
    (number
      ? "Pesanan baru terkirim setelah kamu mengirim pesan di WhatsApp."
      : "Nomor WhatsApp toko belum diatur. Salin atau unduh pesanan untuk disimpan.") +
    '</p><p id="cart-status" class="commerce-status" role="status" aria-live="polite"></p></aside></div>';
  if (focusSelector)
    requestAnimationFrame(() => {
      const el = content.querySelector(focusSelector);
      if (el && !el.disabled) el.focus();
    });
}
function showCart() {
  renderCart();
  openDialog("cart-dialog");
}
async function copyOrder() {
  const textarea = document.getElementById("order-summary");
  let copied = false;
  try {
    await navigator.clipboard.writeText(orderSummary());
    copied = true;
  } catch {
    if (textarea) {
      textarea.focus();
      textarea.select();
      try {
        copied = document.execCommand("copy");
      } catch {
        copied = false;
      }
    }
  }
  const status = document.getElementById("cart-status");
  if (status)
    status.textContent = copied
      ? "Ringkasan pesanan disalin."
      : "Teks sudah dipilih. Tekan Ctrl+C atau gunakan Unduh .txt.";
}
function downloadOrder() {
  const url = URL.createObjectURL(
    new Blob([orderSummary()], { type: "text/plain;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "pesanan-nusa-computer.txt";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  const status = document.getElementById("cart-status");
  if (status) status.textContent = "Ringkasan pesanan diunduh.";
}
function inspectBuild() {
  const chosen = slots
    .map((slot) => productById.get(build[slot.key]))
    .filter((product, index) => product?.component?.type === slots[index].key);
  const missing = slots.filter(
    (slot) =>
      slot.required &&
      productById.get(build[slot.key])?.component?.type !== slot.key,
  );
  const cpu = productById.get(build.cpu)?.component;
  const board = productById.get(build.motherboard)?.component;
  const ram = productById.get(build.ram)?.component;
  const gpu = productById.get(build.gpu)?.component;
  const psu = productById.get(build.psu)?.component;
  const enclosure = productById.get(build.case)?.component;
  const errors = [];
  if (cpu && board && cpu.socket !== board.socket)
    errors.push("Soket prosesor dan motherboard berbeda.");
  if (ram && board && ram.memory !== board.memory)
    errors.push(
      "Memori " +
        ram.memory +
        " tidak cocok dengan motherboard " +
        board.memory +
        ". Pilih DDR5.",
    );
  if (board && enclosure && !enclosure.formats.includes(board.format))
    errors.push("Ukuran motherboard tidak didukung casing.");
  if (psu && enclosure && !enclosure.psuFormats.includes(psu.format))
    errors.push("Ukuran catu daya tidak didukung casing.");
  if (gpu && enclosure && gpu.length > enclosure.clearance)
    errors.push("Kartu grafis lebih panjang dari ruang casing.");
  if (cpu && !cpu.integrated && !gpu)
    errors.push("Prosesor ini membutuhkan kartu grafis.");
  const power = chosen.reduce(
    (sum, product) => sum + (product.component?.power || 0),
    40,
  );
  const recommended = Math.max(
    Math.ceil(power * 1.3),
    gpu?.recommendedPsu || 0,
  );
  if (psu && psu.watts < recommended)
    errors.push(
      "Catu daya minimal " + recommended + " W diperlukan untuk pilihan ini.",
    );
  return {
    chosen,
    missing,
    errors,
    power,
    recommended,
    total: chosen.reduce((sum, product) => sum + product.price, 0),
    valid: missing.length === 0 && errors.length === 0,
  };
}
function applyPreset(preset) {
  build = {
    cpu: "ryzen-7600",
    motherboard: "msi-b650mp",
    ram: "kingston-ddr5",
    gpu: preset === "gaming" ? "rtx-4060" : "",
    storage: "samsung-990evo",
    psu: "nusa-psu-650",
    case: "nusa-case",
  };
  pruneBuild();
}
function renderBuilder(focusSlot) {
  const content = document.getElementById("builder-content");
  if (!content) return;
  const result = inspectBuild();
  const feedback = result.errors.length
    ? "<h3>Perlu disesuaikan</h3><ul>" +
      result.errors
        .map((error) => "<li>" + escapeHtml(error) + "</li>")
        .join("") +
      "</ul>"
    : result.missing.length
      ? "<h3>Mulai pilih komponenmu.</h3><p>Lengkapi " +
        result.missing.length +
        " komponen wajib untuk memeriksa rakitan.</p>"
      : "<h3>Pemeriksaan dasar sesuai</h3><p>Soket, memori, ukuran casing, ruang GPU, dan perkiraan daya sesuai dengan data demo.</p>";
  const fields = slots
    .map(
      (slot, index) =>
        '<div class="builder-field"><label for="build-' +
        slot.key +
        '"><span class="builder-number">' +
        String(index + 1).padStart(2, "0") +
        "</span><span>" +
        escapeHtml(slot.title) +
        " <small>" +
        (slot.required ? "Wajib" : "Opsional") +
        '</small></span></label><select id="build-' +
        slot.key +
        '" data-build-slot="' +
        slot.key +
        '"><option value="">' +
        (slot.required
          ? "Pilih " + escapeHtml(slot.title.toLowerCase())
          : "Gunakan grafis terintegrasi") +
        "</option>" +
        products
          .filter((product) => product.component?.type === slot.key)
          .map(
            (product) =>
              '<option value="' +
              escapeHtml(product.id) +
              '" ' +
              (build[slot.key] === product.id ? "selected" : "") +
              ">" +
              escapeHtml(product.name) +
              " / " +
              money(product.price) +
              "</option>",
          )
          .join("") +
        "</select></div>",
    )
    .join("");
  content.innerHTML =
    '<div class="builder-heading"><p class="commerce-eyebrow">' +
    builderText("eyebrow") +
    "</p><h2>" +
    builderText("heading") +
    "</h2><p>" +
    builderText("description") +
    '</p><div class="builder-presets"><button type="button" class="commerce-link" data-preset="office">' +
    builderText("officePreset") +
    ' ↗</button><button type="button" class="commerce-link" data-preset="gaming">' +
    builderText("gamingPreset") +
    ' ↗</button></div></div><div class="builder-layout"><div class="builder-fields">' +
    fields +
    '</div><aside class="build-summary"><p class="commerce-eyebrow">' +
    builderText("summaryHeading") +
    '</p><div class="build-total">' +
    money(result.total) +
    '</div><p class="commerce-note">' +
    builderText("priceNote") +
    '</p><div id="builder-feedback" class="builder-feedback ' +
    (result.errors.length ? "has-errors" : "") +
    '" role="status" aria-live="polite">' +
    feedback +
    "</div>" +
    (result.chosen.length
      ? '<p class="build-power">Perkiraan konsumsi <strong>' +
        result.power +
        " W</strong><br>Patokan catu daya <strong>≥ " +
        result.recommended +
        " W</strong></p>"
      : "") +
    '<p class="commerce-note">Simulasi mengasumsikan CPU versi boks dengan pendingin bawaan dan PSU ATX. Toko tetap perlu meninjau BIOS, konektor, pendinginan, dimensi detail, dan ketersediaan sebelum perakitan.</p><button type="button" class="commerce-primary build-add" data-add-build ' +
    (!result.valid ? "disabled" : "") +
    ">" +
    builderText("add") +
    '</button><button type="button" class="commerce-link" data-reset-build>' +
    builderText("reset") +
    '</button><p class="commerce-note build-cart-note">' +
    builderText("cartNote") +
    "</p></aside></div>";
  if (focusSlot)
    requestAnimationFrame(() =>
      content.querySelector('[data-build-slot="' + focusSlot + '"]')?.focus(),
    );
}
function showBuilder(preset) {
  if (preset) applyPreset(preset);
  renderBuilder();
  openDialog("builder-dialog");
}

function pruneBuild() {
  slots.forEach((slot) => {
    if (productById.get(build[slot.key])?.component?.type !== slot.key)
      build[slot.key] = "";
  });
}

export function applyConfiguration(configuration = {}, schema = null) {
  commerceConfiguration =
    configuration &&
    typeof configuration === "object" &&
    !Array.isArray(configuration)
      ? configuration
      : {};
  commerceSchema = schema && typeof schema === "object" ? schema : null;
  const active = document.activeElement;
  let focusSelector = "";
  if (active?.id && /^[a-zA-Z0-9_-]+$/.test(active.id))
    focusSelector = "#" + active.id;
  else if (
    active?.matches?.(
      "[data-quantity],[data-qty],[data-remove],[data-add],[data-detail]",
    )
  ) {
    for (const attribute of [
      "data-quantity",
      "data-qty",
      "data-remove",
      "data-add",
      "data-detail",
    ]) {
      const value = active.getAttribute(attribute);
      if (value && /^[a-zA-Z0-9_-]+$/.test(value)) {
        focusSelector = "[" + attribute + '="' + value + '"]';
        break;
      }
    }
  }
  const selection =
    typeof active?.selectionStart === "number"
      ? { start: active.selectionStart, end: active.selectionEnd }
      : null;
  const items = fieldValue("sections.products.items", productDefaults());
  replaceProducts(Array.isArray(items) ? items : productDefaults());
  storeConfig.setStoreSettings({
    whatsapp: fieldValue("contact.whatsapp", ""),
    storeName: fieldValue("business.name", "NUSA Computer"),
  });
  cart = cart.filter((item) => productById.has(item.id));
  pruneBuild();
  saveCart();
  renderCatalog();
  if (document.getElementById("cart-dialog")?.open) renderCart();
  if (document.getElementById("builder-dialog")?.open) renderBuilder();
  if (document.getElementById("product-dialog")?.open) {
    if (productById.has(currentProductId)) showProduct(currentProductId);
    else document.getElementById("product-dialog").close();
  }
  if (focusSelector)
    requestAnimationFrame(() => {
      const next = document.querySelector(focusSelector);
      if (next && !next.disabled) {
        next.focus({ preventScroll: true });
        if (selection && typeof next.setSelectionRange === "function")
          try {
            next.setSelectionRange(selection.start, selection.end);
          } catch {}
      }
    });
}

document
  .getElementById("catalog-search")
  ?.addEventListener("input", renderCatalog);
document
  .getElementById("catalog-sort")
  ?.addEventListener("change", renderCatalog);
document.addEventListener("click", (event) => {
  const button = event.target.closest("button,a");
  if (!button) return;
  if (button.hasAttribute("data-close")) {
    button.closest("dialog")?.close();
    return;
  }
  if (button.hasAttribute("data-category")) {
    category = button.dataset.category;
    document.querySelectorAll("[data-category]").forEach((el) => {
      const active = el.dataset.category === category;
      el.classList.toggle("is-active", active);
      el.classList.toggle("active", active);
      if (el.tagName === "BUTTON")
        el.setAttribute("aria-pressed", String(active));
    });
    renderCatalog();
    return;
  }
  if (button.hasAttribute("data-reset-catalog")) {
    category = "all";
    const input = document.getElementById("catalog-search");
    if (input) input.value = "";
    document.querySelectorAll("[data-category]").forEach((el) => {
      const active = el.dataset.category === "all";
      el.classList.toggle("is-active", active);
      el.classList.toggle("active", active);
      if (el.tagName === "BUTTON")
        el.setAttribute("aria-pressed", String(active));
    });
    renderCatalog();
    return;
  }
  if (button.dataset.detail) {
    showProduct(button.dataset.detail);
    return;
  }
  if (button.dataset.add) {
    const product = productById.get(button.dataset.add);
    if (!product) return;
    addItems([product.id]);
    announce(product.name + " ditambahkan ke keranjang.");
    const old = button.textContent;
    button.textContent = "Ditambahkan";
    setTimeout(() => {
      if (button.isConnected) button.textContent = old;
    }, 1200);
    return;
  }
  if (button.hasAttribute("data-open-cart")) {
    showCart();
    return;
  }
  if (button.dataset.preset) {
    showBuilder(button.dataset.preset);
    return;
  }
  if (button.hasAttribute("data-open-builder")) {
    showBuilder();
    return;
  }
  if (button.dataset.qty) {
    const item = cart.find((item) => item.id === button.dataset.qty);
    if (!item) return;
    item.qty = normalizeQty(item.qty + Number(button.dataset.step));
    saveCart();
    renderCart('[data-quantity="' + item.id + '"]');
    return;
  }
  if (button.dataset.remove) {
    cart = cart.filter((item) => item.id !== button.dataset.remove);
    saveCart();
    renderCart();
    requestAnimationFrame(() =>
      document.querySelector("#cart-content [data-remove]")?.focus(),
    );
    announce("Produk dihapus dari keranjang.");
    return;
  }
  if (button.hasAttribute("data-clear-cart")) {
    cart = [];
    saveCart();
    renderCart();
    requestAnimationFrame(() =>
      document.querySelector("#cart-content [data-close]")?.focus(),
    );
    announce("Keranjang dikosongkan.");
    return;
  }
  if (button.hasAttribute("data-copy-order")) {
    copyOrder();
    return;
  }
  if (button.hasAttribute("data-download-order")) {
    downloadOrder();
    return;
  }
  if (button.hasAttribute("data-reset-build")) {
    build = {
      cpu: "",
      motherboard: "",
      ram: "",
      gpu: "",
      storage: "",
      psu: "",
      case: "",
    };
    renderBuilder("cpu");
    return;
  }
  if (button.hasAttribute("data-add-build")) {
    const result = inspectBuild();
    if (!result.valid) return;
    addItems(result.chosen.map((product) => product.id));
    showCart();
    announce("Komponen rakitan ditambahkan ke keranjang.");
  }
});
document.addEventListener("change", (event) => {
  if (event.target.matches("[data-quantity]")) {
    const item = cart.find((item) => item.id === event.target.dataset.quantity);
    if (item) {
      item.qty = normalizeQty(event.target.value);
      saveCart();
      renderCart('[data-quantity="' + item.id + '"]');
    }
  }
  if (event.target.matches("[data-build-slot]")) {
    const key = event.target.dataset.buildSlot;
    const value = event.target.value;
    const product = productById.get(value);
    if (
      slots.some((slot) => slot.key === key) &&
      (!value || product?.component?.type === key)
    ) {
      build[key] = value;
      renderBuilder(key);
    }
  }
});
document.addEventListener("input", (event) => {
  if (event.target.id === "shopper-name") {
    shopperName = event.target.value.slice(0, 80);
    refreshSummary();
  }
});
dialogIds.forEach((id) =>
  document.getElementById(id)?.addEventListener("click", (event) => {
    if (event.target === event.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        event.currentTarget.close();
    }
  }),
);
restoreCart();
applyConfiguration(
  window.PAGIVERSE_DATA || {},
  window.PAGIVERSE_MANIFEST || null,
);
window.NusaCommerce = Object.freeze({
  getCart: () => cart.map((item) => ({ ...item })),
  getBuild: () => ({ ...build }),
  getBuildStatus: () => {
    const result = inspectBuild();
    return {
      valid: result.valid,
      missing: result.missing.map((slot) => slot.key),
      errors: [...result.errors],
      total: result.total,
      power: result.power,
      recommended: result.recommended,
    };
  },
  getProducts: () =>
    products.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
    })),
  getOrderSummary: () => orderSummary(),
  isWhatsappConfigured: () => Boolean(configuredWhatsapp()),
});
