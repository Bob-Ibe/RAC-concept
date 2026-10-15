/* Val goed: buig je knieën vlak voor je de mat raakt. Vijf vallen. */
RAGame({
  id: 'val-goed', title: RA.t('Val goed', 'Fall Well'), width: 600, height: 800,
  intro: RA.t('De klimmer laat los. Tik (of druk op spatie) vlak voordat de voeten de mat raken: knieën buigen en naar achteren rollen. Te vroeg of te laat telt niet. Je krijgt vijf vallen.', 'The climber lets go. Tap (or press space) just before the feet hit the mat: bend your knees and roll backwards. Too early or too late does not count. You get five falls.'),
  preview: function (g) { RADraw.wall(g.ctx, g.W, g.H, 0); },
  start: function (g) {
    var ctx = g.ctx, W = g.W, H = g.H, rnd = RADraw.rng(Date.now() & 0xffff);
    var MAT = 690, round = 0, good = 0, results = [];
    var st;
    var tips = RA.lang === 'en'
      ? ['Land on both feet.', 'Knees bent, arms in front of you.', 'Roll backwards, not onto your hands.', 'Look where you fall.', 'Almost always: breathe calmly and let go.']
      : ['Land op twee voeten.', 'Knieën gebogen, armen voor je.', 'Rol naar achteren, niet op je handen.', 'Kijk waar je valt.', 'Bijna altijd: rustig ademen en loslaten.'];
    var V = { early: RA.t('TE VROEG', 'TOO EARLY'), good: RA.t('GOED', 'GOOD'), late: RA.t('TE LAAT', 'TOO LATE') };
    function newRound() {
      st = { phase: 'hang', t: 0, wait: 0.7 + rnd() * 1.4, feet: 200 + rnd() * 230, v: 0, x: 200 + rnd() * 200, verdict: null, roll: 0 };
    }
    newRound();

    function act() {
      if (st.phase === 'hang') { st.verdict = V.early; st.phase = 'fall'; st.tapped = true; st.early = true; return; }
      if (st.phase !== 'fall' || st.tapped) return;
      st.tapped = true;
      var d = MAT - st.feet;
      if (d <= 50) st.verdict = 'PERFECT';
      else if (d <= 120) st.verdict = V.good;
      else { st.verdict = V.early; st.early = true; }
    }
    g.onDown(act);
    g.onKey(function (e) { if (e.code === 'Space' || e.key === 'Enter') { e.preventDefault(); act(); } });

    function figure(x, feet, pose, rot) {
      ctx.save();
      ctx.translate(x, feet);
      ctx.rotate(rot || 0);
      ctx.strokeStyle = '#fff'; ctx.fillStyle = '#fff'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      var crouch = pose === 'crouch';
      var hip = crouch ? -42 : -70, sh = crouch ? -95 : -140, head = crouch ? -118 : -165;
      ctx.beginPath(); ctx.moveTo(0, hip); ctx.lineTo(0, sh); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, head, 17, 0, Math.PI * 2); ctx.fill();
      if (crouch) {
        ctx.beginPath(); ctx.moveTo(0, hip); ctx.lineTo(24, -22); ctx.lineTo(4, 0); ctx.moveTo(0, hip); ctx.lineTo(-20, -22); ctx.lineTo(-6, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, sh + 8); ctx.lineTo(30, sh + 34); ctx.moveTo(0, sh + 8); ctx.lineTo(-26, sh + 36); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.moveTo(0, hip); ctx.lineTo(14, 0); ctx.moveTo(0, hip); ctx.lineTo(-14, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, sh + 6); ctx.lineTo(24, sh - 52); ctx.moveTo(0, sh + 6); ctx.lineTo(-24, sh - 52); ctx.stroke();
      }
      ctx.restore();
    }

    g.loop(function (dt) {
      st.t += dt;
      if (st.phase === 'hang' && st.t > st.wait) { st.phase = 'fall'; st.t = 0; }
      else if (st.phase === 'fall') {
        st.v += 1300 * dt;
        st.feet += st.v * dt;
        if (st.feet >= MAT) {
          st.feet = MAT; st.phase = 'land'; st.t = 0;
          if (!st.verdict) st.verdict = V.late;
          var ok = st.verdict === 'PERFECT' || st.verdict === V.good;
          if (ok) good++;
          results.push(ok);
        }
      } else if (st.phase === 'land') {
        if (st.t > 1.5) {
          round++;
          if (round >= 5) {
            g.end({ score: good }, good + RA.t(' van 5 goed', ' of 5 clean'), good === 5 ? RA.t('Vijf keer netjes geland. Dit leer je ook in de introductieles.', 'Five clean landings. You learn this in the intro session too.') : 'Tip: ' + tips[round % tips.length]);
            return;
          }
          newRound();
        }
      }

      RADraw.wall(ctx, W, H, 0);
      /* wand-grepen */
      [[150, 180, 1], [420, 140, 2], [300, 260, 3], [180, 360, 4], [450, 330, 5]].forEach(function (h) { RADraw.hold(ctx, h[0], h[1], 18, h[2], 'rgba(255,255,255,.25)'); });
      /* mat */
      ctx.fillStyle = '#e6e6e3'; ctx.fillRect(30, MAT, W - 60, 70);
      ctx.fillStyle = '#b9b9b5'; for (var i = 1; i < 4; i++) ctx.fillRect(30 + (W - 60) / 4 * i - 1, MAT, 2, 70);
      RADraw.text(ctx, RA.t('VALMAT', 'CRASH MAT'), W / 2, MAT + 36, 13, { mono: true, weight: 500, color: '#0a0a0a' });

      var ok2 = st.verdict === 'PERFECT' || st.verdict === V.good;
      if (st.phase === 'hang') {
        RADraw.hold(ctx, st.x, st.feet - 200, 22, 0.4, '#fff');
        figure(st.x, st.feet + Math.sin(st.t * 5) * 2, 'hang');
        if (st.t > st.wait - 0.35) RADraw.text(ctx, RA.t('LOS!', 'LET GO!'), W / 2, 90, 54);
      } else if (st.phase === 'fall') {
        figure(st.x, st.feet, st.tapped && !st.early ? 'crouch' : 'hang');
      } else {
        var roll = ok2 ? Math.min(1, st.t / 0.45) : 0;
        figure(st.x - roll * 40, MAT - (ok2 ? 0 : 0), ok2 ? 'crouch' : 'hang', ok2 ? -roll * 1.3 : 0);
        if (!ok2) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; for (var k = 0; k < 5; k++) { var a = Math.PI + k * Math.PI / 4; ctx.beginPath(); ctx.moveTo(st.x + Math.cos(a) * 40, MAT + Math.sin(a) * 10); ctx.lineTo(st.x + Math.cos(a) * 70, MAT + Math.sin(a) * 30 - 10); ctx.stroke(); } }
        RADraw.text(ctx, st.verdict, W / 2, 110, 64);
        RADraw.text(ctx, ok2 ? RA.t('Knieën gebogen, weggerold.', 'Knees bent, rolled away.') : st.verdict === V.late ? RA.t('Stijve landing. Eerder buigen.', 'Stiff landing. Bend sooner.') : RA.t('Je zakte al door voor de landing.', 'You crouched before the landing.'), W / 2, 170, 15, { mono: true, weight: 500 });
      }
      g.hud(RA.t('Val ', 'Fall ') + Math.min(5, round + 1) + RA.t(' van 5', ' of 5'), RA.t('Goed: ', 'Clean: ') + good);
    });
  }
});
