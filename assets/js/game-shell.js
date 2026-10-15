/* Gedeeld frame voor de spellen: canvas, HUD, start- en eindscherm, invoer en vrijspelen. */
(function () {
  'use strict';

  window.RAGame = function (cfg) {
    var game = RA.GAMES.filter(function (g) { return g.id === cfg.id; })[0];
    var stage = document.querySelector('[data-stage]');
    var canvas = stage.querySelector('canvas');
    var overlay = stage.querySelector('.overlay');
    var hudL = stage.querySelector('[data-hud-l]'), hudR = stage.querySelector('[data-hud-r]');
    var W = cfg.width, H = cfg.height;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.aspectRatio = W + ' / ' + H;
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    var running = false, raf = 0, last = 0, tick = null, handlers = { down: [], key: [] };

    function sidePanel() {
      var el = document.querySelector('[data-unlocks]');
      if (el) {
        el.innerHTML = game.tiers.map(function (tier) {
          var v = RA.VAULT.filter(function (x) { return x.id === tier.unlock; })[0];
          return '<li class="' + (RA.isUnlocked(v.id) ? 'done' : '') + '">' + RA.esc(RA.tierText(tier, game)) + ': ' + RA.esc(v.title) + '</li>';
        }).join('');
      }
      var best = document.querySelector('[data-best]');
      if (best) {
        var b = RA.state.best[game.id];
        best.textContent = b === undefined ? RA.t('Nog geen score', 'No score yet') : RA.t('Beste score: ', 'Best score: ') + b + ' ' + game.unit;
      }
    }
    sidePanel();

    function pos(e) {
      var r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
    }
    canvas.addEventListener('pointerdown', function (e) {
      if (!running) return;
      e.preventDefault();
      var p = pos(e);
      handlers.down.forEach(function (fn) { fn(p, e); });
    });
    window.addEventListener('keydown', function (e) {
      if (!running) return;
      handlers.key.forEach(function (fn) { fn(e); });
    });

    function frame(now) {
      if (!running) return;
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (tick) tick(dt);
      raf = requestAnimationFrame(frame);
    }

    var api = {
      ctx: ctx, W: W, H: H, canvas: canvas,
      hud: function (l, r) { hudL.textContent = l || ''; hudR.textContent = r || ''; },
      onDown: function (fn) { handlers.down.push(fn); },
      onKey: function (fn) { handlers.key.push(fn); },
      loop: function (fn) { tick = fn; },
      get running() { return running; },
      end: function (result, title, msg) {
        running = false;
        cancelAnimationFrame(raf);
        var got = RA.reportGame(game.id, result);
        sidePanel();
        RA.refreshHeader();
        showOverlay(title, msg, got);
      }
    };

    function showOverlay(title, msg, got) {
      var html = '<h2>' + RA.esc(title) + '</h2>';
      if (msg) html += '<p>' + RA.esc(msg) + '</p>';
      if (got && got.length) {
        html += got.map(function (v) { return '<span class="unlocked">' + RA.t('Vrijgespeeld: ', 'Unlocked: ') + RA.esc(v.title) + '</span>'; }).join('');
        html += '<div class="btn-row on-dark" style="justify-content:center"><button class="btn btn--solid" type="button" data-play>' + RA.t('Nog een keer', 'Play again') + '</button><a class="btn" href="../../kluis/index.html">' + RA.t('Naar de kluis', 'Go to the vault') + '</a></div>';
      } else {
        html += '<div class="btn-row on-dark" style="justify-content:center"><button class="btn btn--solid" type="button" data-play>' + (title === cfg.title ? 'Start' : RA.t('Nog een keer', 'Play again')) + '</button></div>';
      }
      overlay.innerHTML = html;
      overlay.hidden = false;
      overlay.querySelector('[data-play]').addEventListener('click', start);
    }

    function start() {
      overlay.hidden = true;
      var r = stage.getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight) {
        var y = window.scrollY + r.top - 72;
        window.scrollTo({ top: y, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      }
      handlers = { down: [], key: [] };
      tick = null;
      cfg.start(api);
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    if (cfg.preview) cfg.preview(api);
    showOverlay(cfg.title, cfg.intro);
    return api;
  };

  /* tekenhulpjes die meerdere spellen gebruiken */
  window.RADraw = {
    wall: function (ctx, W, H, offset) {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(255,255,255,.05)';
      ctx.lineWidth = 1;
      var s = 60, o = ((offset || 0) % s + s) % s;
      for (var y = -s + o; y < H; y += s) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      for (var x = 0; x < W; x += s) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    },
    hold: function (ctx, x, y, r, rot, fill, stroke) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot || 0);
      ctx.beginPath();
      ctx.moveTo(-r, r * 0.35);
      ctx.quadraticCurveTo(-r * 0.9, -r * 0.8, 0, -r * 0.75);
      ctx.quadraticCurveTo(r * 1.1, -r * 0.6, r, r * 0.25);
      ctx.quadraticCurveTo(r * 0.3, r * 0.85, -r, r * 0.35);
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 3; ctx.stroke(); }
      ctx.restore();
    },
    text: function (ctx, txt, x, y, size, opts) {
      opts = opts || {};
      ctx.font = (opts.weight || 800) + ' ' + size + 'px ' + (opts.mono ? '"JetBrains Mono", monospace' : '"Archivo", sans-serif');
      ctx.fillStyle = opts.color || '#fff';
      ctx.textAlign = opts.align || 'center';
      ctx.textBaseline = opts.base || 'middle';
      ctx.fillText(txt, x, y);
    },
    rng: function (seed) {
      var s = seed >>> 0;
      return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    }
  };
})();
