(() => {
  'use strict';
  let schema, data = window.PAGIVERSE_DATA || {}, cart = {}, products = [], toastTimer, observer;
  const storageKey = 'brew-haven-demo-cart-v1';
  const currency = new Intl.NumberFormat('id-ID', {style:'currency',currency:'IDR',maximumFractionDigits:0});
  const $ = selector => document.querySelector(selector);
  const get = path => Object.prototype.hasOwnProperty.call(data,path) ? data[path] : path.split('.').reduce((o,k)=>o && o[k],data);
  const value = path => get(path) ?? schema?.fields?.[path]?.default ?? '';
  const text = (path,fallback='') => String(value(path) || fallback);
  const el = (tag,className,copy) => {const node=document.createElement(tag);if(className)node.className=className;if(copy!==undefined)node.textContent=String(copy);return node;};
  const array = path => {const field=schema.fields[path],v=value(path);return Array.isArray(v)?v.slice(0,field.maxItems).filter(x=>x&&typeof x==='object'):[];};
  function safeURL(source,image=false){
    const s=String(source||'').trim();
    if(!s)return '';
    if(image && /^(?:\.\/)?assets\/[a-z0-9._/-]+$/i.test(s) && !s.split('/').includes('..'))return s;
    if(image && /^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(s))return s;
    try{const u=new URL(s,location.href);return ['https:','http:'].includes(u.protocol)?u.href:'';}catch{return '';}
  }
  function applyImage(node,image){
    const info=typeof image==='string'?{src:image}:image||{};
    const source=safeURL(info.src,true);if(source)node.src=source;else node.removeAttribute('src');
    node.alt=String(info.alt||info.altId||'');
    const x=Math.max(0,Math.min(100,Number(info.focalPoint?.x ?? 50))),y=Math.max(0,Math.min(100,Number(info.focalPoint?.y ?? 50)));
    node.style.setProperty('--image-x',`${x}%`);node.style.setProperty('--image-y',`${y}%`);
    node.style.objectPosition=`${node.classList.contains('hero-image')&&matchMedia('(max-width:700px)').matches&&x===50?100:x}% ${y}%`;
  }
  const iconNames={bag:'shopping-bag',play:'player-play',bean:'plant',roast:'flame',heart:'heart',leaf:'leaf',cup:'coffee',truck:'truck-delivery',clock:'clock',gift:'gift',star:'star',phone:'phone',mail:'mail',pin:'map-pin',instagram:'brand-instagram',facebook:'brand-facebook',youtube:'brand-youtube'};
  function icon(name){const span=el('span','icon');span.setAttribute('aria-hidden','true');const img=el('img');img.src=`assets/icons/${iconNames[name]||'coffee'}.svg`;img.alt='';img.width=22;img.height=22;span.append(img);return span;}
  function icons(){document.querySelectorAll('[data-icon]').forEach(n=>n.replaceChildren(...icon(n.dataset.icon).childNodes));}
  function price(item){const n=Number(String(item.price).replace(/[^0-9]/g,''));return Number.isSafeInteger(n)&&n>=0&&n<=10000000?n:0;}
  function itemImage(item){return item.image || {src:'assets/cappuccino.webp',alt:item.name};}
  function card(item,index){
    const article=el('article','product-card'),photo=el('div','product-photo'),img=el('img');applyImage(img,itemImage(item));img.loading='lazy';img.width=640;img.height=800;photo.append(img);
    const copy=el('div','product-copy');copy.append(el('h3','',item.name),el('p','',item.description));const row=el('div','price-row');row.append(el('strong','',currency.format(price(item))));
    const button=el('button','add-button');button.type='button';button.dataset.add=String(index);button.setAttribute('aria-label',`${text('sections.products.addLabel')} ${item.name}`);button.append(icon('bag'));row.append(button);copy.append(row);article.append(photo,copy);return article;
  }
  function render(){
    document.querySelectorAll('[data-bind]').forEach(n=>n.textContent=text(n.dataset.bind));
    document.querySelectorAll('[data-bind-src]').forEach(n=>applyImage(n,value(n.dataset.bindSrc)));
    document.title=text('seo.title');$('meta[name="description"]').content=text('seo.description');$('meta[property="og:title"]').content=text('seo.title');$('meta[property="og:description"]').content=text('seo.description');$('meta[property="og:image"]').content=safeURL(value('seo.ogImage')?.src,true);
    for(const section of schema.sections){const n=$(`[data-section="${section.id}"]`);if(n)n.hidden=!section.required && (get(`sectionVisibility.${section.id}`) ?? section.visibleByDefault)===false;}
    for(const [name,token]of Object.entries(schema.theme.tokens)){const v=token.editable?(get(`theme.${name}`)??token.default):token.default;if(/^#[0-9a-f]{6}$/i.test(v))document.documentElement.style.setProperty(`--${name}`,v);}
    document.querySelectorAll('[data-nav]').forEach(n=>{const item=schema.navigation.items.find(x=>x.id===n.dataset.nav);if(item){n.textContent=text(item.labelField);n.hidden=!!item.section&&$(`[data-section="${item.section}"]`)?.hidden;}});
    document.querySelectorAll('a[href^="#"]').forEach(link=>{
      const target=document.getElementById(link.getAttribute('href').slice(1));
      const section=target?.closest('[data-section]');
      if(!section)return;
      const item=schema.navigation.items.find(entry=>entry.target===link.getAttribute('href'));
      const hiddenByNavigation=item?.hideable&&(get(`navigation.${item.id}.hidden`)===true||get(`navigation.${item.id}.visible`)===false||get(`navigation.items.${item.id}.visible`)===false);
      link.hidden=section.hidden||hiddenByNavigation;
    });
    document.querySelectorAll('[data-list]').forEach(n=>{
      const items=array(n.dataset.list);n.replaceChildren();
      items.forEach((item,i)=>{
        const mode=n.classList.contains('about-values')?'values':n.classList.contains('service-strip')?'service':'benefit';
        const node=el(mode==='values'?'li':'div',mode);node.append(icon(mode==='service'?['truck','clock','gift','star'][i%4]:mode==='values'?['leaf','heart','roast','cup'][i%4]:['bean','roast','heart'][i%3]));
        if(mode==='service'){const c=el('div');c.append(el('h3','',item.title),el('p','',item.description));node.append(c);}else node.append(el('span','',item.label));n.append(node);
      });
    });
    products=array('sections.products.items');$('#product-grid').replaceChildren(...products.map(card));$('#full-menu').replaceChildren(...products.map(card));
    const help=$('[data-help-list]');help.replaceChildren();array('sections.footer.help').forEach((item,i)=>{const b=el('button','',item.title);b.type='button';b.dataset.help=String(i);help.append(b);});
    document.querySelectorAll('[data-social]').forEach(n=>{const href=safeURL(value(`social.${n.dataset.social}`));n.hidden=!href;if(href){n.href=href;n.target='_blank';n.rel='noopener noreferrer';}});
    const phone=text('contact.phone').replace(/[^0-9+]/g,'');$('[data-contact="phone"]').href=`tel:${phone}`;
    const email=text('contact.email');$('[data-contact="email"]').href=/^[\w.+-]+@[\w.-]+\.[a-z]{2,}$/i.test(email)?`mailto:${email}`:'#contact';
    $('#email').placeholder=text('sections.footer.emailPlaceholder');
    icons();renderCart();reveal();
  }
  function persist(){try{localStorage.setItem(storageKey,JSON.stringify(cart));}catch{/* Storage is optional. */}}
  function productKey(item,index){return String(item.id||`item-${index}`);}
  function renderCart(){
    const list=$('#cart-items');list.replaceChildren();let total=0,count=0;
    const allowed=new Set(products.map(productKey));for(const key of Object.keys(cart))if(!allowed.has(key))delete cart[key];
    products.forEach((item,index)=>{
      const key=productKey(item,index),quantity=cart[key];if(!quantity)return;total+=price(item)*quantity;count+=quantity;
      const row=el('div','cart-item'),img=el('img');applyImage(img,itemImage(item));const copy=el('div');copy.append(el('h3','',item.name),el('p','',currency.format(price(item))));
      const controls=el('div','quantity');for(const [change,label]of [[-1,'−'],[1,'+']]){const b=el('button','',label);b.dataset.change=String(change);b.dataset.index=String(index);b.setAttribute('aria-label',`${change===1?'Tambah':'Kurangi'} ${item.name}`);if(change===1&&quantity>=99)b.disabled=true;if(change===-1)controls.append(b,el('span','',quantity));else controls.append(b);}
      const remove=el('button','remove',text('sections.products.removeLabel'));remove.dataset.remove=String(index);remove.setAttribute('aria-label',`${text('sections.products.removeLabel')} ${item.name}`);controls.append(remove);copy.append(controls);row.append(img,copy,el('strong','',currency.format(price(item)*quantity)));list.append(row);
    });
    if(!count)list.append(el('p','empty-cart',text('sections.products.emptyLabel')));$('#cart-total').textContent=currency.format(total);document.querySelectorAll('[data-cart-count]').forEach(n=>n.textContent=String(count));persist();
  }
  function notify(copy){clearTimeout(toastTimer);const n=$('.toast');n.textContent=copy;n.classList.add('show');toastTimer=setTimeout(()=>n.classList.remove('show'),2500);}
  function show(id){const dialog=$(id);dialog.setAttribute('aria-label',dialog.querySelector('h2')?.textContent||'Informasi');if(!dialog.open)dialog.showModal();}
  function info(heading,body){$('#info-heading').textContent=String(heading);$('#info-body').textContent=String(body);show('#info-dialog');}
  function reveal(){
    observer?.disconnect();const nodes=document.querySelectorAll('[data-reveal]');
    if(window.parent!==window||matchMedia('(prefers-reduced-motion: reduce)').matches){nodes.forEach(n=>n.classList.add('is-visible'));return;}
    observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target);}}),{threshold:.1});nodes.forEach(n=>{n.classList.add('reveal-ready');observer.observe(n);});
  }
  document.addEventListener('click',event=>{
    const b=event.target.closest('button');if(!b||!schema)return;
    if(b.hasAttribute('data-add')){const i=Number(b.dataset.add),item=products[i];if(!item)return;const key=productKey(item,i);cart[key]=Math.min(99,(cart[key]||0)+1);renderCart();notify(`${item.name} ${text('sections.products.addedLabel')}`);}
    if(b.hasAttribute('data-change')){const i=Number(b.dataset.index),key=productKey(products[i],i);cart[key]=Math.max(0,Math.min(99,(cart[key]||0)+Number(b.dataset.change)));renderCart();}
    if(b.hasAttribute('data-remove')){const i=Number(b.dataset.remove);delete cart[productKey(products[i],i)];renderCart();}
    if(b.hasAttribute('data-open-cart'))show('#cart-dialog');if(b.hasAttribute('data-open-menu'))show('#menu-dialog');
    if(b.hasAttribute('data-open-story'))info(text('sections.about.storyHeading'),text('sections.about.storyBody'));
    if(b.hasAttribute('data-help')){const item=array('sections.footer.help')[Number(b.dataset.help)];if(item)info(item.title,item.body);}
    if(b.hasAttribute('data-close'))b.closest('dialog').close();
    if(b.hasAttribute('data-slide'))$('#product-grid').scrollBy({left:Number(b.dataset.slide)*$('#product-grid').clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  });
  document.querySelectorAll('dialog').forEach(dialog=>{dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});dialog.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.body.style.overflow='';});});
  const form=$('form');form.addEventListener('submit',async event=>{
    event.preventDefault();const status=$('.form-status');if(!window.PagiverseForms?.submit){status.textContent=text('sections.footer.formUnavailable');return;}
    const button=form.querySelector('button');button.disabled=true;try{await window.PagiverseForms.submit('newsletter',new FormData(form));status.textContent=text('sections.footer.formSuccess');form.reset();}catch{status.textContent=text('sections.footer.formError');}finally{button.disabled=false;}
  });
  window.addEventListener('message',event=>{
    const payload=event.data;if(!schema||event.source!==window.parent||event.origin!==location.origin||payload?.type!=='pagiverse:config'||payload.templateId!==schema.id)return;
    data=payload.configuration && typeof payload.configuration==='object'?payload.configuration:{};render();window.parent.postMessage({type:'pagiverse:applied',templateId:schema.id,revision:payload.revision},location.origin);
  });
  matchMedia('(max-width:700px)').addEventListener('change',()=>{if(schema)applyImage($('.hero-image'),value('sections.hero.image'));});
  async function init(){
    try{const saved=JSON.parse(localStorage.getItem(storageKey)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))for(const [key,n]of Object.entries(saved))if(Number.isInteger(n)&&n>0&&n<=99)cart[key]=n;}catch{/* Invalid storage does not block the menu. */}
    try{const response=await fetch('template.json',{cache:'no-store'});if(!response.ok)throw new Error('Manifest unavailable');schema=await response.json();render();if(window.parent!==window)window.parent.postMessage({type:'pagiverse:ready',templateId:schema.id},location.origin);}catch(error){console.error(error);}
  }
  init();
})();
