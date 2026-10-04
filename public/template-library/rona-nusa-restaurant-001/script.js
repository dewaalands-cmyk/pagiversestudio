'use strict';

(function () {
  const root = document.documentElement;
  const state = {
    language: 'id',
    schema: null,
    data: window.PAGIVERSE_DATA || {}
  };

  function readPath(source, path) {
    if (source && Object.prototype.hasOwnProperty.call(source, path)) return source[path];
    return path.split('.').reduce((value, key) => {
      if (value && Object.prototype.hasOwnProperty.call(value, key)) return value[key];
      return undefined;
    }, source);
  }

  function fieldDefault(path) {
    const descriptor = state.schema && state.schema.fields ? state.schema.fields[path] : null;
    return descriptor && Object.prototype.hasOwnProperty.call(descriptor, 'default') ? descriptor.default : undefined;
  }

  function valueFor(path) {
    const runtimeValue = readPath(state.data, path);
    return runtimeValue !== undefined && runtimeValue !== null ? runtimeValue : fieldDefault(path);
  }

  function imageSource(value) {
    if (typeof value === 'string') return value;
    return value && typeof value.src === 'string' ? value.src : '';
  }

  function safeImageSource(value) {
    const source = String(value || '').trim();
    if (/^(?:\.\/)?assets\/[a-z0-9._/-]+$/i.test(source) && !source.split('/').includes('..')) return source;
    if (/^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(source)) return source;
    return safeUrl(source, ['https:', 'http:']);
  }

  function safeUrl(value, allowedProtocols) {
    if (!value || typeof value !== 'string') return '';
    try {
      const parsed = new URL(value, window.location.href);
      return allowedProtocols.includes(parsed.protocol) ? parsed.href : '';
    } catch (_error) {
      return '';
    }
  }

  function applyBindings() {
    document.querySelectorAll('[data-bind]').forEach((element) => {
      const value = valueFor(element.dataset.bind);
      if (typeof value === 'string' || typeof value === 'number') element.textContent = String(value);
    });

    document.querySelectorAll('[data-bind-src]').forEach((element) => {
      const source = safeImageSource(imageSource(valueFor(element.dataset.bindSrc)));
      if (source) element.setAttribute('src', source);
    });

    const wordmark = document.querySelector('.wordmark');
    if (wordmark) {
      const businessName = String(valueFor('business.name') || 'Rona Nusa');
      const source = safeImageSource(imageSource(valueFor('business.logo')));
      let logo = wordmark.querySelector('.wordmark__logo');
      if (!logo) {
        logo = document.createElement('img');
        logo.className = 'wordmark__logo';
        logo.hidden = true;
        wordmark.prepend(logo);
      }
      const fallback = wordmark.querySelector('[data-bind="business.name"]');
      if (source) {
        logo.src = source;
        logo.alt = businessName;
        logo.hidden = false;
        if (fallback) fallback.hidden = true;
      } else {
        logo.removeAttribute('src');
        logo.alt = '';
        logo.hidden = true;
        if (fallback) fallback.hidden = false;
      }
    }

    document.querySelectorAll('[data-bind-alt]').forEach((element) => {
      const path = element.dataset.bindAlt.replace(/\.(id|en)$/, `.${state.language}`);
      const value = valueFor(path);
      if (typeof value === 'string') element.setAttribute('alt', value);
    });

    document.querySelectorAll('[data-safe-href]').forEach((element) => {
      const path = element.dataset.safeHref;
      const value = valueFor(path);
      const protocols = path === 'contact.email' ? ['mailto:'] : ['https:', 'http:'];
      const normalized = path === 'contact.email' && value && !String(value).startsWith('mailto:') ? `mailto:${value}` : value;
      const href = safeUrl(normalized, protocols);
      if (href) element.setAttribute('href', href);
    });

    const title = valueFor('seo.title');
    const description = valueFor('seo.description');
    const ogImage = imageSource(valueFor('seo.ogImage'));
    if (title) document.title = title;
    const descriptionMeta = document.querySelector('meta[name="description"]');
    const ogTitleMeta = document.querySelector('meta[property="og:title"]');
    const ogDescriptionMeta = document.querySelector('meta[property="og:description"]');
    const ogImageMeta = document.querySelector('meta[property="og:image"]');
    if (descriptionMeta && description) descriptionMeta.content = description;
    if (ogTitleMeta && title) ogTitleMeta.content = title;
    if (ogDescriptionMeta && description) ogDescriptionMeta.content = description;
    if (ogImageMeta && ogImage) ogImageMeta.content = ogImage;

    const primary = String(valueFor('theme.primary') || '');
    const accent = String(valueFor('theme.accent') || '');
    if (/^#[0-9a-f]{6}$/i.test(primary)) root.style.setProperty('--primary', primary);
    if (/^#[0-9a-f]{6}$/i.test(accent)) root.style.setProperty('--accent', accent);

    const timePlaceholder = document.querySelector('[data-select-placeholder="time"]');
    const guestsPlaceholder = document.querySelector('[data-select-placeholder="guests"]');
    if (timePlaceholder) timePlaceholder.textContent = state.language === 'id' ? 'Pilih waktu' : 'Select a time';
    if (guestsPlaceholder) guestsPlaceholder.textContent = state.language === 'id' ? 'Pilih jumlah' : 'Select party size';

    renderMenu();
    updateWhatsAppLink();
  }

  function localized(value) {
    if (value && typeof value === 'object') return value[state.language] || value.id || value.en || '';
    return value || '';
  }

  function renderMenu() {
    const container = document.querySelector('[data-collection="sections.products.items"]');
    const items = valueFor('sections.products.items');
    if (!container || !Array.isArray(items)) return;
    container.replaceChildren();

    items.forEach((item) => {
      const article = document.createElement('article');
      article.className = 'menu-item';

      const heading = document.createElement('h3');
      heading.textContent = localized(item.name);

      const price = document.createElement('p');
      price.className = 'menu-item__price';
      price.textContent = item.price || '';

      const description = document.createElement('p');
      description.className = 'menu-item__description';
      description.textContent = localized(item.description);

      const region = document.createElement('p');
      region.className = 'menu-item__region';
      region.textContent = localized(item.region);

      article.append(heading, price, description, region);
      container.append(article);
    });
  }

  function updateWhatsAppLink() {
    const link = document.querySelector('[data-whatsapp-link]');
    if (!link) return;
    const rawNumber = String(valueFor('contact.whatsapp') || '');
    const phone = rawNumber.replace(/\D/g, '');
    if (!phone) {
      link.hidden = true;
      return;
    }
    const message = valueFor(`sections.contact.whatsappMessage.${state.language}`) || '';
    link.href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    link.hidden = false;
  }

  function setLanguage(language) {
    state.language = language === 'en' ? 'en' : 'id';
    root.lang = state.language;
    document.querySelectorAll('[data-language-button]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.languageButton === state.language));
    });
    const menuToggle = document.querySelector('[data-menu-toggle]');
    if (menuToggle) {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-label', state.language === 'id' ? (isOpen ? 'Tutup navigasi' : 'Buka navigasi') : (isOpen ? 'Close navigation' : 'Open navigation'));
    }
    applyBindings();
  }

  function setupLanguageSwitcher() {
    document.querySelectorAll('[data-language-button]').forEach((button) => {
      button.addEventListener('click', () => setLanguage(button.dataset.languageButton));
    });
  }

  function setupNavigation() {
    const header = document.querySelector('[data-header]');
    const toggle = document.querySelector('[data-menu-toggle]');
    const navigation = document.querySelector('[data-navigation]');
    if (!header || !toggle || !navigation) return;

    let previousFocus = null;

    const updateToggleLabel = (isOpen) => {
      toggle.setAttribute('aria-label', state.language === 'id' ? (isOpen ? 'Tutup navigasi' : 'Buka navigasi') : (isOpen ? 'Close navigation' : 'Open navigation'));
    };

    const closeMenu = (restoreFocus) => {
      toggle.setAttribute('aria-expanded', 'false');
      navigation.classList.remove('is-open');
      header.classList.remove('menu-visible');
      document.body.classList.remove('menu-open');
      updateToggleLabel(false);
      if (restoreFocus && previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
    };

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      if (!isOpen) previousFocus = document.activeElement;
      toggle.setAttribute('aria-expanded', String(!isOpen));
      navigation.classList.toggle('is-open', !isOpen);
      header.classList.toggle('menu-visible', !isOpen);
      document.body.classList.toggle('menu-open', !isOpen);
      updateToggleLabel(!isOpen);
      if (!isOpen) {
        const firstLink = navigation.querySelector('a, button');
        if (firstLink) firstLink.focus();
      }
    });

    document.querySelectorAll('[data-nav-link]').forEach((link) => link.addEventListener('click', () => closeMenu(false)));
    document.addEventListener('keydown', (event) => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      if (event.key === 'Escape' && isOpen) closeMenu(true);
      if (event.key === 'Tab' && isOpen) {
        const focusable = Array.from(navigation.querySelectorAll('a, button')).filter((element) => !element.hidden);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    const hero = document.querySelector('#hero');
    if (hero && 'IntersectionObserver' in window) {
      const headerObserver = new IntersectionObserver(([entry]) => {
        header.classList.toggle('is-scrolled', !entry.isIntersecting);
      }, { rootMargin: '-72px 0px 0px 0px', threshold: 0 });
      headerObserver.observe(hero);
    }
  }

  function setupReveal() {
    const elements = document.querySelectorAll('[data-reveal]');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });
    elements.forEach((element) => observer.observe(element));
  }

  function setupForm() {
    const form = document.querySelector('[data-pagiverse-form="reservation"]');
    if (!form) return;
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const status = form.querySelector('.form-status');
      if (!form.checkValidity()) {
        form.reportValidity();
        if (status) status.textContent = state.language === 'id' ? 'Periksa kembali kolom yang wajib diisi.' : 'Please review the required fields.';
        return;
      }

      if (window.PagiverseForms && typeof window.PagiverseForms.submit === 'function') {
        if (status) status.textContent = state.language === 'id' ? 'Mengirim permintaan reservasi...' : 'Sending your reservation request...';
        try {
          await window.PagiverseForms.submit('reservation', new FormData(form));
          if (status) status.textContent = state.language === 'id' ? 'Permintaan reservasi sudah dikirim.' : 'Your reservation request has been sent.';
          form.reset();
        } catch (_error) {
          if (status) status.textContent = state.language === 'id' ? 'Reservasi belum terkirim. Silakan coba lagi.' : 'The reservation was not sent. Please try again.';
        }
      } else if (status) {
        status.textContent = state.language === 'id' ? 'Mode pratinjau. Pengiriman akan aktif melalui Pagiverse Core.' : 'Preview mode. Submission will be enabled by Pagiverse Core.';
      }
    });
  }

  async function loadSchema() {
    try {
      const response = await fetch('template.json');
      if (!response.ok) throw new Error('Template schema unavailable');
      state.schema = await response.json();
    } catch (_error) {
      state.schema = { fields: {} };
    }
  }

  async function init() {
    await loadSchema();
    setupLanguageSwitcher();
    setupNavigation();
    setupReveal();
    setupForm();
    setLanguage('id');
    window.parent.postMessage({ type: 'pagiverse:ready', templateId: state.schema.id }, window.location.origin);
  }

  window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin || event.source !== window.parent) return;
    const payload = event.data;
    if (!payload || payload.type !== 'pagiverse:config' || payload.templateId !== state.schema?.id) return;
    state.data = payload.configuration && typeof payload.configuration === 'object' ? payload.configuration : {};
    setLanguage(state.language);
    window.parent.postMessage({
      type: 'pagiverse:applied',
      templateId: state.schema.id,
      revision: payload.revision
    }, window.location.origin);
  });

  init();
})();
