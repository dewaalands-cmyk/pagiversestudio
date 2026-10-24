/* TIBA — Pagiverse Standard 1. Customer copy is always treated as plain text. */
(() => {
  'use strict';

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
  const categories = ['spirits', 'lokal', 'bir', 'mixer', 'aksesori'];
  const categoryLabels = { spirits: 'Spirits', lokal: 'Rasa Lokal', bir: 'Bir', mixer: 'Soda & Mixer', aksesori: 'Perlengkapan' };
  const cardTones = { cream: '#e8dfcf', peach: '#f0c3ae', pink: '#dfcac8', blue: '#abd2eb', green: '#c8d7b4', orange: '#efb27d', red: '#e5b0b4', lilac: '#d6c8df', yellow: '#e8dfad' };
  const sectionIds = ['hero', 'products', 'about', 'services', 'gallery', 'faq', 'footer'];
  const requiredSections = new Set(['hero', 'footer']);
  const blockedKeys = new Set(['__proto__', 'prototype', 'constructor']);
  const templateId = 'tiba-beverage-editorial-001';
  const embedded = window.parent !== window;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const grid = $('#product-grid');
  const tabs = $$('#catalog-tabs [data-filter]');
  const search = $('#catalog-search');
  const dialog = $('#product-dialog');
  const defaultProducts = Array.isArray(window.TIBA_CONTENT?.products) ? window.TIBA_CONTENT.products : [];
  const approvedTones = new Set(defaultProducts.map(item => item.tone).filter(tone => typeof tone === 'string' && /^#[a-f0-9]{6}$/i.test(tone)));
  let currentFilter = 'all';
  let searchTerm = '';
  let dialogTrigger = null;
  let openedProductId = null;
  let lastProductSignature = '';
  let lastInterfaceSignature = '';
  let products = [];
  let config = { sections: { products: { items: defaultProducts } } };
  const collectionSignatures = new Map();
  let revealObserver;

  function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function readPath(object, path) {
    if (!object || !path) return undefined;
    if (Object.prototype.hasOwnProperty.call(object, path)) return object[path];
    return path.split('.').reduce((value, part) => blockedKeys.has(part) ? undefined : value?.[part], object);
  }

  function writePath(object, path, value) {
    const keys = path.split('.');
    if (keys.some(key => blockedKeys.has(key))) return;
    let target = object;
    keys.forEach((key, index) => {
      if (index === keys.length - 1) target[key] = value;
      else {
        if (!isPlainObject(target[key])) target[key] = {};
        target = target[key];
      }
    });
  }

  function mergeConfig(target, source, depth = 0) {
    if (!isPlainObject(source) || depth > 8) return target;
    Object.entries(source).forEach(([key, value]) => {
      if (blockedKeys.has(key)) return;
      if (key.includes('.')) {
        writePath(target, key, value);
      } else if (isPlainObject(value)) {
        if (!isPlainObject(target[key])) target[key] = {};
        mergeConfig(target[key], value, depth + 1);
      } else if (Array.isArray(value)) {
        target[key] = value.slice(0, 48).map(item => isPlainObject(item) ? mergeConfig({}, item, depth + 1) : item);
      } else if (['string', 'number', 'boolean'].includes(typeof value) || value === null) {
        target[key] = value;
      }
    });
    return target;
  }

  function plain(value, limit = 400) {
    return typeof value === 'string' || typeof value === 'number' ? String(value).slice(0, limit) : '';
  }

  function textLimit(path) {
    const specific = { 'contact.whatsapp': 25, 'sections.footer.whatsappLabel': 28, 'business.name': 18, 'business.tagline': 70, 'business.description': 240, 'sections.hero.eyebrow': 42, 'sections.hero.heading': 40, 'sections.hero.description': 110, 'sections.hero.notice': 70, 'sections.about.eyebrow': 40, 'sections.about.body': 500, 'sections.footer.heading': 72, 'sections.footer.copyright': 100, 'sections.footer.note': 300, 'sections.footer.backTopLabel': 30, 'sections.products.emptyLabel': 140, 'sections.products.resultLabel': 50, 'sections.products.searchLabel': 44 };
    if (specific[path]) return specific[path];
    if (path.includes('.filters.')) return 22;
    if (/label$/i.test(path)) return 28;
    if (/\.heading$/.test(path)) return 60;
    if (/\.description$/.test(path)) return 180;
    return 2000;
  }

  function safeImage(value) {
    const source = typeof value === 'string' ? value : value?.src;
    if (typeof source !== 'string') return '';
    const trimmed = source.trim();
    if (!trimmed || /[\u0000-\u001f\u007f]/.test(trimmed) || trimmed.startsWith('//') || trimmed.includes('\\')) return '';
    // Match Core image uploads without admitting active SVG or arbitrary data URLs.
    if (trimmed.startsWith('data:')) return trimmed.length <= 11534336 && /^data:image\/(?:png|jpeg|webp|avif);base64,[a-z0-9+/]+={0,2}$/i.test(trimmed) ? trimmed : '';
    if (/^https?:\/\//i.test(trimmed)) {
      try {
        const url = new URL(trimmed);
        return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : '';
      } catch { return ''; }
    }
    if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return '';
    if (trimmed.split(/[/?#]/).includes('..')) return '';
    return /^(?:\.\/)?(?:assets\/|images\/|thumbnail\.)[a-z0-9_./%() -]+(?:\?[a-z0-9=&%_.-]+)?$/i.test(trimmed) ? trimmed : '';
  }

  function focalPosition(imageValue) {
    const focal = imageValue?.focalPoint;
    if (isPlainObject(focal) && Number.isFinite(Number(focal.x)) && Number.isFinite(Number(focal.y))) {
      const x = Math.max(0, Math.min(100, Number(focal.x)));
      const y = Math.max(0, Math.min(100, Number(focal.y)));
      return `${x}% ${y}%`;
    }
    const position = imageValue?.objectPosition;
    return typeof position === 'string' && /^\d{1,3}(?:\.\d+)?% \d{1,3}(?:\.\d+)?%$/.test(position) ? position : '50% 50%';
  }

  function setImage(element, imageValue, alt) {
    if (!element) return;
    const source = safeImage(imageValue);
    if (!source) {
      element.removeAttribute('src');
      element.hidden = true;
      return;
    }
    element.hidden = false;
    if (element.getAttribute('src') !== source) element.setAttribute('src', source);
    element.alt = plain(alt ?? imageValue?.alt, 180);
    element.style.objectPosition = focalPosition(imageValue);
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = plain(text, 2000);
    return element;
  }

  function normaliseProducts(items) {
    return items.slice(0, 36).filter(isPlainObject).map((item, index) => {
      const category = categories.includes(item.category) ? item.category : 'spirits';
      return {
        id: plain(item.id, 60).replace(/[^a-z0-9_-]/gi, '') || `drink-${index + 1}`,
        name: plain(item.name, 60), category,
        categoryLabel: plain(item.categoryLabel, 32) || categoryLabels[category],
        origin: plain(item.origin, 80), description: plain(item.description, 240),
        details: plain(item.details, 700), image: item.image,
        alt: plain(item.alt, 180), tone: Object.prototype.hasOwnProperty.call(cardTones, item.tone) || approvedTones.has(item.tone) ? item.tone : 'cream'
      };
    }).filter(item => item.name);
  }

  function revealElements(context = document) {
    const elements = $$('[data-reveal]', context);
    if (embedded || reducedMotion.matches || !('IntersectionObserver' in window)) {
      elements.forEach(element => element.classList.add('is-visible'));
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }), { threshold: 0.08, rootMargin: '0px 0px 24px 0px' });
    }
    elements.forEach(element => revealObserver.observe(element));
  }

  function isSectionVisible(id) {
    if (requiredSections.has(id)) return true;
    const coreVisibility = readPath(config, `sectionVisibility.${id}`);
    return typeof coreVisibility === 'boolean' ? coreVisibility : readPath(config, `sections.${id}.visible`) !== false;
  }

  function renderProducts() {
    if (!grid) return;
    const term = searchTerm.trim().toLocaleLowerCase('id');
    const filtered = products.filter(product => (currentFilter === 'all' || product.category === currentFilter) && (!term || `${product.name} ${product.categoryLabel} ${product.description}`.toLocaleLowerCase('id').includes(term)));
    const fragment = document.createDocumentFragment();
    filtered.forEach((product, index) => {
      const article = createElement('article', `product-card tone-${product.tone.startsWith('#') ? 'custom' : product.tone}`);
      article.style.setProperty('--product-tone', cardTones[product.tone] || product.tone);
      article.dataset.productId = product.id;
      article.dataset.reveal = '';
      article.style.setProperty('--card-index', index % 4);
      const visual = createElement('div', 'product-visual');
      const source = safeImage(product.image);
      if (source) {
        const image = createElement('img', 'product-image');
        setImage(image, product.image, product.alt || product.name);
        image.loading = 'lazy';
        image.decoding = 'async';
        image.width = 600;
        image.height = 720;
        image.addEventListener('error', () => {
          image.remove();
          visual.classList.add('is-placeholder');
          visual.append(createElement('span', 'product-placeholder', product.categoryLabel));
        }, { once: true });
        visual.append(image);
      } else {
        visual.classList.add('is-placeholder');
        visual.append(createElement('span', 'product-placeholder', product.categoryLabel));
      }
      visual.append(createElement('span', 'product-category', product.categoryLabel));
      const copy = createElement('div', 'product-copy');
      copy.append(createElement('h3', 'product-name', product.name));
      if (product.origin) copy.append(createElement('p', 'product-origin', product.origin));
      copy.append(createElement('p', 'product-description', product.description));
      const button = createElement('button', 'product-detail', product.category === 'aksesori' ? plain(readPath(config, 'sections.products.accessoryDetailLabel'), 28) || 'Lihat detail' : plain(readPath(config, 'sections.products.detailLabel'), 28) || 'Kenali minuman');
      button.type = 'button';
      button.dataset.productId = product.id;
      button.setAttribute('aria-label', `${button.textContent}: ${product.name}`);
      copy.append(button);
      article.append(visual, copy);
      fragment.append(article);
    });
    if (!filtered.length) {
      const empty = createElement('p', 'catalog-empty', plain(readPath(config, 'sections.products.emptyLabel'), 140) || 'Belum ada minuman untuk pencarian ini.');
      empty.setAttribute('role', 'status');
      fragment.append(empty);
    }
    grid.replaceChildren(fragment);
    const count = $('#result-count');
    if (count) count.textContent = `${filtered.length} ${plain(readPath(config, 'sections.products.resultLabel'), 50) || 'item dalam koleksi'}`;
    tabs.forEach(tab => {
      const selected = tab.dataset.filter === currentFilter;
      tab.setAttribute('aria-selected', String(selected));
      tab.id ||= `catalog-tab-${tab.dataset.filter}`;
      if (selected) grid.setAttribute('aria-labelledby', tab.id);
      tab.tabIndex = selected ? 0 : -1;
      tab.classList.toggle('is-active', selected);
    });
    revealElements(grid);
  }

  function fillDialog(product) {
    if (!dialog) return;
    setImage($('#dialog-image'), product.image, product.alt || product.name);
    const photo = $('.dialog-photo', dialog);
    $('.product-placeholder', photo || dialog)?.remove();
    if (photo && !safeImage(product.image)) photo.append(createElement('span', 'product-placeholder', 'Foto belum tersedia'));
    const fields = { '#dialog-category': product.categoryLabel, '#dialog-title': product.name, '#dialog-description': product.description, '#dialog-details': product.details, '#dialog-origin': product.origin };
    Object.entries(fields).forEach(([selector, value]) => { const element = $(selector); if (element) element.textContent = value; });
    dialog.dataset.tone = product.tone;
  }

  function closeDialog() {
    if (!dialog) return;
    if (dialog.open) dialog.close();
    openedProductId = null;
    document.body.classList.remove('dialog-open');
    if (dialogTrigger?.isConnected) dialogTrigger.focus({ preventScroll: true });
  }

  function openDialog(id, trigger) {
    const product = products.find(item => item.id === id);
    if (!product || !dialog) return;
    fillDialog(product);
    dialogTrigger = trigger;
    openedProductId = id;
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('dialog-open');
    $('[data-dialog-close]', dialog)?.focus({ preventScroll: true });
  }

  function setMenu(open) {
    const toggle = $('#menu-toggle');
    const menu = $('#mobile-menu');
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
  }

  function setSearch(open) {
    const panel = $('#search-panel');
    const toggle = $('#search-toggle');
    if (!panel) return;
    panel.hidden = !open;
    toggle?.setAttribute('aria-expanded', String(open));
    if (open) search?.focus({ preventScroll: true });
    else if (document.activeElement && panel.contains(document.activeElement)) toggle?.focus({ preventScroll: true });
  }

  function updateCollection(path, selector, buildItem) {
    const items = readPath(config, path);
    const container = $(selector);
    if (!Array.isArray(items) || !container) return;
    const bounded = items.slice(0, path.includes('.faq.') ? 12 : path.includes('.gallery.') ? 6 : 8);
    const signature = JSON.stringify(bounded);
    if (collectionSignatures.get(path) === signature) return;
    const openKeys = new Set($$('details[open]', container).map(element => element.dataset.itemKey));
    const focused = container.contains(document.activeElement) ? document.activeElement.closest('[data-item-key]')?.dataset.itemKey : null;
    const fragment = document.createDocumentFragment();
    bounded.filter(isPlainObject).forEach((item, index) => {
      const element = buildItem(item, index);
      element.dataset.itemKey = plain(item.id, 40) || String(index);
      if (openKeys.has(element.dataset.itemKey) && element.tagName === 'DETAILS') element.open = true;
      fragment.append(element);
    });
    container.replaceChildren(fragment);
    collectionSignatures.set(path, signature);
    if (focused) $$('[data-item-key]', container).find(element => element.dataset.itemKey === focused)?.querySelector('summary,button,a')?.focus({ preventScroll: true });
    revealElements(container);
  }

  function applyConfig(incoming = {}) {
    if (!isPlainObject(incoming)) return;
    mergeConfig(config, incoming);
    $$('[data-field]').forEach(element => {
      const value = readPath(config, element.dataset.field);
      if (typeof value === 'string' || typeof value === 'number') {
        const content = plain(value, Number(element.dataset.maxLength) || textLimit(element.dataset.field));
        if (element.textContent !== content) element.textContent = content;
      }
    });
    $$('.wordmark,.footer-logo').forEach(element => {
      const length = (element.querySelector('[data-field="business.name"]')?.textContent || '').length;
      element.classList.toggle('is-long-name', length > 6 && length <= 12);
      element.classList.toggle('is-very-long-name', length > 12);
    });
    const contactNumber = plain(readPath(config, 'contact.whatsapp'), 25).replace(/[^0-9]/g, '');
    $$('[data-whatsapp-link]').forEach(link => {
      if (/^[1-9][0-9]{7,14}$/.test(contactNumber)) {
        const brand = plain(readPath(config, 'business.name'), 18) || 'TIBA';
        const message = `Halo, saya ingin bertanya tentang informasi dalam katalog ${brand}.`;
        link.href = `https://wa.me/${contactNumber}?text=${encodeURIComponent(message)}`;
        link.removeAttribute('aria-disabled');
      } else {
        link.removeAttribute('href');
        link.setAttribute('aria-disabled', 'true');
      }
    });
    $$('[data-image]').forEach(element => {
      const value = readPath(config, element.dataset.image);
      if (value !== undefined) setImage(element, value, readPath(config, element.dataset.imageAlt || `${element.dataset.image}Alt`));
    });
    sectionIds.forEach(id => {
      const section = $(`[data-section="${id}"]`);
      const visible = isSectionVisible(id);
      if (section) section.hidden = !visible;
      $$(`[data-nav-id="${id}"]`).forEach(link => { link.hidden = !visible || readPath(config, `navigation.items.${id}.visible`) === false; });
    });
    if (Array.isArray(config.navigation?.items)) {
      config.navigation.items.slice(0, 7).forEach(item => {
        if (!isPlainObject(item) || !sectionIds.includes(item.id)) return;
        $$(`[data-nav-id="${item.id}"]`).forEach(link => {
          if (typeof item.label === 'string') {
            const label = $('[data-nav-label]', link) || link;
            if (label.textContent !== plain(item.label, 26)) label.textContent = plain(item.label, 26);
          }
          link.hidden = item.visible === false || !isSectionVisible(item.id);
        });
      });
    }
    const items = readPath(config, 'sections.products.items');
    const interfaceSignature = JSON.stringify(['detailLabel', 'accessoryDetailLabel', 'emptyLabel', 'resultLabel'].map(key => readPath(config, `sections.products.${key}`)));
    let catalogChanged = interfaceSignature !== lastInterfaceSignature;
    lastInterfaceSignature = interfaceSignature;
    if (Array.isArray(items)) {
      const signature = JSON.stringify(items.slice(0, 36));
      if (signature !== lastProductSignature) {
        products = normaliseProducts(items);
        lastProductSignature = signature;
        catalogChanged = true;
        if (openedProductId) {
          const activeProduct = products.find(product => product.id === openedProductId);
          if (activeProduct) fillDialog(activeProduct);
          else closeDialog();
        }
      }
    }
    if (catalogChanged) renderProducts();
    updateCollection('sections.faq.items', '#faq-list', item => {
      const detail = createElement('details', 'faq-item');
      const summary = createElement('summary', '', plain(item.question, 140));
      const icon = createElement('span', '', '+');
      icon.setAttribute('aria-hidden', 'true');
      summary.append(icon);
      detail.append(summary, createElement('p', '', plain(item.answer, 600)));
      return detail;
    });
    updateCollection('sections.services.items', '#services-list', (item, index) => {
      const category = ['spirits', 'lokal', 'bir', 'mixer'][index % 4];
      const article = createElement('article', `category-block category-${category}`);
      article.dataset.reveal = '';
      article.append(createElement('span', 'category-number', String(index + 1).padStart(2, '0')), createElement('h3', '', plain(item.title, 60)), createElement('p', '', plain(item.description, 280)));
      const link = createElement('a', '', plain(readPath(config, 'sections.services.itemLinkLabel'), 28) || 'Kenali kategorinya');
      link.href = '#products';
      link.dataset.categoryLink = category;
      const arrow = createElement('span', '', '↗');
      arrow.setAttribute('aria-hidden', 'true');
      link.append(arrow);
      article.append(link);
      return article;
    });
    updateCollection('sections.gallery.items', '#gallery-grid', (item, index) => {
      const article = createElement('article', 'visual-note');
      article.dataset.reveal = '';
      const frame = createElement('div', `note-image note-image-${index % 2 ? 'two' : 'one'}`);
      const image = createElement('img');
      setImage(image, item.image, item.alt);
      image.loading = 'lazy';
      image.decoding = 'async';
      image.width = 800;
      image.height = 960;
      const caption = createElement('div', 'note-caption');
      caption.append(createElement('h3', '', plain(item.title, 60)), createElement('p', '', plain(item.description, 180)));
      frame.append(image);
      article.append(frame, caption);
      return article;
    });
    const categoryLabel = readPath(config, 'sections.services.itemLinkLabel');
    if (typeof categoryLabel === 'string') $$('#services-list [data-category-link]').forEach(link => {
      const textNode = [...link.childNodes].find(node => node.nodeType === Node.TEXT_NODE);
      if (textNode) textNode.textContent = plain(categoryLabel, 28);
    });
    $$('a[href^="#"]').forEach(link => {
      const id = link.getAttribute('href').slice(1);
      if (!sectionIds.includes(id)) return;
      const visible = isSectionVisible(id);
      const navItem = link.dataset.navId && config.navigation?.items?.find?.(item => item.id === link.dataset.navId);
      link.hidden = !visible || navItem?.visible === false;
    });
    const title = readPath(config, 'seo.title');
    const description = readPath(config, 'seo.description');
    if (typeof title === 'string') document.title = plain(title, 70);
    if (typeof description === 'string') $('meta[name="description"]')?.setAttribute('content', plain(description, 180));
    const ogImage = readPath(config, 'seo.ogImage');
    if (ogImage !== undefined && safeImage(ogImage)) $('meta[property="og:image"]')?.setAttribute('content', safeImage(ogImage));
    revealElements();
  }

  // Read semantic defaults once, so a partial Core update keeps all other copy.
  $$('[data-field]').forEach(element => writePath(config, element.dataset.field, element.textContent.trim()));
  $$('[data-image]').forEach(element => {
    writePath(config, element.dataset.image, element.getAttribute('src') || '');
    if (element.dataset.imageAlt) writePath(config, element.dataset.imageAlt, element.alt || '');
  });
  const defaultNavigation = [];
  $$('[data-nav-id]').forEach(link => {
    const id = link.dataset.navId;
    if (!defaultNavigation.some(item => item.id === id)) defaultNavigation.push({ id, label: ($('[data-nav-label]', link) || link).textContent.trim(), target: `#${id}`, visible: true });
  });
  config.navigation = { items: defaultNavigation };
  const staticCollections = {
    'sections.services.items': $$('#services-list .category-block').map(article => ({ title: $('h3', article)?.textContent.trim() || '', description: $('p', article)?.textContent.trim() || '' })),
    'sections.gallery.items': $$('#gallery-grid .visual-note').map(article => ({ title: $('h3', article)?.textContent.trim() || '', description: $('p', article)?.textContent.trim() || '', image: $('img', article)?.getAttribute('src') || '', alt: $('img', article)?.alt || '' })),
    'sections.faq.items': $$('#faq-list details').map(detail => ({ question: [...($('summary', detail)?.childNodes || [])].filter(node => node.nodeType === Node.TEXT_NODE).map(node => node.textContent).join('').trim(), answer: $('p', detail)?.textContent.trim() || '' }))
  };
  Object.entries(staticCollections).forEach(([path, items]) => {
    writePath(config, path, items);
    collectionSignatures.set(path, JSON.stringify(items));
  });
  $$('#faq-list details').forEach((detail, index) => { detail.dataset.itemKey = String(index); });
  if (!embedded && !reducedMotion.matches && 'IntersectionObserver' in window) document.documentElement.classList.add('js-motion');
  const hero = $('#hero');
  const header = $('.site-header');
  if (hero && header && 'IntersectionObserver' in window) {
    const headerObserver = new IntersectionObserver(entries => {
      header.classList.toggle('is-scrolled', entries[0].boundingClientRect.bottom <= 100);
    }, { threshold: 0, rootMargin: '-100px 0px 0px 0px' });
    headerObserver.observe(hero);
  }
  grid?.addEventListener('click', event => {
    const button = event.target.closest('button[data-product-id]');
    if (button) openDialog(button.dataset.productId, button);
  });
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      currentFilter = ['all', ...categories].includes(tab.dataset.filter) ? tab.dataset.filter : 'all';
      renderProducts();
      if (grid) grid.scrollLeft = 0;
    });
    tab.addEventListener('keydown', event => {
      let target;
      if (event.key === 'ArrowRight') target = tabs[(index + 1) % tabs.length];
      if (event.key === 'ArrowLeft') target = tabs[(index - 1 + tabs.length) % tabs.length];
      if (event.key === 'Home') target = tabs[0];
      if (event.key === 'End') target = tabs[tabs.length - 1];
      if (!target) return;
      event.preventDefault();
      target.focus();
      target.click();
    });
  });
  search?.addEventListener('input', () => { searchTerm = search.value.slice(0, 100); renderProducts(); if (grid) grid.scrollLeft = 0; });
  $('[data-search-close]')?.addEventListener('click', () => setSearch(false));
  $('#search-toggle')?.addEventListener('click', () => setSearch($('#search-panel')?.hidden !== false));
  $('#menu-toggle')?.addEventListener('click', () => setMenu($('#menu-toggle').getAttribute('aria-expanded') !== 'true'));
  $$('#mobile-menu a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', event => {
    const link = event.target.closest('[data-category-link]');
    if (!link || !categories.includes(link.dataset.categoryLink)) return;
    currentFilter = link.dataset.categoryLink;
    renderProducts();
    if (grid) grid.scrollLeft = 0;
    setMenu(false);
  });
  $$('[data-catalog-prev], [data-catalog-next]').forEach(button => button.addEventListener('click', () => {
    if (!grid) return;
    const direction = button.hasAttribute('data-catalog-prev') ? -1 : 1;
    grid.scrollBy({ left: direction * grid.clientWidth * 0.9, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }));
  $$('[data-dialog-close]').forEach(button => button.addEventListener('click', closeDialog));
  dialog?.addEventListener('click', event => { if (event.target === dialog) closeDialog(); });
  dialog?.addEventListener('close', () => {
    openedProductId = null;
    document.body.classList.remove('dialog-open');
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if ($('#mobile-menu')?.hidden === false) { setMenu(false); $('#menu-toggle')?.focus(); }
    if ($('#search-panel')?.hidden === false) setSearch(false);
  });
  $('#back-top')?.addEventListener('click', event => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    $('#hero')?.focus({ preventScroll: true });
  });
  reducedMotion.addEventListener?.('change', () => { if (reducedMotion.matches) $$('[data-reveal]').forEach(element => element.classList.add('is-visible')); });
  document.addEventListener('pagiverse:config', event => applyConfig(event.detail?.configuration || event.detail?.config || event.detail));
  window.addEventListener('message', event => {
    const message = event.data;
    if (!embedded || event.source !== window.parent || event.origin !== window.location.origin) return;
    if (!isPlainObject(message) || message.type !== 'pagiverse:config' || (message.templateId && message.templateId !== templateId)) return;
    const incoming = message.configuration || message.config || message.detail?.configuration || message.detail?.config || message.detail;
    if (!isPlainObject(incoming)) return;
    applyConfig(incoming);
    const applied = { type: 'pagiverse:applied', templateId, revision: message.revision };
    document.dispatchEvent(new CustomEvent('pagiverse:applied', { detail: applied }));
    window.parent.postMessage(applied, event.origin);
  });
  window.TIBA_TEMPLATE = { applyConfig, getConfig: () => JSON.parse(JSON.stringify(config)) };
  applyConfig();
  document.documentElement.classList.add('js-ready');
  const ready = { type: 'pagiverse:ready', templateId, pagiverseStandard: 1 };
  document.dispatchEvent(new CustomEvent('pagiverse:ready', { detail: ready }));
  if (embedded) window.parent.postMessage(ready, window.location.origin);
})();
