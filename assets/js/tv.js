/* ==========================================================
   TV frames — the reference TV render is the bezel; the picture
   is a real <video> (or poster) playing in the screen window.
   Channels are cut from the free 8K HDR demo reel.
   ========================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saveData = !!(navigator.connection && navigator.connection.saveData);
  var BASE = 'assets/video/';
  var CHANNELS = {
    1: 'Nature', 2: 'Wildlife', 3: 'Golden Hour', 4: 'Macro', 5: 'Lakeside', 6: 'Bloom'
  };
  var SPLASH = {
    skt: 'assets/img/splash-skt.jpg',
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
        '<img class="tvf-pic" alt="" decoding="async"' + (o.lazy === false ? '' : ' loading="lazy"') + ' src="' + (splash && mode === 'video' ? splash : BASE + 'ch' + first + '.jpg') + '">' +
        (mode === 'video' ? '<video class="tvf-vid" muted playsinline loop preload="none" disablepictureinpicture></video>' : '') +
        '<canvas class="tvf-noise" width="96" height="54"></canvas>' +
        '<span class="tvf-osd"></span><span class="tvf-glare"></span>' +
      '</div>' +
      '<img class="tvf-frame" src="assets/img/tv-frame.webp" alt="" decoding="async">' +
      '<span class="tvf-brand">' + brand + '</span>' +
      (o.hint ? '<span class="tvf-hint">' + o.hint + '</span>' : '') +
      '</figure>';
  }

  /* ---- shared static generator ---- */
  var nctx = null, nimg = null, noiseRaf = 0, noiseUsers = new Set();
  function noiseTick() {
    noiseUsers.forEach(function (tv) {
      if (performance.now() > tv.noiseUntil) { noiseUsers.delete(tv); tv.noise.classList.remove('on'); return; }
      var c = tv.noise.getContext('2d');
      if (!nimg) nimg = c.createImageData(96, 54);
      var d = nimg.data;
      for (var i = 0; i < d.length; i += 4) { var v = (Math.random() * 255) | 0; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
      c.putImageData(nimg, 0, 0);
    });
    noiseRaf = noiseUsers.size ? requestAnimationFrame(noiseTick) : 0;
  }
  function burst(tv, ms) {
    tv.noiseUntil = performance.now() + ms;
    tv.noise.classList.add('on');
    noiseUsers.add(tv);
    if (!noiseRaf) noiseRaf = requestAnimationFrame(noiseTick);
  }

  /* ---- TV class ---- */
  var tvs = [];
  function TV(el) {
    var self = this;
    this.el = el;
    this.mode = el.dataset.mode || 'poster';
    this.order = (el.dataset.order || '1').split(',').map(Number);
    this.i = 0;
    this.splash = el.dataset.splash || '';
    this.auto = +el.dataset.auto || 0;
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
      el.addEventListener('click', function () { self.next(); });
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); self.next(); } });
    }
    if (this.vid) {
      this.vid.addEventListener('playing', function () { el.classList.add('vid-on'); });
    }
    tvs.push(this);
    io.observe(el);
  }
  TV.prototype.ch = function () { return this.order[this.i]; };
  TV.prototype.show = function (withNoise) {
    var n = this.ch(), self = this;
    if (withNoise) burst(this, 340);
    this.el.classList.remove('vid-on');
    this.pic.src = BASE + 'ch' + n + '.jpg';
    this.label();
    if (this.vid && this.visible && !saveData) {
      var v = this.vid;
      v.src = BASE + 'ch' + n + '.mp4';
      v.currentTime = 0;
      var p = v.play(); if (p && p.catch) p.catch(function () {});
    }
  };
  TV.prototype.label = function () {
    if (!this.osd) return;
    var o = this.osd, n = this.ch();
    o.textContent = 'CH ' + (this.i + 1 < 10 ? '0' : '') + (this.i + 1) + '  ·  ' + CHANNELS[n].toUpperCase();
    o.classList.add('show'); clearTimeout(this._ot);
    this._ot = setTimeout(function () { o.classList.remove('show'); }, 2400);
  };
  TV.prototype.next = function () { this.i = (this.i + 1) % this.order.length; this.show(true); this.arm(); };
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
      /* boot splash first, then channel 1 */
      this.pic.src = this.splash;
      setTimeout(function () { self.el.classList.remove('powering'); self.show(true); self.arm(); }, 2300);
    } else {
      this.el.classList.remove('powering'); this.show(false); this.arm();
    }
  };
  TV.prototype.enter = function () {
    this.visible = true;
    if (this.mode !== 'video') return;
    if (!this.started) this.start();
    else if (this.vid && this.vid.src) { var p = this.vid.play(); if (p && p.catch) p.catch(function () {}); this.arm(); }
  };
  TV.prototype.leave = function () {
    this.visible = false; clearTimeout(this.timer);
    if (this.vid) this.vid.pause();
  };

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
