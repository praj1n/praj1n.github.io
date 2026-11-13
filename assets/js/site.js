/* SK Terabytes — page behaviour */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer:fine)').matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  var WA = '917401719274';
  var MAIL = 'info@skterabytes.com';

  /* ---- catalogue data (prices intentionally not shown) ---- */
  var TIERS = {
    non: { label: 'Non Smart', short: 'LED · Non smart', os: 'No smart OS' },
    android: { label: 'FHD Smart Android', short: 'FHD · Smart', os: 'Android' },
    webos: { label: 'WebOS 4K', short: '4K · Smart', os: 'WebOS' }
  };
  var DATA = {
    xudesi: { name: 'Xudesi', tm: '™', cls: 'gold', splash: 'xudesi', sizes: [[24, 'non'], [32, 'android'], [43, 'android'], [50, 'webos'], [55, 'webos']] },
    adsan: { name: 'Adsan', tm: '', cls: 'blue', splash: 'adsan', sizes: [[24, 'non'], [32, 'android'], [43, 'android'], [50, 'webos'], [55, 'webos'], [65, 'webos']] }
  };

  /* ---- spec content (from the SK Terabytes brochure) ---- */
  var SPECS = {
    android: [
      ['Series', 'Android Smart Series — frameless, with or without voice remote'],
      ['Panel', 'A+ Grade IPS panel'],
      ['Resolution', '1920 × 1080 (Full HD)'],
      ['Operating system', 'Android OS'],
      ['Storage', '1GB / 8GB or 2GB / 16GB internal'],
      ['Sound', '30W · sound bar model support'],
      ['Ports', 'HDMI · USB · AV · LAN (RJ-45) · Wi-Fi · headphone jack · coaxial out']
    ],
    webos: [
      ['Operating system', 'WebOS smart platform'],
      ['Display', '4K Ultra HD']
    ],
    non: [
      ['Type', 'LED television — non-smart'],
      ['Smart features', 'None (no smart OS)']
    ]
  };
  var OS_LIST = ['Android', 'Google', 'Web', 'Cloud', 'Wave'];
  var APPS = ['Google Assistant', 'YouTube', 'Netflix', 'Prime Video', 'Google Play', 'Mirror Cast', 'Zee5', 'Sun NXT', 'Hotstar'];

  function modelName(b, s, t) { return DATA[b].name + ' ' + s + '″ ' + TIERS[t].label; }
  function waLink(text) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text); }
  function rot(i) { var a = [1, 2, 3, 4, 5, 6], k = i % 6; return a.slice(k).concat(a.slice(0, k)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---- preloader ---- */
  var pre = $('#pre'), t0 = performance.now();
  function hidePre() { var wait = Math.max(0, 1100 - (performance.now() - t0)); setTimeout(function () { pre && pre.classList.add('gone'); document.body.classList.add('ready'); }, wait); }
  if (document.readyState === 'complete') hidePre(); else window.addEventListener('load', hidePre);
  setTimeout(function () { pre && pre.classList.add('gone'); }, 4000);

  /* ---- nav ---- */
  var nav = $('.nav');
  function onScroll() { nav.classList.toggle('solid', window.scrollY > 30); }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  var burger = $('.burger');
  function menu(open) { document.body.classList.toggle('menu-open', open); burger.setAttribute('aria-expanded', open); }
  burger.addEventListener('click', function () { menu(!document.body.classList.contains('menu-open')); });
  $$('.drawer a').forEach(function (a) { a.addEventListener('click', function () { menu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') menu(false); });

  /* ---- chapter tracking: nav + side rail ---- */
  var secs = $$('[data-ch]');
  var rail = $('.rail');
  if (rail) rail.innerHTML = secs.map(function (s) { return '<a href="#' + s.id + '" data-l="' + s.dataset.ch + '" aria-label="' + s.dataset.ch + '"></a>'; }).join('');
  var links = $$('.nav ul a, .rail a');
  var so = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id); });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach(function (s) { so.observe(s); });

  /* ---- reveal ---- */
  var ro = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } });
  }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(function (el) { ro.observe(el); });

  /* ---- counters ---- */
  var co = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return; co.unobserve(e.target);
      var el = e.target, to = +el.dataset.count;
      if (reduce) { el.textContent = to; return; }
      var s = performance.now(), dur = 1400;
      (function f(n) { var k = Math.min(1, (n - s) / dur), v = Math.round(to * (1 - Math.pow(1 - k, 3))); el.textContent = v; if (k < 1) requestAnimationFrame(f); })(s);
    });
  }, { threshold: .6 });
  $$('[data-count]').forEach(function (el) { co.observe(el); });

  /* ---- typewriter ---- */
  var ty = $('#type');
  if (ty) {
    var ph = ['Xudesi™ — premium & luxurious LED Smart TVs.', 'Adsan — top-notch quality for the best price.', '1+1 year warranty with doorstep service.', 'Your Trust, Our Promise.'];
    if (reduce) ty.textContent = ph[0]; else {
      var pi = 0, txt = '', del = false;
      (function type() {
        var full = ph[pi]; txt = del ? full.slice(0, txt.length - 1) : full.slice(0, txt.length + 1); ty.textContent = txt;
        var d = del ? 26 : 58;
        if (!del && txt === full) { d = 1700; del = true; } else if (del && !txt) { del = false; pi = (pi + 1) % ph.length; d = 350; }
        setTimeout(type, d);
      })();
    }
  }

  /* ---- spotlight / tilt / magnetic ---- */
  if (fine && !reduce) {
    $$('.spot').forEach(function (s) {
      s.addEventListener('pointermove', function (e) { var r = s.getBoundingClientRect(); s.style.setProperty('--mx', (e.clientX - r.left) + 'px'); s.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
    });
    document.addEventListener('pointermove', function (e) {
      var c = e.target.closest && e.target.closest('.card');
      $$('.card').forEach(function (k) { if (k !== c) k.style.transform = ''; });
      if (!c) return;
      var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      c.style.transform = 'perspective(900px) rotateY(' + x * 5 + 'deg) rotateX(' + -y * 5 + 'deg) translateY(-4px)';
    });
    $$('.mag').forEach(function (b) {
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * .15 + 'px,' + (e.clientY - r.top - r.height / 2) * .25 + 'px)'; });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* ---- founder timeline ---- */
  var tl = $('#tl'), tyr = $('#tl-year');
  if (tl) {
    var items = $$('.tl-item', tl), curYear = '1977';
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        items.forEach(function (it) { it.classList.toggle('on', it === e.target); });
        var y = e.target.dataset.year;
        if (y !== curYear) { curYear = y; tyr.classList.add('swap'); setTimeout(function () { tyr.textContent = y; tyr.classList.remove('swap'); }, 220); }
      });
    }, { rootMargin: '-42% 0px -48% 0px' });
    items.forEach(function (it) { io2.observe(it); });
    items[0].classList.add('on');
    var tick = false;
    var prog = function () { tick = false; var r = tl.getBoundingClientRect(), p = (window.innerHeight * .55 - r.top) / r.height; tl.style.setProperty('--prog', Math.max(0, Math.min(1, p))); };
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(prog); } }, { passive: true });
    prog();
  }

  /* ---- lineups: real-size ratio, one shared floor line ---- */
  $$('.lineup').forEach(function (el) {
    var b = el.dataset.brand, d = DATA[b];
    el.innerHTML = d.sizes.map(function (z, i) {
      return '<div class="lu" style="--d:' + z[0] + '">' +
        SKT_TV.html({ brand: d.name.toUpperCase(), cls: d.cls, mode: 'poster', order: rot(i + (b === 'adsan' ? 2 : 0)) }) +
        '<div class="lab"><b>' + z[0] + '″</b><small>' + TIERS[z[1]].label + '</small></div></div>';
    }).join('');
    SKT_TV.mount(el);
    if (hasGsap && !reduce) {
      gsap.from($$('.lu', el), { y: 60, opacity: 0, duration: .8, stagger: .09, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    }
  });

  /* ---- catalogue ---- */
  var cat = $('#catalog'), grid = $('#cards'), brand = 'xudesi', filter = 'all';
  function renderCards(animate) {
    var d = DATA[brand]; cat.dataset.brand = brand;
    grid.innerHTML = d.sizes.map(function (z, i) {
      var s = z[0], t = z[1], T = TIERS[t];
      var msg = 'Hello SK Terabytes, I would like the dealer price for ' + modelName(brand, s, t) + '.';
      return '<article class="card" data-t="' + t + '"><span class="info-hint">More info ↗</span>' +
        '<div class="art">' + SKT_TV.html({ brand: d.name.toUpperCase(), cls: d.cls, mode: 'poster', order: rot(i), interactive: false }) + '</div>' +
        '<h3><button type="button" class="stretch" data-info="' + brand + '|' + s + '|' + t + '|' + i + '">' + d.name + (d.tm ? '<sup>' + d.tm + '</sup>' : '') + ' ' + s + '″</button></h3><p class="sub">' + T.label + '</p>' +
        '<div class="chips"><span class="t">' + s + ' inch</span><span>' + T.short + '</span><span>' + T.os + '</span><span>1+1 yr warranty</span></div>' +
        '<div class="go"><button type="button" class="p" data-ask="' + brand + '|' + s + '|' + t + '">Get dealer price</button><a class="w" target="_blank" rel="noopener" href="' + waLink(msg) + '">WhatsApp</a></div></article>';
    }).join('');
    SKT_TV.mount(grid); applyFilter();
    $$('.card', grid).forEach(function (c) {
      var tv = c.querySelector('.tvf'), last = 0;
      c.addEventListener('pointerenter', function (e) { if (e.pointerType === 'touch') return; var n = performance.now(); if (n - last > 1400 && tv._tv) { last = n; tv._tv.next(); } });
    });
    if (animate && hasGsap && !reduce) gsap.from($$('.card', grid), { y: 34, opacity: 0, scale: .96, duration: .55, stagger: .07, ease: 'power3.out', clearProps: 'transform,opacity' });
  }
  function applyFilter() { $$('.card', grid).forEach(function (c) { c.classList.toggle('hide', filter !== 'all' && c.dataset.t !== filter); }); }
  $$('.tabs button').forEach(function (b) {
    b.addEventListener('click', function () {
      if (brand === b.dataset.b) return;
      brand = b.dataset.b; $$('.tabs button').forEach(function (x) { x.setAttribute('aria-selected', x === b); });
      renderCards(true);
    });
  });
  $$('.filters button').forEach(function (b) {
    b.addEventListener('click', function () { filter = b.dataset.f; $$('.filters button').forEach(function (x) { x.classList.toggle('on', x === b); }); applyFilter(); });
  });
  if (cat) renderCards(false);

  /* ---- details modal ---- */
  var dlg = document.createElement('dialog');
  dlg.className = 'modal'; dlg.setAttribute('aria-label', 'Model details');
  document.body.appendChild(dlg);
  function openInfo(b, s, t, i) {
    var d = DATA[b], T = TIERS[t];
    var rows = SPECS[t].map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('');
    var extra = t === 'android'
      ? '<h4>Available OS</h4><div class="pills">' + OS_LIST.map(function (x) { return '<span>' + x + '</span>'; }).join('') + '</div>' +
        '<h4>Built-in apps &amp; smart features</h4><div class="pills">' + APPS.map(function (x) { return '<span>' + x + '</span>'; }).join('') + '</div>'
      : '';
    var msg = 'Hello SK Terabytes, I would like the dealer price for ' + modelName(b, s, t) + '.';
    dlg.innerHTML = '<div class="m-box" data-brand="' + b + '">' +
      '<button class="m-close" aria-label="Close">×</button>' +
      '<div class="m-media">' + SKT_TV.html({ brand: d.name.toUpperCase(), cls: d.cls, mode: 'video', order: rot(+i || 0), hint: 'Tap the TV to change channel', lazy: false }) + '</div>' +
      '<div class="m-body"><p class="eyebrow" style="color:var(--ac)">' + d.name + (d.tm ? '™' : '') + ' · ' + s + ' inch</p>' +
      '<h3>' + d.name + (d.tm ? '<sup>' + d.tm + '</sup>' : '') + ' ' + s + '″</h3><p class="sub">' + T.label + '</p>' +
      '<dl class="specs">' + rows +
      '<div><dt>Warranty</dt><dd>1+1 year with doorstep service</dd></div>' +
      '<div><dt>Minimum order</dt><dd>10 units · delivery in 1 to 3 days</dd></div></dl>' +
      extra +
      '<div class="m-foot"><button type="button" class="btn btn-acc" data-ask="' + b + '|' + s + '|' + t + '">Get dealer price</button>' +
      '<a class="btn btn-ghost" target="_blank" rel="noopener" href="' + waLink(msg) + '">WhatsApp</a></div>' +
      '<p class="m-fine">Details from the SK Terabytes brochure. Ask sales for the full spec sheet; specifications may vary by batch.</p></div></div>';
    document.documentElement.style.overflow = 'hidden';
    dlg.showModal();
    SKT_TV.mount(dlg);
  }
  function closeInfo() { if (dlg.open) dlg.close(); }
  dlg.addEventListener('close', function () { document.documentElement.style.overflow = ''; dlg.innerHTML = ''; });
  dlg.addEventListener('click', function (e) {
    if (e.target === dlg || e.target.closest('.m-close')) closeInfo();
    if (e.target.closest('[data-ask]')) closeInfo();
  });

  document.addEventListener('click', function (e) {
    var inf = e.target.closest('[data-info]'); if (inf) { var q = inf.dataset.info.split('|'); openInfo(q[0], q[1], q[2], q[3]); return; }
    var a = e.target.closest('[data-ask]'); if (a) { var p = a.dataset.ask.split('|'); setTimeout(function () { prefill(p[0], p[1], p[2]); }, a.closest('dialog') ? 60 : 0); }
    var sw = e.target.closest('[data-open-cat]'); if (sw) { var bt = $('.tabs button[data-b="' + sw.dataset.openCat + '"]'); bt && bt.click(); }
  });

  /* ---- contact form ---- */
  var f = $('#enq'), fb = $('#f-brand'), fm = $('#f-model');
  function fillModels() {
    var b = fb.value, opts = '<option value="">Not sure yet</option>';
    if (DATA[b]) opts += DATA[b].sizes.map(function (z) { return '<option value="' + z[0] + '|' + z[1] + '">' + z[0] + '″ — ' + TIERS[z[1]].label + '</option>'; }).join('');
    fm.innerHTML = opts;
  }
  fb.addEventListener('change', fillModels); fillModels();
  function prefill(b, s, t) {
    fb.value = b; fillModels(); if (s) fm.value = s + '|' + t;
    $('#contact').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    setTimeout(function () { $('#f-name').focus({ preventScroll: true }); }, 700);
  }
  function compose() {
    var v = function (id) { return ($('#' + id).value || '').trim(); };
    var b = DATA[fb.value] ? DATA[fb.value].name : 'Not sure / both';
    var m = fm.value ? (function () { var p = fm.value.split('|'); return modelName(fb.value, p[0], p[1]); })() : 'Not sure yet';
    return ['Hello SK Terabytes, I would like the dealer price list.', '',
      'Name: ' + v('f-name'), 'Company: ' + (v('f-co') || '-'), 'City: ' + (v('f-city') || '-'), 'Phone: ' + v('f-phone'),
      'Brand: ' + b, 'Model: ' + m, 'Quantity: ' + (v('f-qty') || '-'), v('f-msg') ? 'Message: ' + v('f-msg') : ''].filter(function (x, i) { return x !== '' || (i === 1); }).join('\n');
  }
  function ok() { var e = $('#f-err'); if (!$('#f-name').value.trim() || !$('#f-phone').value.trim()) { e.textContent = 'Please add your name and phone number so we can reach you.'; return false; } e.textContent = ''; return true; }
  $('#send-wa').addEventListener('click', function () { if (ok()) window.open(waLink(compose()), '_blank', 'noopener'); });
  $('#send-mail').addEventListener('click', function () { if (ok()) window.location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Dealer price list enquiry') + '&body=' + encodeURIComponent(compose()); });
  f.addEventListener('submit', function (e) { e.preventDefault(); $('#send-wa').click(); });

  /* ---- map ---- */
  var MAPS = {
    corp: 'Sivageetha & S Residence, West Tambaram, Chennai',
    wh: '5/160, 4th Main Road, Otteri Extn, Vandalur, Chennai 600048'
  };
  var mf = $('#map-frame'), mo = $('#map-open'), mapKey = 'corp', mapReady = false;
  function setMap(k) {
    mapKey = k; var q = MAPS[k];
    $$('.map-tabs button').forEach(function (b) { b.classList.toggle('on', b.dataset.map === k); });
    if (mapReady) mf.src = 'https://maps.google.com/maps?q=' + encodeURIComponent(q) + '&z=17&output=embed';
    mo.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
  }
  $$('.map-tabs button').forEach(function (b) { b.addEventListener('click', function () { setMap(b.dataset.map); }); });
  setMap('corp');
  new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { mapReady = true; setMap(mapKey); o.disconnect(); } }, { rootMargin: '300px' }).observe($('.map'));

  /* ---- clarity compare: hover / drag / click / keys / magnifier / sweep ---- */
  (function () {
    var c = $('#cmp'); if (!c) return;
    var blurImg = $('.blur', c), sharpImg = $('.sharp', c), lens = $('.lens', c);
    var p = 50, goal = 50, drag = false, used = false, lensOn = false, anim = 0, rafLoop = 0;
    var BLUR = blurImg.getAttribute('src'), SHARP = sharpImg.getAttribute('src');
    function clamp(v) { return Math.max(0, Math.min(100, v)); }
    function set(v) { p = clamp(v); c.style.setProperty('--p', p + '%'); c.setAttribute('aria-valuenow', Math.round(p)); }
    function touched() { if (!used) { used = true; c.classList.add('used'); } anim++; }
    function tween(to, ms, cb) {
      var id = ++anim, from = p, s = performance.now();
      (function f(n) {
        if (id !== anim) return;
        var k = Math.min(1, (n - s) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        set(from + (to - from) * e); goal = p;
        if (k < 1) requestAnimationFrame(f); else if (cb) cb();
      })(s);
    }
    function rect(e) { var r = c.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height }; }
    function loop() { rafLoop = 0; if (Math.abs(goal - p) > .05) { set(p + (goal - p) * .22); rafLoop = requestAnimationFrame(loop); } }
    function follow(e) { var q = rect(e); goal = clamp(q.x / q.w * 100); if (!rafLoop) rafLoop = requestAnimationFrame(loop); }
    function moveLens(e) {
      var q = rect(e), Z = 2.6, size = lens.offsetWidth;
      lens.style.left = q.x + 'px'; lens.style.top = q.y + 'px';
      lens.style.backgroundImage = 'url(' + ((q.x / q.w * 100 < p) ? BLUR : SHARP) + ')';
      lens.style.backgroundSize = (q.w * Z) + 'px ' + (q.h * Z) + 'px';
      lens.style.backgroundPosition = (-(q.x * Z - size / 2)) + 'px ' + (-(q.y * Z - size / 2)) + 'px';
    }
    c.addEventListener('pointerdown', function (e) {
      touched(); drag = true; c.classList.add('drag');
      try { c.setPointerCapture(e.pointerId); } catch (_) {}
      var q = rect(e); set(q.x / q.w * 100); goal = p; if (lensOn) moveLens(e);
    });
    c.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'mouse') c.classList.add('hover');
      var q = rect(e);
      if (drag) { set(q.x / q.w * 100); goal = p; }
      else if (e.pointerType === 'mouse') { touched(); follow(e); }
      if (lensOn) moveLens(e);
    });
    function up() { drag = false; c.classList.remove('drag'); }
    c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
    c.addEventListener('pointerleave', function () { c.classList.remove('hover'); });
    c.addEventListener('keydown', function (e) {
      var k = e.key, v = k === 'ArrowLeft' ? p - 5 : k === 'ArrowRight' ? p + 5 : k === 'Home' ? 0 : k === 'End' ? 100 : null;
      if (v === null) return; e.preventDefault(); touched(); goal = clamp(v); set(goal);
    });
    $$('[data-snap]').forEach(function (b) { b.addEventListener('click', function () { touched(); tween(+b.dataset.snap, 700); }); });
    function sweep() { anim++; tween(6, 600, function () { tween(94, 1700, function () { tween(50, 800); }); }); }
    $('#cmp-sweep').addEventListener('click', function () { touched(); sweep(); });
    var lb = $('#cmp-lens');
    lb.addEventListener('click', function () { lensOn = !lensOn; c.classList.toggle('lens-on', lensOn); lb.classList.toggle('on', lensOn); lb.setAttribute('aria-pressed', lensOn); });
    if (!reduce) {
      new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { o.disconnect(); setTimeout(function () { if (!used) sweep(); }, 500); } }, { threshold: .55 }).observe(c);
    }
    set(50);
  })();

  /* ---- GSAP: horizon parallax + gentle entrances ---- */
  if (hasGsap && !reduce) {
    $$('.hz').forEach(function (h) {
      h.style.transform = 'none'; gsap.set(h, { xPercent: -50 });
      gsap.fromTo(h, { yPercent: 14 }, { yPercent: -4, ease: 'none', scrollTrigger: { trigger: h.parentElement, start: 'top bottom', end: 'bottom top', scrub: .6 } });
    });
    $$('.tower .mk').forEach(function (m) { gsap.fromTo(m, { y: 26 }, { y: -26, ease: 'none', scrollTrigger: { trigger: m.parentElement, start: 'top bottom', end: 'bottom top', scrub: .8 } }); });
    $$('.vision p, .inter-txt h2').forEach(function (t) {
      gsap.from(t, { scale: .94, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: t, start: 'top 85%', once: true } });
    });
  }

  var y = $('#yr'); if (y) y.textContent = new Date().getFullYear();
})();
