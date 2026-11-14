/* ==========================================================
   TV frames — the reference TV render is the bezel; the picture
   is a real <video> (or poster) playing in the screen window.
   Channels are cut from the free 8K HDR demo reel.
   ========================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saveData = !!(navigator.connection && navigator.connection.saveData);
  var BASE = 'assets/video/', WP = 'assets/img/wp/', VER = '?v=20261114e';
  function picSrc(n) { return (typeof n === 'number' ? BASE + 'ch' + n + '.jpg' : WP + n + '.jpg') + VER; }
  var CHANNELS = {
    1: 'Wild Colours', 2: 'Deep Blue', 3: 'Splash', 4: 'Colour Burst', 5: 'Fresh', 6: 'Golden Hour', 7: 'Bloom', 8: 'Studio Gold', 9: 'Studio Colour',
    10: 'Lagoon', 11: 'Spring Green', 12: 'Fresh Green', 13: 'Colour Pop', 14: 'Cool Splash'
  };
  var SPLASH = {
    xudesi: 'assets/img/splash-xudesi.jpg',
    adsan: 'assets/img/splash-adsan.jpg'
  };

  /* ---- markup helper (used by lineups, cards, modal) ---- */
  function html(o) {
    var brand = o.brand || '', cls = o.cls || '', mode = o.mode || 'poster';
    var order = (o.order || [1]).join(',');
    var first = (o.order || [1])[0];
    var splash = o.splash ? SPLASH[o.splash] : '';
    var attrs = ' data-mode="' + mode + '" data-order="' + order + '"' +
      (splash ? ' data-splash="' + splash + '"' : '') +
      (o.auto ? ' data-auto="' + o.auto + '"' : '') +
      (o.interactive === false ? ' data-static="1"' : '');
    return '<figure class="tvf ' + cls + '"' + attrs + '>' +
      '<div class="tvf-screen">' +
        '<img class="tvf-pic" alt="" decoding="async"' + (o.lazy === false ? '' : ' loading="lazy"') + ' src="' + (splash && mode === 'video' ? splash : picSrc(first)) + '">' +
        (mode === 'video' ? '<video class="tvf-vid" muted playsinline loop preload="none" disablepictureinpicture></video>' : '') +
        '<canvas class="tvf-noise" width="96" height="54"></canvas>' +
        '<span class="tvf-osd"></span><span class="tvf-glare"></span>' +
      '</div>' +
      '<img class="tvf-frame" src="assets/img/tv-frame.webp' + VER + '" alt="" decoding="async">' +
      '<span class="tvf-brand">' + brand + '</span>' +
      (o.hint ? '<span class="tvf-hint">' + o.hint + '</span>' : '') +
      '</figure>';
  }

  /* ---- channel change: a quick cut to black, then the new picture ---- */
  function burst(tv, ms) {
    tv.noise.classList.add('on'); clearTimeout(tv._bt);
    tv._bt = setTimeout(function () { tv.noise.classList.remove('on'); }, ms);
  }

  /* ---- TV class ---- */
  var tvs = [];
  function TV(el) {
    var self = this;
    this.el = el;
    this.mode = el.dataset.mode || 'poster';
    this.order = (el.dataset.order || '1').split(',').map(function (x) { return /^\d+$/.test(x) ? +x : x; });
    this.i = 0;
    this.splash = el.dataset.splash || '';
    this.auto = +el.dataset.auto || 0;
    this.hold = +el.dataset.hold || 2300;
    this.booting = false;
    this.pic = el.querySelector('.tvf-pic');
    this.vid = el.querySelector('.tvf-vid');
    this.noise = el.querySelector('.tvf-noise');
    this.osd = el.querySelector('.tvf-osd');
    this.noiseUntil = 0;
    this.started = false;
    this.visible = false;
    this.timer = 0;
    el._tv = this;
    if (!el.dataset.static) {
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', 'Animated TV. Activate to change channel.');
      el.addEventListener('click', function () { self.press(); });
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); self.press(); } });
    }
    if (this.vid) {
      this.vid.addEventListener('playing', function () { el.classList.add('vid-on'); });
    }
    tvs.push(this);
    io.observe(el);
  }
  TV.prototype.ch = function () { return this.order[this.i]; };
  TV.prototype.show = function (blink) {
    var self = this, n = this.ch();
    function apply() {
      self.el.classList.remove('vid-on');
      self.pic.src = picSrc(n);
      self.label();
      if (self.vid && self.visible && !saveData) {
        var v = self.vid;
        v.src = BASE + 'ch' + n + '.mp4' + VER;
        v.currentTime = 0;
        var p = v.play(); if (p && p.catch) p.catch(function () {});
      }
    }
    if (blink) { burst(this, 520); clearTimeout(this._sw); this._sw = setTimeout(apply, 170); } else apply();
  };
  TV.prototype.label = function () {
    if (!this.osd || typeof this.ch() !== 'number') return;
    var o = this.osd, n = this.ch();
    o.textContent = 'CH ' + (this.i + 1 < 10 ? '0' : '') + (this.i + 1) + '  ·  ' + CHANNELS[n].toUpperCase();
    o.classList.add('show'); clearTimeout(this._ot);
    this._ot = setTimeout(function () { o.classList.remove('show'); }, 2400);
  };
  /* a tap during the start-up screen tunes to the first channel; after that it changes channel */
  TV.prototype.press = function () { if (this.booting) this.boot(); else this.next(); };
  TV.prototype.next = function () { this.i = (this.i + 1) % this.order.length; this.show(true); this.arm(); };
  /* switch straight to a given channel or wallpaper (added to this TV's list if new) */
  TV.prototype.tune = function (val) {
    var k = this.order.indexOf(val);
    if (k < 0) { this.order.push(val); k = this.order.length - 1; }
    this.i = k; this.show(true); this.arm();
  };
  TV.prototype.arm = function () {
    var self = this; clearTimeout(this.timer);
    if (this.auto && !reduce && this.visible) this.timer = setTimeout(function () { self.next(); }, this.auto);
  };
  TV.prototype.start = function () {
    if (this.started) return;
    this.started = true;
    var self = this;
    if (this.mode !== 'video') return;
    this.el.classList.add('powering');
    if (this.splash && !reduce) {
      /* boot splash first (held for data-hold ms, like a TV start-up screen), then channel 1 */
      this.pic.src = this.splash;
      this.booting = true;
      var b = this.el.querySelector('.tvf-brand');
      if (this.osd && b) { this.osd.textContent = b.textContent; this.osd.classList.add('show'); clearTimeout(this._ot); }
      this._boot = setTimeout(function () { self.boot(); }, this.hold);
    } else {
      this.el.classList.remove('powering'); this.show(false); this.arm();
    }
  };
  TV.prototype.boot = function () {
    if (!this.booting) return;
    this.booting = false; clearTimeout(this._boot);
    if (this.osd) this.osd.classList.remove('show');
    this.el.classList.remove('powering'); this.i = 0; this.show(true); this.arm();
  };
  TV.prototype.enter = function () {
    this.visible = true;
    if (this.mode !== 'video') return;
    /* hold the power-on until the visitor is through the intro portal */
    if (!entered) {
      var self = this;
      if (!this._wait) { this._wait = 1; onEntered(function () { self._wait = 0; setTimeout(function () { if (self.visible) self.enter(); }, 450); }); }
      return;
    }
    if (!this.started) this.start();
    else if (this.vid && this.vid.src) { var p = this.vid.play(); if (p && p.catch) p.catch(function () {}); this.arm(); }
  };
  TV.prototype.leave = function () {
    this.visible = false; clearTimeout(this.timer);
    if (this.vid) this.vid.pause();
  };

  var entered = !document.getElementById('pre'), waiting = [];
  function onEntered(fn) { waiting.push(fn); }
  function flush() { if (entered) return; entered = true; waiting.splice(0).forEach(function (f) { f(); }); }
  document.addEventListener('skt:enter', flush);
  setTimeout(flush, 5000);

  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { var tv = e.target._tv; if (!tv) return; e.isIntersecting ? tv.enter() : tv.leave(); });
  }, { threshold: 0.3 });
  document.addEventListener('visibilitychange', function () {
    tvs.forEach(function (tv) { if (document.hidden) { if (tv.vid) tv.vid.pause(); clearTimeout(tv.timer); } else if (tv.visible) tv.enter(); });
  });

  function mount(root) {
    for (var k = tvs.length - 1; k >= 0; k--) { if (!tvs[k].el.isConnected) { io.unobserve(tvs[k].el); clearTimeout(tvs[k].timer); tvs.splice(k, 1); } }
    (root || document).querySelectorAll('.tvf:not([data-ready])').forEach(function (el) { el.dataset.ready = 1; new TV(el); });
  }

  window.SKT_TV = { html: html, mount: mount, tvs: tvs, channels: CHANNELS };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mount(); }); else mount();
})();
