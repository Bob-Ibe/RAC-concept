/* Top-out: tik als de bereikmeter in het vak staat. Je grip loopt leeg. */
RAGame({
  id: 'top-out', title: 'Top-out', width: 600, height: 800,
  intro: RA.t('Tik (of druk op spatie) als het blokje in het witte vak staat. Raak je de greep, dan laadt je grip een beetje op. Mis je, dan glijd je.', 'Tap (or press space) when the marker is inside the white zone. Catch the hold and your grip recovers a little. Miss and you slip.'),
  preview: function (g) { RADraw.wall(g.ctx, g.W, g.H, 0); },
  start: function (g) {
    var ctx = g.ctx, W = g.W, H = g.H, rnd = RADraw.rng(Date.now() & 0xffff);
    var holds = [{ x: 300, y: 0, rot: 0 }];
    function addHold() {
      var p = holds[holds.length - 1];
      var x = Math.max(110, Math.min(490, p.x + (rnd() - 0.5) * 380));
      holds.push({ x: x, y: p.y + 120 + rnd() * 40, rot: rnd() * 6 });
    }
    for (var i = 0; i < 8; i++) addHold();

    var at = 0, cam = 0, grip = 1, phase = 0, zone = newZone(0), move = null, shake = 0, flash = null, falling = 0;
    function newZone(n) { return { c: 0.25 + rnd() * 0.5, w: Math.max(0.12, 0.27 - n * 0.005) }; }
    function meter() { return (Math.sin(phase) + 1) / 2; }
    function sy(wy) { return H - 190 - (wy - cam); }

    function attempt() {
      if (move || falling) return;
      var m = meter();
      if (Math.abs(m - zone.c) <= zone.w / 2) {
        move = { from: holds[at], to: holds[at + 1], t: 0 };
        grip = Math.min(1, grip + 0.16);
        flash = { txt: Math.abs(m - zone.c) < zone.w / 6 ? 'PERFECT' : RA.t('RAAK', 'HIT'), t: 0.6 };
      } else {
        grip -= 0.2;
        shake = 0.3;
        flash = { txt: RA.t('MIS', 'MISS'), t: 0.6 };
      }
    }
    g.onDown(attempt);
    g.onKey(function (e) { if (e.code === 'Space' || e.key === 'Enter') { e.preventDefault(); attempt(); } });

    g.loop(function (dt) {
      phase += dt * (2.6 + at * 0.05);
      if (!falling) grip -= dt * (0.075 + at * 0.0035);
      if (move) {
        move.t += dt / 0.2;
        if (move.t >= 1) { at++; move = null; zone = newZone(at); addHold(); }
      }
      cam += ((holds[at].y) - cam) * Math.min(1, dt * 6);
      shake = Math.max(0, shake - dt);
      if (flash) { flash.t -= dt; if (flash.t <= 0) flash = null; }
      if (grip <= 0 && !falling) { falling = 0.001; }
      if (falling) {
        falling += dt;
        if (falling > 0.8) g.end({ score: at }, at + ' ' + RA.t('grepen', 'holds'), at < 10 ? RA.t('Je grip was op. Haal 10 grepen voor de eerste visual.', 'Your grip gave out. Get 10 holds for the first visual.') : RA.t('Mooi geklommen. Je grip was op na ', 'Nice climbing. Your grip gave out after ') + at + ' ' + RA.t('grepen.', 'holds.'));
      }

      /* tekenen */
      ctx.save();
      if (shake) ctx.translate((Math.random() - 0.5) * 12 * shake / 0.3, 0);
      RADraw.wall(ctx, W, H, cam);
      for (var i = Math.max(0, at - 3); i < holds.length; i++) {
        var h = holds[i], y = sy(h.y);
        if (y < -40 || y > H + 40) continue;
        var next = i === at + 1;
        RADraw.hold(ctx, h.x, y, next ? 30 : 24, h.rot, i <= at ? '#fff' : next ? null : 'rgba(255,255,255,.35)', next ? '#fff' : null);
        if (next) {
          ctx.strokeStyle = 'rgba(255,255,255,' + (0.3 + 0.3 * Math.sin(phase * 2)) + ')';
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(h.x, y, 46, 0, Math.PI * 2); ctx.stroke();
        }
      }
      /* hand */
      var hx, hy;
      if (move) { var k = 1 - Math.pow(1 - move.t, 3); hx = move.from.x + (move.to.x - move.from.x) * k; hy = sy(move.from.y + (move.to.y - move.from.y) * k); }
      else { hx = holds[at].x; hy = sy(holds[at].y) + (falling ? falling * falling * 1400 : 0); }
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(hx, hy - 6, 13, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#0a0a0a'; ctx.lineWidth = 3; ctx.stroke();
      if (!move && !falling) {
        var n = holds[at + 1];
        ctx.setLineDash([3, 10]); ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(hx, hy - 6); ctx.lineTo(n.x, sy(n.y)); ctx.stroke(); ctx.setLineDash([]);
      }
      ctx.restore();

      /* meter */
      var mx = 60, mw = W - 120, my = H - 92;
      ctx.fillStyle = '#1d1d1b'; ctx.fillRect(mx, my, mw, 26);
      ctx.fillStyle = '#fff'; ctx.fillRect(mx + mw * (zone.c - zone.w / 2), my, mw * zone.w, 26);
      var mm = mx + mw * meter();
      ctx.fillStyle = '#0a0a0a'; ctx.fillRect(mm - 7, my - 8, 14, 42);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.strokeRect(mm - 7, my - 8, 14, 42);
      RADraw.text(ctx, RA.t('BEREIK', 'REACH'), mx, my - 20, 12, { mono: true, weight: 500, align: 'left' });

      /* grip */
      ctx.fillStyle = '#1d1d1b'; ctx.fillRect(mx, H - 40, mw, 8);
      ctx.fillStyle = grip < 0.25 ? '#fff' : '#b9b9b5'; ctx.fillRect(mx, H - 40, mw * Math.max(0, grip), 8);
      RADraw.text(ctx, 'GRIP', mx, H - 52, 12, { mono: true, weight: 500, align: 'left' });

      if (flash) { ctx.globalAlpha = Math.min(1, flash.t * 3); RADraw.text(ctx, flash.txt, W / 2, 140, 64); ctx.globalAlpha = 1; }
      g.hud(RA.t('Grepen: ', 'Holds: ') + at, RA.t('Beste: ', 'Best: ') + (RA.state.best['top-out'] || 0));
    });
  }
});
