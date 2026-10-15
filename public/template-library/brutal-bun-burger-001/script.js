/* Pagiverse Website Blank v1 infrastructure adapted for the protected BRUTAL BUN design. */
(() => {
  'use strict';
  let schema, configuration = window.PAGIVERSE_DATA || {}, selected = 'all';
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object || {}, key);
  const configured = path => own(configuration, path) ? configuration[path] : path.split('.').reduce((value, key) => value && own(value, key) ? value[key] : undefined, configuration);
  const value = path => configured(path) ?? schema?.fields[path]?.default;
  const text = path => String(value(path) ?? '').slice(0, schema?.fields[path]?.maxLength || 1000);
  const node = (tag, className, content) => { const result = document.createElement(tag); if (className) result.className = className; if (content !== undefined) result.textContent = String(content); return result; };
  const categories = ['all', 'sapi', 'ayam', 'plant'];
  function safeURL(input, image = false) {
    const source = String(input || '').trim();
    if (image && /^(?:\.\/)?assets\/[a-z0-9._/-]+$/i.test(source) && !source.split('/').includes('..')) return source;
    if (image && /^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(source)) return source;
    try { const url = new URL(source); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; }
  }
  function applyImage(element, raw, fallback = '') {
    const info = typeof raw === 'string' ? { src: raw } : raw || {};
    const source = safeURL(info.src, true);
    if (source) { element.src = source; element.hidden = false; } else { element.removeAttribute('src'); element.hidden = true; }
    element.alt = String(fallback || info.alt || info.altId || text('business.name'));
    const coordinate = input => Number.isFinite(Number(input)) ? Math.max(0, Math.min(100, Number(input))) : 50;
    element.style.objectPosition = `${coordinate(info.focalPoint?.x)}% ${coordinate(info.focalPoint?.y)}%`;
    element.style.objectFit = ['cover', 'contain'].includes(info.fit) ? info.fit : element.closest('.logo') ? 'contain' : 'cover';
  }
  function array(path) {
    const descriptor = schema.fields[path], items = value(path);
    if (!Array.isArray(items)) return [];
    return items.slice(0, descriptor.maxItems).filter(item => item && typeof item === 'object' && !Array.isArray(item)).map(item => {
      const result = {};
      for (const [key, field] of Object.entries(descriptor.item.fields)) {
        const raw = item[key] ?? field.default ?? '';
        result[key] = field.type === 'image' ? raw : String(raw).slice(0, field.maxLength || 300);
        if (field.type === 'select' && !field.options.some(option => (option.value ?? option) === result[key])) result[key] = field.default || field.options[0].value;
      }
      return result;
    });
  }
  function renderProducts() {
    const products = array('sections.products.items');
    if (selected !== 'all' && !products.some(item => item.category === selected)) selected = 'all';
    const filters = document.querySelector('.filters');
    filters.replaceChildren(...categories.map(category => {
      const button = node('button', selected === category ? 'active' : '', text(`sections.products.filters.${category}`));
      const count = category === 'all' ? products.length : products.filter(item => item.category === category).length;
      button.type = 'button'; button.dataset.filter = category; button.setAttribute('aria-pressed', String(selected === category));
      button.disabled = category !== 'all' && count === 0;
      button.append(node('span', '', String(count).padStart(2, '0')));
      return button;
    }));
    const visible = products.filter(item => selected === 'all' || selected === item.category);
    const cards = visible.map(item => {
      const article = node('article', 'menu-card'), frame = node('div', 'card-image'), image = node('img');
      applyImage(image, item.image, item.alt || item.name); image.loading = 'lazy'; image.width = 800; image.height = 600;
      frame.append(image, node('span', 'card-category', text(`sections.products.filters.${item.category}`)), node('span', 'card-number', String(products.indexOf(item) + 1).padStart(2, '0')));
      const content = node('div', 'card-content'), row = node('div', 'card-title');
      row.append(node('h3', '', item.name), node('span', '', item.price));
      content.append(node('span', 'card-tag', item.tag), row, node('p', '', item.description)); article.append(frame, content); return article;
    });
    document.querySelector('#menu-grid').replaceChildren(...cards);
    document.querySelector('.empty-menu').hidden = visible.length > 0;
    document.querySelector('#filter-status').textContent = `${visible.length} menu ditampilkan`;
  }
  function fitHeadings() {
    for (const heading of document.querySelectorAll('h1,h2')) {
      if (!heading.getClientRects().length) continue;
      heading.style.transform = 'none'; heading.style.width = 'max-content';
      const width = heading.getBoundingClientRect().width;
      const parentStyle = getComputedStyle(heading.parentElement);
      const contentWidth = heading.parentElement.clientWidth - parseFloat(parentStyle.paddingLeft) - parseFloat(parentStyle.paddingRight);
      const available = heading.closest('.hero') ? Math.min(contentWidth, innerWidth > 1000 ? innerWidth * .55 : contentWidth) : contentWidth;
      heading.style.transform = `scaleX(${Math.min(1, available / Math.max(width, 1))})`;
      heading.style.transformOrigin = 'left center';
      heading.style.marginRight = `${Math.min(0, available - width)}px`;
    }
  }
  function render() {
    document.querySelectorAll('[data-bind]').forEach(element => { element.textContent = text(element.dataset.bind); });
    document.querySelectorAll('[data-bind-src]').forEach(element => applyImage(element, value(element.dataset.bindSrc)));
    document.querySelectorAll('[data-bind-href]').forEach(element => {
      const href = safeURL(value(element.dataset.bindHref));
      if (href) { element.href = href; element.removeAttribute('aria-disabled'); element.removeAttribute('tabindex'); }
      else { element.removeAttribute('href'); element.setAttribute('aria-disabled', 'true'); element.setAttribute('tabindex', '-1'); }
    });
    for (const section of schema.sections) {
      const element = document.querySelector(`[data-section="${section.id}"]`);
      if (element) element.hidden = !section.required && (configured(`sectionVisibility.${section.id}`) ?? section.visibleByDefault) === false;
    }
    document.querySelectorAll('[data-nav]').forEach(element => {
      const item = schema.navigation.items.find(item => item.id === element.dataset.nav);
      const visible = !item?.section || !document.querySelector(`[data-section="${item.section}"]`)?.hidden;
      element.hidden = !visible || (item.hideable && configured(`navigationVisibility.${item.id}`) === false);
    });
    for (const [key, descriptor] of Object.entries(schema.theme.tokens)) {
      const raw = descriptor.editable ? value(`theme.${key}`) : descriptor.default;
      if (/^#[0-9a-f]{6}$/i.test(raw)) document.documentElement.style.setProperty(`--color-${key}`, raw);
    }
    document.title = text('seo.title');
    document.querySelector('meta[name="description"]').content = text('seo.description');
    document.querySelector('meta[property="og:title"]').content = text('seo.title');
    document.querySelector('meta[property="og:description"]').content = text('seo.description');
    const og = value('seo.ogImage'); document.querySelector('meta[property="og:image"]').content = safeURL(typeof og === 'string' ? og : og?.src, true);
    const hours = document.querySelector('[data-collection="sections.location.hours"]');
    hours.replaceChildren(...array('sections.location.hours').map(item => { const row = node('div'); row.append(node('dt', '', item.days), node('dd', '', item.time)); return row; }));
    renderProducts(); requestAnimationFrame(fitHeadings);
  }
  document.querySelector('.filters').addEventListener('click', event => {
    const button = event.target.closest('button[data-filter]');
    if (!button || !schema) return;
    selected = button.dataset.filter; renderProducts();
    document.querySelector(`button[data-filter="${selected}"]`)?.focus({ preventScroll: true });
  });
  window.addEventListener('resize', fitHeadings);
  window.addEventListener('message', event => {
    const payload = event.data;
    if (!schema || event.source !== window.parent || event.origin !== location.origin || payload?.type !== 'pagiverse:config' || payload.templateId !== schema.id) return;
    configuration = payload.configuration && typeof payload.configuration === 'object' && !Array.isArray(payload.configuration) ? payload.configuration : {};
    render();
    window.parent.postMessage({ type: 'pagiverse:applied', templateId: schema.id, revision: payload.revision }, location.origin);
  });
  async function init() {
    const response = await fetch('template.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Template schema unavailable');
    schema = await response.json(); render();
    document.fonts.ready.then(fitHeadings);
    if (window.parent !== window) window.parent.postMessage({ type: 'pagiverse:ready', templateId: schema.id }, location.origin);
  }
  init().catch(error => console.error(error));
})();
