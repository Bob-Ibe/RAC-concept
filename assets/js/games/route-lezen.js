/* Route lezen: kijk hoe de route oplicht en tik hem daarna in dezelfde volgorde na. */
RAGame({
  id: 'route-lezen', title: RA.t('Route lezen', 'Read the Route'), width: 600, height: 800,
  intro: RA.t('Een route licht greep voor greep op. Daarna tik je hem in dezelfde volgorde na. Elke ronde komt er een greep bij. Eén fout en je valt.', 'A route lights up hold by hold. Then you tap it back in the same order. Every round adds a hold. One mistake and you fall.'),
  preview: function (g) { RADraw.wall(g.ctx, g.W, g.H, 0); },
  start: function (g) {
    var ctx = g.ctx, W = g.W, H = g.H, rnd = RADraw.rng(Date.now() & 0xffff);
    var holds = [];
    while (holds.length < 20) {
      var p = { x: 70 + rnd() * 460, y: 90 + rnd() * 640, rot: rnd() * 6 };
      if (holds.every(function (h) { return Math.hypot(h.x - p.x, h.y - p.y) > 105; })) holds.push(p);
    }
    var level = 1, route, phase, t, input, wrong = null, done = 0;
    function newRoute() {
      var len = level + 2, idx = holds.map(function (_, i) { return i; });
      for (var i = idx.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var tmp = idx[i]; idx[i] = idx[j]; idx[j] = tmp; }
      route = idx.slice(0, len).sort(function (a, b) { return holds[b].y - holds[a].y; });
      phase = 'show'; t = -0.6; input = [];
    }
    newRoute();
    var step = function () { return Math.max(0.38, 0.62 - level * 0.025); };

    g.onDown(function (p) {
      if (phase !== 'input') return;
      var best = -1, bd = 50;
      holds.forEach(function (h, i) { var d = Math.hypot(h.x - p.x, h.y - p.y); if (d < bd) { bd = d; best = i; } });
      if (best === -1) return;
      if (route[input.length] === best) {
        input.push(best);
        if (input.length === route.length) { phase = 'ok'; t = 0; done = level; }
      } else {
        wrong = best; phase = 'fail'; t = 0;
      }
    });

    g.loop(function (dt) {
      t += dt;
      if (phase === 'show' && t > route.length * step() + 0.2) { phase = 'input'; t = 0; }
      if (phase === 'ok' && t > 0.9) { level++; newRoute(); }
      if (phase === 'fail' && t > 1.1) {
        g.end({ score: done }, 'Level ' + done, done < 4 ? RA.t('Haal level 4 voor de eerste visual.', 'Reach level 4 for the first visual.') : RA.t('Goed gelezen. Dat scheelt pogingen op de echte wand.', 'Well read. That saves attempts on the real wall.'));
        return;
      }

      RADraw.wall(ctx, W, H, 0);
      var lit = phase === 'show' ? Math.floor(t / step()) : -1;
      var litOn = phase === 'show' && t >= 0 && (t % step()) < step() * 0.75;
      holds.forEach(function (h, i) {
        var k = route.indexOf(i);
        var fill = 'rgba(255,255,255,.28)';
        if (phase === 'show' && k === lit && litOn) fill = '#fff';
        if ((phase === 'input' || phase === 'ok' || phase === 'fail') && input.indexOf(i) !== -1) fill = '#fff';
        if (phase === 'fail' && i === wrong) fill = null;
        RADraw.hold(ctx, h.x, h.y, 26, h.rot, fill, phase === 'fail' && (i === wrong || i === route[input.length]) ? '#fff' : null);
        if (phase === 'fail' && i === route[input.length]) RADraw.text(ctx, RA.t('HIER', 'HERE'), h.x, h.y - 44, 13, { mono: true, weight: 500 });
        if (input.indexOf(i) !== -1) RADraw.text(ctx, String(input.indexOf(i) + 1), h.x, h.y + 2, 18, { color: '#0a0a0a' });
      });
      if (phase === 'show') RADraw.text(ctx, RA.t('KIJK GOED', 'WATCH CLOSELY'), W / 2, H - 36, 16, { mono: true, weight: 500 });
      if (phase === 'input') RADraw.text(ctx, RA.t('JOUW BEURT · ', 'YOUR TURN · ') + input.length + '/' + route.length, W / 2, H - 36, 16, { mono: true, weight: 500 });
      if (phase === 'ok') RADraw.text(ctx, 'TOP!', W / 2, H / 2, 90);
      g.hud('Level ' + level, route.length + ' ' + RA.t('grepen', 'holds'));
    });
  }
});
