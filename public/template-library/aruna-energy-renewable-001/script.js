(() => {
  'use strict';
  const TEMPLATE_ID = 'aruna-energy-renewable-001';
  const state = { schema: null, data: window.PAGIVERSE_DATA || {}, templates: new Map(), filter: 'semua', observer: null };
  const renderedFaqCollections = new WeakMap();
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object || {}, key);
  function nested(object, path) { return path.split('.').reduce((v, key) => v && typeof v === 'object' && own(v, key) ? v[key] : undefined, object); }
  function get(path) { let value=own(state.data,path)?state.data[path]:nested(state.data,path);if(value===undefined){const parts=path.split('.');for(let index=parts.length-1;index>0;index--){const prefix=parts.slice(0,index).join('.');if(own(state.data,prefix)){value=nested(state.data[prefix],parts.slice(index).join('.'));break;}}}return value===undefined?state.schema?.fields?.[path]?.default:value; }
  function safeImage(value) {
    const src = typeof value === 'string' ? value : value?.src;
    if (typeof src !== 'string' || !src) return '';
    if (/^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(src)) return src;
    if (/^assets\/[a-z0-9._/-]+$/i.test(src) && !src.split('/').includes('..')) return src;
    try { const url = new URL(src); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
  }
  function paintImage(element, value) {
    const src = safeImage(value);
    element.hidden = !src;
    const designSource=state.schema?.fields?.[element.dataset.bindSrc]?.default;
    const customized=Boolean(src && src!==safeImage(designSource));
    const backdrop=element.closest('.hero, .wind-section');
    if(backdrop)backdrop.classList.toggle('is-custom-photo',customized);
    if (src) element.src = src; else element.removeAttribute('src');
    element.alt = value && typeof value === 'object' ? String(value.altId || value.altEn || '').slice(0, 180) : '';
    const declaredAlt=element.dataset.bindAlt?get(element.dataset.bindAlt):undefined;if(typeof declaredAlt==='string')element.alt=declaredAlt.slice(0,180);const focal = value && typeof value === 'object' ? {...value.focalPoint} : {};if(element.dataset.bindSrc){for(const axis of ['x','y']){const configured=get(element.dataset.bindSrc+'.focalPoint.'+axis);if(configured!==undefined)focal[axis]=configured;}}
    const coordinate = v => Number.isFinite(Number(v)) ? Math.min(100, Math.max(0, Number(v))) : 50;
    element.style.objectPosition = coordinate(focal?.x) + '% ' + coordinate(focal?.y) + '%';
  }
  function scalar(descriptor, value) {
    if (descriptor?.type === 'image') return typeof value==='string'?value:{src:safeImage(value),altId:String(value?.altId||''),altEn:String(value?.altEn||''),focalPoint:{x:value?.focalPoint?.x??50,y:value?.focalPoint?.y??50}};
    if (descriptor?.type === 'select') { const allowed = (descriptor.options || []).map(o => typeof o === 'string' ? o : o.value); return allowed.includes(value) ? value : descriptor.default || ''; }
    return String(value ?? '').slice(0, descriptor?.maxLength || 1200);
  }
  function items(path) {
    const descriptor = state.schema?.fields?.[path]; const source = get(path);
    if (!Array.isArray(source)) return [];
    return source.slice(0,descriptor?.maxItems||12).filter(v=>v&&typeof v==='object'&&!Array.isArray(v)).map(item=>{const result={};for(const[key,d]of Object.entries(descriptor?.item?.fields||{})){const configured=own(item,key)?item[key]:nested(item,key);const value=scalar(d,configured===undefined?d.default:configured);const parts=key.split('.');let target=result;parts.forEach((part,index)=>{if(index===parts.length-1)target[part]=value;else{if(!target[part]||typeof target[part]!=='object')target[part]={};target=target[part];}});}return result;});
  }
  function renderCollections() {
    document.querySelectorAll('[data-collection]').forEach(container => {
      const path = container.dataset.collection; const template = state.templates.get(path); if (!template) return;
      const collectionItems = items(path);
      const faqSignature = path === 'sections.faq.items' ? JSON.stringify(collectionItems) : null;
      // Preserve native disclosure state and focus when only other content changes.
      if (faqSignature !== null && renderedFaqCollections.get(container) === faqSignature) return;
      const fragment = document.createDocumentFragment();
      collectionItems.forEach((item, index) => {
        const clone = template.content.cloneNode(true);
        clone.querySelectorAll('[data-item-bind]').forEach(el => {
          const key = el.dataset.itemBind; const value = item[key];
          // Keep the FAQ expand glyph as protected structure.
          if (el.tagName === 'SUMMARY') { const glyph = document.createElement('span'); glyph.setAttribute('aria-hidden', 'true'); glyph.textContent = '+'; el.textContent = String(value || '').replace(/\s*\+$/, ''); el.append(glyph); }
          else el.textContent = String(value || '');
        });
        clone.querySelectorAll('[data-item-image]').forEach(el => paintImage(el, item[el.dataset.itemImage]));
        clone.querySelectorAll('[data-project-index]').forEach(el => {
          el.dataset.projectIndex = String(index);
          if (el.classList.contains('project-image-button')) el.setAttribute('aria-label', 'Lihat detail ' + item.name);
        });
        clone.querySelectorAll('[data-item-type-label]').forEach(el => el.textContent = String(get('sections.gallery.type.' + item.type) || item.type));
        clone.querySelectorAll('[data-item-capacity]').forEach(el => el.textContent = String(get('sections.gallery.capacityLabel') || '') + ' ' + item.capacity);
        const card = clone.querySelector('.project-card'); if (card) card.dataset.projectType = item.type;
        fragment.append(clone);
      });
      container.replaceChildren(fragment);
      if (faqSignature !== null) renderedFaqCollections.set(container, faqSignature);
    });
  }
  function renderBindings() {
    document.querySelectorAll('[data-bind]').forEach(el => { const value = get(el.dataset.bind); if (value !== undefined && value !== null && typeof value !== 'object') {const descriptor=state.schema.fields[el.dataset.bind];let text=scalar(descriptor,value);if(!String(text).trim()&&el.closest('a,button,label,option'))text=descriptor?.default||'';el.textContent=String(text);} });
    document.querySelectorAll('[data-bind-src]').forEach(el => paintImage(el, get(el.dataset.bindSrc)));
    document.querySelectorAll('[data-bind-placeholder]').forEach(el => el.placeholder = String(get(el.dataset.bindPlaceholder) || ''));
    document.querySelectorAll('.brand').forEach(el => {
      const logo = el.querySelector('.brand-logo');
      const value = get('business.logo'); const src = safeImage(value);
      const name = String(get('business.name') || '');
      const defaultLogoWithNewName = src === 'assets/logo-aruna.svg' && name !== state.schema.fields['business.name'].default;
      const showLogo = Boolean(src && !defaultLogoWithNewName);
      if (logo) logo.hidden = !showLogo;
      el.toggleAttribute('data-has-logo', showLogo);
      el.setAttribute('aria-label', name + ', beranda');
    });
  }
  function luminance(hex) { const channels = hex.match(/[a-f0-9]{2}/gi).map(x => parseInt(x, 16) / 255).map(v => v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4)); return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2]; }
  function renderTheme() {
    const accent = get('theme.accent');
    if (typeof accent !== 'string' || !/^#[a-f0-9]{6}$/i.test(accent)) return;
    const light = luminance(accent) > .179;
    document.documentElement.style.setProperty('--accent', accent);
    document.documentElement.style.setProperty('--accent-ink', light ? '#000000' : '#ffffff');
    document.documentElement.style.setProperty('--focus', luminance(accent) < .13 ? '#ededf3' : accent);
  }
  function renderVisibility() {
    (state.schema.sections || []).forEach(section => {
      const value = get('sectionVisibility.' + section.id);
      const visible = section.required || (typeof value === 'boolean' ? value : section.visibleByDefault !== false);
      document.querySelectorAll('[data-section="' + section.id + '"]').forEach(el => el.hidden = !visible);
    });
  }
  function renderMetadata() {
    const page = document.body.dataset.page;
    const title = get(page === 'home' ? 'seo.title' : 'seo.pages.' + page + '.title');
    const description = get(page === 'home' ? 'seo.description' : 'seo.pages.' + page + '.description');
    if (title) document.title = String(title);
    const meta = document.querySelector('meta[name="description"]'); if (meta && description) meta.content = String(description);
    const ogTitle = document.querySelector('meta[property="og:title"]'); if (ogTitle && title) ogTitle.content = String(title);
    const og = document.querySelector('meta[property="og:image"]'); if (og) og.content = safeImage(get('seo.ogImage'));
  }
  function filterProjects() {
    let count = 0;
    document.querySelectorAll('[data-project-type]').forEach(card => { const show = state.filter === 'semua' || state.filter === card.dataset.projectType; card.hidden = !show; if (show) count++; });
    const counter = document.getElementById('project-count'); if (counter) counter.textContent = count + ' ' + String(get('sections.gallery.countLabel') || 'proyek');
    const empty = document.getElementById('projects-empty'); if (empty) empty.hidden = count !== 0;
    document.querySelectorAll('[data-filter]').forEach(button => { const active = button.dataset.filter === state.filter; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
  }
  function setupReveals() {
    state.observer?.disconnect();
    const els = [...document.querySelectorAll('.reveal')];
    if (window.parent !== window || window.matchMedia('(prefers-reduced-motion:reduce)').matches || !('IntersectionObserver' in window)) { els.forEach(el => { el.classList.remove('is-pending'); el.classList.add('is-visible'); }); return; }
    state.observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.remove('is-pending'); entry.target.classList.add('is-visible'); state.observer.unobserve(entry.target); } }), { threshold: .08 });
    els.forEach(el => { if (!el.classList.contains('is-visible')) { el.classList.add('is-pending'); state.observer.observe(el); } });
  }
  function checkNavigationLayout() { const header=document.querySelector('.site-header'),wrap=document.querySelector('.nav-wrap');if(!header||!wrap)return;header.classList.remove('nav-overflow');if(window.innerWidth>1200&&wrap.scrollWidth>wrap.clientWidth+1)header.classList.add('nav-overflow'); }
  function render() { renderCollections(); renderBindings(); renderTheme(); renderVisibility(); renderMetadata(); filterProjects(); setupReveals(); checkNavigationLayout(); }
  function setupUI() {
    const header = document.querySelector('.site-header'), sentinel = document.querySelector('.nav-sentinel'), toggle = document.querySelector('.menu-toggle'), mobile = document.querySelector('#mobile-nav');
    if (window.ResizeObserver) new ResizeObserver(checkNavigationLayout).observe(document.querySelector('.nav-wrap'));
    if (header && sentinel && 'IntersectionObserver' in window) new IntersectionObserver(([entry]) => header.classList.toggle('is-scrolled', !entry.isIntersecting)).observe(sentinel);
    const closeMenu = () => { if (!toggle || !mobile) return; toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Buka navigasi'); mobile.hidden = true; header.classList.remove('menu-open'); };
    if (toggle && mobile) {
      toggle.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'Tutup navigasi' : 'Buka navigasi'); mobile.hidden = !open; header.classList.toggle('menu-open', open); });
      mobile.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
      window.matchMedia('(min-width:1201px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
      document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
    }
    document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => { state.filter = button.dataset.filter; filterProjects(); }));
    const dialog = document.getElementById('project-dialog');
    document.addEventListener('click', event => {
      const button = event.target.closest('[data-project-index]'); if (!button || !dialog) return;
      const item = items('sections.gallery.items')[Number(button.dataset.projectIndex)]; if (!item) return;
      document.getElementById('dialog-title').textContent = item.name;
      document.getElementById('dialog-location').textContent = item.location;
      document.getElementById('dialog-description').textContent = item.description;
      document.getElementById('dialog-scope').textContent = item.scope;
      document.getElementById('dialog-capacity').textContent = String(get('sections.gallery.capacityLabel') || '') + ' ' + item.capacity;
      paintImage(document.getElementById('dialog-image'), item.image);
      document.getElementById('dialog-cta').href = 'ajukan.html?solusi=' + encodeURIComponent(item.type);
      dialog.showModal();
    });
    if (dialog) {
      dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
      dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
    }
    const solution = document.getElementById('solution');
    const param = new URLSearchParams(window.location.search).get('solusi');
    if (solution && ['surya','angin','penyimpanan','terintegrasi','diskusi'].includes(param)) solution.value = param;
  }
  window.addEventListener('message', event => {
    if (event.source !== window.parent || event.origin !== window.location.origin) return;
    const payload = event.data;
    if (!payload || payload.type !== 'pagiverse:config' || payload.templateId !== TEMPLATE_ID) return;
    state.data = payload.configuration && typeof payload.configuration === 'object' && !Array.isArray(payload.configuration) ? payload.configuration : {};
    if (!state.schema) return;
    render();
    window.parent.postMessage({ type: 'pagiverse:applied', templateId: TEMPLATE_ID, revision: payload.revision }, window.location.origin);
  });
  async function init() {
    const response = await fetch('template.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Template schema unavailable');
    state.schema = await response.json();
    document.querySelectorAll('template[data-array-template]').forEach(el => state.templates.set(el.dataset.arrayTemplate, el.cloneNode(true)));
    window.PAGIVERSE_GET_VALUE = get;
    setupUI(); render();
    if (window.parent !== window) window.parent.postMessage({ type: 'pagiverse:ready', templateId: TEMPLATE_ID }, window.location.origin);
  }
  init().catch(error => { document.documentElement.classList.add('template-error'); document.querySelectorAll('.reveal').forEach(el => el.classList.remove('is-pending')); console.error(error); });
})();
(() => {
  'use strict';

  const form = document.getElementById('energy-form');
  if (!form) return;

  const status = document.getElementById('form-status');
  const summary = document.getElementById('submission-summary');
  const summaryList = document.getElementById('summary-list');
  const editButton = document.getElementById('edit-brief');
  const downloadButton = document.getElementById('download-brief');

  const fields = [
    ['company', 'Nama perusahaan'],
    ['industry', 'Sektor industri'],
    ['province', 'Provinsi'],
    ['city', 'Kota / kabupaten'],
    ['solution', 'Solusi yang diminati'],
    ['demand', 'Perkiraan kebutuhan daya'],
    ['contactName', 'Nama kontak'],
    ['email', 'Email bisnis'],
    ['phone', 'Nomor telepon'],
    ['notes', 'Catatan tambahan']
  ];
  const required = [
    'company', 'industry', 'province', 'city', 'solution',
    'demand', 'contactName', 'email', 'phone', 'consent'
  ];
  let brief = null;
  let downloadedUrl = null;

  function control(name) {
    return form.elements.namedItem(name);
  }

  function value(name) {
    const input = control(name);
    return input && typeof input.value === 'string' ? input.value.trim() : '';
  }

  function announce(message) {
    if (!status) return;
    status.textContent = message;
    status.hidden = !message;
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
  }

  function setError(name, message) {
    const input = control(name);
    const error = document.getElementById('error-' + name);
    if (error) {
      error.textContent = message;
      error.hidden = !message;
    }
    if (!input || !input.setAttribute) return;
    const describedBy = new Set((input.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      if (error) describedBy.add(error.id);
    } else {
      input.removeAttribute('aria-invalid');
      if (error) describedBy.delete(error.id);
    }
    if (describedBy.size) input.setAttribute('aria-describedby', Array.from(describedBy).join(' '));
    else input.removeAttribute('aria-describedby');
  }

  function validate(name) {
    const input = control(name);
    if (!input) return 'Kolom ini belum tersedia. Muat ulang halaman untuk mencoba lagi.';

    if (name === 'consent') {
      return input.checked ? '' : 'Centang persetujuan untuk meninjau kebutuhan energi.';
    }

    const raw = value(name);
    if (!raw) {
      const messages = {
        company: 'Masukkan nama perusahaan.',
        industry: 'Pilih sektor industri.',
        province: 'Masukkan provinsi lokasi proyek.',
        city: 'Masukkan kota atau kabupaten lokasi proyek.',
        solution: 'Pilih solusi energi yang diminati.',
        demand: 'Masukkan perkiraan kebutuhan daya dalam kVA.',
        contactName: 'Masukkan nama kontak.',
        email: 'Masukkan email bisnis.',
        phone: 'Masukkan nomor telepon.'
      };
      return messages[name] || 'Lengkapi kolom ini.';
    }

    if (name === 'demand') {
      const number = Number(raw.replace(',', '.'));
      if (!Number.isFinite(number) || number <= 0 || (input.validity && input.validity.badInput)) {
        return 'Masukkan angka kebutuhan daya lebih besar dari 0.';
      }
    }
    if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
      return 'Masukkan alamat email yang valid, misalnya nama@perusahaan.co.id.';
    }
    if (name === 'phone') {
      const digits = raw.replace(/\D/g, '');
      if (!/^\+?[\d\s().-]+$/.test(raw) || digits.length < 8 || digits.length > 15) {
        return 'Masukkan nomor telepon yang valid, berisi 8-15 digit.';
      }
    }
    return '';
  }

  function displayValue(name) {
    const input = control(name);
    if (input && input.tagName === 'SELECT' && input.selectedOptions.length) {
      return input.selectedOptions[0].textContent.trim();
    }
    const raw = value(name);
    if (name === 'demand') return raw + ' kVA';
    return raw || 'Tidak ada catatan tambahan.';
  }

  function buildSummary() {
    summaryList.replaceChildren();
    fields.forEach(([name, label]) => {
      if (summaryList.tagName === 'DL') {
        const term = document.createElement('dt');
        const description = document.createElement('dd');
        term.textContent = label;
        description.textContent = brief[name];
        summaryList.append(term, description);
      } else {
        const item = document.createElement('li');
        const labelElement = document.createElement('span');
        const valueElement = document.createElement('strong');
        labelElement.className = 'summary-label';
        valueElement.className = 'summary-value';
        labelElement.textContent = label;
        valueElement.textContent = brief[name];
        item.append(labelElement, valueElement);
        summaryList.append(item);
      }
    });

    let heading = summary.querySelector('#summary-title, h1, h2, h3');
    if (!heading) {
      heading = document.createElement('h2');
      summary.prepend(heading);
    }
    heading.textContent = 'Ringkasan kebutuhan siap';
    heading.setAttribute('tabindex', '-1');

    let note = summary.querySelector('#summary-note, [data-demo-note]');
    if (!note) {
      note = document.createElement('p');
      note.setAttribute('data-demo-note', '');
      heading.insertAdjacentElement('afterend', note);
    }
    note.textContent = 'Ringkasan belum dikirim. Anda dapat mengedit atau mengunduhnya. Pemrosesan pengajuan di website yang diterbitkan dikelola oleh Pagiverse Core.';

    form.hidden = true;
    summary.hidden = false;
    announce('');
    heading.focus();
  }

  form.noValidate = true;

  required.forEach((name) => {
    const input = control(name);
    if (!input || !input.addEventListener) return;
    input.setAttribute('required', '');
    const recheck = () => {
      if (input.getAttribute('aria-invalid') === 'true') setError(name, validate(name));
      if (status && status.textContent) announce('');
    };
    input.addEventListener('input', recheck);
    input.addEventListener('change', recheck);
    input.addEventListener('blur', () => {
      if (input.getAttribute('aria-invalid') === 'true') setError(name, validate(name));
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    let firstInvalid = null;
    let errorCount = 0;

    required.forEach((name) => {
      const message = validate(name);
      setError(name, message);
      if (message) {
        errorCount += 1;
        if (!firstInvalid) firstInvalid = control(name);
      }
    });

    if (errorCount) {
      announce('Periksa ' + errorCount + ' kolom yang ditandai sebelum meninjau kebutuhan energi.');
      if (firstInvalid && firstInvalid.focus) firstInvalid.focus();
      return;
    }

    if (!summary || !summaryList) {
      announce('Ringkasan belum tersedia. Kebutuhan Anda belum dikirim.');
      return;
    }

    fields.forEach(entry => { const label = form.querySelector('label[for="' + entry[0] + '"]'); if (label) entry[1] = label.textContent.replace(/\*/g, '').trim(); });
    brief = Object.fromEntries(fields.map(([name]) => [name, displayValue(name)]));
    buildSummary();
  });

  if (editButton) {
    editButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (!summary) return;
      summary.hidden = true;
      form.hidden = false;
      announce('Silakan ubah kebutuhan energi Anda. Data belum dikirim.');
      const first = control('company');
      if (first && first.focus) first.focus();
    });
  }

  if (downloadButton) {
    if (window.parent !== window) downloadButton.textContent = 'Lihat Dokumen Ringkasan';
    downloadButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (!brief) return;

      const lines = [
        String(window.PAGIVERSE_GET_VALUE?.('business.name') || 'Perusahaan') + ' - Ringkasan',
        'Ringkasan kebutuhan energi',
        '',
        'Ringkasan kebutuhan yang dibuat melalui website.',
        'Dokumen ini hanya ringkasan kebutuhan. Status pengiriman mengikuti pemrosesan host Pagiverse.',
        ''
      ];
      fields.forEach(([name, label]) => lines.push(label + ': ' + brief[name]));
      lines.push('', 'Persetujuan peninjauan: diberikan.', '', 'Dokumen demo ini bukan penawaran, kontrak, atau konfirmasi penerimaan permintaan.');

      if (window.parent !== window) {
        let documentPreview = summary.querySelector('[data-preview-document]');
        if (!documentPreview) { documentPreview=document.createElement('textarea');documentPreview.setAttribute('data-preview-document','');documentPreview.setAttribute('aria-label','Dokumen ringkasan kebutuhan');documentPreview.className='summary-document';documentPreview.readOnly=true;documentPreview.rows=14;summary.append(documentPreview); }
        documentPreview.value=lines.join(String.fromCharCode(10));documentPreview.focus();documentPreview.select();return;
      }
      if (downloadedUrl) URL.revokeObjectURL(downloadedUrl);
      const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      downloadedUrl = url;
      const link = document.createElement('a');
      link.href = url;
      link.download = 'ringkasan-kebutuhan-energi.txt';
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => {
        URL.revokeObjectURL(url);
        if (downloadedUrl === url) downloadedUrl = null;
      }, 1000);
    });
  }

  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) submitButton.disabled = false;

  window.addEventListener('pagehide', () => {
    brief = null;
    if (downloadedUrl) URL.revokeObjectURL(downloadedUrl);
    downloadedUrl = null;
  });
})();


(() => {
  const form = document.querySelector('[data-pagiverse-form]');
  const button = document.querySelector('[data-core-submit]');
  const status = document.getElementById('core-form-status');
  if (!form || !button || !status) return;
  button.addEventListener('click', () => {
    const values = Object.fromEntries(new FormData(form).entries());
    if (window.parent === window) {
      status.textContent = 'Ringkasan siap. Pengiriman dan penerimaan pengajuan perlu integrasi Pagiverse Core pada website yang diterbitkan.';
      return;
    }
    window.parent.postMessage({ type: 'pagiverse:form-submit', templateId: 'aruna-energy-renewable-001', formId: 'energy-needs', values }, window.location.origin);
    const summaryNote=document.getElementById('summary-note');if(summaryNote)summaryNote.textContent='Ringkasan diteruskan ke host Pagiverse. Penerimaan pengajuan belum dikonfirmasi.';
    status.textContent = 'Ringkasan diserahkan ke host Pagiverse untuk diproses. Template ini belum mengonfirmasi penerimaan pengajuan.';
  });
})();
