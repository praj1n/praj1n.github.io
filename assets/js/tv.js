/* ==========================================================
   Animated TVs — procedural "moving wallpapers" drawn on canvas.
   No video files: every scene is generated live.
   ========================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TAU = Math.PI * 2;

  /* ---- shared assets ---- */
  var eyeImg = new Image(); eyeImg.src = 'assets/img/xudesi-eye.png';
  var adMark = new Image(); adMark.src = 'assets/img/adsan-mark.png';

  /* vertical gradient sprites (cheap aurora columns) */
  function sprite(stops) {
    var c = document.createElement('canvas'); c.width = 1; c.height = 64;
    var g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 64);
    stops.forEach(function (s) { gr.addColorStop(s[0], s[1]); });
    g.fillStyle = gr; g.fillRect(0, 0, 1, 64);
    return c;
  }
  var SP = {
    green: sprite([[0, 'rgba(60,255,160,0)'], [.35, 'rgba(60,255,170,.55)'], [.7, 'rgba(40,200,170,.25)'], [1, 'rgba(40,200,170,0)']]),
    violet: sprite([[0, 'rgba(180,90,255,0)'], [.4, 'rgba(170,90,255,.4)'], [1, 'rgba(120,60,220,0)']]),
    teal: sprite([[0, 'rgba(40,220,255,0)'], [.4, 'rgba(40,220,255,.35)'], [1, 'rgba(20,120,255,0)']])
  };

  /* deterministic pseudo-random for stable stars */
  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  var STARS = (function () { var r = rng(7), a = []; for (var i = 0; i < 70; i++) a.push([r(), r() * .62, r() * TAU, .4 + r()]); return a; })();

  function ridge(x, w, seed, amp) {
    return Math.sin(x * .011 + seed) * amp + Math.sin(x * .027 + seed * 2.3) * amp * .5 + Math.sin(x * .061 + seed * 4.1) * amp * .22;
  }

  function reflect(ctx, w, h, hh, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(0, hh * 2);
    ctx.scale(1, -1);
    ctx.drawImage(ctx.canvas, 0, 0, w, hh, 0, 0, w, hh);
    ctx.restore();
  }

  /* ---------------- SCENES ---------------- */
  var SCENES = {
    aurora: { name: 'Aurora', draw: function (c, w, h, t) {
      var hh = h * .72, g = c.createLinearGradient(0, 0, 0, hh);
      g.addColorStop(0, '#01030a'); g.addColorStop(1, '#0a2230');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      for (var i = 0; i < STARS.length; i++) {
        var s = STARS[i]; c.fillStyle = 'rgba(255,255,255,' + (.35 + .35 * Math.sin(t * 2 + s[2])) + ')';
        c.fillRect(s[0] * w, s[1] * h, s[3], s[3]);
      }
      c.globalCompositeOperation = 'lighter';
      var sp = [SP.green, SP.violet, SP.teal];
      for (var k = 0; k < 3; k++) {
        for (var x = 0; x < w; x += 2) {
          var y = h * (.27 + .06 * k) + Math.sin(x * .018 + t * .6 + k * 2) * h * .07 + Math.sin(x * .047 - t * .45 + k) * h * .03;
          var ht = h * (.26 + .06 * Math.sin(x * .03 + t * .9 + k));
          c.drawImage(sp[k], x, y, 2, ht);
        }
      }
      c.globalCompositeOperation = 'source-over';
      c.fillStyle = '#02070a'; c.beginPath(); c.moveTo(0, hh);
      for (var m = 0; m <= w; m += 4) c.lineTo(m, hh - 6 - (ridge(m, w, 3, h * .05) + h * .06));
      c.lineTo(w, hh); c.fill();
      c.fillStyle = '#03090e'; c.fillRect(0, hh, w, h - hh);
      reflect(c, w, h, hh, .38);
      c.fillStyle = 'rgba(2,7,10,.35)';
      for (var r = 0; r < 6; r++) c.fillRect(0, hh + ((r * 9 + t * 6) % (h - hh)), w, 1);
    } },

    sunset: { name: 'Golden Hour', draw: function (c, w, h, t) {
      var hh = h * .68, g = c.createLinearGradient(0, 0, 0, hh);
      g.addColorStop(0, '#1b0b2e'); g.addColorStop(.45, '#8a2d12'); g.addColorStop(.8, '#f08a1c'); g.addColorStop(1, '#ffd36b');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      var sx = w * .5 + Math.sin(t * .15) * w * .12, sy = hh - h * .05 - Math.sin(t * .2) * h * .03;
      var rg = c.createRadialGradient(sx, sy, 0, sx, sy, h * .6);
      rg.addColorStop(0, 'rgba(255,240,190,.95)'); rg.addColorStop(.12, 'rgba(255,190,80,.7)'); rg.addColorStop(1, 'rgba(255,120,20,0)');
      c.fillStyle = rg; c.fillRect(0, 0, w, hh);
      c.fillStyle = '#fff6cf'; c.beginPath(); c.arc(sx, sy, h * .055, 0, TAU); c.fill();
      var cols = ['#5a2a2c', '#3a1c24', '#1a0e14'];
      for (var L = 0; L < 3; L++) {
        c.fillStyle = cols[L]; c.beginPath(); c.moveTo(0, hh);
        for (var x = 0; x <= w; x += 4) c.lineTo(x, hh - h * (.08 + .06 * L) - ridge(x + t * (4 + L * 5), w, L * 5 + 2, h * (.05 + .03 * L)));
        c.lineTo(w, hh); c.fill();
      }
      c.fillStyle = '#12090d'; c.fillRect(0, hh, w, h - hh);
      reflect(c, w, h, hh, .5);
      c.fillStyle = 'rgba(255,200,110,.18)';
      for (var r = 0; r < 14; r++) {
        var yy = hh + 3 + r * ((h - hh) / 14) + Math.sin(t * 2 + r) * 1.2;
        c.fillRect(sx - (r + 4) * 3, yy, (r + 4) * 6, 1);
      }
    } },

    ribbons: { name: 'Flow', draw: function (c, w, h, t) {
      var g = c.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#07040f'); g.addColorStop(1, '#14061a');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      c.globalCompositeOperation = 'lighter';
      var pal = ['255,190,70', '255,90,120', '80,200,255', '150,110,255', '255,150,40'];
      for (var j = 0; j < 8; j++) {
        c.beginPath();
        for (var x = 0; x <= w; x += 6) {
          var y = h * .5 + Math.sin(x * .012 + t * (.5 + j * .06) + j * .9) * h * .2 + Math.sin(x * .031 - t * .7 + j) * h * .09;
          x ? c.lineTo(x, y) : c.moveTo(x, y);
        }
        c.strokeStyle = 'rgba(' + pal[j % 5] + ',.12)'; c.lineWidth = h * .05; c.stroke();
        c.strokeStyle = 'rgba(' + pal[j % 5] + ',.8)'; c.lineWidth = Math.max(1, h * .006); c.stroke();
      }
      c.globalCompositeOperation = 'source-over';
    } },

    eye: { name: 'Xudesi', draw: function (c, w, h, t) {
      var rg = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * .6);
      rg.addColorStop(0, '#2a1204'); rg.addColorStop(.55, '#0d0604'); rg.addColorStop(1, '#000');
      c.fillStyle = rg; c.fillRect(0, 0, w, h);
      c.globalCompositeOperation = 'lighter';
      for (var i = 0; i < 4; i++) {
        var p = ((t * .12 + i / 4) % 1), r = p * w * .55;
        c.strokeStyle = 'rgba(224,166,63,' + (.35 * (1 - p)) + ')'; c.lineWidth = 1;
        c.beginPath(); c.arc(w / 2, h / 2, r, 0, TAU); c.stroke();
      }
      for (var s = 0; s < 3; s++) {
        var px = ((t * .09 + s * .37) % 1.4 - .2) * w, gr = c.createLinearGradient(px - w * .1, 0, px + w * .1, h);
        gr.addColorStop(0, 'rgba(255,170,60,0)'); gr.addColorStop(.5, 'rgba(255,200,100,.18)'); gr.addColorStop(1, 'rgba(255,170,60,0)');
        c.fillStyle = gr; c.fillRect(px - w * .1, 0, w * .2, h);
      }
      c.globalCompositeOperation = 'source-over';
      if (eyeImg.complete && eyeImg.naturalWidth) {
        var sc = (1 + .035 * Math.sin(t * 1.4)) * h * .78, iw = sc * eyeImg.naturalWidth / eyeImg.naturalHeight;
        c.drawImage(eyeImg, (w - iw) / 2, (h - sc) / 2, iw, sc);
      }
      c.globalCompositeOperation = 'lighter';
      for (var k = 0; k < 24; k++) {
        var a = rng(k + 3)(), b = rng(k + 11)(), yy = ((b - t * (.02 + a * .03)) % 1 + 1) % 1;
        c.fillStyle = 'rgba(255,210,120,' + (.2 + .5 * Math.abs(Math.sin(t + k))) + ')';
        c.fillRect(a * w, yy * h, 1.4, 1.4);
      }
      c.globalCompositeOperation = 'source-over';
    } },

    chevron: { name: 'Adsan', draw: function (c, w, h, t) {
      var g = c.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#02101f'); g.addColorStop(.6, '#05305f'); g.addColorStop(1, '#0a78e0');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      var hz = h * .56;
      c.strokeStyle = 'rgba(80,170,255,.28)'; c.lineWidth = 1;
      for (var i = -10; i <= 10; i++) { c.beginPath(); c.moveTo(w / 2 + i * w * .02, hz); c.lineTo(w / 2 + i * w * .22, h); c.stroke(); }
      for (var j = 0; j < 8; j++) { var q = ((j / 8 + t * .08) % 1), yy = hz + (q * q) * (h - hz); c.beginPath(); c.moveTo(0, yy); c.lineTo(w, yy); c.stroke(); }
      for (var k = 0; k < 6; k++) {
        var p = (t * .22 + k / 6) % 1, s = .15 + p * p * 2.8;
        c.save(); c.translate(w / 2, h * .66); c.scale(s, s);
        c.beginPath(); c.moveTo(-w * .22, 0); c.lineTo(0, -h * .5); c.lineTo(w * .22, 0);
        c.strokeStyle = 'rgba(' + (k % 2 ? '255,255,255' : '60,160,255') + ',' + (.9 * (1 - p)) + ')';
        c.lineWidth = Math.max(1, h * .035) / s; c.lineJoin = 'miter'; c.stroke(); c.restore();
      }
      if (adMark.complete && adMark.naturalWidth) {
        var mh = h * .42, mw = mh * adMark.naturalWidth / adMark.naturalHeight;
        c.globalAlpha = .9; c.drawImage(adMark, (w - mw) / 2, h * .2 + Math.sin(t) * 2, mw, mh); c.globalAlpha = 1;
      }
    } }
  };

  /* ---- static / channel-change noise ---- */
  var noiseC = document.createElement('canvas'); noiseC.width = 128; noiseC.height = 72;
  var noiseX = noiseC.getContext('2d'), noiseD = noiseX.createImageData(128, 72);
  function drawNoise(c, w, h) {
    var d = noiseD.data;
    for (var i = 0; i < d.length; i += 4) { var v = Math.random() * 255 | 0; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    noiseX.putImageData(noiseD, 0, 0);
    c.imageSmoothingEnabled = false; c.drawImage(noiseC, 0, 0, w, h); c.imageSmoothingEnabled = true;
  }

  /* ---------------- TV component ---------------- */
  var tvs = [], visible = new Set(), running = false, T0 = performance.now();
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { e.isIntersecting ? visible.add(e.target._tv) : visible.delete(e.target._tv); });
    kick();
  }, { rootMargin: '80px' }) : null;

  function TV(el) {
    this.el = el;
    this.scenes = (el.dataset.scenes || 'aurora').split(',');
    this.i = 0;
    this.res = +(el.dataset.res || 320);
    this.canvas = el.querySelector('canvas');
    this.canvas.width = this.res; this.canvas.height = Math.round(this.res / (+el.dataset.ratio || 16 / 9));
    this.ctx = this.canvas.getContext('2d');
    this.osd = el.querySelector('.tv-osd');
    this.noiseUntil = 0;
    this.auto = el.dataset.auto ? +el.dataset.auto : 0;
    this.nextAuto = performance.now() + this.auto;
    this.seed = Math.random() * 20;
    el._tv = this;
    var self = this;
    if (!el.classList.contains('tv-sm')) {
      el.setAttribute('role', 'button'); el.tabIndex = 0;
      el.setAttribute('aria-label', 'Animated TV — activate to change channel');
      el.addEventListener('click', function () { self.next(); });
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); self.next(); } });
    }
    if (io) io.observe(el); else visible.add(this);
    this.renderOnce(this.seed);
  }
  TV.prototype.set = function (name) {
    var n = this.scenes.indexOf(name); if (n < 0) return;
    this.i = n; this.noiseUntil = performance.now() + 380; this.showOsd(); kick();
  };
  TV.prototype.next = function () {
    this.i = (this.i + 1) % this.scenes.length;
    this.noiseUntil = performance.now() + 380; this.showOsd(); kick();
  };
  TV.prototype.showOsd = function () {
    if (!this.osd) return;
    var s = SCENES[this.scenes[this.i]], o = this.osd;
    o.textContent = 'CH ' + String(this.i + 1).padStart(2, '0') + ' · ' + s.name.toUpperCase();
    o.classList.add('show'); clearTimeout(this._ot);
    this._ot = setTimeout(function () { o.classList.remove('show'); }, 2200);
  };
  TV.prototype.renderOnce = function (t) {
    SCENES[this.scenes[this.i]].draw(this.ctx, this.canvas.width, this.canvas.height, t);
  };
  TV.prototype.frame = function (now, t) {
    if (this.auto && now > this.nextAuto) { this.nextAuto = now + this.auto; this.next(); }
    if (now < this.noiseUntil) drawNoise(this.ctx, this.canvas.width, this.canvas.height);
    else this.renderOnce(t + this.seed);
  };

  function loop(now) {
    var t = (now - T0) / 1000;
    visible.forEach(function (tv) { tv.frame(now, t); });
    if (visible.size && !document.hidden && !reduce) requestAnimationFrame(loop); else running = false;
  }
  function kick() {
    if (reduce) { visible.forEach(function (tv) { tv.frame(performance.now(), 5); }); setTimeout(function () { visible.forEach(function (tv) { tv.frame(performance.now(), 5); }); }, 420); return; }
    if (!running) { running = true; requestAnimationFrame(loop); }
  }
  document.addEventListener('visibilitychange', kick);

  /* ---------------- compare slider ---------------- */
  function initCompare(root) {
    var lo = root.querySelector('.lo'), hi = root.querySelector('.hi');
    var lc = lo.getContext('2d'), hc = hi.getContext('2d');
    lo.width = 48; lo.height = 27; hi.width = 640; hi.height = 360;
    var scene = 'aurora', p = 50, dragging = false, touched = false, vis = false, demoT = 0;
    function setP(v) { p = Math.max(2, Math.min(98, v)); root.style.setProperty('--p', p + '%'); root.setAttribute('aria-valuenow', Math.round(p)); }
    function fromX(x) { var r = root.getBoundingClientRect(); setP((x - r.left) / r.width * 100); }
    function down(e) { dragging = touched = true; fromX(e.clientX); try { root.setPointerCapture(e.pointerId); } catch (_) {} }
    root.addEventListener('pointerdown', down);
    root.addEventListener('pointermove', function (e) { if (dragging) fromX(e.clientX); });
    root.addEventListener('pointerup', function () { dragging = false; });
    root.addEventListener('pointercancel', function () { dragging = false; });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { setP(p - 4); touched = true; e.preventDefault(); }
      if (e.key === 'ArrowRight') { setP(p + 4); touched = true; e.preventDefault(); }
    });
    new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis) tick(); }, { threshold: .2 }).observe(root);
    var go;
    function tick(now) {
      if (!vis || document.hidden) return;
      var t = (performance.now() - T0) / 1000;
      var d = SCENES[scene].draw;
      d(lc, 48, 27, t); d(hc, 640, 360, t);
      if (!touched && !reduce) { demoT += .012; setP(50 + Math.sin(demoT) * 32); }
      if (!reduce) go = requestAnimationFrame(tick);
    }
    if (reduce) { SCENES[scene].draw(lc, 48, 27, 5); SCENES[scene].draw(hc, 640, 360, 5); }
    var btns = document.querySelectorAll('[data-cmp-scene]');
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        scene = b.dataset.cmpScene;
        btns.forEach(function (x) { x.classList.toggle('on', x === b); });
        if (reduce) { SCENES[scene].draw(lc, 48, 27, 5); SCENES[scene].draw(hc, 640, 360, 5); }
      });
    });
    setP(50);
  }

  /* ---------------- gold dust (Xudesi) ---------------- */
  function initDust(cv) {
    var c = cv.getContext('2d'), ps = [], vis = false, W = 0, H = 0;
    function size() { var r = cv.getBoundingClientRect(); W = cv.width = r.width; H = cv.height = r.height; }
    size(); window.addEventListener('resize', size);
    var n = window.innerWidth < 700 ? 28 : 60, r = rng(99);
    for (var i = 0; i < n; i++) ps.push({ x: r(), y: r(), s: .5 + r() * 1.6, v: .02 + r() * .05, ph: r() * TAU });
    new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis) draw(); }).observe(cv);
    function draw() {
      if (!vis || reduce) return;
      c.clearRect(0, 0, W, H);
      var t = performance.now() / 1000;
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i]; p.y -= p.v / 60; if (p.y < -.02) { p.y = 1.02; p.x = Math.random(); }
        var a = .25 + .45 * Math.abs(Math.sin(t * .8 + p.ph));
        c.fillStyle = 'rgba(255,205,110,' + a + ')'; c.shadowColor = 'rgba(255,170,50,.9)'; c.shadowBlur = 8;
        c.beginPath(); c.arc(p.x * W + Math.sin(t * .4 + p.ph) * 14, p.y * H, p.s, 0, TAU); c.fill();
      }
      requestAnimationFrame(draw);
    }
  }

  /* ---------------- boot ---------------- */
  window.SKT_TV = {
    scenes: SCENES,
    mount: function (root) { (root || document).querySelectorAll('.tv:not([data-ready])').forEach(function (el) { el.dataset.ready = 1; tvs.push(new TV(el)); }); kick(); },
    tvs: tvs
  };
  function boot() {
    SKT_TV.mount();
    var cmp = document.getElementById('cmp'); if (cmp) initCompare(cmp);
    var d = document.getElementById('dust'); if (d) initDust(d);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
