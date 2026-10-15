/* Rise Above Creators: motion-visuals.
   Elke animatie is een pure functie van de tijd: draw(ctx, t, opts).
   Hetzelfde bestand rendert de mp4's (build/render.mjs) en speelt live af op de site. */
(function (root) {
  'use strict';

  var W = 1080, H = 1920;
  var GREEN = '#00B140';
  var DISPLAY = '"Archivo", "Arial Narrow", sans-serif';
  var MONO = '"JetBrains Mono", ui-monospace, monospace';

  /* ---------- helpers ---------- */
  function clamp(x, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return Math.min(b, Math.max(a, x)); }
  function prog(t, s, e) { return clamp((t - s) / (e - s)); }
  function outCubic(x) { return 1 - Math.pow(1 - x, 3); }
  function inCubic(x) { return x * x * x; }
  function inOutCubic(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function outExpo(x) { return x === 1 ? 1 : 1 - Math.pow(2, -10 * x); }
  function outBack(x) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
  function inBack(x) { var c1 = 1.70158, c3 = c1 + 1; return c3 * x * x * x - c1 * x * x; }
  function lerp(a, b, x) { return a + (b - a) * x; }

  function rng(seed) {
    var s = seed >>> 0;
    return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  function font(ctx, weight, size, family, stretch) {
    ctx.font = weight + ' ' + size + 'px ' + family;
    if ('fontStretch' in ctx) ctx.fontStretch = stretch || 'normal';
  }

  var grainCanvas = null;
  function grain(ctx, t, alpha) {
    if (!grainCanvas) {
      grainCanvas = document.createElement('canvas');
      grainCanvas.width = grainCanvas.height = 256;
      var g = grainCanvas.getContext('2d'), img = g.createImageData(256, 256), r = rng(7);
      for (var i = 0; i < img.data.length; i += 4) { var v = r() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
      g.putImageData(img, 0, 0);
    }
    var f = Math.floor(t * 24), r2 = rng(f + 11);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = 'overlay';
    ctx.translate(-r2() * 256, -r2() * 256);
    ctx.fillStyle = ctx.createPattern(grainCanvas, 'repeat');
    ctx.fillRect(0, 0, W + 256, H + 256);
    ctx.restore();
  }

  /* tekst die van onder uit een masker omhoog schuift */
  function maskedLine(ctx, text, x, y, size, p, color, opts) {
    opts = opts || {};
    font(ctx, opts.weight || 800, size, DISPLAY, opts.stretch || 'condensed');
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, y - size * 0.86, W, size * 0.98);
    ctx.clip();
    ctx.fillStyle = color;
    ctx.textAlign = opts.align || 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(text, x, y + (1 - outExpo(p)) * size, opts.maxWidth || 960);
    ctx.restore();
  }

  /* logo onthullen met een draaiende taartpunt */
  function logoReveal(ctx, img, cx, cy, size, p, rot) {
    if (!img || p <= 0) return;
    ctx.save();
    ctx.translate(cx, cy);
    if (rot) ctx.rotate(rot);
    if (p < 1) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, size, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * outCubic(p));
      ctx.closePath();
      ctx.clip();
    }
    var s = lerp(0.82, 1, outBack(p));
    ctx.drawImage(img, -size / 2 * s, -size / 2 * s, size * s, size * s);
    ctx.restore();
  }

  function hold(ctx, x, y, r, rot, s, color) {
    if (s <= 0) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-r, r * 0.35);
    ctx.quadraticCurveTo(-r * 0.9, -r * 0.8, 0, -r * 0.75);
    ctx.quadraticCurveTo(r * 1.1, -r * 0.6, r, r * 0.25);
    ctx.quadraticCurveTo(r * 0.3, r * 0.85, -r, r * 0.35);
    ctx.fill();
    ctx.restore();
  }

  function polyPartial(ctx, pts, p) {
    var lens = [], total = 0, i;
    for (i = 1; i < pts.length; i++) { var l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); lens.push(l); total += l; }
    var target = total * p, acc = 0;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    var tip = pts[0];
    for (i = 1; i < pts.length; i++) {
      if (acc + lens[i - 1] >= target) {
        var f = (target - acc) / lens[i - 1];
        tip = [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)];
        ctx.lineTo(tip[0], tip[1]);
        break;
      }
      acc += lens[i - 1];
      ctx.lineTo(pts[i][0], pts[i][1]);
      tip = pts[i];
    }
    ctx.stroke();
    return { tip: tip, reached: function (k) { var a = 0; for (var j = 0; j < k; j++) a += lens[j]; return target >= a - 1; } };
  }

  /* ---------- 1. RISE ABOVE opener ---------- */
  function riseAbove(ctx, t, o) {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);

    var pts = [[540, 1990], [420, 1720], [660, 1500], [450, 1290], [640, 1080], [520, 880], [540, 700]];
    var draw = inOutCubic(prog(t, 0.1, 2.0));
    var cam = lerp(260, 0, outCubic(prog(t, 0, 2.2)));
    var fade = lerp(1, 0.18, prog(t, 2.0, 2.6));

    ctx.save();
    ctx.translate(0, cam);
    ctx.globalAlpha = fade;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.setLineDash([2, 26]);
    var route = polyPartial(ctx, pts, draw);
    ctx.setLineDash([]);
    for (var i = 1; i < pts.length - 1; i++) {
      var on = route.reached(i);
      var s = 0;
      if (on) {
        var total = pts.length - 1;
        var hitAt = 0.1 + 1.9 * (i / total);
        s = outBack(prog(t, hitAt - 0.05, hitAt + 0.3));
      }
      hold(ctx, pts[i][0], pts[i][1], 44, i * 1.3, s, '#fff');
    }
    ctx.restore();

    var lp = prog(t, 1.75, 2.5);
    logoReveal(ctx, o.logoWhite, 540, 560 + cam * 0.3, 330, lp);

    maskedLine(ctx, 'RISE', 540, 1290, 380, prog(t, 2.25, 2.9), '#fff');
    maskedLine(ctx, 'ABOVE.', 540, 1640, 380, prog(t, 2.45, 3.1), '#fff');

    var lab = prog(t, 3.1, 3.6);
    ctx.globalAlpha = lab;
    font(ctx, 500, 34, MONO);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('THE CLIMBING CORNER  ·  HEERLEN', 540, 1770 + (1 - outCubic(lab)) * 20);
    ctx.globalAlpha = 1;

    grain(ctx, t, 0.12);
  }

  /* ---------- 2. Poging-teller ---------- */
  function attempts(ctx, t, o) {
    var goal = o.attempts || 14;
    ctx.fillStyle = '#f4f4f2';
    ctx.fillRect(0, 0, W, H);

    var cp = prog(t, 0.25, 3.3);
    var raw = 1 + (goal - 1) * (cp * cp);
    var n = Math.min(goal, Math.floor(raw));
    var frac = raw - Math.floor(raw);
    var pulse = n < goal ? 1 + 0.06 * Math.max(0, 1 - frac * 4) : 1;
    var intro = outExpo(prog(t, 0, 0.5));

    ctx.fillStyle = '#0a0a0a';
    ctx.textAlign = 'center';
    font(ctx, 500, 40, MONO);
    ctx.globalAlpha = intro;
    ctx.fillText(o.lang === 'en' ? 'ATTEMPT' : 'POGING', 540, 620);
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.translate(540, 1080);
    ctx.scale(pulse, pulse);
    var shake = n < goal ? (rng(n)() - 0.5) * 14 * Math.max(0, 1 - frac * 3) : 0;
    ctx.translate(shake, 0);
    font(ctx, 800, 620, DISPLAY, 'condensed');
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(String(n).padStart(2, '0'), 0, 200 + (1 - intro) * 200);
    ctx.restore();

    /* turflijn onderaan */
    var bx = 140, bw = 800, by = 1420;
    ctx.fillStyle = '#0a0a0a';
    for (var i = 0; i < goal; i++) {
      var x = bx + (bw / (goal - 1)) * i;
      var on = i < n;
      ctx.globalAlpha = on ? 1 : 0.15;
      ctx.fillRect(x - 4, by - (on ? 60 : 30), 8, on ? 60 : 30);
    }
    ctx.globalAlpha = 1;

    font(ctx, 500, 32, MONO);
    ctx.globalAlpha = intro * (1 - prog(t, 3.2, 3.5));
    ctx.fillText(o.lang === 'en' ? 'ONE MORE GO.' : 'NOG EEN KEER.', 540, 1530);
    ctx.globalAlpha = 1;

    /* zwart vlak schuift omhoog */
    var wp = inOutCubic(prog(t, 3.4, 3.9));
    if (wp > 0) {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, H * (1 - wp), W, H * wp);
    }
    var sp = prog(t, 3.85, 4.35);
    if (sp > 0) {
      ctx.save();
      ctx.translate(540, 1010);
      var sc = lerp(1.5, 1, outBack(sp));
      ctx.scale(sc, sc);
      ctx.globalAlpha = clamp(sp * 3);
      ctx.fillStyle = '#fff';
      font(ctx, 800, 400, DISPLAY, 'condensed');
      ctx.textAlign = 'center';
      ctx.fillText('SEND.', 0, 140, 960);
      ctx.restore();
      var sub = prog(t, 4.3, 4.8);
      ctx.globalAlpha = sub;
      ctx.fillStyle = '#fff';
      font(ctx, 500, 38, MONO);
      ctx.textAlign = 'center';
      ctx.fillText(o.lang === 'en' ? 'AFTER ' + goal + ' ATTEMPTS' : 'NA ' + goal + ' POGINGEN', 540, 1260);
      ctx.globalAlpha = 1;
      logoReveal(ctx, o.logoWhite, 540, 1620, 150, prog(t, 4.6, 5.2));
      grain(ctx, t, 0.12 * wp);
    }
  }

  /* ---------- 3. SEND! stempel (green screen) ---------- */
  function stamp(ctx, t, o) {
    ctx.fillStyle = GREEN;
    ctx.fillRect(0, 0, W, H);

    var hit = 0.42;
    var inP = prog(t, 0.12, hit);
    var outP = prog(t, 2.45, 2.75);
    if (inP <= 0 || outP >= 1) return;

    var shakeAmt = t > hit ? Math.max(0, 1 - (t - hit) / 0.4) : 0;
    var sx = Math.sin(t * 90) * 22 * shakeAmt, sy = Math.cos(t * 70) * 16 * shakeAmt;

    /* stralen */
    var rp = prog(t, hit, hit + 0.5);
    if (rp > 0 && rp < 1) {
      ctx.save();
      ctx.translate(540 + sx, 960 + sy);
      ctx.strokeStyle = '#0a0a0a';
      ctx.lineCap = 'round';
      ctx.lineWidth = 18 * (1 - rp);
      for (var i = 0; i < 14; i++) {
        var a = (i / 14) * Math.PI * 2 + 0.2;
        var r1 = lerp(360, 560, outCubic(rp)), r2 = lerp(420, 760, outCubic(rp));
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
        ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
        ctx.stroke();
      }
      ctx.restore();
    }

    /* krijtwolk */
    if (t > hit) {
      var r = rng(42), dt = t - hit;
      for (var k = 0; k < 70; k++) {
        var ang = r() * Math.PI * 2, sp = 500 + r() * 1300, sz = 4 + r() * 16;
        var d = sp * (1 - Math.exp(-dt * 3)) / 3;
        var al = Math.max(0, 1 - dt / (0.7 + r() * 0.9));
        if (al <= 0) continue;
        ctx.globalAlpha = al;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(540 + Math.cos(ang) * d + sx, 960 + Math.sin(ang) * d + sy + dt * dt * 260, sz, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    var s = lerp(2.8, 1, outCubic(inP)) * (1 - inBack(outP));
    ctx.save();
    ctx.translate(540 + sx, 960 + sy);
    ctx.rotate(-0.1);
    ctx.scale(s, s);
    ctx.globalAlpha = clamp(inP * 2);
    /* kader */
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(-430, -250, 860, 500);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 14;
    ctx.strokeRect(-400, -220, 800, 440);
    font(ctx, 800, 330, DISPLAY, 'condensed');
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('SEND!', 0, 115, 740);
    font(ctx, 500, 30, MONO);
    ctx.fillText('THE CLIMBING CORNER', 0, 185);
    ctx.restore();
  }

  /* ---------- 4. Overgang (green screen) ---------- */
  function wipe(ctx, t, o) {
    ctx.fillStyle = GREEN;
    ctx.fillRect(0, 0, W, H);

    var nx = Math.cos(-0.95), ny = Math.sin(-0.95); /* richting: naar rechtsboven */
    var corners = [[0, 0], [W, 0], [0, H], [W, H]].map(function (c) { return c[0] * nx + c[1] * ny; });
    var mn = Math.min.apply(null, corners), mx = Math.max.apply(null, corners), span = mx - mn;

    function band(a, b, color) {
      if (b <= a) return;
      var tx = -ny, ty = nx, L = 4000;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(nx * a + tx * L, ny * a + ty * L);
      ctx.lineTo(nx * a - tx * L, ny * a - ty * L);
      ctx.lineTo(nx * b - tx * L, ny * b - ty * L);
      ctx.lineTo(nx * b + tx * L, ny * b + ty * L);
      ctx.closePath();
      ctx.fill();
    }

    var lead = mn - 200 + (span + 400) * inOutCubic(prog(t, 0.05, 0.7));
    var trail = mn - 200 + (span + 400) * inOutCubic(prog(t, 1.1, 1.75));
    band(Math.max(trail, mn - 400), lead, '#0a0a0a');
    /* witte strepen zoals in het logo */
    for (var i = 0; i < 3; i++) {
      var off = 90 + i * 70;
      band(lead + off - 22, lead + off, '#fff');
      if (trail > mn - 200) band(trail - off, trail - off + 22, '#fff');
    }

    var lp = prog(t, 0.55, 1.05);
    var lo = 1 - prog(t, 1.05, 1.25);
    if (lp > 0 && lo > 0) {
      ctx.globalAlpha = lo;
      logoReveal(ctx, o.logoWhite, 540, 960, 420, lp, (1 - outCubic(lp)) * -0.6);
      ctx.globalAlpha = 1;
    }
  }

  /* ---------- 5. Eindkaart met code ---------- */
  function endcard(ctx, t, o) {
    var en = o.lang === 'en';
    var code = (o.code || (en ? 'YOURCODE' : 'JOUWCODE')).toUpperCase().slice(0, 12);
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);

    logoReveal(ctx, o.logoWhite, 540, 400, 260, prog(t, 0.05, 0.7));
    maskedLine(ctx, en ? 'COME' : 'KOM', 540, 830, 300, prog(t, 0.45, 1.05), '#fff');
    maskedLine(ctx, en ? 'CLIMB.' : 'KLIMMEN.', 540, 1100, 300, prog(t, 0.6, 1.2), '#fff');

    var dl = outCubic(prog(t, 1.15, 1.6));
    ctx.fillStyle = '#fff';
    ctx.fillRect(540 - 380 * dl, 1185, 760 * dl, 4);

    var lines = ['THE CLIMBING CORNER', 'IN DE CRAMER 14  ·  HEERLEN', '@THE_CLIMBINGCORNER'];
    font(ctx, 500, 36, MONO);
    ctx.textAlign = 'center';
    lines.forEach(function (l, i) {
      var p = prog(t, 1.4 + i * 0.15, 1.9 + i * 0.15);
      ctx.globalAlpha = p;
      ctx.fillText(l, 540, 1270 + i * 58 + (1 - outCubic(p)) * 24);
    });
    ctx.globalAlpha = 1;

    /* codevak: rand tekent zich, daarna wordt de code getypt */
    var bp = prog(t, 2.2, 2.8);
    if (bp > 0) {
      var bx = 150, by = 1500, bw = 780, bh = 270;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 5;
      var per = 2 * (bw + bh), len = per * outCubic(bp);
      ctx.setLineDash([len, per]);
      ctx.strokeRect(bx, by, bw, bh);
      ctx.setLineDash([]);
      var fill = prog(t, 2.75, 3.0);
      ctx.globalAlpha = fill;
      ctx.fillStyle = '#fff';
      ctx.fillRect(bx, by, bw, bh);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#0a0a0a';
      font(ctx, 500, 28, MONO);
      ctx.globalAlpha = fill;
      ctx.fillText(en ? 'MENTION THIS CODE AT RECEPTION' : 'NOEM DEZE CODE AAN DE BALIE', 540, by + 72);
      ctx.globalAlpha = 1;
      var shown = Math.floor(code.length * prog(t, 2.95, 3.6) + 0.0001);
      var txt = code.slice(0, shown);
      var size = code.length > 9 ? 110 : 140;
      font(ctx, 800, size, DISPLAY, 'semi-expanded');
      var full = ctx.measureText(code).width, sq = Math.min(1, 680 / full);
      ctx.save(); ctx.translate(540, by + 210); ctx.scale(sq, 1); ctx.fillText(txt, 0, 0); ctx.restore();
      if (shown < code.length && t > 2.95 && Math.floor(t * 6) % 2 === 0) {
        var w = ctx.measureText(txt).width * sq;
        ctx.fillRect(540 + w / 2 + 8, by + 110, 10, 110);
      }
    }
    grain(ctx, t, 0.12);
  }

  var CLIPS = [
    { id: 'rise-opener', title: 'Rise Above opener', duration: 5, kind: 'Intro', note: 'Zet aan het begin van je video.', draw: riseAbove },
    { id: 'poging-teller', title: 'Poging-teller', duration: 6, kind: 'Intro of outro', note: 'Voor de video over dat ene project dat je eindelijk haalt.', draw: attempts },
    { id: 'send-stempel', title: 'SEND! stempel', duration: 3, kind: 'Overlay, green screen', note: 'Leg over je top-out. Groen wegfilteren met chroma key in CapCut of Instagram.', draw: stamp },
    { id: 'overgang', title: 'Corner-overgang', duration: 2, kind: 'Overgang, green screen', note: 'Tussen twee shots. Groen wegfilteren met chroma key.', draw: wipe },
    { id: 'eindkaart', title: 'Eindkaart met jouw code', duration: 6, kind: 'Outro', note: 'Altijd als laatste shot. Hier komen nieuwe bezoekers vandaan.', draw: endcard, personal: true }
  ];

  root.RAMotion = { W: W, H: H, CLIPS: CLIPS, get: function (id) { return CLIPS.filter(function (c) { return c.id === id; })[0]; } };
})(window);
