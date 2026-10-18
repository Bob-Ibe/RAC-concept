/* Rise Above Creators: gedeelde logica.
   Demo-versie: alle gegevens staan in de browser (localStorage). In de echte versie komt dit uit een database.
   Tweetalig: de taal volgt <html lang>. Nederlandse pagina's staan in de root, Engelse onder /en/. */
(function () {
  'use strict';

  var root = document.body.getAttribute('data-root') || './';          // naar de projectmap (voor assets)
  var page = document.body.getAttribute('data-page') || '';
  var path = document.body.getAttribute('data-path') || 'index.html';  // deze pagina, gezien vanaf de taalmap
  var LANG = (document.documentElement.lang || 'nl').slice(0, 2) === 'en' ? 'en' : 'nl';
  var LOCALE = LANG === 'en' ? 'en-GB' : 'nl-NL';
  var pageRoot = root + (LANG === 'en' ? 'en/' : '');                   // naar de pagina's in deze taal
  function t(nl, en) { return LANG === 'en' ? en : nl; }

  /* ---------- spelregels (voorstel, af te stemmen met de hal) ---------- */
  var RULES = {
    pointsPer1000: 10,      // 1.000 views = 10 punten
    tagBonus: 0.25,         // +25% als @the_climbingcorner getagd is of als samenwerking geplaatst
    newVisitor: 150,        // nieuwe bezoeker die jouw code noemt aan de balie
    monthCap: 600,          // maximaal aantal punten per maker per maand
    pointValue: 0.10        // 1 punt = € 0,10 aan klimtegoed (interne rekenwaarde)
  };

  /* prijzen komen van theclimbingcorner.com (volwassene) */
  var REWARDS = [
    { id: 'schoenen', title: t('Schoenhuur', 'Shoe rental'), cost: 35, note: t('Eén keer klimschoenen huren.', 'Rent climbing shoes once.') },
    { id: 'dag', title: t('Dagentree', 'Day pass'), cost: 137, note: t('Eén dag onbeperkt klimmen.', 'A full day of climbing.') },
    { id: 'intro', title: t('Introductieles voor een vriend', 'Intro session for a friend'), cost: 250, note: t('Zaterdag 13:00 - 14:30, entree en schoenhuur inbegrepen.', 'Saturday 13:00 - 14:30, entry and shoe rental included.') },
    { id: 'maand', title: t('Maand abonnement', 'Monthly membership'), cost: 498, note: t('Eén maand klimmen, verrekend met je abonnement.', 'One month of climbing, credited to your membership.') },
    { id: 'strip', title: t('10-strippenkaart', '10-strip card'), cost: 1233, note: t('Tien keer klimmen, twaalf maanden geldig.', 'Ten visits, valid for twelve months.') }
  ];

  var GAMES = [
    { id: 'top-out', title: 'Top-out', unit: t('grepen', 'holds'), tiers: [{ min: 10, unlock: 'klim-mee' }, { min: 25, unlock: 'logo-neon' }],
      blurb: t('Klim van greep naar greep. Tik als je bereik goed staat, voordat je grip op is.', 'Climb from hold to hold. Tap when your reach lines up, before your grip runs out.') },
    { id: 'beta', title: t('Beta van de dag', 'Beta of the Day'), unit: t('zetten', 'moves'), lowerIsBetter: true, tiers: [{ solve: true, unlock: 'eerste-keer' }, { optimal: true, unlock: 'logo-code' }],
      blurb: t('Elke dag een nieuwe wand. Vind de route naar de top in zo min mogelijk zetten.', 'A new wall every day. Find the route to the top in as few moves as you can.') },
    { id: 'pump', title: 'Pump', unit: t('zetten', 'moves'), tiers: [{ min: 30, unlock: 'poging-teller' }, { min: 60, unlock: 'logo-krijt' }],
      blurb: t('Links, rechts, links. Je onderarmen lopen vol. Rust op de grote grepen, maar de klok loopt door.', 'Left, right, left. Your forearms fill up. Rest on the big holds, but the clock keeps ticking.') },
    { id: 'val-goed', title: t('Val goed', 'Fall Well'), unit: t('goed', 'clean landings'), tiers: [{ min: 3, unlock: 'logo-raster' }, { min: 5, unlock: 'logo-glitch' }],
      blurb: t('Vallen hoort erbij. Buig je knieën op het juiste moment en rol weg op de mat.', 'Falling is part of it. Bend your knees at the right moment and roll away on the mat.') },
    { id: 'route-lezen', title: t('Route lezen', 'Read the Route'), unit: 'level', tiers: [{ min: 4, unlock: 'logo-strepen' }, { min: 7, unlock: 'rise-opener' }],
      blurb: t('Kijk hoe de route oplicht en klim hem daarna uit je hoofd na. Elke ronde een greep langer.', 'Watch the route light up, then climb it from memory. One hold longer every round.') }
  ];

  var IBE = 'Motion: IBE MOTION';
  /* vijf visuals die mensen naar de hal halen, zes logo-animaties */
  var VAULT = [
    { id: 'eindkaart', title: t('Eindkaart met jouw code', 'End card with your code'), kind: 'Outro', group: 'mat', free: true, personal: true, note: t('Altijd als laatste shot. Hier komen nieuwe bezoekers vandaan.', 'Always your last shot. This is where new visitors come from.') },
    { id: 'eerste-keer', title: t('Nog nooit geboulderd?', 'Never bouldered?'), kind: 'Outro', group: 'mat', note: t('Voor vrienden die nog nooit geklommen hebben. Sluit af met de introductieles.', 'For friends who have never climbed. Ends with the intro session.') },
    { id: 'klim-mee', title: t('Wie gaat er mee?', "Who's coming?"), kind: 'Outro', group: 'mat', note: t('Zet hem aan het eind en tag een maat die mee moet.', 'Put it at the end and tag a friend who should come along.') },
    { id: 'poging-teller', title: t('Poging-teller', 'Attempt counter'), kind: t('Intro of outro', 'Intro or outro'), group: 'mat', note: t('Voor dat ene project dat je eindelijk haalt. Eindigt met: jouw beurt.', 'For that one project you finally send. Ends with: your turn.') },
    { id: 'rise-opener', title: 'Rise Above opener', kind: 'Intro', group: 'mat', note: t('Zet aan het begin van je video.', 'Put it at the start of your video.') },
    { id: 'logo-neon', title: t('Neon-logo', 'Neon logo'), kind: t('Intro of outro', 'Intro or outro'), group: 'logo', note: t('Het logo flikkert aan als een neonbord en kleurt van oranje naar rood.', 'The logo flickers on like a neon sign and turns from orange to red.') },
    { id: 'logo-krijt', title: t('Krijtwolk', 'Chalk cloud'), kind: 'Intro', group: 'logo', note: t('Een wolk magnesium die neerdaalt tot het logo.', 'A cloud of chalk that settles into the logo.') },
    { id: 'logo-raster', title: t('Gedrukt logo', 'Print logo'), kind: t('Intro of outro', 'Intro or outro'), group: 'logo', note: t('Het logo in rasterpunten, als een zeefdrukposter.', 'The logo in halftone dots, like a screen-printed poster.') },
    { id: 'logo-glitch', title: 'Glitch', kind: t('Overgang', 'Transition'), group: 'logo', note: t('Het logo hapert als een oude videoband.', 'The logo stutters like an old video tape.') },
    { id: 'logo-code', title: t('Code-logo', 'Code logo'), kind: 'Intro', group: 'logo', note: t('Het logo bouwt zich op uit letters en tekens.', 'The logo builds itself out of characters.') },
    { id: 'logo-strepen', title: t('Strepen-overgang', 'Stripe transition'), kind: t('Overgang', 'Transition'), group: 'logo', note: t('Het logo schuift in stroken binnen en weer weg.', 'The logo slides in and out in strips.') }
  ];
  /* visuals met tekst erin hebben een Engelse versie (bestandsnaam eindigt op -en) */
  var LOCALIZED = ['eindkaart', 'poging-teller', 'eerste-keer', 'klim-mee'];
  VAULT.forEach(function (v) {
    var file = v.id + (LANG === 'en' && LOCALIZED.indexOf(v.id) !== -1 ? '-en' : '');
    v.credit = IBE;
    v.src = root + 'assets/video/' + file + '.mp4';
    v.download = root + 'assets/video/' + file + '-1080.mp4';
    v.poster = root + 'assets/poster/' + file + '.jpg';
    GAMES.forEach(function (g) {
      g.tiers.forEach(function (tier) { if (tier.unlock === v.id) { v.game = g; v.tier = tier; } });
    });
  });

  /* fictieve makers voor de demo */
  var DEMO_CREATORS = [
    { name: 'Lotte', handle: '@lotte.sends', code: 'LOTTE', points: 540 },
    { name: 'Sem', handle: '@sem_klimt', code: 'SEM', points: 465 },
    { name: 'Noor', handle: '@noorophoogte', code: 'NOOR', points: 380 },
    { name: 'Jens', handle: '@jens.boulders', code: 'JENS', points: 290 },
    { name: 'Mila', handle: '@mila.chalk', code: 'MILA', points: 215 },
    { name: 'Daan', handle: '@daan.dyno', code: 'DAAN', points: 160 },
    { name: 'Yara', handle: '@yara.on.the.wall', code: 'YARA', points: 95 },
    { name: 'Ruben', handle: '@rubenhangt', code: 'RUBEN', points: 40 }
  ];
  var DEMO_PENDING = [
    { id: 'd1', who: 'Noor', handle: '@noorophoogte', url: 'https://www.instagram.com/reel/demo-noor', views: 8400, tagged: true, status: 'pending', date: '2026-10-08' },
    { id: 'd2', who: 'Daan', handle: '@daan.dyno', url: 'https://www.instagram.com/reel/demo-daan', views: 2150, tagged: false, status: 'pending', date: '2026-10-09' },
    { id: 'd3', who: 'Mila', handle: '@mila.chalk', url: 'https://www.instagram.com/reel/demo-mila', views: 12900, tagged: true, status: 'pending', date: '2026-10-09' }
  ];

  /* ---------- state (gedeeld door beide talen) ---------- */
  var KEY = 'rac-demo-v1';
  function fresh() {
    return { user: null, points: 0, monthPoints: 0, visitors: 0, unlocked: ['eindkaart'], best: {}, submissions: [], vouchers: [], others: JSON.parse(JSON.stringify(DEMO_PENDING)), creators: JSON.parse(JSON.stringify(DEMO_CREATORS)) };
  }
  var state;
  try { state = JSON.parse(localStorage.getItem(KEY)) || fresh(); } catch (e) { state = fresh(); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* demo werkt ook zonder opslag */ } }
  function reset() { state = fresh(); save(); location.reload(); }

  function pointsFor(views, tagged) {
    var base = views / 1000 * RULES.pointsPer1000;
    return Math.round(base * (tagged ? 1 + RULES.tagBonus : 1));
  }
  function addPoints(n) {
    var room = Math.max(0, RULES.monthCap - state.monthPoints);
    var got = Math.min(n, room);
    state.points += got; state.monthPoints += got;
    save();
    return got;
  }
  function euro(n) { return LANG === 'en' ? '€' + n.toFixed(2) : '€ ' + n.toFixed(2).replace('.', ','); }
  function fmt(n) { return Math.round(n).toLocaleString(LOCALE); }
  function pts(n) { return fmt(n) + ' ' + t('punten', 'points'); }

  /* ---------- ontgrendelen ---------- */
  function isUnlocked(id) { return state.unlocked.indexOf(id) !== -1; }
  function unlock(id) {
    if (isUnlocked(id)) return null;
    state.unlocked.push(id); save();
    return VAULT.filter(function (v) { return v.id === id; })[0];
  }
  /* result: {score} of {solved, optimal} */
  function reportGame(gameId, result) {
    var g = GAMES.filter(function (x) { return x.id === gameId; })[0];
    var prev = state.best[gameId];
    var better = prev === undefined || (g.lowerIsBetter ? result.score < prev : result.score > prev);
    if (result.score !== undefined && better && (!g.lowerIsBetter || result.solved)) state.best[gameId] = result.score;
    var got = [];
    g.tiers.forEach(function (tier) {
      var ok = (tier.min !== undefined && result.score >= tier.min) || (tier.solve && result.solved) || (tier.optimal && result.optimal);
      if (ok) { var v = unlock(tier.unlock); if (v) got.push(v); }
    });
    save();
    return got;
  }
  function tierText(tier, g) {
    if (tier.solve) return t('Los de puzzel van vandaag op', 'Solve today\'s puzzle');
    if (tier.optimal) return t('Los hem op in het minste aantal zetten', 'Solve it in the fewest moves');
    if (g.id === 'route-lezen') return t('Haal level ', 'Reach level ') + tier.min;
    return t('Haal ', 'Get ') + tier.min + ' ' + g.unit;
  }

  /* ---------- header en footer ---------- */
  var NAV = [
    ['spellen', t('Spellen', 'Games'), 'spellen/index.html'],
    ['kluis', t('Kluis', 'Vault'), 'kluis/index.html'],
    ['ranglijst', t('Ranglijst', 'Leaderboard'), 'ranglijst/index.html'],
    ['beloningen', t('Beloningen', 'Rewards'), 'beloningen/index.html'],
    ['dashboard', t('Mijn crew', 'My crew'), 'dashboard/index.html']
  ];
  /* dezelfde pagina in de andere taal */
  var otherLang = LANG === 'en' ? 'nl' : 'en';
  var switchHref = root + (LANG === 'en' ? '' : 'en/') + path;
  function langLink(cls) {
    return '<a class="' + cls + '" href="' + switchHref + '" hreflang="' + otherLang + '" lang="' + otherLang + '" aria-label="' +
      t('Switch to English', 'Schakel naar Nederlands') + '">' + otherLang.toUpperCase() + '</a>';
  }
  function header() {
    var el = document.querySelector('[data-header]');
    if (!el) return;
    var links = NAV.map(function (n) {
      return '<a href="' + pageRoot + n[2] + '"' + (page === n[0] ? ' aria-current="page"' : '') + '>' + n[1] + '</a>';
    }).join('');
    var pill = state.user
      ? '<a class="points-pill" href="' + pageRoot + 'dashboard/index.html">' + pts(state.points) + '</a>'
      : '<a class="points-pill" href="' + pageRoot + 'dashboard/index.html">' + t('Doe mee', 'Join') + '</a>';
    el.innerHTML =
      '<div class="demo-bar">' + t('Prototype · alle gegevens zijn voorbeelddata en blijven in je browser', 'Prototype · all data is sample data and stays in your browser') + '</div>' +
      '<header class="site-header"><div class="container">' +
      '<a class="brand" href="' + pageRoot + 'index.html"><img src="' + root + 'assets/img/logo-mark.png" alt="" width="34" height="34"><span>Rise Above Creators<small>The Climbing Corner</small></span></a>' +
      langLink('lang-switch lang-switch--bar') +
      '<button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav">' + t('Menu', 'Menu') + '</button>' +
      '<nav class="nav" id="nav" aria-label="' + t('Hoofdmenu', 'Main menu') + '">' + links + pill + '</nav>' +
      '</div></header>';
    var btn = el.querySelector('.menu-btn'), nav = el.querySelector('.nav');
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open);
      btn.textContent = open ? t('Sluit', 'Close') : t('Menu', 'Menu');
    });
  }
  function footer() {
    var el = document.querySelector('[data-footer]');
    if (!el) return;
    el.innerHTML =
      '<footer class="site-footer"><div class="container">' +
      '<div><div class="wordmark">Rise Above<br>Creators</div><p class="mono" style="margin-top:14px">' + t('Een programma van The Climbing Corner', 'A programme by The Climbing Corner') + '<br>In de Cramer 14, Heerlen</p></div>' +
      '<div><p class="mono">' + t('Programma', 'Programme') + '</p>' + NAV.map(function (n) { return '<a href="' + pageRoot + n[2] + '">' + n[1] + '</a>'; }).join('') + '</div>' +
      '<div><p class="mono">' + t('Achter de schermen', 'Behind the scenes') + '</p><a href="' + pageRoot + 'admin/index.html">' + t('Beheer (voor de hal)', 'Admin (for the gym)') + '</a><a href="' + pageRoot + 'pitch/index.html">' + t('Het voorstel', 'The proposal') + '</a><a href="https://www.instagram.com/the_climbingcorner" rel="noopener">@the_climbingcorner</a>' +
      langLink('lang-switch') +
      '<button class="btn btn--small" type="button" data-reset style="margin-top:14px">' + t('Prototype opnieuw starten', 'Restart the prototype') + '</button></div>' +
      '</div></footer>';
    el.querySelector('[data-reset]').addEventListener('click', function () {
      if (confirm(t('Alle voorbeeldgegevens wissen en opnieuw beginnen?', 'Clear all sample data and start again?'))) reset();
    });
  }

  var toastEl;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function () { toastEl.classList.remove('is-on'); }, 3200);
  }

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  window.RA = {
    root: root, pageRoot: pageRoot, lang: LANG, locale: LOCALE, t: t,
    RULES: RULES, REWARDS: REWARDS, GAMES: GAMES, VAULT: VAULT,
    get state() { return state; }, save: save, reset: reset,
    pointsFor: pointsFor, addPoints: addPoints, euro: euro, fmt: fmt, pts: pts, esc: esc,
    isUnlocked: isUnlocked, unlock: unlock, reportGame: reportGame, tierText: tierText, toast: toast,
    refreshHeader: header
  };

  header();
  footer();
})();
