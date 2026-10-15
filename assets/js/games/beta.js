/* Beta van de dag: elke dag dezelfde wand voor iedereen. Vind de kortste route naar de top. */
(function () {
  var W = 600, H = 800, R = 175;
  var today = new Date();
  var dayKey = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

  function canMove(a, b) { return Math.hypot(a.x - b.x, a.y - b.y) <= R && b.y <= a.y + 25; }

  function generate(seed) {
    for (var attempt = 0; attempt < 400; attempt++) {
      var rnd = RADraw.rng(seed * 31 + attempt);
      var holds = [{ x: 150 + rnd() * 300, y: 735, kind: 'start' }];
      var tries = 0;
      while (holds.length < 21 && tries < 2000) {
        tries++;
        var p = { x: 55 + rnd() * 490, y: 150 + rnd() * 540 };
        if (holds.every(function (h) { return Math.hypot(h.x - p.x, h.y - p.y) > 78; })) holds.push(p);
      }
      holds.push({ x: 120 + rnd() * 360, y: 70, kind: 'top' });
      holds.forEach(function (h) { h.rot = rnd() * 6; });
      var opt = bfs(holds);
      if (opt >= 5 && opt <= 7) return { holds: holds, opt: opt };
    }
    return null;
  }
  function bfs(holds) {
    var dist = holds.map(function () { return -1; }), q = [0];
    dist[0] = 0;
    while (q.length) {
      var i = q.shift();
      for (var j = 0; j < holds.length; j++) {
        if (dist[j] === -1 && canMove(holds[i], holds[j])) { dist[j] = dist[i] + 1; q.push(j); }
      }
    }
    return dist[holds.length - 1];
  }

  var puzzle = generate(dayKey);
  var dateLabel = today.toLocaleDateString(RA.locale, { day: 'numeric', month: 'long' });
  document.querySelectorAll('[data-day]').forEach(function (el) { el.textContent = dateLabel; });

  var path = [0], done = false, api;

  function draw() {
    var ctx = api.ctx, holds = puzzle.holds, cur = holds[path[path.length - 1]];
    RADraw.wall(ctx, W, H, 0);
    if (!done) {
      ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.setLineDash([4, 8]); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cur.x, cur.y, R, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    path.forEach(function (i, k) { var h = holds[i]; if (k) ctx.lineTo(h.x, h.y); else ctx.moveTo(h.x, h.y); });
    ctx.stroke();
    holds.forEach(function (h, i) {
      var used = path.indexOf(i) !== -1;
      var reach = !done && i !== path[path.length - 1] && !used && canMove(cur, h);
      var r = h.kind ? 30 : 22;
      RADraw.hold(ctx, h.x, h.y, r, h.rot, used ? '#fff' : reach ? 'rgba(255,255,255,.75)' : 'rgba(255,255,255,.22)', reach ? '#fff' : null);
      if (h.kind) RADraw.text(ctx, h.kind === 'top' ? 'TOP' : 'START', h.x + (h.kind === 'top' ? 0 : 0), h.y + (h.kind === 'top' ? 46 : 42), 13, { mono: true, weight: 500 });
    });
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(cur.x, cur.y - 4, 12, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#0a0a0a'; ctx.lineWidth = 3; ctx.stroke();
    api.hud(RA.t('Zetten: ', 'Moves: ') + (path.length - 1), dateLabel.toUpperCase());
  }

  function tap(p) {
    if (done) return;
    var holds = puzzle.holds, cur = holds[path[path.length - 1]], best = -1, bd = 48;
    holds.forEach(function (h, i) { var d = Math.hypot(h.x - p.x, h.y - p.y); if (d < bd) { bd = d; best = i; } });
    if (best === -1 || path.indexOf(best) !== -1) return;
    if (!canMove(cur, holds[best])) { RA.toast(holds[best].y > cur.y + 25 ? RA.t('Niet omlaag klimmen', 'No climbing down') : RA.t('Te ver, buiten je bereik', 'Too far, out of reach')); return; }
    path.push(best);
    if (best === holds.length - 1) {
      done = true;
      draw();
      var moves = path.length - 1, optimal = moves === puzzle.opt;
      setTimeout(function () {
        api.end({ score: moves, solved: true, optimal: optimal }, RA.t('Top in ', 'Top in ') + moves,
          optimal ? RA.t('Flash-beta. Korter kan niet. Morgen staat er een nieuwe wand.', 'Flash beta. It doesn\'t get shorter. A new wall tomorrow.') : RA.t('Het kan in ', 'It can be done in ') + puzzle.opt + RA.t(' zetten. Probeer het nog eens.', ' moves. Try again.'));
      }, 500);
    } else if (!puzzle.holds.some(function (h, i) { return path.indexOf(i) === -1 && canMove(holds[best], h); })) {
      RA.toast(RA.t('Vast. Doe een zet terug.', 'Stuck. Take a move back.'));
    }
    draw();
  }

  RAGame({
    id: 'beta', title: RA.t('Beta van de dag', 'Beta of the Day'), width: W, height: H,
    intro: RA.t('Tik op een greep binnen je bereik (de stippelcirkel). Omlaag mag niet. Haal de top in zo min mogelijk zetten.', 'Tap a hold within your reach (the dotted circle). No going down. Reach the top in as few moves as you can.'),
    preview: function (g) { api = g; draw(); },
    start: function (g) {
      api = g; path = [0]; done = false;
      g.onDown(tap);
      g.loop(function () {});
      draw();
    }
  });

  document.querySelector('[data-undo]').addEventListener('click', function () { if (!done && path.length > 1) { path.pop(); draw(); } });
  document.querySelector('[data-restart]').addEventListener('click', function () { if (!done) { path = [0]; draw(); } });
})();
