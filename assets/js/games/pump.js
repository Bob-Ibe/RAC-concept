/* Pump: tik de juiste hand. Kleine grepen pompen je onderarmen vol, op grote grepen rust je uit. */
(function () {
  var api, press = null;
  RAGame({
    id: 'pump', title: 'Pump', width: 600, height: 800,
    intro: RA.t('De volgende greep zegt welke hand: links of rechts. Gebruik de knoppen of je pijltjestoetsen. Op een grote greep (RUST) loopt je pomp leeg, maar de klok loopt door. Je hebt 45 seconden.', 'The next hold tells you which hand: left or right. Use the buttons or your arrow keys. On a big hold (REST) your pump drains, but the clock keeps running. You have 45 seconds.'),
    preview: function (g) { RADraw.wall(g.ctx, g.W, g.H, 0); },
    start: function (g) {
      api = g;
      var ctx = g.ctx, W = g.W, H = g.H, rnd = RADraw.rng(Date.now() & 0xffff);
      var route = [], moves = 0, pump = 0, clock = 45, scroll = 0, flash = null, over = false;
      var nextJug = 8;
      function add() {
        var n = route.length;
        var jug = n === nextJug;
        if (jug) nextJug = n + 8 + Math.floor(rnd() * 5);
        route.push({ hand: rnd() < 0.5 ? 'L' : 'R', jug: jug, rot: rnd() * 6 });
      }
      for (var i = 0; i < 14; i++) add();

      function hit(hand) {
        if (over) return;
        var next = route[moves + 1];
        if (next.hand === hand) {
          moves++; add();
          pump += 0.022;
          flash = null;
        } else {
          pump += 0.12;
          flash = { txt: RA.t('ANDERE HAND', 'WRONG HAND'), t: 0.5 };
        }
      }
      press = hit;
      g.onKey(function (e) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); hit('L'); }
        if (e.key === 'ArrowRight') { e.preventDefault(); hit('R'); }
      });
      g.onDown(function (p) { hit(p.x < W / 2 ? 'L' : 'R'); });

      g.loop(function (dt) {
        clock -= dt;
        var onJug = route[moves].jug;
        pump += onJug ? -0.38 * dt : 0.09 * dt;
        pump = Math.max(0, pump);
        scroll += (moves * 90 - scroll) * Math.min(1, dt * 12);
        if (flash) { flash.t -= dt; if (flash.t <= 0) flash = null; }
        if ((pump >= 1 || clock <= 0) && !over) {
          over = true;
          var why = pump >= 1 ? RA.t('Gepompt.', 'Pumped out.') : RA.t('Tijd.', 'Time.');
          g.end({ score: moves }, moves + ' ' + RA.t('zetten', 'moves'), why + ' ' + (moves < 30 ? RA.t('Haal 30 zetten voor de eerste visual.', 'Get 30 moves for the first visual.') : RA.t('Sterke onderarmen.', 'Strong forearms.')));
          return;
        }

        RADraw.wall(ctx, W, H, scroll);
        /* route */
        for (var i = Math.max(0, moves - 3); i < moves + 9 && i < route.length; i++) {
          var h = route[i];
          var x = W / 2 + (h.hand === 'L' ? -95 : 95);
          var y = H - 230 - (i * 90 - scroll);
          var r = h.jug ? 40 : 20;
          var isNext = i === moves + 1;
          RADraw.hold(ctx, x, y, r, h.rot, i <= moves ? '#fff' : isNext ? '#fff' : 'rgba(255,255,255,.3)', null);
          if (h.jug) RADraw.text(ctx, RA.t('RUST', 'REST'), x + (h.hand === 'L' ? -80 : 80), y, 13, { mono: true, weight: 500 });
          if (isNext) {
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(x, y, r + 18, 0, Math.PI * 2); ctx.stroke();
            RADraw.text(ctx, h.hand === 'L' ? RA.t('LINKS', 'LEFT') : RA.t('RECHTS', 'RIGHT'), x, y - r - 36, 16, { mono: true, weight: 500 });
          }
        }
        /* pompmeter */
        var bx = 24, by = 120, bh = H - 260;
        ctx.fillStyle = '#1d1d1b'; ctx.fillRect(bx, by, 16, bh);
        ctx.fillStyle = pump > 0.75 ? '#fff' : '#b9b9b5';
        ctx.fillRect(bx, by + bh * (1 - Math.min(1, pump)), 16, bh * Math.min(1, pump));
        ctx.save(); ctx.translate(bx + 8, by + bh + 28); RADraw.text(ctx, RA.t('POMP', 'PUMP'), 0, 0, 12, { mono: true, weight: 500 }); ctx.restore();
        if (onJug) RADraw.text(ctx, RA.t('UITSCHUDDEN...', 'SHAKING OUT...'), W / 2, H - 60, 16, { mono: true, weight: 500 });
        if (flash) RADraw.text(ctx, flash.txt, W / 2, 150, 44);
        g.hud(RA.t('Zetten: ', 'Moves: ') + moves, Math.max(0, clock).toFixed(1) + ' s');
      });
    }
  });
  document.querySelectorAll('[data-hand]').forEach(function (b) {
    b.addEventListener('pointerdown', function (e) { e.preventDefault(); if (press && api && api.running) press(b.getAttribute('data-hand')); });
  });
})();
