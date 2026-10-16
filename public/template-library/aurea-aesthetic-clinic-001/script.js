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
    if (value && typeof value === "object") {
      const alt = plainText(value.altId || value.alt);
      if (alt.trim()) return alt.trim();
    }
    return typeof fallback === "string" ? fallback.trim() : "";
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

  const faqSignatures = new WeakMap();
  let activeFilter = 'all';
  function renderCollections() {
    document.querySelectorAll('[data-collection]').forEach(container => {
      const field = state.schema.fields[container.dataset.collection];
      let items = getValue(container.dataset.collection);
      items = Array.isArray(items) ? items.filter(item => item && typeof item === 'object').slice(0, field.maxItems) : [];
      const limit = Number.parseInt(container.dataset.limit || '', 10);
      if (container.dataset.collectionKind === 'services' && activeFilter !== 'all') items = items.filter(item => item.category === activeFilter);
      if (Number.isInteger(limit)) items = items.slice(0, limit);
      const isFaq = container.dataset.collectionKind === 'faq';
      const faqSignature = isFaq
        ? JSON.stringify(items.map(item => [plainText(item.question), plainText(item.answer)]))
        : null;
      if (isFaq && faqSignatures.get(container) === faqSignature) return;
      const fragment = document.createDocumentFragment();
      items.forEach(item => {
        if (container.dataset.collectionKind === 'faq') {
          const detail = element('details', '');
          detail.append(element('summary', '', item.question), element('p', '', item.answer)); fragment.append(detail); return;
        }
        const article = element('article', container.dataset.collectionKind === 'services' ? 'service-card' : 'value-item');
        if (container.dataset.collectionKind === 'services') {
          const image = document.createElement('img');const source = imageSource(item.image);
          if (source) image.src = source;
          image.alt = imageAlt(item.image, item.imageAlt);image.width = 800;image.height = 600;image.loading = 'lazy';image.decoding = 'async';applyFocalPoint(image, item.image);article.append(image);
          article.append(element('p', 'category', getValue(item.category === 'medical' ? 'sections.services.medicalLabel' : 'sections.services.skinLabel')));
        }
        article.append(element('h3', '', item.name), element('p', '', item.description));
        if (container.dataset.collectionKind === 'services') {
          const price = element('div', 'price');price.append(element('span','',item.price),element('span','',item.duration));article.append(price);
        }
        fragment.append(article);
      });
      container.replaceChildren(fragment);
      if (isFaq) faqSignatures.set(container, faqSignature);
      if (container.dataset.collectionKind === 'services') {const empty = document.querySelector('.empty');if(empty)empty.classList.toggle('is-visible', items.length === 0);}
    });
    const select = document.querySelector('select[name="service"]');
    if (select) {
      const chosen = select.value;
      select.replaceChildren(new Option(plainText(getValue('sections.contact.optionLabel')), 'consultation'));
      const items = getValue('sections.services.items');
      if (Array.isArray(items)) items.slice(0,12).forEach(item => {if(item && typeof item.name === 'string') select.append(new Option(item.name,item.name));});
      if ([...select.options].some(option => option.value === chosen)) select.value = chosen;
    }
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
    state.schema.sections.forEach(section => {
      const configured = getValue('sectionVisibility.'+section.id) ?? nestedValue(state.data,'sections.'+section.id+'.visible');
      document.querySelectorAll('[data-section="'+section.id+'"]').forEach(node => {node.hidden = section.required ? false : configured === undefined ? !section.visibleByDefault : configured === false;});
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
      : "kontak.html";
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
      link.href = safeEmail ? `mailto:${safeEmail}` : "kontak.html";
    });

    const instagram = safeHttps(getValue("social.instagram"));
    document.querySelectorAll("[data-instagram-link]").forEach((link) => {
      link.href = instagram || "kontak.html";
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
    updateMaps();

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

  function updateMaps() {
    document.querySelectorAll('[data-maps-link]').forEach(link => {link.href = safeHttps(getValue('location.mapsUrl')) || 'kontak.html';link.target='_blank';link.rel='noopener noreferrer';});
  }
  function setupFormsAndFilters() {
    document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
      activeFilter = button.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
      renderCollections();
    }));
    const form=document.querySelector('[data-pagiverse-form]'); if(!form)return;
    const date=form.querySelector('[name=date]'); const today=new Date();today.setMinutes(today.getMinutes()-today.getTimezoneOffset());date.min=today.toISOString().slice(0,10);
    form.addEventListener('submit', async event => {
      event.preventDefault();if(!form.reportValidity())return;
      const payload=Object.fromEntries(new FormData(form));const status=form.querySelector('[data-form-status]');const wa=form.querySelector('[data-form-whatsapp]');const button=form.querySelector('[type=submit]');
      const request=new CustomEvent('pagiverse:form-submit',{bubbles:true,cancelable:true,detail:{templateId:state.schema.id,formId:'reservation',values:payload}});
      if(!form.dispatchEvent(request)){status.textContent=plainText(getValue('sections.contact.coreStatus'));wa.hidden=true;return;}
      if(typeof window.PAGIVERSE_CORE?.submitForm==='function'){
        button.disabled=true;
        try{await window.PAGIVERSE_CORE.submitForm({templateId:state.schema.id,formId:'reservation',values:payload});status.textContent=plainText(getValue('sections.contact.successStatus'));form.reset();wa.hidden=true;}
        catch(error){status.textContent=plainText(getValue('sections.contact.errorStatus'));}
        finally{button.disabled=false;}
        return;
      }
      status.textContent=plainText(getValue('sections.contact.demoStatus'));
      const phone=whatsappNumber(getValue('contact.whatsapp'));
      const message=[getValue('contact.whatsappMessage'),getValue('sections.contact.nameLabel')+': '+payload.name,getValue('sections.contact.phoneLabel')+': '+payload.phone,getValue('sections.contact.serviceLabel')+': '+(payload.service==='consultation'?getValue('sections.contact.optionLabel'):payload.service),getValue('sections.contact.dateLabel')+': '+payload.date,payload.note].filter(Boolean).join('\n');
      wa.href=phone?'https://wa.me/'+phone+'?text='+encodeURIComponent(message):'kontak.html';wa.target='_blank';wa.rel='noopener noreferrer';wa.hidden=false;
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
      setupFormsAndFilters();
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
