(() => {
'use strict';
const templateId='satria-capital-multi-asset-001';
const scriptUrl=new URL(document.currentScript.src,document.baseURI);
const ownOrigin=location.origin;
let parentOrigin=ownOrigin;
try{if(document.referrer){const o=new URL(document.referrer).origin;if(/^https?:/.test(o))parentOrigin=o;}}catch{}
const isEmbedded=window.parent!==window;
const unsafeKeys=new Set(['__proto__','prototype','constructor']);
let manifest,defaults={},current={},collectionCache=new WeakMap(),activeFilter='all',hasRendered=false;
const cleanText=(v,max=2000)=>String(v??'').slice(0,max);
function safeUrl(value,image=false){
 const raw=typeof value==='object'&&value?value.src:value;
 if(typeof raw!=='string'||!raw.trim())return '';
 const s=raw.trim();
 if(/[\\\u0000-\u001f]/.test(s)||s.startsWith('//'))return '';
 try{const u=new URL(s,scriptUrl);if(!['http:','https:'].includes(u.protocol)&&!( !image&&['mailto:','tel:'].includes(u.protocol)))return '';return s;}catch{return '';}
}
function cleanValue(value,descriptor){
 if(descriptor.type==='array'){
  if(!Array.isArray(value))return descriptor.default||[];
  return value.slice(0,descriptor.maxItems).map(item=>{const out={};for(const [key,def] of Object.entries(descriptor.item.fields)){if(!unsafeKeys.has(key)){let v=item&&typeof item==='object'?item[key]:'';out[key]=def.type==='image'?(safeUrl(v,true)?v:''):def.type==='select'?(def.options.includes(v)?v:def.default||def.options[0]):cleanText(v,def.maxLength);}}return out;});
 }
 if(descriptor.type==='image')return safeUrl(value,true)?value:'';
 if(descriptor.type==='url')return safeUrl(value)?value:descriptor.default||'';
 if(descriptor.type==='boolean')return Boolean(value);
 return cleanText(value,descriptor.maxLength);
}
function normalize(raw){
 let payload=raw&&typeof raw==='object'?raw:{};
 payload=payload.configuration??payload.data??payload.values??payload;
 if(payload.fields&&typeof payload.fields==='object')payload=Object.assign({},payload,payload.fields);
 const out={};
 function walk(obj,prefix=''){for(const [key,value] of Object.entries(obj||{})){if(unsafeKeys.has(key))continue;const p=prefix?prefix+'.'+key:key;if(manifest.fields[p])out[p]=cleanValue(value,manifest.fields[p]);else if(value&&typeof value==='object'&&!Array.isArray(value))walk(value,p);}}
 walk(payload);
 const visibility={...(payload.sectionVisibility||raw?.sectionVisibility||{})};
 for(const def of manifest.sections){const key='sectionVisibility.'+def.id;if(Object.prototype.hasOwnProperty.call(payload,key))visibility[def.id]=payload[key];}
 return {values:out,visibility};
}
function post(type,extra={}){if(isEmbedded)window.parent.postMessage({type,templateId,...extra},parentOrigin);}
function textNode(tag,cls,value){const e=document.createElement(tag);if(cls)e.className=cls;e.textContent=value||'';return e;}
function setPhoto(img,value,alt=''){
 const url=safeUrl(value,true);if(!url){img.hidden=true;img.removeAttribute('src');return;} img.hidden=false;
 if(img.getAttribute('src')!==url)img.setAttribute('src',url);
 img.alt=typeof value==='object'?cleanText(value.alt||value.altId||alt,140):alt;
 const focal=typeof value==='object'?value.focalPoint:null;
 const x=Math.max(0,Math.min(100,Number(focal?.x??50)));const y=Math.max(0,Math.min(100,Number(focal?.y??50)));
 img.style.objectPosition=x+'% '+y+'%';
}
function researchCard(item){
 const el=document.createElement('article');el.className='research-card';el.dataset.category=item.category;
 const link=document.createElement('a');link.href='insight.html?id='+encodeURIComponent(item.id);link.setAttribute('aria-label',item.title);
 const imageFrame=document.createElement('div');imageFrame.className='research-image';
 const img=document.createElement('img');img.className='editorial-photo';img.width=700;img.height=467;img.loading='lazy';img.decoding='async';setPhoto(img,item.image,item.alt);imageFrame.append(img);
 const content=document.createElement('div');content.className='research-content';
 content.append(textNode('p','category',item.category),textNode('h3','',item.title),textNode('p','excerpt',item.excerpt));
 const read=document.createElement('div');read.className='research-read';read.append(textNode('span','',current['sections.insights.readLabel']),textNode('span','','↗'));read.lastChild.setAttribute('aria-hidden','true');content.append(read);link.append(imageFrame,content);el.append(link);return el;
}
function renderCollection(container){
 const key=container.dataset.collection;let items=current[key]||[];const kind=container.dataset.kind;const limit=Number(container.dataset.limit)||0;if(limit)items=items.slice(0,limit);
 const signature=JSON.stringify([items,kind,kind==='research'?current['sections.insights.readLabel']:'',kind==='options'?current['sections.contact.selectPlaceholder']:'']);if(collectionCache.get(container)===signature){filterResearch();return;}
 collectionCache.set(container,signature);
 const fragment=document.createDocumentFragment();
 if(kind==='options'){const placeholder=document.createElement('option');placeholder.value='';placeholder.textContent=current['sections.contact.selectPlaceholder'];fragment.append(placeholder);}
 for(const item of items){let el;
  if(kind==='research')el=researchCard(item);
  else if(kind==='thesisRows'){el=document.createElement('a');el.href='approach.html';el.className='thesis-row';const image=document.createElement('img');image.className='editorial-photo';image.width=260;image.height=150;image.loading='lazy';setPhoto(image,item.image,item.title);const text=document.createElement('div');text.append(textNode('h3','',item.title),textNode('p','',item.question));const arrow=textNode('span','thesis-row-arrow','↗');arrow.setAttribute('aria-hidden','true');el.append(image,text,arrow);}
  else if(kind==='thesisPanels'){el=document.createElement('article');el.className='thesis-panel';el.append(textNode('h3','',item.title),textNode('p','',item.description));}
  else if(kind==='stories'){el=document.createElement('article');el.className='story-copy';const heading=document.createElement('h2');for(const key of ['lineOne','lineTwo','lineThree']){const line=textNode('span','typing-line','');line.append(textNode('span','',item[key]));heading.append(line);}const caret=textNode('i','typing-caret','');caret.setAttribute('aria-hidden','true');heading.append(caret);el.append(heading,textNode('p','',item.description));}
  else if(kind==='options'){el=document.createElement('option');el.value=item.label;el.textContent=item.label;}
  else if(kind==='strip'){el=document.createElement('a');el.href='approach.html#assets';el.textContent=item.name;}
  else if(kind==='asset'){
   el=document.createElement('details');el.className='asset-detail';const summary=document.createElement('summary');const plus=textNode('span','plus','+');plus.setAttribute('aria-hidden','true');summary.append(textNode('h3','',item.name),textNode('span','lens',item.lens),plus);el.append(summary,textNode('p','',item.description));
  }else{el=document.createElement('div');el.className=kind==='process'?'process-item':kind==='value'?'value-item':'principle';el.append(textNode('h3','',item.title),textNode('p','',item.description));}
  fragment.append(el);
 }
 if(kind==='stories'){const stage=document.createElement('div');stage.className='story-stage wrap';const photos=document.createElement('div');photos.className='story-photos';items.forEach(item=>{const image=document.createElement('img');image.className='story-photo editorial-photo';image.width=400;image.height=600;image.loading='lazy';setPhoto(image,item.image);photos.append(image);});const texts=document.createElement('div');texts.className='story-texts';texts.append(fragment);stage.append(photos,texts);container.replaceChildren(stage);}else container.replaceChildren(fragment);filterResearch();
}
function filterResearch(){
 let visible=0;document.querySelectorAll('.research-list .research-card').forEach(card=>{const show=activeFilter==='all'||card.dataset.category===activeFilter;card.hidden=!show;if(show)visible++;});
 const empty=document.querySelector('.collection-empty');if(empty)empty.hidden=visible>0;
}
function renderArticle(){
 if(document.body.dataset.page!=='insight')return;
 const id=new URLSearchParams(location.search).get('id');const items=current['sections.insights.items']||[];const item=items.find(x=>x.id===id)||items[0];
 document.querySelectorAll('[data-article]').forEach(el=>{const k=el.dataset.article;if(!item){el.hidden=true;return;}el.hidden=false;if(k==='image')setPhoto(el,item.image,item.alt);else el.textContent=item[k]||'';});
 if(!item){document.querySelector('.article h1').hidden=false;document.querySelector('.article h1').textContent=current['sections.insights.emptyLabel'];}
 if(item)document.title=item.title+' | '+current['business.name'];
}
function render(raw={}){
 const previous=current;const n=normalize(raw);current={...defaults,...n.values};const changedKeys=Object.keys(current).filter(key=>JSON.stringify(current[key])!==JSON.stringify(previous[key]));
 document.querySelectorAll('[data-bind]').forEach(el=>{const v=current[el.dataset.bind];if(v!==undefined){const text=typeof v==='object'?'':String(v);if(el.textContent!==text)el.textContent=text;}});
 document.querySelectorAll('[data-bind-src]').forEach(img=>{const key=img.dataset.bindSrc;setPhoto(img,current[key],current[img.dataset.bindAlt]||'');});
 document.querySelectorAll('[data-bind-href]').forEach(a=>{const u=safeUrl(current[a.dataset.bindHref]);if(u)a.href=u;else a.removeAttribute('href');});
 document.querySelectorAll('[data-section]').forEach(el=>{const def=manifest.sections.find(s=>s.id===el.dataset.section);el.hidden=def&&!def.required&&n.visibility[def.id]===false;});
 document.querySelectorAll('[data-collection]').forEach(renderCollection);renderArticle();
 const description=document.querySelector('meta[name=description]');if(description)description.content=current['seo.description'];
 if(document.body.dataset.page!=='insight'){const p=manifest.pages.find(x=>x.id===document.body.dataset.page);document.title=document.body.dataset.page==='home'?current['seo.title']:(p?.label||'')+' | '+current['business.name'];}
 document.dispatchEvent(new CustomEvent('satria:render',{detail:{changedKeys,initial:!hasRendered}}));hasRendered=true;
 requestAnimationFrame(()=>{fitHero();pixelType();});
}
function pixelType(){document.querySelectorAll('.kinetic-pixel').forEach(host=>{const text=host.textContent;if(host.dataset.pixelText!==text)host.dataset.pixelText=text;let canvas=host.querySelector('canvas');if(!canvas){canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');host.append(canvas);}const fontSize=parseFloat(getComputedStyle(host).fontSize);const scale=fontSize/64;canvas.width=Math.max(1,Math.ceil(host.clientWidth/scale));canvas.height=76;const context=canvas.getContext('2d');context.clearRect(0,0,canvas.width,canvas.height);context.fillStyle='#121613';context.font='64px Georgia';context.textBaseline='alphabetic';if('letterSpacing' in context)context.letterSpacing='-2.5px';context.fillText(text,0,57,canvas.width);host.classList.add('bitmap-rendered');});}
function fitHero(){document.querySelectorAll('.hero-word').forEach(word=>{word.style.fontSize='';const width=word.parentElement.clientWidth;if(word.scrollWidth>width){word.style.fontSize=(parseFloat(getComputedStyle(word).fontSize)*width/word.scrollWidth*.98)+'px';}});}
const heroGrid=document.querySelector('.nf-hero-grid');if(heroGrid&&'ResizeObserver' in window)new ResizeObserver(fitHero).observe(heroGrid);document.fonts?.ready.then(()=>{fitHero();pixelType();});
const menuButton=document.querySelector('.menu-toggle');const nav=document.querySelector('.main-nav');
function closeMenu(){nav.setAttribute('aria-hidden','true');nav.classList.remove('is-open');menuButton.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open');}
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);nav.setAttribute('aria-hidden',String(!open));document.body.classList.toggle('menu-open',open);if(open)nav.querySelector('a')?.focus();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menuButton.getAttribute('aria-expanded')==='true'){closeMenu();menuButton.focus();}if(e.key==='Tab'&&menuButton.getAttribute('aria-expanded')==='true'){const links=[menuButton,...nav.querySelectorAll('a')];if(e.shiftKey&&document.activeElement===links[0]){e.preventDefault();links.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===links.at(-1)){e.preventDefault();links[0].focus();}}});
nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
matchMedia('(min-width:768px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
document.querySelectorAll('[data-nav]').forEach(a=>{if(a.dataset.nav===document.body.dataset.page)a.setAttribute('aria-current','page');});
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{activeFilter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));filterResearch();}));
const form=document.querySelector('[data-pagiverse-form]');
if(form)form.addEventListener('submit',e=>{
 e.preventDefault();let valid=true;
 for(const input of form.querySelectorAll('input,select,textarea')){
  const error=document.getElementById(input.id+'-error');input.setAttribute('aria-describedby',error.id);const bad=!input.checkValidity()||(input.name==='summary'&&input.value.trim().length<20)||(input.name==='fullName'&&!input.value.trim());
  input.setAttribute('aria-invalid',String(bad));error.textContent=bad?(input.type==='email'?'Masukkan alamat email yang valid.':input.type==='checkbox'?'Persetujuan diperlukan.':input.name==='summary'?'Tuliskan konteks sedikitnya 20 karakter.':'Lengkapi bidang ini.') :'';if(bad)valid=false;
 }
 if(!valid){form.querySelector('[aria-invalid=true]')?.focus();return;}
 const values=Object.fromEntries(new FormData(form));values.consent=true;post('pagiverse:form-submit',{formId:'private-conversation',values});
 const status=form.querySelector('.form-status');status.textContent=isEmbedded?'Ringkasan siap diproses oleh Pagiverse. Konfirmasi pengiriman belum diterima.':'Ringkasan percakapan siap ditinjau. Formulir contoh ini belum mengirimkan data.\n\nFokus: '+values.interest+'\n'+values.summary;
});
window.addEventListener('message',event=>{
 if(!isEmbedded||event.source!==window.parent||event.origin!==parentOrigin||!event.data||event.data.templateId!==templateId)return;
 if(event.data.type==='pagiverse:config'&&manifest){render(event.data);post('pagiverse:applied',{revision:event.data.revision});}
 if(event.data.type==='pagiverse:form-result'&&form&&event.data.formId==='private-conversation'){
  form.querySelector('.form-status').textContent=event.data.success?'Percakapan Anda telah diterima.':cleanText(event.data.message||'Pengiriman belum dapat diproses. Silakan coba kembali.',180);
 }
});
fetch(new URL('template.json',scriptUrl)).then(response=>{if(!response.ok)throw new Error('Manifest tidak tersedia');return response.json();}).then(schema=>{
 manifest=schema;defaults=Object.fromEntries(Object.entries(manifest.fields).map(([key,def])=>[key,def.default??'']));render(window.PAGIVERSE_DATA||{});post('pagiverse:ready');
 document.documentElement.classList.remove('can-reveal');
}).catch(error=>{document.documentElement.classList.remove('can-reveal');console.error(error);});
})();

/* Satria Capital: protected motion scenes, independently reconstructed. */
/* Satria Capital — independent editorial motion. GSAP plugins are local assets. */
(() => {
  'use strict';
  const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const embedded = window.parent !== window;
  const records = new Map();
  const nodeIds = new WeakMap();
  const cleanups = [];
  let nextId = 1;
  let initialized = false;
  let enabled = false;
  let booting = false;
  let refreshFrame = 0;
  let resizeTimer = 0;
  let observer;
  let smoother;
  let engine;
  let trigger;
  let smoothPlugin;
  let responsiveMode = '';
  let initialEntryPlayed = false;
  let menuTimeline;
  let ticker;
  let refreshing = false;

  const all = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const id = node => {
    if (!node) return 0;
    if (!nodeIds.has(node)) nodeIds.set(node, nextId++);
    return nodeIds.get(node);
  };
  const mode = () => innerWidth > 1024 ? 'desktop' : innerWidth < 768 ? 'mobile' : 'tablet';
  const mobile = () => innerWidth < 768;
  const displayed = element => !!element && !element.closest('[hidden]') && element.getClientRects().length > 0 && getComputedStyle(element).display !== 'none';
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function hideLoader() {
    const loader = document.querySelector('.site-loader');
    if (loader) {
      loader.hidden = true;
      loader.setAttribute('aria-hidden', 'true');
      loader.style.pointerEvents = 'none';
    }
    document.documentElement.classList.remove('is-loading');
    document.body.classList.remove('is-loading');
    document.body.removeAttribute('aria-busy');
  }

  function resetPanelAccessibility() {
    all('.story-copy,.thesis-panel').forEach(panel => {
      panel.removeAttribute('aria-hidden');
      panel.removeAttribute('inert');
      panel.style.removeProperty('pointer-events');
    });
    all('.thesis-index').forEach(node => {
      node.classList.remove('is-active');
      node.removeAttribute('aria-current');
    });
  }

  function panelState(panels) {
    const original = panels.map(panel => ({
      panel,
      aria: panel.getAttribute('aria-hidden'),
      inert: panel.hasAttribute('inert'),
      pointer: panel.style.pointerEvents
    }));
    let active = -1;
    return {
      set(index) {
        if (index === active) return;
        active = index;
        panels.forEach((panel, position) => {
          const current = position === index;
          panel.setAttribute('aria-hidden', String(!current));
          panel.toggleAttribute('inert', !current);
          panel.style.pointerEvents = current ? 'auto' : 'none';
        });
      },
      restore() {
        original.forEach(({ panel, aria, inert, pointer }) => {
          if (aria === null) panel.removeAttribute('aria-hidden');
          else panel.setAttribute('aria-hidden', aria);
          panel.toggleAttribute('inert', inert);
          if (pointer) panel.style.pointerEvents = pointer;
          else panel.style.removeProperty('pointer-events');
        });
      }
    };
  }

  function define(name, selector, signature, build) {
    records.set(name, { name, selector, signature, build, context: null, result: null, value: null, element: null });
  }

  function unmount(record) {
    if (record.context) record.context.revert();
    if (record.result && record.result.cleanup) record.result.cleanup();
    record.context = null;
    record.result = null;
    record.value = null;
    record.element = null;
  }

  function mount(record) {
    const element = document.querySelector(record.selector);
    if (!displayed(element)) {
      if (record.context) unmount(record);
      return;
    }
    const signature = JSON.stringify(record.signature(element));
    if (record.context && signature === record.value && record.element === element) return;
    const progress = record.result && record.result.timeline ? record.result.timeline.progress() : null;
    unmount(record);
    record.value = signature;
    record.element = element;
    record.context = engine.context(() => { record.result = record.build(element) || {}; }, element);
    if (progress !== null && record.result.timeline && record.result.preserveProgress !== false) {
      record.result.timeline.progress(progress, true);
      if (record.result.sync) record.result.sync();
    }
  }

  function heroScene(element) {
    const secondary = all('.photo-swap .secondary-photo', element);
    if (!secondary.length) return {};
    engine.set(secondary, { clipPath: 'inset(0% 0% 0% 0%)', willChange: 'clip-path' });
    const timeline = engine.timeline({ repeat: -1, repeatDelay: 0.15 });
    timeline.to(secondary, {
      clipPath: 'inset(0% 0% 100% 0%)', duration: 1, stagger: 0.25, ease: 'power2.inOut'
    }, 3);
    timeline.set(secondary, { clipPath: 'inset(100% 0% 0% 0%)' }, 8);
    timeline.to(secondary, {
      clipPath: 'inset(0% 0% 0% 0%)', duration: 1, stagger: 0.25, ease: 'power2.inOut'
    }, 8);
    timeline.to({}, { duration: 0.35 });
    return { timeline };
  }

  function storyScene(element) {
    const stage = element.querySelector('.story-stage');
    const photos = all('.story-photo', element);
    const panels = all('.story-copy', element);
    const count = Math.min(photos.length, panels.length);
    if (!stage || count < 2) return {};
    const accessibility = panelState(panels);
    const starts = panels.slice(0, count).map((_, index) => index ? 0.95 + (index - 1) * 1.1 : 0);
    const end = starts[count - 1] + 1.25;
    engine.set(photos, { autoAlpha: 1, transformOrigin: '50% 50%', willChange: 'transform' });
    photos.slice(0, count).forEach((photo, index) => engine.set(photo, {
      xPercent: index ? 62 : 0,
      yPercent: index ? 108 + (index - 1) * 100 : 0,
      scale: index ? 0.7 : 1,
      borderRadius: index ? 14 : 8,
      zIndex: index + 1
    }));
    engine.set(panels, { autoAlpha: 0 });
    engine.set(panels[0], { autoAlpha: 1 });
    let timeline;
    timeline = engine.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: element, start: 'top top', end: () => '+=' + (mobile() ? 1100 : 2000),
        pin: stage, refreshPriority: 40, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: () => sync()
      }
    });
    function sync() {
      if (!timeline) return;
      const time = timeline.time();
      let active = 0;
      starts.forEach((start, index) => { if (time >= start) active = index; });
      accessibility.set(active);
    }
    panels.slice(0, count).forEach((panel, index) => {
      const lines = all('.typing-line > span:not(.typing-caret)', panel);
      engine.set(lines, { display: 'inline-block', clipPath: index ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 0% 0%)' });
      if (!index) return;
      const start = starts[index];
      timeline.to(panels[index - 1], { autoAlpha: 0, duration: 0.13 }, start);
      timeline.set(panel, { autoAlpha: 1 }, start);
      lines.forEach((line, lineIndex) => timeline.to(line, {
        clipPath: 'inset(0% 0% 0% 0%)', duration: 0.38,
        ease: 'steps(' + Math.max(1, line.textContent.trim().length) + ')'
      }, start + 0.07 + lineIndex * 0.075));
      timeline.to(photos[index - 1], {
        xPercent: 62, yPercent: -92, scale: 0.62, borderRadius: 14, duration: 0.9, ease: 'power1.inOut'
      }, start - 0.15);
      timeline.to(photos[index], {
        xPercent: 0, yPercent: 0, scale: 1, borderRadius: 8, duration: 0.9, ease: 'power3.inOut'
      }, start - 0.15);
      if (index > 1) timeline.to(photos[index - 2], { yPercent: -210, duration: 0.5 }, start - 0.15);
    });
    timeline.to({}, { duration: 0.01 }, end);
    const carets = all('.typing-caret', element);
    if (carets.length) engine.fromTo(carets, { opacity: 0 }, { opacity: 1, duration: 0.45, repeat: -1, yoyo: true, ease: 'steps(1)' });
    sync();
    return { timeline, sync, cleanup: () => accessibility.restore() };
  }

  function bandScene(element) {
    const rows = all('.kinetic-row', element);
    rows.forEach((row, index) => {
      const track = row.querySelector('.kinetic-track');
      if (!track || !track.children.length) return;
      const half = Math.floor(track.children.length / 2);
      const children = Array.from(track.children);
      let distance = half > 0 ? children[half].offsetLeft - children[0].offsetLeft : track.scrollWidth;
      if (distance <= 0) distance = track.scrollWidth / 2;
      if (distance <= 0) return;
      const reverse = index % 2 === 1;
      engine.set(row, { width: '150%', marginLeft: '-25%', willChange: 'transform' });
      engine.fromTo(track, { x: reverse ? -distance : 0 }, {
        x: reverse ? 0 : -distance, duration: reverse ? 40 : 60,
        repeat: -1, ease: 'none', willChange: 'transform'
      });
      engine.fromTo(row, { x: () => (reverse ? -1 : 1) * innerWidth * 0.18 }, {
        x: () => (reverse ? 1 : -1) * innerWidth * 0.18,
        ease: 'none', scrollTrigger: {
          trigger: element, start: 'top bottom', end: 'bottom top', refreshPriority: 30, scrub: true, invalidateOnRefresh: true
        }
      });
    });
    return {};
  }

  function thesisScene(element) {
    const stage = element.querySelector('.thesis-stage');
    const group = element.querySelector('.thesis-circles');
    const circles = all('.thesis-circle', element);
    const panels = all('.thesis-panel', element);
    const indices = all('.thesis-index', element);
    if (!stage || !group || !circles.length) return {};
    const accessibility = panelState(panels);
    const box = group.getBoundingClientRect();
    const target = circles.map(circle => {
      const rect = circle.getBoundingClientRect();
      return {
        x: Number(engine.getProperty(circle, 'x')) || 0,
        y: Number(engine.getProperty(circle, 'y')) || 0,
        dx: box.left + box.width / 2 - rect.left - rect.width / 2,
        dy: box.top + box.height / 2 - rect.top - rect.height / 2
      };
    });
    circles.forEach((circle, index) => engine.set(circle, {
      x: target[index].x + target[index].dx,
      y: target[index].y + target[index].dy,
      autoAlpha: 0, scale: 0.8, '--detail-progress': 0,
      transformOrigin: '50% 50%', willChange: 'transform,opacity'
    }));
    if (panels.length) engine.set(panels, { autoAlpha: 0, y: 18 });
    if (panels[0]) engine.set(panels[0], { autoAlpha: 1, y: 0 });
    let timeline;
    timeline = engine.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: element, start: 'top top', end: () => '+=' + (mobile() ? 1800 : 2500),
        pin: stage, refreshPriority: 20, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: () => sync()
      }
    });
    circles.forEach((circle, index) => {
      const start = index * 1.2;
      timeline.to(circle, { autoAlpha: 0.95, scale: 1, duration: 0.6, ease: 'power2.out' }, start);
      timeline.to(circle, { '--detail-progress': 1, duration: 0.9, ease: 'power2.inOut' }, start + 0.35);
      const lines = all('[data-draw],.thesis-line', circle);
      const dots = all('.thesis-dot', circle);
      lines.forEach(line => {
        if (typeof line.getTotalLength === 'function') {
          try {
            const length = line.getTotalLength();
            engine.set(line, { strokeDasharray: length, strokeDashoffset: length });
            timeline.to(line, { strokeDashoffset: 0, duration: 1 }, start + 0.35);
          } catch (_) { /* A non-rendered SVG path does not block the scene. */ }
        } else {
          timeline.from(line, { scaleY: 0, transformOrigin: 'center bottom', duration: 0.8 }, start + 0.35);
        }
      });
      if (dots.length) timeline.from(dots, { scale: 0, opacity: 0, stagger: { amount: 0.65, from: 'end' }, duration: 0.35, ease: 'power3.out' }, start + 0.4);
      if (index && panels[index]) {
        timeline.to(panels[index - 1], { autoAlpha: 0, y: -18, duration: 0.25 }, start);
        timeline.fromTo(panels[index], { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.4 }, start);
      }
    });
    circles.forEach((circle, index) => timeline.to(circle, {
      x: target[index].x, y: target[index].y, duration: 1.15, ease: 'power2.inOut'
    }, 3.55));
    timeline.to({}, { duration: 0.1 }, 5.05);
    function sync() {
      if (!timeline) return;
      const active = panels.reduce((best, panel, index) => Number(engine.getProperty(panel, 'opacity')) > Number(engine.getProperty(panels[best], 'opacity')) ? index : best, 0);
      accessibility.set(active);
      indices.forEach((node, index) => {
        node.classList.toggle('is-active', index === active);
        if (index === active) node.setAttribute('aria-current', 'step');
        else node.removeAttribute('aria-current');
      });
    }
    sync();
    return { timeline, sync, cleanup: () => {
      accessibility.restore();
      indices.forEach(node => { node.classList.remove('is-active'); node.removeAttribute('aria-current'); });
    } };
  }

  function wrapQuoteWords(element) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.textContent.trim() && !node.parentElement.closest('[data-motion-word]')) textNodes.push(node);
    }
    const words = [];
    textNodes.forEach(node => {
      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) fragment.append(document.createTextNode(part));
        else {
          const word = document.createElement('span');
          word.dataset.motionWord = '';
          word.className = 'motion-word';
          word.style.display = 'inline-block';
          word.textContent = part;
          fragment.append(word);
          words.push(word);
        }
      });
      node.replaceWith(fragment);
    });
    return {
      words,
      restore() {
        all('[data-motion-word]', element).forEach(word => word.replaceWith(document.createTextNode(word.textContent)));
        element.normalize();
      }
    };
  }

  function quoteScene(element) {
    const stage = element.querySelector('.conviction-stage');
    const windowElement = element.querySelector('.quote-window');
    const text = element.querySelector('.quote-text');
    const image = element.querySelector('.quote-image');
    if (!stage || !windowElement || !text) return {};
    const wrapped = wrapQuoteWords(text);
    engine.set(windowElement, { clipPath: 'inset(50% 100% 50% 0%)', willChange: 'clip-path' });
    if (wrapped.words.length) engine.set(wrapped.words, { opacity: 0 });
    let timeline;
    timeline = engine.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: element, start: 'top top', end: () => '+=' + (mobile() ? 650 : 1000),
        pin: stage, refreshPriority: 10, pinSpacing: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true
      }
    });
    timeline.to(windowElement, { clipPath: 'inset(0% 100% 0% 0%)', duration: 0.65 }, 0);
    timeline.to(windowElement, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.95 }, 0.6);
    if (wrapped.words.length) timeline.to(wrapped.words, { opacity: 1, duration: 0.03, stagger: { amount: 1.15, from: 'start' } }, 0.8);
    if (image) timeline.fromTo(image, { yPercent: 15, scale: 1.08 }, { yPercent: -8, scale: 1, duration: 2.25 }, 0);
    timeline.to({}, { duration: 0.1 }, 2.35);
    return { timeline, cleanup: () => wrapped.restore() };
  }

  function setupScenes() {
    define('hero', '.nf-hero', element => all('.photo-swap img', element).map(id), heroScene);
    define('stories', '.story-pin', element => [
      all('.story-photo', element).map(id),
      all('.story-copy', element).map(panel => [id(panel), all('.typing-line > span:not(.typing-caret)', panel).map(line => line.textContent)])
    ], storyScene);
    all('.kinetic-band').forEach((element, index) => {
      if (!element.dataset.motionBand) element.dataset.motionBand = String(index + 1);
      define('band-' + index, '.kinetic-band[data-motion-band="' + element.dataset.motionBand + '"]', band => all('.kinetic-track', band).map(track => [id(track), track.textContent, Math.round(track.scrollWidth)]), bandScene);
    });
    define('thesis', '#thesis', element => [all('.thesis-circle', element).map(id), all('.thesis-panel', element).map(id)], thesisScene);
    define('quote', '.conviction', element => [id(element.querySelector('.quote-text')), element.querySelector('.quote-text')?.textContent, id(element.querySelector('.quote-image'))], quoteScene);
    records.forEach(mount);
  }

  function setupMenu() {
    const nav = document.querySelector('.main-nav');
    if (!nav) return;
    let wasOpen = nav.classList.contains('is-open');
    function animateMenu() {
      const open = nav.classList.contains('is-open');
      if (open === wasOpen) return;
      wasOpen = open;
      if (menuTimeline) menuTimeline.kill();
      if (smoother) smoother.paused(open);
      const clipClosed = mobile() ? 'ellipse(150% 0% at 50% 0%)' : 'ellipse(0% 150% at 0% 50%)';
      const clipOpen = mobile() ? 'ellipse(150% 150% at 50% 0%)' : 'ellipse(150% 150% at 0% 50%)';
      menuTimeline = engine.timeline();
      if (open) {
        menuTimeline.set(nav, { visibility: 'visible', opacity: 1, pointerEvents: 'auto' });
        menuTimeline.fromTo(nav, { clipPath: clipClosed }, { clipPath: clipOpen, duration: 0.7, ease: 'power3.out' });
        menuTimeline.fromTo(all('a', nav), { x: -32, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, stagger: 0.055, ease: 'power2.out', clearProps: 'transform,opacity' }, 0.25);
      } else {
        menuTimeline.set(nav, { pointerEvents: 'none' });
        menuTimeline.to(nav, { clipPath: clipClosed, duration: 0.5, ease: 'power3.in' });
        menuTimeline.set(nav, { clearProps: 'clipPath,visibility,opacity,pointerEvents' });
      }
    }
    const mutation = new MutationObserver(animateMenu);
    mutation.observe(nav, { attributes: true, attributeFilter: ['class'] });
    const hoverCleanups = [];
    if (matchMedia('(hover:hover)').matches) all('a', nav).forEach(link => {
      const hover = () => {
        if (!nav.classList.contains('is-open')) return;
        engine.fromTo(link, { clipPath: 'inset(0% 100% 0% 0%)' }, {
          clipPath: 'inset(0% 0% 0% 0%)', duration: 0.45,
          ease: 'steps(' + Math.max(1, link.textContent.trim().length) + ')', overwrite: 'auto',
          clearProps: 'clipPath'
        });
      };
      link.addEventListener('pointerenter', hover);
      hoverCleanups.push(() => link.removeEventListener('pointerenter', hover));
    });
    cleanups.push(() => {
      mutation.disconnect();
      hoverCleanups.forEach(cleanup => cleanup());
      if (menuTimeline) menuTimeline.kill();
      engine.set(nav, { clearProps: 'clipPath,visibility,opacity,pointerEvents' });
      engine.set(all('a', nav), { clearProps: 'transform,opacity,clipPath' });
      menuTimeline = null;
    });
  }

  function setupAmbientMotion() {
    const header = document.querySelector('.site-header');
    const curves = all('canvas.section-curve[data-fill]').map(canvas => ({ canvas, context: canvas.getContext('2d'), width: 0, height: 0 }));
    let lastScroll = smoother ? smoother.scrollTop() : scrollY;
    let bend = 0;
    let previousInverse;
    function draw(curve, force) {
      const { canvas, context } = curve;
      if (!context || !displayed(canvas)) return;
      const rect = canvas.getBoundingClientRect();
      if (!force && (rect.bottom < -150 || rect.top > innerHeight + 150)) return;
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height || 150));
      const ratio = Math.min(2, devicePixelRatio || 1);
      if (curve.width !== width || curve.height !== height || canvas.width !== Math.round(width * ratio)) {
        curve.width = width;
        curve.height = height;
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      const middle = height * 0.48;
      const amount = clamp(bend, -height * 0.42, height * 0.42);
      const reverse = canvas.dataset.edge === 'bottom';
      context.beginPath();
      context.moveTo(0, middle);
      context.bezierCurveTo(width * 0.23, middle, width * 0.27, middle + amount, width * 0.5, middle + amount);
      context.bezierCurveTo(width * 0.73, middle + amount, width * 0.77, middle, width, middle);
      context.lineTo(width, reverse ? 0 : height);
      context.lineTo(0, reverse ? 0 : height);
      context.closePath();
      context.fillStyle = window.CSS && CSS.supports('color', canvas.dataset.fill) ? canvas.dataset.fill : '#121613';
      context.fill();
    }
    ticker = () => {
      if (document.hidden) return;
      const y = smoother ? smoother.scrollTop() : scrollY;
      const velocity = y - lastScroll;
      lastScroll = y;
      const targetBend = clamp(-velocity * 5, mobile() ? -40 : -68, mobile() ? 40 : 68);
      bend += (targetBend - bend) * 0.13;
      if (Math.abs(bend) < 0.04) bend = 0;
      curves.forEach(curve => draw(curve, false));
      if (header) {
        const center = header.getBoundingClientRect().top + header.getBoundingClientRect().height / 2;
        const inverse = !!document.querySelector('.main-nav.is-open') || all('.motion-dark').some(element => {
          if (!displayed(element)) return false;
          const rect = element.getBoundingClientRect();
          return rect.top <= center && rect.bottom > center;
        });
        if (previousInverse !== inverse) {
          header.classList.toggle('is-inverse', inverse);
          previousInverse = inverse;
        }
      }
    };
    engine.ticker.add(ticker);
    curves.forEach(curve => {
      curve.canvas.setAttribute('aria-hidden', 'true');
      curve.canvas.style.pointerEvents = 'none';
      draw(curve, true);
    });
    cleanups.push(() => {
      engine.ticker.remove(ticker);
      ticker = null;
      if (header) header.classList.remove('is-inverse');
      curves.forEach(curve => curve.context?.clearRect(0, 0, curve.canvas.width, curve.canvas.height));
    });
  }

  function playEntry() {
    if (initialEntryPlayed) { hideLoader(); return; }
    initialEntryPlayed = true;
    const loader = document.querySelector('.site-loader');
    const words = all('.nf-hero .hero-word');
    if (embedded) { hideLoader(); return; }
    if (words.length) {
      const entry = engine.fromTo(words, { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 0.85, stagger: 0.07, delay: loader && !loader.hidden ? 0.9 : 0.1, ease: 'power3.out', clearProps: 'transform,opacity' });
      cleanups.push(() => { entry.kill(); engine.set(words, { clearProps: 'transform,opacity' }); });
    }
    if (!loader || loader.hidden) { hideLoader(); return; }
    const number = loader.querySelector('.loader-number');
    const progress = { value: 0 };
    const timeline = engine.timeline({ onComplete: hideLoader });
    timeline.to(progress, { value: 100, duration: 0.7, ease: 'power1.out', onUpdate: () => { if (number) number.textContent = Math.round(progress.value) + '%'; } });
    timeline.to(loader, mobile() ? {
      yPercent: -105, borderRadius: '0% 0% 40% 40%', duration: 0.8, ease: 'power3.inOut'
    } : {
      xPercent: 105, borderRadius: '45% 0% 0% 45%', duration: 0.8, ease: 'power3.inOut'
    }, 0.72);
    cleanups.push(() => { timeline.kill(); hideLoader(); });
  }

  function refresh() {
    refreshFrame = 0;
    if (!enabled || refreshing) return;
    refreshing = true;
    try {
      records.forEach(mount);
      trigger.sort();
      trigger.refresh();
    } catch (error) {
      console.warn('Satria motion enhancement is unavailable.', error);
      destroy();
      readableFallback(false);
    } finally { refreshing = false; }
  }

  function scheduleRefresh() {
    if (!enabled || refreshFrame) return;
    refreshFrame = requestAnimationFrame(refresh);
  }

  function destroy() {
    enabled = false;
    if (refreshFrame) cancelAnimationFrame(refreshFrame);
    refreshFrame = 0;
    if (observer) observer.disconnect();
    observer = null;
    records.forEach(unmount);
    records.clear();
    cleanups.splice(0).reverse().forEach(cleanup => { try { cleanup(); } catch (_) {} });
    if (smoother) smoother.kill();
    smoother = null;
    document.body.classList.remove('motion-ready');
    resetPanelAccessibility();
  }

  function readableFallback(reduced) {
    document.body.classList.toggle('reduced-motion', reduced);
    document.body.classList.remove('motion-ready');
    document.documentElement.dataset.satriaMotion = reduced ? 'reduced' : 'fallback';
    hideLoader();
    resetPanelAccessibility();
  }

  function start() {
    if (enabled) return;
    initialized = true;
    if (reducedQuery.matches) { readableFallback(true); return; }
    engine = window.gsap;
    trigger = window.ScrollTrigger;
    smoothPlugin = window.ScrollSmoother;
    if (!engine || !trigger) { readableFallback(false); return; }
    try {
      engine.registerPlugin(trigger);
      if (smoothPlugin) engine.registerPlugin(smoothPlugin);
      document.body.classList.remove('reduced-motion');
      document.body.classList.add('motion-ready');
      enabled = true;
      responsiveMode = mode();
      if (responsiveMode === 'desktop' && smoothPlugin && document.querySelector('#smooth-wrapper > #smooth-content')) {
        smoother = smoothPlugin.create({
          wrapper: '#smooth-wrapper', content: '#smooth-content', smooth: 1, smoothTouch: 0,
          effects: true, normalizeScroll: false, ignoreMobileResize: true
        });
      }
      setupScenes();
      setupMenu();
      setupAmbientMotion();
      observer = new ResizeObserver(scheduleRefresh);
      all('.nf-hero,.story-stage,.kinetic-band,.thesis-stage,.conviction-stage').forEach(element => observer.observe(element));
      trigger.sort();
      trigger.refresh();
      document.documentElement.dataset.satriaMotion = 'ready';
      playEntry();
    } catch (error) {
      console.warn('Satria motion enhancement is unavailable.', error);
      destroy();
      readableFallback(false);
    }
  }

  function boot() {
    if (booting || initialized) return;
    booting = true;
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.race([fontsReady, new Promise(resolve => setTimeout(resolve, 1200))]).then(() => {
      booting = false;
      start();
    });
  }

  document.addEventListener('satria:render', () => {
    if (!initialized) boot();
    else if (enabled) scheduleRefresh();
    else if (reducedQuery.matches) readableFallback(true);
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  if (document.fonts) document.fonts.ready.then(scheduleRefresh);
  document.addEventListener('load', event => { if (event.target instanceof HTMLImageElement) scheduleRefresh(); }, true);
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!initialized) return;
      if (enabled && mode() !== responsiveMode) {
        const y = smoother ? smoother.scrollTop() : scrollY;
        destroy();
        start();
        window.scrollTo(0, y);
        scheduleRefresh();
      } else scheduleRefresh();
    }, 180);
  });
  reducedQuery.addEventListener('change', () => {
    destroy();
    start();
  });
  window.SatriaMotion = Object.freeze({
    refresh: scheduleRefresh,
    destroy,
    status: () => ({ enabled, reduced: reducedQuery.matches, embedded, smoother: !!smoother, scenes: Array.from(records.values()).filter(record => record.context).map(record => record.name) })
  });
})();
