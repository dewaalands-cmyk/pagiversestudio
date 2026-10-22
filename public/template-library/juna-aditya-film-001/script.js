(() => {
  'use strict';
  const TEMPLATE_ID = 'juna-aditya-film-001';
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
  const $ = (selector) => document.querySelector(selector);
  const all = (selector) => [...document.querySelectorAll(selector)];
  const palette = ['#e21715','#086392','#f2572c','#5bc52c','#b3813c'];
  const embedded = window.parent !== window;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const gallery = $('#gallery');
  const tileRoot = $('#gallery-tiles');
  const menu = $('#menu-panel');
  const menuToggle = $('.menu-toggle');
  const contentPanel = $('#content-panel');
  const filmPanel = $('#film-panel');
  const motionToggle = $('#motion-toggle');
  const columns = 6, rows = 8;
  const tiles = [];
  const listNodes = new Map();
  let schema;
  let configuration = {};
  let lastSignature = '';
  let films = [], frames = [];
  let lastFrames = '';
  let activeFilmId = null;
  let activeView = null;
  let paused = reduced.matches || embedded;
  let pan = {x:0,y:0}, target = {...pan};
  let metrics, drag = null, initialized = false;
  let previousSmall;
  let lastTime = 0, lastInteraction = performance.now(), suppressClickUntil = 0;
  const mod = (n,max) => ((n % max) + max) % max;
  const anyDialog = () => menu.open || contentPanel.open || filmPanel.open;

  function pathValue(source, path) {
    if (record(source) && own(source,path)) return source[path];
    return path.split('.').reduce((value,key) => record(value) && own(value,key) ? value[key] : undefined,source);
  }
  function value(path) {
    const supplied = pathValue(configuration,path);
    return supplied === undefined ? schema?.fields[path]?.default : supplied;
  }
  function plain(input,max=500) { return (typeof input==='string'||typeof input==='number') ? String(input).slice(0,max) : ''; }
  function text(path) { const result=plain(value(path),schema?.fields[path]?.maxLength || 500);return schema?.fields[path]?.type==='textarea'?result:result.replace(/[\r\n]+/g,' '); }
  function safeUrl(input,kind='link') {
    const raw = plain(input,12*1024*1024).trim();
    if (!raw || /[\u0000-\u001f\u007f]/.test(raw)) return '';
    if (kind==='image' && /^data:image\/(?:png|jpeg|webp|avif|gif);base64,[A-Za-z0-9+/=]+$/i.test(raw)) return raw;
    if (/^(?:\.\/)?assets\/[a-zA-Z0-9_./-]+$/.test(raw) && !raw.split('/').includes('..')) return raw;
    try {
      const url = new URL(raw,document.baseURI);
      if (url.protocol==='https:' || (url.protocol==='http:' && url.origin===location.origin)) return url.href;
      if (kind==='image' && url.protocol==='blob:' && url.origin===location.origin) return url.href;
    } catch { /* Invalid links are intentionally not rendered. */ }
    return '';
  }
  const percent = (number) => Number.isFinite(Number(number)) ? Math.max(0,Math.min(100,Number(number))) : 50;
  function imageValue(input,alt='') {
    const source = record(input) ? input : {src:input};
    return {src:safeUrl(source.src,'image'),alt:plain(alt || source.alt,240),x:percent(source.focalPoint?.x),y:percent(source.focalPoint?.y),fit:source.fit==='contain'?'contain':'cover'};
  }
  function setImage(img,image,hideEmpty=false) {
    const imageKey = JSON.stringify(image);
    if (img.dataset.imageKey===imageKey) return;
    img.dataset.imageKey=imageKey;
    if (image.src) {if(img.getAttribute('src')!==image.src)img.setAttribute('src',image.src);} else img.removeAttribute('src');
    img.alt=image.alt;
    img.style.objectPosition=`${image.x}% ${image.y}%`;
    img.style.objectFit=image.fit;
    if(hideEmpty)img.hidden=!image.src;
  }
  function sectionVisible(id) {
    const section=schema.sections.find(item=>item.id===id);
    if (!section || section.required) return true;
    const custom=pathValue(configuration,`sectionVisibility.${id}`);
    return typeof custom==='boolean' ? custom : section.visibleByDefault!==false;
  }
  function normalizedFilms() {
    const descriptor=schema.fields['sections.gallery.items'];
    const entries=value('sections.gallery.items');
    if(!Array.isArray(entries))return [];
    const seen=new Set();
    return entries.slice(0,descriptor.maxItems).filter(record).map((item,index)=>{
      const baseId=plain(item.id,descriptor.item.fields.id.maxLength||40).replace(/[^a-zA-Z0-9_-]/g,'') || `film-${index+1}`;
      let id=baseId,suffix=1;while(seen.has(id)){id=`${baseId}-${suffix++}`;}seen.add(id);
      return {id,title:plain(item.title,72),year:plain(item.year,4),format:plain(item.format,32),description:plain(item.description,600),image:imageValue(item.image,item.imageAlt),secondaryImage:imageValue(item.secondaryImage,item.secondaryImageAlt),borderColor:palette.includes(item.borderColor)?item.borderColor:palette[index%palette.length],orientation:item.orientation==='portrait'?'portrait':'landscape',trailerUrl:safeUrl(item.trailerUrl)};
    });
  }
  function bindStatic() {
    all('[data-bind]').forEach(node=>{
      const next=text(node.dataset.bind);
      if(node.textContent!==next)node.textContent=next;
    });
    all('[data-bind-src]').forEach(node=>setImage(node,imageValue(value(node.dataset.bindSrc),node.dataset.bindAlt?text(node.dataset.bindAlt):''),true));
    all('[data-bind-alt]').forEach(node=>{node.alt=text(node.dataset.bindAlt);});
    const logo=imageValue(value('business.logo'));
    all('.wordmark,.menu-wordmark').forEach(node=>{node.querySelector('[data-bind="sections.hero.heading"]').hidden=Boolean(logo.src);node.classList.toggle('has-logo',Boolean(logo.src));});
    const video=$('.reel-player');
    const reelUrl=safeUrl(value('sections.gallery.reelUrl'),'video');
    if(video.getAttribute('src')!==reelUrl){video.pause();if(reelUrl)video.setAttribute('src',reelUrl);else video.removeAttribute('src');video.load();}
    const poster=imageValue(value('sections.gallery.reelPoster'),text('sections.gallery.reelPosterAlt'));
    if(poster.src)video.setAttribute('poster',poster.src);else video.removeAttribute('poster');
    video.setAttribute('aria-label',text('sections.gallery.reelHeading'));video.setAttribute('aria-description',poster.alt);video.style.objectPosition=`${poster.x}% ${poster.y}%`;
    $('[data-nav-id="reel"]').hidden=!reelUrl;
    all('[data-for-section]').forEach(node=>{node.hidden=!sectionVisible(node.dataset.forSection);});
    all('[data-nav-id]').forEach(node=>{
      const entry=schema.navigation.items.find(item=>item.id===node.dataset.navId);
      if(entry?.hideable){const visibility=pathValue(configuration,`navigation.items.${entry.id}.visible`);if(visibility===false)node.hidden=true;}
    });
    const email=plain(value('contact.email'),160).trim();
    const phone=plain(value('contact.phone'),30).trim();
    const phoneDigits=phone.replace(/\D/g,'');
    const contacts={email:/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)?`mailto:${encodeURIComponent(email).replace(/%40/g,'@')}`:'',phone:/^\+?[\d ()-]{7,30}$/.test(phone)&&/^\d{7,15}$/.test(phoneDigits)?`tel:${phone.startsWith('+')?'+':''}${phoneDigits}`:'',instagram:safeUrl(value('social.instagram')),youtube:safeUrl(value('social.youtube'))};
    all('[data-contact-link]').forEach(node=>{const href=contacts[node.dataset.contactLink];node.hidden=!href;if(href)node.href=href;else node.removeAttribute('href');if(href?.startsWith('https:')){node.target='_blank';node.rel='noopener noreferrer';}});
    $('#contact-empty').hidden=Object.values(contacts).some(Boolean);
    document.title=text('seo.title');
    $('meta[name="description"]').content=text('seo.description');
    $('meta[property="og:title"]').content=document.title;
    $('meta[property="og:description"]').content=text('seo.description');
    const og=imageValue(value('seo.ogImage')).src;
    if(og)$('meta[property="og:image"]').content=new URL(og,document.baseURI).href;
    else $('meta[property="og:image"]').removeAttribute('content');
    if(contentPanel.open && ((activeView==='tentang'&&!sectionVisible('about')) || (activeView==='kontak'&&!sectionVisible('contact')) || (activeView==='showreel'&&!reelUrl)))contentPanel.close();
  }
  function derivedFrames() {
    return films.flatMap(film=>[
      ...(film.image.src?[{key:`${film.id}:main`,filmId:film.id,image:film.image,color:film.borderColor,ratio:film.orientation==='portrait'?2/3:1.5,lockedRatio:true}]:[]),
      ...(film.secondaryImage.src?[{key:`${film.id}:secondary`,filmId:film.id,image:film.secondaryImage,color:film.borderColor,ratio:1.5}]:[])
    ]);
  }
  function patchTiles() {
    const next=derivedFrames();
    const signature=JSON.stringify(next);
    tiles.forEach(tile=>{if(!tile.frame)return;const film=films.find(item=>item.id===tile.frame.filmId);if(film)tile.button.setAttribute('aria-label',`${film.title}, ${film.year}. Buka detail film`);});
    if(signature===lastFrames)return;
    lastFrames=signature;frames=next;
    const order=[2,0,6,4,7,5,1,4,3,7,5,6,6,5,2,1,4,7,3,6,0,5,1,7];
    tiles.forEach((tile,i)=>{
      if(!frames.length){tile.frame=null;tile.button.hidden=true;return;}
      const frame=frames[frames.length===8?order[i%order.length]:i%frames.length];
      tile.frame=frame;tile.button.hidden=false;
      tile.button.dataset.film=frame.filmId;
      tile.button.style.setProperty('--frame',frame.color);
      const film=films.find(item=>item.id===frame.filmId);
      tile.button.setAttribute('aria-label',`${film.title}, ${film.year}. Buka detail film`);
      setImage(tile.img,frame.image);
      if(!frame.lockedRatio && tile.img.complete && tile.img.naturalWidth)frame.ratio=tile.img.naturalWidth/tile.img.naturalHeight;
    });
    $('#gallery-empty').hidden=frames.length>0;
    layout();
  }
  function patchList() {
    const list=$('.film-list');
    const keys=new Set(films.map(film=>film.id));
    listNodes.forEach((node,id)=>{if(!keys.has(id)){if(node.contains(document.activeElement))$('.panel-close').focus();node.remove();listNodes.delete(id);}});
    films.forEach(film=>{
      let node=listNodes.get(film.id);
      if(!node){node=document.createElement('button');node.type='button';node.className='film-list-item';node.dataset.film=film.id;const figure=document.createElement('figure');const img=document.createElement('img');img.width=1536;img.height=1024;img.loading='lazy';const caption=document.createElement('figcaption');caption.className='film-list-caption';caption.append(document.createElement('span'),document.createElement('small'));figure.append(img,caption);node.append(figure);node.addEventListener('click',()=>openFilm(node.dataset.film));listNodes.set(film.id,node);}
      node.style.setProperty('--frame',film.borderColor);setImage(node.querySelector('img'),film.image,true);
      node.querySelector('figcaption span').textContent=film.title;node.querySelector('small').textContent=film.year;
      const expected=list.children[films.indexOf(film)];if(expected!==node)list.insertBefore(node,expected||null);
    });
    const preview=all('.menu-preview img');
    preview.forEach((img,index)=>{const film=films[index];if(film)setImage(img,film.image,true);else img.hidden=true;});
  }
  function fitWordmarks() {
    const width=innerWidth*(innerWidth<768?.96:.50);
    all('.wordmark,.menu-wordmark,.intro>span').forEach(node=>{
      node.style.fontSize='';
      const span=node.querySelector('[data-bind="sections.hero.heading"]')||node;
      const measured=span.getBoundingClientRect().width;
      if(measured>width)node.style.fontSize=`${parseFloat(getComputedStyle(node).fontSize)*width/measured}px`;
    });
    fitMenu();
  }
  function fitMenu() {
    if(!menu.open)return;
    const nav=$('.menu-links');
    const buttons=all('.menu-links button').filter(node=>!node.hidden);
    buttons.forEach(node=>{node.style.fontSize='';});
    const reserved=innerWidth<768&&innerHeight>500?innerWidth*.42+35:30;
    const available=Math.max(130,innerHeight-nav.offsetTop-reserved);
    for(let pass=0;pass<3;pass++){
      if(nav.scrollHeight<=available||!buttons.length)break;
      const size=parseFloat(getComputedStyle(buttons[0]).fontSize);
      const next=Math.max(20,size*available/nav.scrollHeight*.98);
      buttons.forEach(node=>{node.style.fontSize=`${next}px`;});
    }
  }
  function render() {
    if(!schema)return;
    const snapshot={fields:Object.fromEntries(Object.keys(schema.fields).map(key=>[key,value(key)])),visibility:schema.sections.map(item=>[item.id,sectionVisible(item.id)]),navigation:pathValue(configuration,'navigation.items')};
    const signature=JSON.stringify(snapshot);
    if(signature===lastSignature)return;
    lastSignature=signature;
    films=normalizedFilms();bindStatic();patchTiles();patchList();
    if(filmPanel.open){if(films.some(film=>film.id===activeFilmId))patchFilm();else filmPanel.close();}
    requestAnimationFrame(fitWordmarks);
  }
  function updateMotion() {motionToggle.setAttribute('aria-pressed',String(paused));motionToggle.textContent=paused?'Lanjut gerak':'Jeda gerak';}
  motionToggle.addEventListener('click',()=>{paused=!paused;updateMotion();});
  reduced.addEventListener('change',()=>{paused=reduced.matches||embedded;updateMotion();});updateMotion();
  for(let i=0;i<columns*rows;i++){
    const button=document.createElement('button');button.type='button';button.className='tile';button.hidden=true;
    const img=document.createElement('img');img.decoding='async';img.draggable=false;img.loading=i<12?'eager':'lazy';img.width=1536;img.height=1024;button.append(img);
    const tile={button,img,i,col:i%columns,row:Math.floor(i/columns),frame:null,x:0,y:0,w:0,h:0};
    img.addEventListener('load',()=>{if(tile.frame&&!tile.frame.lockedRatio&&img.naturalWidth){tile.frame.ratio=img.naturalWidth/img.naturalHeight;layout();}});
    button.addEventListener('click',()=>{if(performance.now()>suppressClickUntil&&tile.frame)openFilm(tile.frame.filmId);});
    button.addEventListener('focus',()=>{const rect=button.getBoundingClientRect();if(rect.right<30||rect.left>innerWidth-30||rect.bottom<30||rect.top>innerHeight*.8){pan.x+=innerWidth*.6-(rect.x+rect.width/2);pan.y+=innerHeight*.35-(rect.y+rect.height/2);target={...pan};renderTiles();}});
    tiles.push(tile);tileRoot.append(button);
  }
  function layout() {
    const small=innerWidth<768,cell=innerWidth*(small?.75:1/3),cellHeight=Math.max(cell*1.08,(innerHeight+cell*2)/rows);
    metrics={cell,cellHeight,worldW:cell*columns,worldH:cellHeight*rows};
    if(!initialized||previousSmall!==small){pan={x:-cell*.38,y:-cellHeight*.2};target={...pan};initialized=true;previousSmall=small;}
    const shifts=[[.08,.04],[.10,.13],[.17,.04],[.06,.13],[.13,.06],[.08,.1]];
    tiles.forEach(tile=>{if(!tile.frame)return;const shift=shifts[(tile.i+tile.row)%shifts.length];let w=cell*[.76,.87,.70,.84,.74,.82][tile.i%6],h=w/tile.frame.ratio;if(h>cellHeight*.86){h=cellHeight*.86;w=h*tile.frame.ratio;}Object.assign(tile,{w,h,x:tile.col*cell+cell*shift[0],y:tile.row*cellHeight+cellHeight*shift[1]});tile.button.style.width=`${w}px`;tile.button.style.height=`${h}px`;});renderTiles();
  }
  function renderTiles(){if(!metrics)return;const {cell,cellHeight,worldW,worldH}=metrics;tiles.forEach(tile=>{if(!tile.frame)return;const x=mod(tile.x+pan.x+cell,worldW)-cell,y=mod(tile.y+pan.y+cellHeight,worldH)-cellHeight;tile.button.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;const visible=x+tile.w>0&&x<innerWidth&&y+tile.h>0&&y<innerHeight;tile.button.style.visibility=visible?'visible':'hidden';tile.button.tabIndex=visible?0:-1;});}
  function animate(now){const dt=Math.min(now-lastTime||16,40);lastTime=now;if(!anyDialog()&&!document.hidden){if(!paused&&!drag&&!gallery.contains(document.activeElement)&&now-lastInteraction>2000){target.x+=dt*.009;target.y-=dt*.006;}const ease=reduced.matches?1:1-Math.pow(.88,dt/16);if(Math.abs(target.x-pan.x)>.01||Math.abs(target.y-pan.y)>.01){pan.x+=(target.x-pan.x)*ease;pan.y+=(target.y-pan.y)*ease;renderTiles();}}requestAnimationFrame(animate);}
  gallery.addEventListener('pointerdown',event=>{if(event.button!==0||anyDialog())return;drag={id:event.pointerId,x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,moved:false};lastInteraction=performance.now();});
  gallery.addEventListener('pointermove',event=>{if(!drag||drag.id!==event.pointerId)return;if(Math.hypot(event.clientX-drag.startX,event.clientY-drag.startY)>6&&!drag.moved){drag.moved=true;gallery.setPointerCapture(event.pointerId);gallery.classList.add('is-dragging');gallery.focus({preventScroll:true});}if(drag.moved){target.x+=event.clientX-drag.x;target.y+=event.clientY-drag.y;if(reduced.matches){pan={...target};renderTiles();}event.preventDefault();}drag.x=event.clientX;drag.y=event.clientY;});
  function endDrag(event){if(!drag||drag.id!==event.pointerId)return;if(drag.moved)suppressClickUntil=performance.now()+250;if(gallery.hasPointerCapture(event.pointerId))gallery.releasePointerCapture(event.pointerId);drag=null;gallery.classList.remove('is-dragging');lastInteraction=performance.now();}
  gallery.addEventListener('pointerup',endDrag);gallery.addEventListener('pointercancel',endDrag);gallery.addEventListener('lostpointercapture',()=>{drag=null;gallery.classList.remove('is-dragging');});
  gallery.addEventListener('wheel',event=>{if(anyDialog()||event.ctrlKey)return;if(tileRoot.contains(document.activeElement))gallery.focus({preventScroll:true});event.preventDefault();lastInteraction=performance.now();const unit=event.deltaMode===1?16:event.deltaMode===2?innerHeight:1;target.x-=event.deltaX*unit*.7;target.y-=event.deltaY*unit*.7;},{passive:false});
  gallery.addEventListener('keydown',event=>{const directions={ArrowLeft:[100,0],ArrowRight:[-100,0],ArrowUp:[0,100],ArrowDown:[0,-100]};if(!directions[event.key])return;event.preventDefault();lastInteraction=performance.now();gallery.focus({preventScroll:true});target.x+=directions[event.key][0];target.y+=directions[event.key][1];});
  addEventListener('resize',()=>{layout();fitWordmarks();});
  function closeMenu(){if(!menu.open)return;menu.close();menuToggle.setAttribute('aria-expanded','false');menu.style.background='';menu.classList.remove('has-preview');menuToggle.focus({preventScroll:true});}
  menuToggle.addEventListener('click',()=>{if(anyDialog())return;menuToggle.setAttribute('aria-expanded','true');menu.showModal();$('.menu-close').focus();fitWordmarks();});
  $('.menu-close').addEventListener('click',closeMenu);menu.addEventListener('cancel',event=>{event.preventDefault();closeMenu();});
  const tones={red:'#f2572c',blue:'#a9d8eb',green:'#c6dfb0',gold:'#efce8f'};
  all('[data-tone]').forEach(button=>{const preview=()=>{menu.style.background=tones[button.dataset.tone];menu.classList.add('has-preview');};const clear=()=>{menu.style.background='';menu.classList.remove('has-preview');};button.addEventListener('mouseenter',preview);button.addEventListener('focus',preview);button.addEventListener('mouseleave',clear);button.addEventListener('blur',clear);});
  all('#menu-panel [data-view]').forEach(button=>button.addEventListener('click',()=>{const view=button.dataset.view;closeMenu();if(view==='galeri')gallery.focus({preventScroll:true});else openView(view);}));
  $('.skip-link').addEventListener('click',event=>{event.preventDefault();openView('daftar');});
  function openView(view){if((view==='tentang'&&!sectionVisible('about'))||(view==='kontak'&&!sectionVisible('contact'))||(view==='showreel'&&!safeUrl(value('sections.gallery.reelUrl'),'video')))return;activeView=view;all('[data-view-page]').forEach(node=>{node.hidden=node.dataset.viewPage!==view;});contentPanel.setAttribute('aria-labelledby',({daftar:'films-title',tentang:'about-title',kontak:'contact-title',showreel:'reel-title'})[view]);if(!contentPanel.open)contentPanel.showModal();contentPanel.scrollTop=0;}
  $('.panel-close').addEventListener('click',()=>contentPanel.close());contentPanel.addEventListener('close',()=>$('.reel-player').pause());
  $('#about-contact').addEventListener('click',()=>openView('kontak'));$('#contact-work').addEventListener('click',()=>openView('daftar'));
  function patchFilm(){const film=films.find(item=>item.id===activeFilmId);if(!film)return;$('#film-title').textContent=film.title;$('#film-meta').textContent=[film.format,film.year].filter(Boolean).join(' / ');$('#film-synopsis').textContent=film.description;setImage($('#film-image'),film.image,true);$('.film-visual').style.setProperty('--frame',film.borderColor);const watch=$('#film-watch');watch.hidden=!film.trailerUrl;if(film.trailerUrl)watch.href=film.trailerUrl;else watch.removeAttribute('href');$('#film-previous').disabled=films.length<2;$('#film-next').disabled=films.length<2;}
  function openFilm(id){if(!films.some(item=>item.id===id))return;activeFilmId=id;patchFilm();if(!filmPanel.open)filmPanel.showModal();filmPanel.scrollTop=0;}
  function adjacentFilm(delta){if(!films.length)return;const index=films.findIndex(item=>item.id===activeFilmId);openFilm(films[mod(index+delta,films.length)].id);}
  $('.film-close').addEventListener('click',()=>filmPanel.close());$('#film-previous').addEventListener('click',()=>adjacentFilm(-1));$('#film-next').addEventListener('click',()=>adjacentFilm(1));filmPanel.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();adjacentFilm(-1);}if(event.key==='ArrowRight'){event.preventDefault();adjacentFilm(1);}});
  window.addEventListener('message',event=>{
    if(!embedded||event.source!==window.parent||event.origin!==location.origin)return;
    const payload=event.data;if(!record(payload)||payload.type!=='pagiverse:config'||payload.templateId!==TEMPLATE_ID||!record(payload.configuration))return;
    configuration=payload.configuration;if(schema)render();
    if(schema)window.parent.postMessage({type:'pagiverse:applied',templateId:TEMPLATE_ID,revision:payload.revision},location.origin);
  });
  const intro=$('.intro');if(reduced.matches||embedded)intro.remove();else intro.addEventListener('animationend',()=>intro.remove(),{once:true});
  async function init(){
    const response=await fetch('template.json',{cache:'no-store'});if(!response.ok)throw new Error('Template configuration unavailable');schema=await response.json();if(schema.id!==TEMPLATE_ID)throw new Error('Template identity mismatch');render();layout();requestAnimationFrame(animate);document.fonts.ready.then(fitWordmarks);
    if(embedded)window.parent.postMessage({type:'pagiverse:ready',templateId:TEMPLATE_ID},location.origin);
  }
  init().catch(error=>{console.error(error);const notice=$('#gallery-empty');notice.hidden=false;notice.textContent='Galeri belum dapat dimuat. Muat ulang halaman untuk mencoba kembali.';});
})();
