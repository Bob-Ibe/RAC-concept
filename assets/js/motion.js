/* Rise Above Creators: motion-visuals.
   Elke animatie is een pure functie van de tijd: draw(ctx, t, opts).
   Hetzelfde bestand rendert de mp4's (build/render.mjs) en speelt live af op de site. */
(function (root) {
  'use strict';

  var W = 1080, H = 1920;
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
      var turn = prog(t, 4.9, 5.4);
      ctx.globalAlpha = turn;
      ctx.fillStyle = '#fff';
      font(ctx, 800, 64, DISPLAY, 'condensed');
      ctx.fillText(o.lang === 'en' ? 'YOUR TURN.' : 'JOUW BEURT.', 540, 1400 + (1 - outCubic(turn)) * 30);
      ctx.globalAlpha = 1;
      logoReveal(ctx, o.logoWhite, 540, 1620, 150, prog(t, 4.6, 5.2));
      ctx.globalAlpha = prog(t, 5.2, 5.6);
      font(ctx, 500, 30, MONO);
      ctx.fillText('THE CLIMBING CORNER  ·  HEERLEN', 540, 1770);
      ctx.globalAlpha = 1;
      grain(ctx, t, 0.12 * wp);
    }
  }

  /* ---------- logo-hulpjes: maskers, contouren en kleuren uit de logo-png ---------- */
  var cache = {};
  function canvas(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h || w; return c; }
  /* alfa van het logo op een raster van n x n (0..1) */
  function logoMask(img, n) {
    var key = 'mask' + n;
    if (cache[key]) return cache[key];
    var c = canvas(n), g = c.getContext('2d');
    g.drawImage(img, 0, 0, n, n);
    var d = g.getImageData(0, 0, n, n).data, a = new Float32Array(n * n);
    for (var i = 0; i < n * n; i++) a[i] = d[i * 4 + 3] / 255;
    return (cache[key] = { n: n, a: a, at: function (u, v) {
      if (u < 0 || v < 0 || u >= 1 || v >= 1) return 0;
      return a[Math.floor(v * n) * n + Math.floor(u * n)];
    } });
  }
  /* alleen de randen van de logovlakken, voor neonbuizen */
  function logoOutline(img, size, th) {
    var key = 'out' + size + '-' + th;
    if (cache[key]) return cache[key];
    var full = canvas(size), g = full.getContext('2d');
    g.drawImage(img, 0, 0, size, size);
    var er = canvas(size), e = er.getContext('2d');
    e.drawImage(img, 0, 0, size, size);
    e.globalCompositeOperation = 'destination-in';
    for (var i = 0; i < 16; i++) { var a = i / 16 * Math.PI * 2; e.drawImage(img, Math.cos(a) * th, Math.sin(a) * th, size, size); }
    g.globalCompositeOperation = 'destination-out';
    g.drawImage(er, 0, 0);
    return (cache[key] = full);
  }
  /* kleur een (witte) vorm in; per bronmaat een herbruikbaar canvas */
  function tint(src, color, slot) {
    var key = 'tint' + (slot || '') + src.width;
    var c = cache[key] || (cache[key] = canvas(src.width, src.height)), g = c.getContext('2d');
    g.globalCompositeOperation = 'source-over';
    g.clearRect(0, 0, c.width, c.height);
    g.drawImage(src, 0, 0, c.width, c.height);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = color;
    g.fillRect(0, 0, c.width, c.height);
    return c;
  }
  function mix(c1, c2, x) {
    var a = [parseInt(c1.slice(1, 3), 16), parseInt(c1.slice(3, 5), 16), parseInt(c1.slice(5, 7), 16)];
    var b = [parseInt(c2.slice(1, 3), 16), parseInt(c2.slice(3, 5), 16), parseInt(c2.slice(5, 7), 16)];
    return 'rgb(' + a.map(function (v, i) { return Math.round(lerp(v, b[i], x)); }).join(',') + ')';
  }
  function smooth(x) { x = clamp(x); return x * x * (3 - 2 * x); }

  /* ---------- 3. Nog nooit gebouldered? (naar de mat) ---------- */
  function firstTime(ctx, t, o) {
    var en = o.lang === 'en';
    ctx.fillStyle = '#f4f4f2';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#0a0a0a';
    ctx.textAlign = 'center';
    var lab = prog(t, 0.05, 0.5);
    ctx.globalAlpha = lab;
    font(ctx, 500, 34, MONO);
    ctx.fillText('THE CLIMBING CORNER  ·  HEERLEN', 540, 300);
    ctx.globalAlpha = 1;
    maskedLine(ctx, en ? 'NEVER' : 'NOG NOOIT', 540, 820, 250, prog(t, 0.2, 0.8), '#0a0a0a');
    maskedLine(ctx, en ? 'BOULDERED?' : 'GEBOULDERD?', 540, 1060, 250, prog(t, 0.4, 1.0), '#0a0a0a');
    /* drie grepen als vraagteken-ritme */
    for (var i = 0; i < 3; i++) hold(ctx, 380 + i * 160, 1300, 46, i * 1.7, outBack(prog(t, 0.9 + i * 0.12, 1.25 + i * 0.12)), '#0a0a0a');

    /* zwart vlak schuift omhoog met het antwoord */
    var wp = inOutCubic(prog(t, 1.9, 2.4));
    if (wp > 0) {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, H * (1 - wp), W, H * wp);
    }
    if (t > 2.3) {
      logoReveal(ctx, o.logoWhite, 540, 600, 260, prog(t, 2.35, 2.95));
      maskedLine(ctx, en ? 'COME AND' : 'KOM HET', 540, 1030, 250, prog(t, 2.45, 3.05), '#fff');
      maskedLine(ctx, en ? 'TRY IT.' : 'PROBEREN.', 540, 1270, 250, prog(t, 2.6, 3.2), '#fff');
      var dl = outCubic(prog(t, 3.1, 3.5));
      ctx.fillStyle = '#fff';
      ctx.fillRect(540 - 380 * dl, 1360, 760 * dl, 4);
      var lines = en ? ['INTRO SESSION ON SATURDAYS', 'SHOES INCLUDED', 'IN DE CRAMER 14  ·  HEERLEN']
                     : ['INTRODUCTIELES OP ZATERDAG', 'SCHOENEN INBEGREPEN', 'IN DE CRAMER 14  ·  HEERLEN'];
      font(ctx, 500, 36, MONO);
      lines.forEach(function (l, k) {
        var p = prog(t, 3.3 + k * 0.15, 3.8 + k * 0.15);
        ctx.globalAlpha = p;
        ctx.fillText(l, 540, 1450 + k * 60 + (1 - outCubic(p)) * 24);
      });
      ctx.globalAlpha = 1;
      grain(ctx, t, 0.12 * wp);
    }
  }

  /* ---------- 4. Wie gaat er mee? (naar de mat) ---------- */
  function bringFriend(ctx, t, o) {
    var en = o.lang === 'en';
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);
    /* grepen ploppen op rond de kop */
    var r = rng(5);
    for (var i = 0; i < 14; i++) {
      var x = 90 + r() * 900, y = 200 + r() * 1500, sz = 26 + r() * 40, at = 0.1 + r() * 0.9;
      if (y > 560 && y < 1300) continue;
      ctx.globalAlpha = 0.9;
      hold(ctx, x, y + Math.sin(t * 1.6 + i) * 8, sz, r() * 6, outBack(prog(t, at, at + 0.35)), i % 4 === 0 ? '#fff' : '#3a3a3a');
    }
    ctx.globalAlpha = 1;
    maskedLine(ctx, en ? "WHO'S" : 'WIE GAAT', 540, 820, 270, prog(t, 0.3, 0.9), '#fff');
    maskedLine(ctx, en ? 'COMING?' : 'ER MEE?', 540, 1080, 270, prog(t, 0.45, 1.05), '#fff');

    /* tag-balk die zichzelf typt */
    var bp = outBack(prog(t, 1.4, 1.9));
    if (bp > 0) {
      var bw = 840, bh = 150, bx = 540 - bw / 2, by = 1180;
      ctx.save();
      ctx.translate(540, by + bh / 2);
      ctx.scale(bp, bp);
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 75); else ctx.rect(-bw / 2, -bh / 2, bw, bh);
      ctx.fill();
      ctx.fillStyle = '#0a0a0a';
      font(ctx, 800, 72, DISPLAY, 'semi-expanded');
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('@', -bw / 2 + 56, 4);
      var msg = en ? 'TAG YOUR CLIMBING BUDDY' : 'TAG JE KLIMMAATJE';
      var n = Math.floor(msg.length * prog(t, 1.9, 2.9) + 0.0001);
      font(ctx, 500, en ? 38 : 44, MONO);
      var txt = msg.slice(0, n);
      ctx.fillText(txt, -bw / 2 + 140, 4);
      if (Math.floor(t * 5) % 2 === 0) ctx.fillRect(-bw / 2 + 146 + ctx.measureText(txt).width, -26, 5, 56);
      ctx.restore();
      ctx.textBaseline = 'alphabetic';
    }
    var lp = prog(t, 3.0, 3.6);
    logoReveal(ctx, o.logoWhite, 540, 1560, 170, lp);
    ctx.globalAlpha = prog(t, 3.3, 3.8);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    font(ctx, 500, 34, MONO);
    ctx.fillText(en ? 'CLIMB TOGETHER  ·  HEERLEN' : 'SAMEN KLIMMEN  ·  HEERLEN', 540, 1730);
    ctx.globalAlpha = 1;
    grain(ctx, t, 0.12);
  }

  /* ---------- 6. Neon-logo ---------- */
  function neonLogo(ctx, t, o) {
    var size = 760, cx = 540, cy = 860;
    /* aanflikkeren, zoemen, uitvallen */
    var lvl;
    if (t < 0.35) lvl = 0;
    else if (t < 1.4) lvl = rng(Math.floor(t * 18))() < lerp(0.25, 0.9, prog(t, 0.35, 1.4)) ? 1 : 0.12;
    else if (t < 4.0) lvl = 0.94 + 0.06 * Math.sin(t * 47) * Math.sin(t * 13);
    else lvl = rng(Math.floor(t * 22) + 3)() < lerp(0.8, 0.1, prog(t, 4.0, 4.4)) ? 0.8 : 0.05;
    if (t > 4.4) lvl = 0;
    var col = mix('#ffb03a', '#ff2a1a', smooth(prog(t, 2.2, 2.9)));

    ctx.fillStyle = '#070707';
    ctx.fillRect(0, 0, W, H);
    /* gloed op de muur */
    var halo = ctx.createRadialGradient(cx, cy, 50, cx, cy, 900);
    halo.addColorStop(0, col.replace('rgb', 'rgba').replace(')', ',' + (0.32 * lvl) + ')'));
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, W, H);

    var tube = logoOutline(o.logoWhite, size, 9);
    var lit = tint(tube, col, 'neon');
    function sign(y, alpha, flip) {
      ctx.save();
      ctx.translate(cx, y);
      if (flip) ctx.scale(1, -1);
      ctx.globalAlpha = alpha * Math.max(lvl, 0.05);
      ctx.shadowColor = col;
      ctx.shadowBlur = 90;
      ctx.drawImage(lit, -size / 2, -size / 2);
      ctx.shadowBlur = 30;
      ctx.drawImage(lit, -size / 2, -size / 2);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = alpha * lvl * 0.85;
      ctx.drawImage(tint(tube, '#fff2e8', 'core'), -size / 2, -size / 2);
      ctx.restore();
    }
    sign(cy, 1, false);
    /* weerspiegeling in een natte vloer */
    var fy = cy + size / 2 + 150;
    sign(fy + size / 2 + 40, 0.22, true);
    var fade = ctx.createLinearGradient(0, fy, 0, H);
    fade.addColorStop(0, 'rgba(7,7,7,0.2)');
    fade.addColorStop(0.6, 'rgba(7,7,7,1)');
    ctx.fillStyle = fade;
    ctx.fillRect(0, fy, W, H - fy);
    ctx.fillStyle = col.replace('rgb', 'rgba').replace(')', ',' + (0.25 * lvl) + ')');
    ctx.fillRect(140, fy, 800, 2);
    grain(ctx, t, 0.14);
  }

  /* ---------- 7. Krijtwolk ---------- */
  var chalk = null;
  function chalkCloud(ctx, t, o) {
    var size = 800, cx = 540, cy = 880;
    if (!chalk) {
      var m = logoMask(o.logoWhite, 200), r = rng(21), pts = [];
      for (var v = 0; v < 200; v++) for (var u = 0; u < 200; u++) if (m.a[v * 200 + u] > 0.5) pts.push([u, v]);
      chalk = [];
      for (var i = 0; i < 3200; i++) {
        var p = pts[Math.floor(r() * pts.length)], ang = r() * Math.PI * 2, dist = 60 + Math.pow(r(), 1.6) * 720;
        chalk.push({
          tx: cx - size / 2 + (p[0] + r()) / 200 * size, ty: cy - size / 2 + (p[1] + r()) / 200 * size,
          bx: cx + Math.cos(ang) * dist, by: cy + 380 + Math.sin(ang) * dist * 0.75 - r() * 300,
          d: r() * 0.7, s: 2 + r() * 4, a: 0.45 + r() * 0.5, drift: r()
        });
      }
    }
    ctx.fillStyle = '#0b0b0b';
    ctx.fillRect(0, 0, W, H);
    var puff = outExpo(prog(t, 0.15, 1.0)), lock = prog(t, 3.0, 3.6);
    var clap = prog(t, 0.1, 0.5);
    if (clap > 0 && clap < 1) {
      var g = ctx.createRadialGradient(cx, cy + 380, 0, cx, cy + 380, 700 * clap);
      g.addColorStop(0, 'rgba(255,255,255,' + 0.35 * (1 - clap) + ')');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.fillStyle = '#fff';
    for (var k = 0; k < chalk.length; k++) {
      var c = chalk[k];
      var gp = inOutCubic(prog(t, 0.9 + c.d * 0.8, 2.2 + c.d * 0.8));
      var sx = lerp(cx, c.bx, puff), sy = lerp(cy + 380, c.by, puff) - t * 30 * c.drift;
      var x = lerp(sx, c.tx, gp) + Math.sin(t * 3 + k) * 3 * (1 - gp);
      var y = lerp(sy, c.ty, gp);
      ctx.globalAlpha = c.a * (1 - 0.85 * lock) * clamp(puff * 3);
      ctx.fillRect(x, y, c.s, c.s);
    }
    ctx.globalAlpha = lock;
    ctx.drawImage(o.logoWhite, cx - size / 2, cy - size / 2, size, size);
    /* nastof die blijft hangen */
    var r2 = rng(99);
    for (var q = 0; q < 160; q++) {
      var px = r2() * W, py = (r2() * H + t * (20 + r2() * 40)) % H;
      ctx.globalAlpha = (0.08 + r2() * 0.2) * clamp(puff * 2);
      ctx.fillRect(px, py, 2 + r2() * 3, 2 + r2() * 3);
    }
    ctx.globalAlpha = 1;
    grain(ctx, t, 0.12);
  }

  /* ---------- 8. Gedrukt logo (rasterpunten) ---------- */
  function halftone(ctx, t, o) {
    var size = 900, cx = 540, cy = 900, s = 24, rot = 0.26;
    var m = logoMask(o.logoWhite, 300);
    ctx.fillStyle = '#efebe2';
    ctx.fillRect(0, 0, W, H);
    var front = lerp(0, 1500, outCubic(prog(t, 0.1, 1.4)));
    var bg = 1 - smooth(prog(t, 1.4, 2.3));
    var ripple = lerp(1, 0.25, prog(t, 1.0, 3.0));
    var off = lerp(26, 6, outCubic(prog(t, 2.0, 3.0)));
    var cr = Math.cos(rot), sr = Math.sin(rot), R = 1300;
    function layer(color, dx, dy, show) {
      if (show <= 0) return;
      ctx.fillStyle = color;
      ctx.beginPath();
      for (var j = -R; j <= R; j += s) {
        for (var i = -R; i <= R; i += s) {
          var x = cx + i * cr - j * sr, y = cy + i * sr + j * cr;
          if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue;
          var d = Math.hypot(x - cx, y - cy), on = smooth((front - d) / 160);
          if (on <= 0) continue;
          var a = m.at((x - cx + size / 2) / size, (y - cy + size / 2) / size);
          var wave = 1 + 0.3 * ripple * Math.sin(d * 0.018 - t * 7);
          var rad = Math.max(a * s * 0.62, (1 - a) * s * 0.2 * bg) * on * wave * show;
          if (rad < 0.6) continue;
          ctx.moveTo(x + dx + rad, y + dy);
          ctx.arc(x + dx, y + dy, rad, 0, Math.PI * 2);
        }
      }
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'multiply';
    layer('#ff4436', off, off * 0.7, prog(t, 1.6, 2.4));
    layer('#141414', 0, 0, 1);
    ctx.globalCompositeOperation = 'source-over';
    grain(ctx, t, 0.1);
  }

  /* ---------- 9. Glitch ---------- */
  var glitchFrame = null;
  function glitch(ctx, t, o) {
    var size = 720, cx = 540, cy = 900;
    var F = glitchFrame || (glitchFrame = canvas(W, H)), g = F.getContext('2d');
    var bursts = [[0, 0.45, 1], [1.2, 1.4, 0.6], [2.3, 2.7, 0.8], [3.4, 3.95, 1.2]];
    var amt = 0;
    bursts.forEach(function (b) { if (t >= b[0] && t < b[1]) amt = b[2]; });
    var fr = Math.floor(t * 30), r = rng(fr * 7 + 1);
    var k = amt * (0.4 + r() * 0.6);
    var invert = t > 3.82 && t < 3.95;
    var bgc = invert ? '#f4f4f2' : '#050505';
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = bgc;
    g.fillRect(0, 0, W, H);
    var appear = t < 0.45 ? (r() < prog(t, 0, 0.45) ? 1 : 0.15) : 1;
    var jx = (r() - 0.5) * 6;
    if (k > 0 && !invert) {
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = appear;
      g.drawImage(tint(o.logoWhite, '#ff2a2a', 'gr'), cx - size / 2 - 30 * k + jx, cy - size / 2, size, size);
      g.drawImage(tint(o.logoWhite, '#00e5ff', 'gc'), cx - size / 2 + 30 * k + jx, cy - size / 2 + 6 * k, size, size);
      g.globalCompositeOperation = 'source-over';
      g.globalAlpha = 0.85 * appear;
    } else g.globalAlpha = appear;
    g.drawImage(invert ? o.logo : o.logoWhite, cx - size / 2 + jx * (k > 0 ? 1 : 0.2), cy - size / 2, size, size);
    g.globalAlpha = 1;
    ctx.drawImage(F, 0, 0);
    /* verschoven stroken */
    var n = Math.floor(k * 14);
    for (var i = 0; i < n; i++) {
      var y = r() * H, h = 8 + r() * 90, dx = (r() - 0.5) * 260 * k;
      ctx.drawImage(F, 0, y, W, h, dx, y, W, h);
    }
    /* ruisblokken */
    for (var q = 0; q < n; q++) {
      ctx.fillStyle = r() < 0.5 ? '#fff' : '#ff2a2a';
      ctx.globalAlpha = 0.6;
      ctx.fillRect(r() * W, r() * H, 20 + r() * 160, 4 + r() * 14);
    }
    ctx.globalAlpha = 1;
    /* rolbalk en scanlijnen */
    var by = ((t * 0.45) % 1) * (H + 300) - 150;
    var bar = ctx.createLinearGradient(0, by - 150, 0, by + 150);
    bar.addColorStop(0, 'rgba(255,255,255,0)'); bar.addColorStop(0.5, 'rgba(255,255,255,0.06)'); bar.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = bar;
    ctx.fillRect(0, by - 150, W, 300);
    ctx.fillStyle = invert ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.35)';
    for (var sy = 0; sy < H; sy += 6) ctx.fillRect(0, sy, W, 2);
    grain(ctx, t, 0.16);
  }

  /* ---------- 10. Code-logo (tekens) ---------- */
  var asciiCells = null;
  function asciiLogo(ctx, t, o) {
    var cw = 15, ch = 26, cols = Math.ceil(W / cw), rows = Math.ceil(H / ch);
    var size = 960, cx = 540, cy = 900, ramp = ' .:-=+*#%@', noise = '01<>/\\|#%&$*+=';
    if (!asciiCells) {
      var m = logoMask(o.logoWhite, 300), r = rng(3);
      asciiCells = [];
      for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
        var u = (x * cw + cw / 2 - cx + size / 2) / size, v = (y * ch + ch / 2 - cy + size / 2) / size;
        var a = (m.at(u, v) + m.at(u + 0.004, v) + m.at(u, v + 0.006) + m.at(u + 0.004, v + 0.006)) / 4;
        asciiCells.push({ x: x * cw, y: y * ch + ch * 0.8, row: y, a: a, rnd: r(), ch: ramp[Math.min(9, Math.round(a * 9))] });
      }
    }
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    font(ctx, 500, 24, MONO);
    ctx.textAlign = 'left';
    var front = lerp(-6, rows + 6, inOutCubic(prog(t, 0.2, 2.6)));
    var fr = Math.floor(t * 20);
    for (var i = 0; i < asciiCells.length; i++) {
      var c = asciiCells[i], dist = c.row - front + c.rnd * 6;
      var glyph, alpha, color = '#fff';
      if (dist > 6) { if (c.rnd < 0.035) { glyph = '.'; alpha = 0.18; } else continue; }
      else if (dist > 0) { glyph = noise[(fr + i) % noise.length]; alpha = c.a > 0 ? 0.9 : 0.25; color = dist < 2 ? '#ff3b2f' : '#fff'; }
      else {
        if (c.a < 0.05) { if (c.rnd < 0.05) { glyph = '.'; alpha = 0.2; } else continue; }
        else {
          glyph = c.ch; alpha = 0.35 + c.a * 0.65;
          /* golf van licht na het opbouwen */
          var wv = Math.sin((c.x + c.y) * 0.006 - t * 4);
          if (t > 2.8 && wv > 0.93) { glyph = '@'; color = '#ff3b2f'; alpha = 1; }
        }
      }
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.fillText(glyph, c.x, c.y);
    }
    ctx.globalAlpha = 1;
    grain(ctx, t, 0.1);
  }

  /* ---------- 11. Strepen-overgang ---------- */
  function stripes(ctx, t, o) {
    var size = 780, cx = 540, cy = 960, N = 16, sh = size / N;
    ctx.fillStyle = '#f4f4f2';
    ctx.fillRect(0, 0, W, H);
    function strips(img, dir) {
      for (var k = 0; k < N; k++) {
        var side = k % 2 ? 1 : -1;
        var pin = outExpo(prog(t, 0.1 + k * 0.035, 0.75 + k * 0.035));
        var pout = inCubic(prog(t, 2.9 + k * 0.03, 3.5 + k * 0.03));
        var dx = (1 - pin) * 1300 * side - pout * 1300 * side * dir;
        var sy = k * sh * (img.height / size);
        ctx.drawImage(img, 0, sy, img.width, sh * (img.height / size), cx - size / 2 + dx, cy - size / 2 + k * sh, size, sh + 0.5);
      }
    }
    strips(o.logo, 1);
    /* zwarte banen in de hoek van de logostrepen vegen het beeld om */
    var nx = Math.cos(-0.95), ny = Math.sin(-0.95);
    var c4 = [[0, 0], [W, 0], [0, H], [W, H]].map(function (c) { return c[0] * nx + c[1] * ny; });
    var mn = Math.min.apply(null, c4), span = Math.max.apply(null, c4) - mn;
    var lead = mn - 300 + (span + 600) * inOutCubic(prog(t, 1.3, 2.1));
    function band(a, b) {
      var tx = -ny, ty = nx, L = 4000;
      ctx.beginPath();
      ctx.moveTo(nx * a + tx * L, ny * a + ty * L);
      ctx.lineTo(nx * a - tx * L, ny * a - ty * L);
      ctx.lineTo(nx * b - tx * L, ny * b - ty * L);
      ctx.lineTo(nx * b + tx * L, ny * b + ty * L);
      ctx.closePath();
    }
    ctx.save();
    band(mn - 400, lead);
    ctx.clip();
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);
    strips(o.logoWhite, -1);
    ctx.restore();
    ctx.fillStyle = '#f4f4f2';
    for (var i = 0; i < 3; i++) { band(lead - 92 - i * 60, lead - 70 - i * 60); ctx.fill(); }
    grain(ctx, t, 0.08 * prog(t, 1.6, 2.1));
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

  /* vijf visuals die mensen naar de hal halen, zes logo-animaties */
  var CLIPS = [
    { id: 'eindkaart', duration: 6, draw: endcard, personal: true },
    { id: 'eerste-keer', duration: 5, draw: firstTime },
    { id: 'klim-mee', duration: 4.5, draw: bringFriend },
    { id: 'poging-teller', duration: 6, draw: attempts },
    { id: 'rise-opener', duration: 5, draw: riseAbove },
    { id: 'logo-neon', duration: 4.6, draw: neonLogo },
    { id: 'logo-krijt', duration: 4.5, draw: chalkCloud },
    { id: 'logo-raster', duration: 4, draw: halftone },
    { id: 'logo-glitch', duration: 4.2, draw: glitch },
    { id: 'logo-code', duration: 4.5, draw: asciiLogo },
    { id: 'logo-strepen', duration: 3.8, draw: stripes }
  ];

  root.RAMotion = { W: W, H: H, CLIPS: CLIPS, get: function (id) { return CLIPS.filter(function (c) { return c.id === id; })[0]; } };
})(window);
