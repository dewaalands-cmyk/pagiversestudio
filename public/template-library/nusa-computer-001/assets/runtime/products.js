const seedProducts = [
  {
    id: "nusa-air-14",
    name: "NUSA Air 14",
    category: "Laptop",
    price: 8999000,
    image: "./assets/laptop.webp",
    tag: "Pilihan",
    spec: "14 inci · Ryzen 5 · 16 GB · 512 GB",
    description:
      "Laptop contoh yang ringan untuk bekerja, belajar, dan menemani ide sehari-hari.",
    details: [
      "Layar 14 inci Full HD",
      "Memori 16 GB dan SSD 512 GB",
      "Desain ringkas untuk mobilitas",
    ],
    illustration: true,
  },
  {
    id: "nusa-pro-16",
    name: "NUSA Pro 16",
    category: "Laptop",
    price: 15999000,
    image: "./assets/laptop.webp",
    spec: "16 inci · Core i7 · 16 GB · 1 TB",
    description:
      "Ruang kerja lebih luas untuk berkarya, mengolah banyak tugas, dan menikmati konten.",
    details: [
      "Layar 16 inci",
      "Memori 16 GB dan SSD 1 TB",
      "Konfigurasi produk demo",
    ],
    illustration: true,
  },
  {
    id: "nusa-play",
    name: "NUSA Play",
    category: "PC Desktop",
    price: 16999000,
    image: "./assets/desktop.webp",
    tag: "Pilihan",
    spec: "Ryzen 5 · RTX 4060 · 16 GB DDR5",
    description:
      "Sebuah gambaran PC untuk bermain dan berkarya. Pilih komponen sendiri melalui Rakit PC.",
    details: [
      "Ryzen 5 7600",
      "GeForce RTX 4060 8 GB",
      "Memori 16 GB DDR5 · SSD 1 TB",
    ],
    illustration: true,
  },
  {
    id: "ryzen-7600",
    name: "AMD Ryzen 5 7600",
    category: "Komponen",
    price: 2999000,
    image: "./assets/cpu-amd-ryzen7600.webp",
    spec: "6 core · 12 thread · AM5",
    description:
      "Fondasi PC serbaguna dengan soket AM5 dan grafis terintegrasi untuk kebutuhan tampilan dasar.",
    details: [
      "Soket AM5 · dukungan DDR5",
      "TDP 65 W",
      "Pilihan demo menyertakan pendingin bawaan",
    ],
    component: {
      type: "cpu",
      socket: "AM5",
      memory: "DDR5",
      power: 65,
      integrated: true,
    },
  },
  {
    id: "msi-b650mp",
    name: "MSI PRO B650M-P",
    category: "Komponen",
    price: 2099000,
    image: "./assets/motherboard-msi-b650mp.webp",
    spec: "AM5 · B650 · Micro-ATX · DDR5",
    description:
      "Papan utama Micro-ATX untuk membangun sistem berbasis AMD AM5 dan memori DDR5.",
    details: ["Soket AM5", "Memori DDR5", "Format Micro-ATX"],
    component: {
      type: "motherboard",
      socket: "AM5",
      memory: "DDR5",
      format: "mATX",
      power: 35,
    },
  },
  {
    id: "rtx-4060",
    name: "MSI RTX 4060 VENTUS 2X",
    category: "Komponen",
    price: 4899000,
    image: "./assets/gpu-msi-rtx4060.webp",
    spec: "8 GB GDDR6 · GeForce RTX 4060",
    description:
      "Pilihan grafis diskrit untuk melengkapi rakitan gaming dan pekerjaan visual.",
    details: [
      "Memori grafis 8 GB",
      "Panjang model: 199 mm",
      "Rekomendasi catu daya model: 550 W",
    ],
    component: { type: "gpu", power: 120, length: 199, recommendedPsu: 550 },
  },
  {
    id: "kingston-ddr5",
    name: "Kingston FURY Beast DDR5",
    category: "Komponen",
    price: 1099000,
    image: "./assets/ram-kingston-fury.webp",
    spec: "16 GB · DDR5 · 5600 MT/s",
    description:
      "Pilihan memori DDR5 untuk rakitan AM5 dalam katalog demo ini.",
    details: [
      "Kapasitas 16 GB",
      "Standar DDR5",
      "Kecepatan konfigurasi demo: 5600 MT/s",
    ],
    component: { type: "ram", memory: "DDR5", power: 10 },
  },
  {
    id: "samsung-990evo",
    name: "Samsung 990 EVO",
    category: "Komponen",
    price: 1399000,
    image: "./assets/ssd-samsung-990evo.webp",
    spec: "1 TB · NVMe · M.2 2280",
    description:
      "Penyimpanan SSD dalam format M.2 untuk sistem operasi, aplikasi, dan koleksi pribadi.",
    details: ["Kapasitas 1 TB", "Format M.2 2280", "Antarmuka NVMe"],
    component: { type: "storage", power: 6 },
  },
  {
    id: "nusa-psu-650",
    name: "Corsair CX650",
    category: "Komponen",
    price: 899000,
    image: "./assets/psu650.webp",
    spec: "650 W · ATX · 80 PLUS Bronze",
    description:
      "Catu daya ATX 650 W untuk melengkapi rakitan. Pastikan kebutuhan daya dan konektor sistem telah diperiksa.",
    details: [
      "Daya kontinu 650 W",
      "Format ATX · panjang 125 mm",
      "80 PLUS Bronze · kabel non-modular",
    ],
    component: { type: "psu", watts: 650, format: "ATX" },
  },
  {
    id: "nusa-case",
    name: "MSI MAG PANO M100R PZ",
    category: "Komponen",
    price: 799000,
    image: "./assets/case-black.webp",
    spec: "Micro-ATX · hitam · ruang GPU 390 mm",
    description:
      "Casing hitam berpanel kaca untuk sistem Micro-ATX. Tinjau kembali ukuran pendingin dan konektor sebelum perakitan.",
    details: [
      "Dukungan Micro-ATX dan Mini-ITX",
      "Ruang kartu grafis hingga 390 mm",
      "PSU ATX hingga 200 mm; cooler CPU hingga 175 mm",
    ],
    component: {
      type: "case",
      formats: ["mATX", "ITX"],
      psuFormats: ["ATX"],
      clearance: 390,
      power: 10,
    },
  },
  {
    id: "kingston-ddr4-demo",
    name: "Kingston ValueRAM SO-DIMM",
    category: "Komponen",
    price: 649000,
    image: "./assets/laptop-ram.webp",
    spec: "16 GB · DDR4-3200 · RAM laptop",
    description:
      "Memori SO-DIMM untuk laptop dengan slot DDR4 yang dapat diganti. Periksa dukungan model laptop, kapasitas maksimum, dan slot sebelum membeli.",
    details: [
      "16 GB · DDR4-3200 · CL22",
      "SO-DIMM 260-pin · 1.2 V",
      "Tidak sesuai untuk motherboard DDR5 atau slot DIMM desktop",
    ],
    component: { type: "ram", memory: "DDR4", power: 8 },
  },
  {
    id: "keyboard-demo",
    name: "NUSA Keys",
    category: "Aksesori",
    price: 699000,
    image: "./assets/keyboard.webp",
    spec: "Keyboard mekanis · konfigurasi demo",
    description:
      "Pilihan keyboard ringkas untuk melengkapi meja kerja dan area bermain.",
    details: [
      "Produk aksesori demo",
      "Model dan spesifikasi akhir dapat diganti",
      "Konfirmasi pilihan dengan toko",
    ],
    illustration: true,
  },
];
const owns = (object, key) =>
  object !== null &&
  typeof object === "object" &&
  Object.prototype.hasOwnProperty.call(object, key);
const valueOf = (object, key, fallback) =>
  owns(object, key) ? object[key] : fallback;
const plain = (value, limit, fallback = "") =>
  typeof value === "string" || typeof value === "number"
    ? String(value)
        .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
        .slice(0, limit)
    : fallback;
const coordinate = (value) =>
  Number.isFinite(Number(value))
    ? Math.max(0, Math.min(100, Number(value)))
    : 50;
const seedById = new Map(seedProducts.map((product) => [product.id, product]));
const categories = new Set(["Laptop", "PC Desktop", "Komponen", "Aksesori"]);

export function safeImageSource(value) {
  if (typeof value !== "string") return "";
  const source = value.trim();
  if (!source || /[\u0000-\u0020\u007f\\]/.test(source)) return "";
  if (/^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(source))
    return source.length <= 11000000 ? source : "";
  if (/^https?:\/\//i.test(source)) {
    try {
      const url = new URL(source);
      return !url.username && !url.password && /^https?:$/.test(url.protocol)
        ? url.href
        : "";
    } catch {
      return "";
    }
  }
  let decoded;
  try {
    decoded = decodeURIComponent(source);
  } catch {
    return "";
  }
  const path = decoded.replace(/^\.\//, "");
  return /^assets\/[a-zA-Z0-9_./-]+\.(?:avif|gif|jpe?g|png|webp)$/i.test(
    path,
  ) && !path.split("/").some((part) => !part || part === "." || part === "..")
    ? source
    : "";
}

export function normalizeImage(value, fallback, name = "") {
  const supplied =
    value && typeof value === "object" && !Array.isArray(value)
      ? value
      : { src: value };
  const base =
    fallback && typeof fallback === "object" ? fallback : { src: fallback };
  const focal = valueOf(supplied, "focalPoint", null);
  return {
    src:
      safeImageSource(valueOf(supplied, "src", "")) ||
      safeImageSource(valueOf(base, "src", "")) ||
      "./assets/laptop.webp",
    alt: plain(valueOf(supplied, "alt", name), 160, name),
    focalPoint: {
      x: coordinate(valueOf(focal, "x", 50)),
      y: coordinate(valueOf(focal, "y", 50)),
    },
    crop:
      valueOf(supplied, "crop", "contain") === "cover" ? "cover" : "contain",
  };
}

export function productDefaults() {
  return seedProducts.map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    price: String(product.price),
    image: normalizeImage(product.image, product.image, product.name),
    spec: product.spec,
    description: product.description,
    detailText: product.details.join("\n"),
    tag: product.tag || "",
  }));
}

function normalizeProduct(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const id = plain(valueOf(input, "id", ""), 60).trim();
  if (
    !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,59}$/.test(id) ||
    ["__proto__", "constructor", "prototype"].includes(id)
  )
    return null;
  const seed = seedById.get(id);
  const name =
    plain(valueOf(input, "name", seed?.name || "Produk"), 70).trim() ||
    "Produk";
  const requestedCategory = valueOf(
    input,
    "category",
    seed?.category || "Aksesori",
  );
  const priceValue = valueOf(input, "price", seed?.price || 0);
  const parsedPrice =
    typeof priceValue === "string" &&
    /^\d{1,10}(?:\.\d{1,2})?$/.test(priceValue.trim())
      ? Number(priceValue.trim())
      : typeof priceValue === "number"
        ? priceValue
        : 0;
  const spec = plain(valueOf(input, "spec", seed?.spec || ""), 100);
  const detailValue = valueOf(input, "detailText", undefined);
  const detailLines =
    detailValue === undefined
      ? valueOf(input, "details", seed?.details || [])
      : plain(detailValue, 350).split(/\r?\n/);
  const product = {
    id,
    name,
    category: categories.has(requestedCategory)
      ? requestedCategory
      : "Aksesori",
    price: Number.isFinite(parsedPrice)
      ? Math.round(Math.max(0, Math.min(1000000000, parsedPrice)))
      : 0,
    image: normalizeImage(
      valueOf(input, "image", seed?.image),
      seed?.image,
      name,
    ),
    spec,
    description: plain(
      valueOf(input, "description", seed?.description || ""),
      240,
    ),
    details: Array.isArray(detailLines)
      ? detailLines
          .slice(0, 8)
          .map((value) => plain(value, 160).trim())
          .filter(Boolean)
      : [],
    tag: plain(valueOf(input, "tag", seed?.tag || ""), 24),
    illustration: Boolean(seed?.illustration),
  };
  // Compatibility metadata belongs to the shipped hardware, never to editor input.
  // Renamed or re-specified items stay available in the catalog but leave the builder.
  if (
    seed?.component &&
    product.category === seed.category &&
    name === seed.name &&
    spec === seed.spec
  ) {
    product.component = Object.freeze({
      ...seed.component,
      ...(seed.component.formats
        ? { formats: Object.freeze([...seed.component.formats]) }
        : {}),
      ...(seed.component.psuFormats
        ? { psuFormats: Object.freeze([...seed.component.psuFormats]) }
        : {}),
    });
  }
  return product;
}

export const products = [];
export const productById = new Map();
export function replaceProducts(items) {
  const normalized = (Array.isArray(items) ? items : productDefaults())
    .slice(0, 24)
    .map(normalizeProduct)
    .filter(Boolean);
  const unique = normalized.filter(
    (product, index, all) =>
      all.findIndex((candidate) => candidate.id === product.id) === index,
  );
  products.splice(0, products.length, ...unique);
  productById.clear();
  products.forEach((product) => productById.set(product.id, product));
}
replaceProducts(productDefaults());
