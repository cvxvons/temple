/* ============================================================
   TEMPLE — interactions
   ============================================================ */
(function(){
  'use strict';
  /* always open at the hero — don't let the browser restore scroll on reload */
  if('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if(!location.hash) window.scrollTo(0,0);
  window.addEventListener('load', function(){ if(!location.hash) window.scrollTo(0,0); });
  const $  = (s,c)=> (c||document).querySelector(s);
  const $$ = (s,c)=> Array.from((c||document).querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- store badges ---------- */
  const appstore = $('#appstore'), gp = $('#googleplay');
  if(appstore) appstore.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" style="width:24px;height:24px"><path d="M17.05 12.04c-.02-2.2 1.8-3.26 1.88-3.31-1.02-1.5-2.62-1.71-3.19-1.73-1.36-.14-2.65.8-3.34.8-.69 0-1.75-.78-2.88-.76-1.48.02-2.85.86-3.61 2.19-1.54 2.67-.39 6.62 1.1 8.79.73 1.06 1.6 2.25 2.74 2.21 1.1-.04 1.52-.71 2.85-.71 1.33 0 1.71.71 2.88.69 1.19-.02 1.94-1.08 2.67-2.15.84-1.23 1.19-2.42 1.21-2.48-.03-.01-2.32-.89-2.34-3.53ZM14.87 5.56c.6-.74 1.01-1.75.9-2.77-.87.04-1.93.58-2.56 1.31-.56.65-1.05 1.69-.92 2.68.97.08 1.97-.49 2.58-1.22Z"/></svg><span><span class="sb-small">Download on the</span><span class="sb-big">App Store</span></span>';
  if(gp) gp.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" style="width:22px;height:22px"><path d="M3.9 2.1C3.6 2.3 3.4 2.6 3.4 3.1v17.8c0 .5.2.8.5 1l9.4-9.9L3.9 2.1Zm12.7 6.3L5.2 1.9c-.4-.2-.8-.2-1.1 0l9.2 9.7 3.3-3.2Zm0 0L13.3 11.6l3.3 3.4 3.6-2.1c.7-.4.7-1.4 0-1.8L16.6 8.4ZM4.1 21.9c.3.2.7.2 1.1 0l11.4-6.5-3.3-3.4-9.2 9.9Z" opacity=".55"/><path d="M3.9 2.1 13.4 12 3.9 21.9c-.3-.2-.5-.5-.5-1V3.1c0-.5.2-.8.5-1Z"/></svg><span><span class="sb-small">Get it on</span><span class="sb-big">Google Play</span></span>';

  /* ---------- clone wordmark into footer + hero ---------- */
  (function(){
    const src = $('#wordmarkSrc');
    if(!src) return;
    const foot = $('#footerLogo');
    if(foot){ const c = src.cloneNode(true); c.removeAttribute('id'); foot.replaceWith(c); c.classList.add('logo'); }
    const hero = $('#heroWordmark');
    if(hero){ hero.remove(); }
    const fwm = $('#footerWordmark');
    if(fwm){ const c = src.cloneNode(true); c.removeAttribute('id'); c.removeAttribute('class'); fwm.appendChild(c); }
  })();

  /* ---------- nav ---------- */
  const nav = $('#nav');
  const onScroll = ()=> nav.classList.toggle('scrolled', window.scrollY > 24);
  onScroll(); addEventListener('scroll', onScroll, {passive:true});

  const burger = $('#burger'), menu = $('#mobileMenu');
  if(burger){
    burger.addEventListener('click', ()=> menu.classList.toggle('open'));
    $$('#mobileMenu a').forEach(a=> a.addEventListener('click', ()=> menu.classList.remove('open')));
  }

  /* ---------- marquee (seamless) ---------- */
  $$('[data-marquee]').forEach(mq=>{
    const row = mq.querySelector('.marquee__row');
    if(!row) return;
    const base = row.innerHTML;
    // fill so a single row is at least 1.5x the container
    let guard = 0;
    while(row.scrollWidth < mq.offsetWidth * 1.6 && guard++ < 20){ row.innerHTML += base; }
    const clone = row.cloneNode(true);
    clone.setAttribute('aria-hidden','true');
    mq.appendChild(clone);
  });

  /* ---------- scroll reveals (IO + scroll fallback) ---------- */
  function triggerEl(el){
    if(el.classList.contains('reveal')) el.classList.add('in');
    if(el.dataset.count !== undefined && !el.dataset.counted){ el.dataset.counted = '1'; animateCount(el); }
  }
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ triggerEl(e.target); io.unobserve(e.target); } });
  }, {threshold:.16, rootMargin:'0px 0px -6% 0px'});
  const watched = $$('.reveal, [data-count]');
  watched.forEach(el=> io.observe(el));
  // fallback: rAF polling (covers programmatic scroll / IO quirks / capture)
  let pending = watched.slice();
  function poll(){
    const vh = innerHeight;
    pending = pending.filter(el=>{
      if(el.classList.contains('in') || el.dataset.counted){
        if(!el.classList.contains('reveal')) return false;
      }
      const r = el.getBoundingClientRect();
      if(r.top < vh*0.92 && r.bottom > 0){ triggerEl(el); io.unobserve(el); return false; }
      return true;
    });
    if(pending.length) requestAnimationFrame(poll);
  }
  requestAnimationFrame(poll);

  /* ---------- stat counters ---------- */
  function animateCount(el){
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.dec||'0',10);
    const suffix = el.dataset.suffix||'';
    const pre = el.textContent.trim().startsWith('~') ? '~' : '';
    const unitEl = el.querySelector('.unit');
    const unit = unitEl ? unitEl.outerHTML : (suffix? '<span class="unit">'+suffix+'</span>':'');
    if(reduce){ el.innerHTML = pre + target.toFixed(dec) + unit; return; }
    const dur = 1400, t0 = performance.now();
    function step(now){
      const p = Math.min(1, (now-t0)/dur);
      const eased = 1 - Math.pow(1-p, 3);
      const val = (target*eased).toFixed(dec);
      el.innerHTML = pre + val + unit;
      if(p<1) requestAnimationFrame(step);
      else el.innerHTML = pre + target.toFixed(dec) + unit;
    }
    requestAnimationFrame(step);
  }

  /* ---------- episode countdown ---------- */
  (function(){
    const map = {d:null,h:null,m:null,s:null};
    $$('[data-cd]').forEach(c=> map[c.dataset.cd] = c);
    if(!map.s) return;
    // target ~6d 17h 15m 23s from now
    let target = Date.now() + (6*86400 + 17*3600 + 15*60 + 23)*1000;
    function tick(){
      let diff = Math.max(0, target - Date.now());
      const d = Math.floor(diff/86400000); diff -= d*86400000;
      const h = Math.floor(diff/3600000); diff -= h*3600000;
      const m = Math.floor(diff/60000); diff -= m*60000;
      const s = Math.floor(diff/1000);
      if(map.d) map.d.textContent = String(d).padStart(2,'0')+'d';
      if(map.h) map.h.textContent = String(h).padStart(2,'0')+'h';
      if(map.m) map.m.textContent = String(m).padStart(2,'0')+'m';
      if(map.s) map.s.textContent = String(s).padStart(2,'0')+'s';
    }
    tick(); setInterval(tick, 1000);
  })();

  /* ---------- Memento Mori ---------- */
  (function(){
    const fill = $('#mmFill'), pctEl = $('#mmPct'), secEl = $('#mmSeconds');
    if(!fill) return;
    // assume born 1994-06-01, world avg lifespan 73.4 years
    const born = new Date('1994-06-01T00:00:00').getTime();
    const lifeMs = 73.4 * 365.2425 * 86400000;
    const end = born + lifeMs;
    function tick(){
      const now = Date.now();
      const pct = Math.min(99.999999999, ((now-born)/lifeMs)*100);
      const remainSec = Math.max(0, Math.floor((end-now)/1000));
      fill.style.width = pct.toFixed(4)+'%';
      if(pctEl) pctEl.textContent = pct.toFixed(9)+'% lived…';
      if(secEl) secEl.textContent = remainSec.toLocaleString('en-US');
    }
    tick(); setInterval(tick, 60);
  })();

  /* ---------- FAQ ---------- */
  $$('.faq-item').forEach(item=>{
    const q = $('.faq-q', item), a = $('.faq-a', item);
    q.addEventListener('click', ()=>{
      const open = item.classList.contains('open');
      $$('.faq-item.open').forEach(o=>{ o.classList.remove('open'); $('.faq-a',o).style.maxHeight = null; });
      if(!open){ item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
    });
  });

  /* ---------- contact form ---------- */
  const form = $('#contactForm');
  if(form){
    const success = $('#formSuccess');
    const submitBtn = form.querySelector('button[type=submit]');
    const setErr = (row, on)=> row.classList.toggle('err', on);
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      let ok = true;
      const name = $('#cName'), email = $('#cEmail'), type = $('#cType');
      [[name, name.value.trim().length>0],
       [email, /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim())],
       [type, !!type.value]
      ].forEach(([el,valid])=>{ setErr(el.closest('.form-row'), !valid); if(!valid) ok=false; });
      if(!ok){ const f = $('.form-row.err input, .form-row.err select'); f&&f.focus(); return; }
      submitBtn.textContent = 'Sending…';
      submitBtn.disabled = true;
      try{
        const res = await fetch(form.action, {
          method:'POST',
          headers:{'Accept':'application/json'},
          body: new FormData(form)
        });
        if(res.ok){
          form.querySelectorAll('.form-row, .form-submit').forEach(el=> el.style.display='none');
          success.classList.add('show');
        } else {
          submitBtn.textContent = 'Try again';
          submitBtn.disabled = false;
        }
      } catch(_){
        submitBtn.textContent = 'Try again';
        submitBtn.disabled = false;
      }
    });
    form.querySelectorAll('input,select').forEach(el=>{
      el.addEventListener('input', ()=> el.closest('.form-row').classList.remove('err'));
      el.addEventListener('change', ()=> el.closest('.form-row').classList.remove('err'));
    });
    /* "Something else" reveal */
    const moreRow = $('#moreRow');
    const moreTA  = $('#cMore');
    const charCount = $('#charCount');
    $('#cType').addEventListener('change', function(){
      const show = this.value === 'Something else';
      moreRow.classList.toggle('visible', show);
      moreRow.setAttribute('aria-hidden', String(!show));
      if(show) moreTA.focus();
    });
    moreTA.addEventListener('input', ()=>{
      charCount.textContent = moreTA.value.length;
    });
  }

  /* ---------- subtle parallax on phones ---------- */
  if(!reduce){
    const items = $$('[data-parallax], [data-parallax-soft]');
    let ticking = false;
    function para(){
      const vh = innerHeight;
      items.forEach(el=>{
        const r = el.getBoundingClientRect();
        const center = r.top + r.height/2;
        const off = (center - vh/2) / vh; // -1..1
        const amt = el.hasAttribute('data-parallax-soft') ? 26 : 14;
        el.style.setProperty('--py', (off*amt).toFixed(1)+'px');
      });
      ticking = false;
    }
    addEventListener('scroll', ()=>{ if(!ticking){ requestAnimationFrame(para); ticking=true; } }, {passive:true});
    para();
  }

  /* ---------- hero two-layer parallax ---------- */
  (function(){
    const hero = document.getElementById('header');
    if(!hero || reduce) return;
    const bg = hero.querySelector('.hero-bg');
    const bust = hero.querySelector('.hero-bust');
    if(!bg) return;
    let tx=0, ty=0, ticking=false;
    function apply(){
      const y = window.scrollY;
      bg.style.setProperty('--py',  (y*0.22).toFixed(1)+'px');
      if(bust) bust.style.setProperty('--py',(y*0.06).toFixed(1)+'px');
      bg.style.setProperty('--px',  (tx*8).toFixed(1)+'px');
      bg.style.setProperty('--py2', (ty*5).toFixed(1)+'px');
      if(bust) bust.style.setProperty('--px', (tx*22).toFixed(1)+'px');
      if(bust) bust.style.setProperty('--py2',(ty*14).toFixed(1)+'px');
      ticking=false;
    }
    function schedule(){ if(!ticking){ requestAnimationFrame(apply); ticking=true; } }
    addEventListener('scroll', schedule, {passive:true});
    if(matchMedia('(pointer:fine)').matches){
      hero.addEventListener('mousemove', e=>{
        const r=hero.getBoundingClientRect();
        tx=((e.clientX-r.left)/r.width-0.5)*2;
        ty=((e.clientY-r.top)/r.height-0.5)*2;
        schedule();
      });
      hero.addEventListener('mouseleave', ()=>{ tx=0; ty=0; schedule(); });
    }
    apply();
  })();

  /* ---------- ascii flow-field (hero) ---------- */
  (function(){
    const canvas = document.getElementById('heroParticles');
    if(!canvas) return;
    const ctx = canvas.getContext('2d', { alpha:true });
    const root = document.documentElement;
    let W=0, H=0, DPR=1, cols=0, rows=0, cell=16, raf=0, running=false, t=0, heroVisible=true;
    const RAMP = " .·:-=+*o#%@";   // sparse → dense

    // ----- Temple logo symbol → density mask -----
    const LOGO_VB = 588;
    const LOGO = [
      new Path2D("M0.0830137 528.983C0.150538 481.014 0.239126 470.422 0.573652 470.215C0.797908 470.076 5.8158 469.877 11.7245 469.772C46.0079 469.166 83.1731 464.062 117.25 455.281C169.164 441.902 218.304 419.863 262.24 390.251C287.326 373.344 308.981 355.634 330.159 334.704C375.938 289.46 409.471 239.776 434.599 179.96C455.406 130.43 467.683 75.0828 469.877 20.9174C470.049 16.6497 470.28 10.2603 470.388 6.71801L470.584 0.277768H587.91V587.5H470.516L470.5 469.947C470.484 359.277 470.453 352.439 469.958 353.163C468.816 354.834 454.337 372.898 449.801 378.31C422.456 410.935 388.649 442.997 354.516 468.678C307.297 504.205 257.099 531.59 202.276 551.734C167.326 564.576 128.496 574.679 92.9351 580.181C73.4452 583.198 55.1726 585.155 34.8576 586.404C26.7497 586.903 9.87719 587.494 3.6451 587.497L0 587.5L0.0830137 528.983Z"),
      new Path2D("M0.0108527 220.331L4.26987 220.326C9.08147 220.321 15.6196 219.927 22.4675 219.228C85.7202 212.779 143.362 179.111 180.281 127.051C190.67 112.401 200.351 93.974 206.897 76.3891C212.598 61.0746 216.862 43.4049 218.974 26.3496C219.716 20.3572 220.138 14.5303 220.425 6.29476L220.632 0.36188L232.594 0.144438C239.173 0.0242566 265.59 -0.0321167 291.298 0.0186817L338.041 0.110986L337.838 9.58365C337.592 21.0362 337.037 28.7539 335.61 40.5403C332.924 62.7361 329.105 80.4462 322.407 101.77C309.59 142.574 287.709 182.668 260.131 215.883C248.75 229.59 234.354 244.202 220.636 255.971C189.991 282.261 154.932 302.919 117.626 316.669C92.3909 325.97 68.7962 331.737 41.9815 335.161C29.7236 336.725 24.8104 337.084 5.35398 337.835L0.0108527 338.041V220.331Z")
    ];
    let mask=null;   // Float32Array[rows*cols], 0..1 logo coverage per cell (upright)
    let lcx=0, lcy=0, angle=0;   // logo centre (cell coords) + spin angle
    function buildMask(){
      mask = new Float32Array(cols*rows);
      if(!W||!H) return;
      const oc = document.createElement('canvas'); oc.width=W; oc.height=H;
      const o = oc.getContext('2d');
      const size = Math.min(W, H) * 0.42;       // emblem size in device px (~20% smaller)
      const cx = W*0.5, cy = H*(window.innerWidth<=860 ? 0.30 : 0.40);  // lift emblem up on mobile so it clears the wordmark
      lcx = cx/cell; lcy = cy/cell;
      o.save();
      o.translate(cx - size/2, cy - size/2);
      o.scale(size/LOGO_VB, size/LOGO_VB);
      o.fillStyle = '#fff';
      for(const p of LOGO) o.fill(p);
      o.restore();
      const data = o.getImageData(0,0,W,H).data;
      const half = (cell/2)|0;
      for(let r=0;r<rows;r++){
        const py = Math.min(H-1, r*cell + half);
        for(let col=0;col<cols;col++){
          const px = Math.min(W-1, col*cell + half);
          mask[r*cols+col] = data[(py*W+px)*4+3] / 255;
        }
      }
    }
    function mget(ix, iy){
      if(!mask || ix<0 || iy<0 || ix>=cols || iy>=rows) return 0;
      return mask[iy*cols+ix];
    }
    // bilinear sample of the upright mask at fractional cell coords
    function sampleMask(fx, fy){
      const x0=Math.floor(fx), y0=Math.floor(fy), tx=fx-x0, ty=fy-y0;
      const a=mget(x0,y0), b=mget(x0+1,y0), c=mget(x0,y0+1), d=mget(x0+1,y0+1);
      return (a*(1-tx)+b*tx)*(1-ty) + (c*(1-tx)+d*tx)*ty;
    }

    function hexToRGB(c){
      let h=(c||'').trim().replace('#',''); if(h.length===3) h=h.split('').map(x=>x+x).join('');
      const n=parseInt(h||'0c0c0d',16); return [(n>>16)&255,(n>>8)&255,n&255];
    }
    const bgRGB = ()=> hexToRGB(getComputedStyle(root).getPropertyValue('--bg'));
    const darkBg = ()=>{ const b=bgRGB(); return (b[0]*0.299+b[1]*0.587+b[2]*0.114) < 128; };

    // value-noise (Perlin-ish) field
    const noise = (function(){
      const p=new Uint8Array(256); for(let i=0;i<256;i++) p[i]=i;
      for(let i=255;i>0;i--){const j=(Math.random()*(i+1))|0; const tmp=p[i]; p[i]=p[j]; p[j]=tmp;}
      const perm=new Uint8Array(512); for(let i=0;i<512;i++) perm[i]=p[i&255];
      const fade=t=>t*t*t*(t*(t*6-15)+10), lerp=(a,b,t)=>a+(b-a)*t;
      const grad=(h,x,y)=>((h&1)?-x:x)+((h&2)?-y:y);
      return function(x,y){
        const X=Math.floor(x)&255, Y=Math.floor(y)&255;
        x-=Math.floor(x); y-=Math.floor(y);
        const u=fade(x), v=fade(y);
        const a=perm[X]+Y, b=perm[X+1]+Y;
        return lerp(lerp(grad(perm[a],x,y),grad(perm[b],x-1,y),u),
                    lerp(grad(perm[a+1],x,y-1),grad(perm[b+1],x-1,y-1),u), v);
      };
    })();

    function cfg(){
      const mode = root.dataset.particles || 'ambient';
      if(mode==='off') return null;
      return mode==='minimal'
        ? { cellCSS:21, scale:0.150, speed:0.034, thresh:0.52, amb:0.74, spin:0.010, erase:7.0 }
        : { cellCSS:16, scale:0.155, speed:0.048, thresh:0.50, amb:0.85, spin:0.012, erase:8.0 };
    }
    // two-octave field, clamped to [0,1]
    function field(nx, ny){
      const v = noise(nx, ny) + 0.5*noise(nx*2.1+11.3, ny*2.1-7.7);
      const n = (v/1.5)*0.5 + 0.5;
      return n < 0 ? 0 : n > 1 ? 1 : n;
    }

    // pointer interaction (in cell units)
    const pointer = { gx:-999, gy:-999, str:0 };

    function clearAll(){ ctx.clearRect(0,0,W,H); }
    function layout(){
      const c = cfg();
      cell = Math.max(8, Math.round((c?c.cellCSS:16) * DPR));
      cols = Math.ceil(W/cell)+1;
      rows = Math.ceil(H/cell)+1;
      buildMask();
    }
    function resize(){
      DPR=Math.min(2, window.devicePixelRatio||1);
      const r=canvas.getBoundingClientRect();
      W=Math.max(1,Math.round(r.width*DPR)); H=Math.max(1,Math.round(r.height*DPR));
      canvas.width=W; canvas.height=H; layout();
    }

    function drawStep(){
      const c=cfg();
      if(!c){ clearAll(); return false; }
      t++; angle += c.spin;                       // slow logo spin
      clearAll();
      const b = darkBg() ? [236,232,225] : [22,20,17];
      ctx.font = `${Math.round(cell*0.92)}px "JetBrains Mono", ui-monospace, monospace`;
      ctx.textBaseline = 'top';
      const sc=c.scale, drift=t*c.speed, sway=Math.sin(t*0.004)*0.26, amb=c.amb;
      // --- 3D spin around the vertical axis: horizontal squash = cos(angle); back face is mirrored + dimmer ---
      const ca=Math.cos(angle);
      const sxs = Math.abs(ca) < 0.07 ? (ca<0?-0.07:0.07) : ca;   // avoid div blow-up at edge-on
      const faceDim = ca < 0 ? 0.80 : 1;                          // back of the logo reads dimmer
      const eraseR=c.erase, pStr=pointer.str, active=pStr>0.02;
      for(let r=0;r<rows;r++){
        const baseNy = r*sc + drift;
        for(let col=0;col<cols;col++){
          const nx = col*sc + drift*0.22 + sway, ny = baseNy;
          // sample the upright logo with only its horizontal axis scaled → spins like a 3D card
          let m = sampleMask(lcx + (col - lcx)/sxs, r);
          // --- hover dissolves the logo away; the hole STAYS until the cursor leaves the hero ---
          if(active && m > 0.001){
            const dx=col-pointer.gx, dy=r-pointer.gy, d=Math.hypot(dx,dy);
            if(d < eraseR){
              let e = (1 - d/eraseR) + (field(nx*1.8+9, ny*1.8)-0.5)*0.6;  // soft, noisy, breathing edge
              e = e<0?0 : e>1?1 : e;
              m *= 1 - e*pStr;
            }
          }
          const fv = field(nx, ny);
          const v = m*0.95 + fv*amb;                 // logo + ambient field throughout
          if(v < c.thresh) continue;
          const u = Math.min(1, (v - c.thresh)/(1 - c.thresh));
          const ch = RAMP[Math.min(RAMP.length-1, 1+Math.floor(u*(RAMP.length-1)))];
          if(ch===' ') continue;
          const a = Math.min(0.95, (0.05 + u*0.48 + m*0.32) * (m>0.05?faceDim:1));
          ctx.fillStyle = `rgba(${b[0]},${b[1]},${b[2]},${a})`;
          ctx.fillText(ch, col*cell, r*cell);
        }
      }
      return true;
    }

    let lastT=0;
    function loop(ts){ if(!running) return; if((ts||0)-lastT>=33){ lastT=ts||0; if(!drawStep()){ running=false; return; } } raf=requestAnimationFrame(loop); }
    function start(){ if(running || !heroVisible) return; if(!cfg()) return; running=true; raf=requestAnimationFrame(loop); }
    function stop(){ running=false; cancelAnimationFrame(raf); }
    function staticRender(){ clearAll(); for(let k=0;k<140;k++) drawStep(); }

    // expose for tweaks
    window.__particles = { refresh(){
      layout();
      if(!cfg()){ stop(); clearAll(); return; }
      if(reduce) staticRender(); else { stop(); start(); }
    }};

    resize();
    if(reduce){ staticRender(); }
    else {
      start();
      const io=new IntersectionObserver(es=>{ heroVisible=es[0].isIntersecting; if(heroVisible) start(); else stop(); },{threshold:0.02});
      const hero=document.getElementById('header'); if(hero) io.observe(hero);
      document.addEventListener('visibilitychange', ()=>{ if(document.hidden) stop(); else start(); });
      // mouse / touch interaction over the hero
      function onMove(e){
        const r=canvas.getBoundingClientRect();
        const x=(e.clientX-r.left)*DPR, y=(e.clientY-r.top)*DPR;
        if(x<0||y<0||x>W||y>H) return;
        pointer.gx = x/cell; pointer.gy = y/cell; pointer.str = 1;
        if(!running) start();
      }
      const heroEl=document.getElementById('header');
      if(heroEl){ heroEl.addEventListener('pointermove', onMove, {passive:true});
        heroEl.addEventListener('pointerleave', ()=>{ pointer.str=0; }); }
    }
    let rz; addEventListener('resize', ()=>{ clearTimeout(rz); rz=setTimeout(()=>{ resize(); if(reduce) staticRender(); }, 180); }, {passive:true});
  })();
})();

/* ============================================================
   Hero cinematic particles — three monochrome layers:
   1) large slow glowing orbs   2) mid drifting motes w/ twinkle
   3) fine dust/sparks, denser near center. Cursor repels nearby
   particles softly; all loop seamlessly. rAF, pauses when the
   tab is hidden or the hero scrolls off-screen.
   ============================================================ */
(function(){
  'use strict';
  const c = document.getElementById('heroDust');
  if(!c) return;
  const ctx = c.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TAU = Math.PI * 2;
  let W=0, H=0, raf=0, t=0;
  let orbs=[], motes=[], dust=[];
  const mouse = { x:-9999, y:-9999, on:false };
  let orbSprite = null;

  function size(){
    const dpr = Math.min(window.devicePixelRatio||1, 2);
    W = c.clientWidth; H = c.clientHeight;
    c.width = W*dpr; c.height = H*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  /* pre-rendered radial-gradient sprite so orbs cost one drawImage */
  function makeOrbSprite(){
    const s = document.createElement('canvas');
    s.width = s.height = 128;
    const g = s.getContext('2d');
    const grad = g.createRadialGradient(64,64,0, 64,64,64);
    grad.addColorStop(0,   'rgba(255,255,255,1)');
    grad.addColorStop(0.35,'rgba(240,240,242,0.55)');
    grad.addColorStop(1,   'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0,0,128,128);
    orbSprite = s;
  }

  function make(){
    const small = window.innerWidth < 700;

    /* Layer 1 — large slow orbs */
    const nOrbs = small ? 6 : 10;
    orbs = Array.from({length:nOrbs}, () => ({
      x: Math.random()*W, y: Math.random()*H,
      r: 30 + Math.random()*30,                 // radius 30-60 → 60-120px dia
      o: 0.15 + Math.random()*0.05,             // 15-20%
      vy: -(0.05 + Math.random()*0.08),         // extremely slow rise
      swayA: 8 + Math.random()*14,              // sway amplitude px
      swayF: 0.002 + Math.random()*0.003,       // sway freq
      ph: Math.random()*TAU,
      ox: 0, oy: 0                              // repel offsets
    }));

    /* Layer 2 — medium motes, drifting upper-left → lower-right */
    const nMotes = small ? 22 : 36;
    motes = Array.from({length:nMotes}, () => {
      const paused = Math.random() < 0.28;      // some hang mid-air
      const sp = 0.08 + Math.random()*0.22;
      return {
        x: Math.random()*W, y: Math.random()*H,
        r: 1.5 + Math.random()*2.5,             // 3-8px dia
        o: 0.25 + Math.random()*0.10,           // 25-35%
        vx: paused ? 0 : sp,
        vy: paused ? 0 : sp*0.7,
        tw: 0.4 + Math.random()*0.8,            // twinkle speed
        ph: Math.random()*TAU,
        ox: 0, oy: 0
      };
    });

    /* Layer 3 — fine dust & sparks, biased toward center (logo) */
    const nDust = small ? 55 : 92;
    dust = Array.from({length:nDust}, () => {
      const central = Math.random() < 0.55;
      const gx = () => central ? W*0.5 + (Math.random()-0.5)*W*0.5 : Math.random()*W;
      const gy = () => central ? H*0.5 + (Math.random()-0.5)*H*0.5 : Math.random()*H;
      const a = Math.random()*TAU, sp = 0.15 + Math.random()*0.45;
      return {
        x: gx(), y: gy(),
        r: 0.5 + Math.random()*0.5,             // 1-2px dia
        o: 0.40 + Math.random()*0.10,           // 40-50%
        vx: Math.cos(a)*sp, vy: Math.sin(a)*sp,
        spark: Math.random() < 0.18,            // brief flashers
        life: Math.random(),                    // 0..1 spark phase
        lifeV: 0.004 + Math.random()*0.008,
        ox: 0, oy: 0
      };
    });
  }

  const wrap = (p, m) => {
    if(p.x < -m) p.x = W + m; else if(p.x > W + m) p.x = -m;
    if(p.y < -m) p.y = H + m; else if(p.y > H + m) p.y = -m;
  };

  /* soft cursor repulsion + slow return of the offset */
  function repel(p, radius, push){
    if(mouse.on){
      const dx = (p.x + p.ox) - mouse.x, dy = (p.y + p.oy) - mouse.y;
      const d2 = dx*dx + dy*dy, r2 = radius*radius;
      if(d2 < r2 && d2 > 0.01){
        const d = Math.sqrt(d2), f = (1 - d/radius) * push;
        p.ox += (dx/d)*f; p.oy += (dy/d)*f;
      }
    }
    p.ox *= 0.965; p.oy *= 0.965;               // drift back like still water
  }

  function tick(){
    t++;
    ctx.clearRect(0,0,W,H);

    /* Layer 1 — orbs */
    for(const p of orbs){
      p.y += p.vy;
      const sway = Math.sin(t*p.swayF + p.ph) * p.swayA;
      wrap(p, p.r*2);
      repel(p, 160, 0.5);
      ctx.globalAlpha = p.o;
      const d = p.r*2;
      ctx.drawImage(orbSprite, p.x + sway + p.ox - p.r, p.y + p.oy - p.r, d, d);
    }

    /* Layer 2 — motes */
    ctx.fillStyle = '#e9e9ec';
    for(const p of motes){
      p.x += p.vx; p.y += p.vy;
      wrap(p, 10);
      repel(p, 110, 0.8);
      const twinkle = 0.75 + 0.25*Math.sin(t*0.02*p.tw + p.ph);
      ctx.globalAlpha = p.o * twinkle;
      ctx.beginPath(); ctx.arc(p.x + p.ox, p.y + p.oy, p.r, 0, TAU); ctx.fill();
    }

    /* Layer 3 — dust & sparks */
    ctx.fillStyle = '#fff';
    for(const p of dust){
      p.x += p.vx; p.y += p.vy;
      wrap(p, 6);
      repel(p, 90, 1.1);
      let a = p.o;
      if(p.spark){
        p.life += p.lifeV;
        if(p.life >= 1){                        // respawn spark elsewhere
          p.life = 0;
          p.x = W*0.5 + (Math.random()-0.5)*W*0.7;
          p.y = H*0.5 + (Math.random()-0.5)*H*0.7;
        }
        const ph = p.life;                       // flash in fast, fade out
        a = p.o * (ph < 0.15 ? ph/0.15 : Math.max(0, 1-(ph-0.15)/0.85)) * 1.6;
      }
      ctx.globalAlpha = Math.min(a, 0.75);
      ctx.beginPath(); ctx.arc(p.x + p.ox, p.y + p.oy, p.r, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(tick);
  }

  function start(){ if(!raf && !reduce) raf = requestAnimationFrame(tick); }
  function stop(){ cancelAnimationFrame(raf); raf = 0; }

  size(); makeOrbSprite(); make();
  if(reduce){ t = 1; tick(); cancelAnimationFrame(raf); raf = 0; } /* single static frame */
  else start();

  /* pause when tab hidden */
  document.addEventListener('visibilitychange', () => {
    if(document.visibilityState === 'hidden') stop(); else start();
  });

  /* pause when hero is off-screen */
  let heroVisible = true;
  if('IntersectionObserver' in window){
    new IntersectionObserver(([e])=>{
      heroVisible = e.isIntersecting;
      if(heroVisible && document.visibilityState === 'visible') start(); else stop();
    }).observe(c);
  }

  /* cursor repulsion */
  const heroEl = document.getElementById('header');
  if(heroEl && !reduce){
    heroEl.addEventListener('pointermove', (e) => {
      const r = c.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.on = true;
    }, {passive:true});
    heroEl.addEventListener('pointerleave', () => { mouse.on = false; }, {passive:true});
  }

  let rz2;
  addEventListener('resize', ()=>{ clearTimeout(rz2); rz2=setTimeout(()=>{ size(); make(); }, 160); }, {passive:true});
})();
