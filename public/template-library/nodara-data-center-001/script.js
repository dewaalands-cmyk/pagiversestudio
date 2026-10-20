(() => {
  "use strict";

  const TEMPLATE_ID = "nodara-data-center-001";
  const forbiddenKeys = new Set(["__proto__", "prototype", "constructor"]);
  const own = (object, key) =>
    object !== null &&
    typeof object === "object" &&
    Object.prototype.hasOwnProperty.call(object, key);
  const isRecord = (input) =>
    input !== null && typeof input === "object" && !Array.isArray(input);
  const state = {
    schema: null,
    data: isRecord(window.PAGIVERSE_DATA) ? window.PAGIVERSE_DATA : {},
    signatures: new WeakMap(),
    rendered: false,
    visibilitySignature: "",
    pending: [],
    lastConfiguration: "",
  };

  // The same document is used for the published site and the editor preview.
  const isPreview = window.parent !== window;
  document.documentElement.classList.toggle("pagiverse-preview", isPreview);

  function nested(source, path) {
    return String(path)
      .split(".")
      .reduce(
        (current, key) =>
          !forbiddenKeys.has(key) && own(current, key)
            ? current[key]
            : undefined,
        source,
      );
  }

  function configured(path) {
    return own(state.data, path) ? state.data[path] : nested(state.data, path);
  }

  function value(path) {
    const input = configured(path);
    return input === undefined ? state.schema?.fields?.[path]?.default : input;
  }

  function plain(input, maximum = 2000) {
    if (typeof input !== "string" && typeof input !== "number") return "";
    return String(input)
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
      .slice(0, maximum);
  }

  function fieldText(path) {
    const descriptor = state.schema?.fields?.[path];
    const output = plain(value(path), descriptor?.maxLength || 2000);
    return descriptor?.required && !output.trim()
      ? plain(descriptor.default, descriptor.maxLength || 2000)
      : output;
  }

  function booleanValue(path, fallback = true) {
    const current = value(path);
    return typeof current === "boolean" ? current : fallback;
  }

  function safeURL(input, protocols = ["http:", "https:"]) {
    const source = typeof input === "string" ? input.trim() : "";
    if (
      !source ||
      /[\u0000-\u0020\u007f\\]/.test(source) ||
      source.startsWith("//")
    )
      return "";
    try {
      const absolute = /^[a-z][a-z0-9+.-]*:/i.test(source);
      const parsed = new URL(source, document.baseURI);
      if (
        !["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol) ||
        !protocols.includes(parsed.protocol) ||
        parsed.username ||
        parsed.password ||
        (!absolute && parsed.origin !== window.location.origin)
      )
        return "";
      return absolute ? parsed.href : source;
    } catch (_) {
      return "";
    }
  }

  function focal(input) {
    if (input === "" || input === null || input === undefined) return 50;
    const number = Number(input);
    return Number.isFinite(number) ? Math.max(0, Math.min(100, number)) : 50;
  }

  function safeImageURL(input) {
    const source = typeof input === "string" ? input.trim() : "";
    if (/^data:/i.test(source)) {
      // Studio's file picker supplies raster uploads as base64 data URLs.
      if (source.length > 12 * 1024 * 1024) return "";
      return /^data:image\/(?:png|jpeg|webp|avif);base64,[a-z0-9+/]+={0,2}$/i.test(
        source,
      )
        ? source
        : "";
    }
    return safeURL(source);
  }

  function normalizedImage(input, fallbackAlt = "") {
    const image = isRecord(input) ? input : { src: input };
    const english = document.documentElement.lang
      .toLowerCase()
      .startsWith("en");
    return {
      src: safeImageURL(image.src),
      alt: plain(
        (english ? image.altEn || image.altId : image.altId || image.altEn) ||
          image.alt ||
          fallbackAlt,
        240,
      ),
      focalPoint: {
        x: focal(image.focalPoint?.x),
        y: focal(image.focalPoint?.y),
      },
      fit: ["cover", "contain"].includes(image.fit || image.objectFit)
        ? image.fit || image.objectFit
        : "cover",
    };
  }

  function setImage(node, input, alt = "") {
    const image = normalizedImage(input, alt);
    if (image.src) {
      if (node.getAttribute("src") !== image.src)
        node.setAttribute("src", image.src);
      node.hidden = false;
    } else {
      node.removeAttribute("src");
      node.hidden = true;
    }
    node.alt = node.closest('[aria-hidden="true"]') ? "" : image.alt;
    node.style.objectPosition = `${image.focalPoint.x}% ${image.focalPoint.y}%`;
    node.style.objectFit = image.fit;
    return image;
  }

  function element(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) {
      node.textContent = plain(content);
      if (node.textContent.includes("\n")) node.style.whiteSpace = "pre-line";
    }
    return node;
  }

  function arrow(direction = "↗") {
    const node = element("span", "", direction);
    node.setAttribute("aria-hidden", "true");
    return node;
  }

  function normalizedCollection(path) {
    const descriptor = state.schema?.fields?.[path];
    if (!descriptor || descriptor.type !== "array") return [];
    const defaults = Array.isArray(descriptor.default)
      ? descriptor.default
      : [];
    let items = value(path);
    if (!Array.isArray(items)) items = defaults;
    items = items.filter(isRecord);
    if (items.length < (descriptor.minItems || 0)) items = defaults;
    const maximum = Math.min(descriptor.maxItems || 12, 32);
    const itemFields = descriptor.item?.fields || {};
    const ids = new Set([
      "hero",
      "top",
      "main-content",
      "about",
      "infrastruktur",
      "services",
      "layanan",
      "process",
      "proses",
      "faq",
      "contact",
      "footer",
      "contact-title",
      "hero-title",
      "consultation-dialog",
      "mobile-menu",
    ]);
    return items.slice(0, maximum).map((item, index) => {
      const output = {};
      Object.entries(itemFields).forEach(([key, field]) => {
        if (forbiddenKeys.has(key)) return;
        const raw = own(item, key) ? item[key] : field.default;
        if (field.type === "image")
          output[key] = normalizedImage(raw, item.imageAlt);
        else if (field.type === "boolean")
          output[key] = typeof raw === "boolean" ? raw : Boolean(field.default);
        else {
          const content = plain(raw, field.maxLength || 2000);
          output[key] =
            field.required && !content.trim()
              ? plain(defaults[index]?.[key] || field.default, field.maxLength)
              : content;
        }
      });
      if (path === "sections.services.items") {
        if (!output.name.trim())
          output.name =
            plain(defaults[index]?.name, 48) || `Layanan ${index + 1}`;
        if (!output.heading.trim()) output.heading = output.name;
        const base =
          plain(output.id, 64)
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9_-]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 48) || `service-${index + 1}`;
        let id = /^[a-z]/.test(base) ? base : `service-${base}`;
        const original = id;
        let suffix = 1;
        while (
          ids.has(id) ||
          (document.getElementById(id) &&
            document.getElementById(id).dataset.chapter === undefined)
        )
          id = `${original}-${++suffix}`;
        ids.add(id);
        output.key = id;
      }
      if (path === "sections.faq.items" && !output.question.trim())
        output.question =
          plain(defaults[index]?.question, 180) || `Pertanyaan ${index + 1}`;
      if (
        ["sections.about.layers", "sections.process.items"].includes(path) &&
        !output.title.trim()
      )
        output.title =
          plain(defaults[index]?.title, 100) ||
          `${path === "sections.about.layers" ? "Lapisan" : "Langkah"} ${index + 1}`;
      return output;
    });
  }

  function collectionChanged(container, signature) {
    if (state.signatures.get(container) === signature) return false;
    state.signatures.set(container, signature);
    return true;
  }

  function serviceImage(item, className = "", decorative = false) {
    const image = element("img", className);
    image.width = 1600;
    image.height = 1200;
    image.loading = "lazy";
    image.decoding = "async";
    setImage(image, item.image, item.name);
    if (decorative) image.alt = "";
    return image;
  }

  function serviceChapter(item, index) {
    const article = element("article", "story-chapter");
    article.id = item.key;
    article.dataset.chapter = String(index);
    article.append(
      element(
        "p",
        "chapter-number mono-label",
        `${String(index + 1).padStart(2, "0")} / ${item.name}`,
      ),
      element("h3", "", item.heading),
      element("p", "", item.description),
    );
    const list = element("ul", "feature-list");
    plain(item.features)
      .split("\n")
      .map((feature) => feature.trim())
      .filter(Boolean)
      .slice(0, 8)
      .forEach((feature) => list.append(element("li", "", feature)));
    article.append(list);
    const button = element("button", "text-link");
    button.type = "button";
    button.dataset.consult = "";
    button.dataset.service = item.name;
    const label = element(
      "span",
      "",
      item.ctaLabel || "Bahas kebutuhan layanan",
    );
    button.append(label, arrow());
    article.append(button, serviceImage(item, "chapter-mobile-image"));
    return article;
  }

  function renderServices(items) {
    const signature = JSON.stringify(items);
    let changed = false;
    document
      .querySelectorAll('[data-collection="sections.services.items"]')
      .forEach((container) => {
        const view = container.dataset.collectionView;
        const viewSignature =
          signature +
          (view === "options"
            ? fieldText("sections.contact.form.servicePlaceholder")
            : "");
        if (!collectionChanged(container, viewSignature)) return;
        changed = true;
        const nodes = [];
        if (view === "rail") {
          items.forEach((item, index) => {
            const link = element("a");
            link.href = `#${item.key}`;
            link.dataset.chapterLink = String(index);
            if (!index) {
              link.classList.add("is-active");
              link.setAttribute("aria-current", "true");
            }
            link.append(
              element("span", "", String(index + 1).padStart(2, "0")),
              document.createTextNode(item.name),
            );
            nodes.push(link);
          });
        } else if (view === "chapters") {
          items.forEach((item, index) =>
            nodes.push(serviceChapter(item, index)),
          );
        } else if (view === "images") {
          items.forEach((item, index) => {
            const layer = element(
              "div",
              `story-layer${index ? "" : " is-active"}`,
            );
            layer.dataset.storyImage = String(index);
            layer.append(serviceImage(item, "", true));
            nodes.push(layer);
          });
          container
            .querySelectorAll(
              ":scope > .story-visual-caption, :scope > [data-static]",
            )
            .forEach((node) => nodes.push(node));
        } else if (view === "menu") {
          items.forEach((item, index) => {
            const link = element("a");
            link.href = `#${item.key}`;
            const label = element("span");
            label.append(
              element("strong", "", item.name),
              element("small", "", item.menuDescription || item.description),
            );
            link.append(
              element(
                "span",
                "menu-number",
                String(index + 1).padStart(2, "0"),
              ),
              label,
              arrow(),
            );
            nodes.push(link);
          });
        } else if (view === "ticker") {
          const group = element("div", "ticker-group");
          items.forEach((item) => {
            const link = element("a", "", item.name);
            link.href = `#${item.key}`;
            link.append(arrow());
            const dot = element("span", "ticker-dot");
            dot.setAttribute("aria-hidden", "true");
            group.append(link, dot);
          });
          const clone = group.cloneNode(true);
          clone.setAttribute("aria-hidden", "true");
          clone.setAttribute("inert", "");
          clone.querySelectorAll("a").forEach((link) => {
            link.tabIndex = -1;
          });
          nodes.push(group, clone);
        } else if (view === "options") {
          const selected = container.value;
          const placeholder = element(
            "option",
            "",
            fieldText("sections.contact.form.servicePlaceholder") ||
              "Pilih layanan",
          );
          placeholder.value = "";
          nodes.push(placeholder);
          items.forEach((item) => {
            const option = element("option", "", item.name);
            option.value = item.name;
            nodes.push(option);
          });
          container.replaceChildren(...nodes);
          if (items.some((item) => item.name === selected))
            container.value = selected;
          else container.value = "";
          return;
        } else return;
        container.replaceChildren(...nodes);
      });
    return changed;
  }

  function renderSimpleCollection(path, items) {
    const signature = JSON.stringify(items);
    document.querySelectorAll("[data-collection]").forEach((container) => {
      if (
        container.dataset.collection !== path ||
        !collectionChanged(container, signature)
      )
        return;
      const nodes = items.map((item, index) => {
        if (path === "sections.faq.items") {
          const details = element("details");
          const summary = element("summary", "", item.question);
          const indicator = element("span", "details-indicator");
          indicator.setAttribute("aria-hidden", "true");
          summary.append(indicator);
          const answer = element("div", "faq-answer");
          answer.append(element("p", "", item.answer));
          details.append(summary, answer);
          return details;
        }
        const process = path === "sections.process.items";
        const itemNode = element(
          "li",
          process ? "process-step is-visible" : "",
        );
        if (process) itemNode.dataset.reveal = "";
        itemNode.append(
          element(
            "span",
            process ? "process-number mono-label" : "diagram-number",
            String(index + 1).padStart(2, "0"),
          ),
          element("h3", "", item.heading || item.name || item.title),
          element("p", "", item.description || item.body),
        );
        return itemNode;
      });
      container.replaceChildren(...nodes);
    });
  }

  function renderBindings() {
    document.querySelectorAll("[data-bind]").forEach((node) => {
      const content = fieldText(node.dataset.bind);
      if (node.textContent !== content) node.textContent = content;
      if (content.includes("\n")) node.style.whiteSpace = "pre-line";
    });
    document
      .querySelectorAll("[data-bind-src], [data-image]")
      .forEach((node) => {
        const path = node.dataset.bindSrc || node.dataset.image;
        setImage(node, value(path));
      });
    document.querySelectorAll("[data-bind-alt]").forEach((node) => {
      const path = node.dataset.bindAlt;
      const content =
        state.schema.fields[path]?.type === "image"
          ? normalizedImage(value(path)).alt
          : fieldText(path);
      if (!node.closest('[aria-hidden="true"]')) node.alt = content;
    });
    document.querySelectorAll("[data-bind-content]").forEach((node) => {
      const path = node.dataset.bindContent;
      const content =
        state.schema.fields[path]?.type === "image"
          ? normalizedImage(value(path)).src
          : fieldText(path);
      node.setAttribute("content", content);
    });
    document.querySelectorAll("[data-bind-placeholder]").forEach((node) => {
      node.setAttribute("placeholder", fieldText(node.dataset.bindPlaceholder));
    });
    document.querySelectorAll("[data-bind-aria-label]").forEach((node) => {
      node.setAttribute("aria-label", fieldText(node.dataset.bindAriaLabel));
    });
    document
      .querySelectorAll("[data-bind-href], [data-link]")
      .forEach((node) => {
        const path = node.dataset.bindHref || node.dataset.link;
        const field = state.schema.fields[path];
        const protocols = Array.isArray(field?.allowedProtocols)
          ? field.allowedProtocols.map(
              (protocol) => String(protocol).replace(/:$/, "") + ":",
            )
          : ["https:", "http:"];
        const url = safeURL(value(path), protocols);
        if (url) node.setAttribute("href", url);
        else node.removeAttribute("href");
        if (node.target === "_blank") node.rel = "noopener noreferrer";
      });
    document.querySelectorAll("[data-brand-logo]").forEach((node) => {
      setImage(
        node,
        value("business.logo"),
        `Logo ${fieldText("business.name")}`,
      );
      node.style.objectFit = "contain";
    });
    document.querySelectorAll(".wordmark").forEach((node) => {
      if (node.tagName === "A")
        node.setAttribute(
          "aria-label",
          `${fieldText("business.name")}, kembali ke awal`,
        );
    });
    const heroTitle = document.querySelector("#hero-title");
    if (heroTitle) {
      const first = fieldText("sections.hero.headingLine1");
      const second = fieldText("sections.hero.headingLine2");
      heroTitle.dataset.longHeading = String(
        first.length > 18 ||
          second.length > 18 ||
          first.length + second.length > 36,
      );
    }
  }

  function sectionVisible(section) {
    if (section.required) return true;
    const explicit = configured(`sectionVisibility.${section.id}`);
    const nestedVisible = configured(`sections.${section.id}.visible`);
    const current = explicit === undefined ? nestedVisible : explicit;
    return typeof current === "boolean"
      ? current
      : section.visibleByDefault !== false;
  }

  function renderVisibility() {
    const visibility = new Map();
    const targets = new Map();
    state.schema.sections.forEach((section) => {
      const visible = sectionVisible(section);
      visibility.set(section.id, visible);
      document.querySelectorAll("[data-section]").forEach((node) => {
        if (node.dataset.section !== section.id) return;
        node.hidden = !visible;
        if (node.id) targets.set(`#${node.id}`, visible);
      });
      document.querySelectorAll("[data-section-related]").forEach((node) => {
        if (node.dataset.sectionRelated === section.id) node.hidden = !visible;
      });
    });
    state.schema.navigation.items.forEach((item) => {
      const optional = item.hideable === true;
      const hidden =
        optional &&
        (configured(`navigation.${item.id}.hidden`) === true ||
          configured(`navigation.${item.id}.visible`) === false ||
          configured(`navigation.items.${item.id}.visible`) === false ||
          targets.get(item.target) === false ||
          !fieldText(item.labelField).trim());
      document.querySelectorAll("[data-nav-id]").forEach((node) => {
        if (node.dataset.navId !== item.id) return;
        node.hidden = hidden;
        if (node.tagName === "A" && /^#[a-z][\w-]*$/i.test(item.target))
          node.setAttribute("href", item.target);
      });
    });
    document.querySelectorAll('a[href^="#"]').forEach((node) => {
      if (node.hasAttribute("data-nav-id")) return;
      const target = node.getAttribute("href");
      if (targets.has(target)) node.hidden = !targets.get(target);
    });
    const signature = JSON.stringify(Array.from(visibility));
    const changed = signature !== state.visibilitySignature;
    state.visibilitySignature = signature;
    return changed;
  }

  function renderTheme() {
    const mapping = {
      primary: "--orange",
      accent: "--orange",
      background: "--white",
      text: "--ink",
      surface: "--surface",
      secondary: "--muted",
    };
    Object.entries(state.schema.theme?.tokens || {}).forEach(
      ([token, field]) => {
        if (field.editable !== true) return;
        const current = value(`theme.${token}`) ?? field.default;
        if (mapping[token] && /^#[a-f0-9]{6}$/i.test(current || ""))
          document.documentElement.style.setProperty(mapping[token], current);
      },
    );
  }

  function renderMetadata() {
    const title = fieldText("seo.title") || fieldText("business.name");
    const description = fieldText("seo.description");
    document.title = title;
    [
      ['meta[name="description"]', description],
      ['meta[property="og:title"]', title],
      ['meta[property="og:description"]', description],
      ['meta[name="twitter:title"]', title],
      ['meta[name="twitter:description"]', description],
    ].forEach(([selector, content]) => {
      document.querySelector(selector)?.setAttribute("content", content);
    });
    const image = normalizedImage(value("seo.ogImage")).src;
    document
      .querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]')
      .forEach((node) => {
        if (image)
          node.setAttribute("content", new URL(image, document.baseURI).href);
        else node.removeAttribute("content");
      });
  }

  function renderVideoPolicy() {
    const video = document.querySelector("#hero-video");
    const hero = document.querySelector('[data-section="hero"]');
    const poster = normalizedImage(value("sections.hero.image")).src;
    const defaultPoster = normalizedImage(
      state.schema.fields["sections.hero.image"]?.default,
    ).src;
    const isDefaultPoster =
      Boolean(poster && defaultPoster) &&
      new URL(poster, document.baseURI).href ===
        new URL(defaultPoster, document.baseURI).href;
    const enabled =
      booleanValue("sections.hero.videoEnabled", true) && isDefaultPoster;
    if (hero) hero.dataset.videoEnabled = String(enabled);
    if (video) {
      video.dataset.videoEnabled = String(enabled);
      video.hidden = !enabled;
      if (!enabled) video.pause();
      if (poster) video.setAttribute("poster", poster);
      else video.removeAttribute("poster");
    }
    const toggle = document.querySelector("#hero-motion-toggle");
    if (toggle) toggle.hidden = !enabled;
    document.dispatchEvent(
      new CustomEvent("nodara:policy", { detail: { videoEnabled: enabled } }),
    );
  }

  function render() {
    if (!state.schema) return;
    const servicesChanged = renderServices(
      normalizedCollection("sections.services.items"),
    );
    [
      "sections.about.layers",
      "sections.process.items",
      "sections.faq.items",
    ].forEach((path) =>
      renderSimpleCollection(path, normalizedCollection(path)),
    );
    renderBindings();
    const visibilityChanged = renderVisibility();
    renderTheme();
    renderMetadata();
    renderVideoPolicy();
    const rebuildUI = !state.rendered || servicesChanged || visibilityChanged;
    state.rendered = true;
    document.dispatchEvent(
      new CustomEvent("nodara:render", { detail: { rebuildUI } }),
    );
  }

  function acknowledge(payload) {
    if (!isPreview) return;
    window.parent.postMessage(
      {
        type: "pagiverse:applied",
        templateId: TEMPLATE_ID,
        revision: payload.revision,
      },
      window.location.origin,
    );
  }

  function applyConfiguration(payload) {
    // Equivalent payloads still receive their revision ACK without DOM replacement.
    const signature = JSON.stringify(payload.configuration);
    if (signature !== state.lastConfiguration) {
      state.data = payload.configuration;
      state.lastConfiguration = signature;
      render();
    }
    acknowledge(payload);
  }

  window.addEventListener("message", (event) => {
    if (
      !isPreview ||
      event.source !== window.parent ||
      event.origin !== window.location.origin
    )
      return;
    const payload = event.data;
    if (
      !isRecord(payload) ||
      payload.type !== "pagiverse:config" ||
      payload.templateId !== TEMPLATE_ID ||
      !isRecord(payload.configuration)
    )
      return;
    if (!state.schema) {
      if (state.pending.length < 16) state.pending.push(payload);
      return;
    }
    applyConfiguration(payload);
  });

  async function init() {
    try {
      const response = await fetch("template.json", { cache: "no-store" });
      if (!response.ok) throw new Error("Template schema unavailable");
      const schema = await response.json();
      if (
        !isRecord(schema) ||
        schema.pagiverseStandard !== 1 ||
        schema.id !== TEMPLATE_ID ||
        !isRecord(schema.fields) ||
        !Array.isArray(schema.sections) ||
        !Array.isArray(schema.navigation?.items)
      )
        throw new Error("Invalid template schema");
      state.schema = schema;
      render();
      state.lastConfiguration = JSON.stringify(state.data);
      state.pending.splice(0).forEach(applyConfiguration);
      if (isPreview)
        window.parent.postMessage(
          { type: "pagiverse:ready", templateId: TEMPLATE_ID },
          window.location.origin,
        );
    } catch (error) {
      console.error("NODARA configuration could not be loaded.", error);
      document.dispatchEvent(
        new CustomEvent("nodara:render", { detail: { rebuildUI: true } }),
      );
    }
  }

  init();
})();
