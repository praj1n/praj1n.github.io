/* SK Terabytes — page behaviour (no dependencies) */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer:fine)').matches;

  var WA = '917401719274';
  var MAIL = 'info@skterabytes.com';

  /* ---- catalogue data (from the dealer price lists; prices intentionally not shown) ---- */
  var TIERS = {
    non: { label: 'Non Smart', short: 'LED · Non smart', os: 'No smart OS' },
    android: { label: 'FHD Smart Android', short: 'FHD · Smart', os: 'Android' },
    webos: { label: 'WebOS 4K', short: '4K · Smart', os: 'WebOS' }
  };
  var DATA = {
    xudesi: { name: 'Xudesi', sizes: [[24, 'non'], [32, 'android'], [43, 'android'], [50, 'webos'], [55, 'webos']], scenes: ['eye', 'sunset', 'ribbons'] },
    adsan: { name: 'Adsan', sizes: [[24, 'non'], [32, 'android'], [43, 'android'], [50, 'webos'], [55, 'webos'], [65, 'webos']], scenes: ['chevron', 'aurora', 'ribbons'] }
  };
  function modelName(b, s, t) { return DATA[b].name + ' ' + s + '″ ' + TIERS[t].label; }
  function waLink(text) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text); }

  /* ---- preloader ---- */
  var pre = $('#pre'), t0 = performance.now();
  function hidePre() { var wait = Math.max(0, 900 - (performance.now() - t0)); setTimeout(function () { pre && pre.classList.add('gone'); document.body.classList.add('ready'); }, wait); }
  if (document.readyState === 'complete') hidePre(); else window.addEventListener('load', hidePre);
  setTimeout(function () { pre && pre.classList.add('gone'); }, 3500);

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
      var el = e.target, to = +el.dataset.count, pre = el.dataset.pre || '', suf = el.dataset.suf || '';
      if (reduce) { el.textContent = pre + to + suf; return; }
      var s = performance.now(), dur = 1400;
      (function f(n) { var k = Math.min(1, (n - s) / dur), v = Math.round(to * (1 - Math.pow(1 - k, 3))); el.textContent = pre + v + suf; if (k < 1) requestAnimationFrame(f); })(s);
    });
  }, { threshold: .6 });
  $$('[data-count]').forEach(function (el) { co.observe(el); });

  /* ---- typewriter ---- */
  var ty = $('#type');
  if (ty) {
    var ph = ['Premium & luxurious LED Smart TVs.', 'Xudesi™ — The Smart Choice.', 'Adsan — The Best or Nothing!', '1+1 year warranty with doorstep service.'];
    if (reduce) ty.textContent = ph[0]; else {
      var pi = 0, txt = '', del = false;
      (function type() {
        var full = ph[pi]; txt = del ? full.slice(0, txt.length - 1) : full.slice(0, txt.length + 1); ty.textContent = txt;
        var d = del ? 28 : 62;
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
      c.style.transform = 'perspective(900px) rotateY(' + x * 6 + 'deg) rotateX(' + -y * 6 + 'deg) translateY(-4px)';
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
    function prog() { tick = false; var r = tl.getBoundingClientRect(), p = (window.innerHeight * .55 - r.top) / r.height; tl.style.setProperty('--prog', Math.max(0, Math.min(1, p))); }
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(prog); } }, { passive: true });
    prog();
  }

  /* ---- lineups (scaled TVs, size ∝ diagonal) ---- */
  function tvHTML(cls, scenes, res, brandLabel, extra) {
    return '<figure class="tv ' + cls + '" data-scenes="' + scenes + '" data-res="' + res + '"' + (extra || '') + '><div class="tv-body"><div class="tv-screen"><canvas></canvas><div class="tv-glare"></div><div class="tv-osd"></div></div>' +
      '<span class="tv-brand">' + brandLabel + '</span></div><div class="tv-stand"><i></i><i></i></div></figure>';
  }
  $$('.lineup').forEach(function (el) {
    var b = el.dataset.brand, d = DATA[b], cls = b === 'xudesi' ? 'gold' : 'blue';
    el.innerHTML = d.sizes.map(function (z, i) {
      return '<div class="lu reveal" style="--d:' + z[0] + ';transition-delay:' + (i * .07) + 's">' +
        tvHTML('tv-sm ' + cls, d.scenes[i % d.scenes.length], 160, d.name.toUpperCase()) +
        '<b>' + z[0] + '″</b><small>' + TIERS[z[1]].label + '</small></div>';
    }).join('');
    $$('.reveal', el).forEach(function (n) { ro.observe(n); });
  });

  /* ---- catalogue ---- */
  var cat = $('#catalog'), grid = $('#cards'), brand = 'xudesi', filter = 'all';
  function renderCards() {
    var d = DATA[brand]; cat.dataset.brand = brand;
    grid.innerHTML = d.sizes.map(function (z, i) {
      var s = z[0], t = z[1], T = TIERS[t], cls = brand === 'xudesi' ? 'gold' : 'blue';
      var msg = 'Hello SK Terabytes, I would like the dealer price for ' + modelName(brand, s, t) + '.';
      return '<article class="card" data-t="' + t + '"><div class="art" style="--d:' + s + '">' +
        tvHTML('tv-sm ' + cls, d.scenes[i % d.scenes.length], 192, d.name.toUpperCase()) + '</div>' +
        '<h3>' + d.name + (brand === 'xudesi' ? '<sup>™</sup>' : '') + ' ' + s + '″</h3><p class="sub">' + T.label + '</p>' +
        '<div class="chips"><span class="t">' + s + ' inch</span><span>' + T.short + '</span><span>' + T.os + '</span><span>1+1 yr warranty</span></div>' +
        '<div class="go"><button class="p" data-ask="' + brand + '|' + s + '|' + t + '">Get dealer price</button><a class="w" target="_blank" rel="noopener" href="' + waLink(msg) + '">WhatsApp</a></div></article>';
    }).join('');
    SKT_TV.mount(grid); applyFilter();
  }
  function applyFilter() { $$('.card', grid).forEach(function (c) { c.classList.toggle('hide', filter !== 'all' && c.dataset.t !== filter); }); }
  $$('.tabs button').forEach(function (b) {
    b.addEventListener('click', function () {
      brand = b.dataset.b; $$('.tabs button').forEach(function (x) { x.setAttribute('aria-selected', x === b); });
      renderCards();
    });
  });
  $$('.filters button').forEach(function (b) {
    b.addEventListener('click', function () { filter = b.dataset.f; $$('.filters button').forEach(function (x) { x.classList.toggle('on', x === b); }); applyFilter(); });
  });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-ask]'); if (a) { var p = a.dataset.ask.split('|'); prefill(p[0], p[1], p[2]); }
    var sw = e.target.closest('[data-open-cat]'); if (sw) { var bt = $('.tabs button[data-b="' + sw.dataset.openCat + '"]'); bt && bt.click(); }
  });
  if (cat) renderCards();

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
      'Brand: ' + b, 'Model: ' + m, 'Quantity: ' + (v('f-qty') || '-'), v('f-msg') ? 'Message: ' + v('f-msg') : ''].filter(function (x, i, a) { return x !== '' || (i === 1); }).join('\n');
  }
  function ok() { var e = $('#f-err'); if (!$('#f-name').value.trim() || !$('#f-phone').value.trim()) { e.textContent = 'Please add your name and phone number so we can reach you.'; return false; } e.textContent = ''; return true; }
  $('#send-wa').addEventListener('click', function () { if (ok()) window.open(waLink(compose()), '_blank', 'noopener'); });
  $('#send-mail').addEventListener('click', function () { if (ok()) window.location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Dealer price list enquiry') + '&body=' + encodeURIComponent(compose()); });
  f.addEventListener('submit', function (e) { e.preventDefault(); $('#send-wa').click(); });

  var y = $('#yr'); if (y) y.textContent = new Date().getFullYear();
})();
