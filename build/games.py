"""Maakt de spelpagina's en het overzicht, in het Nederlands en het Engels.
  NL: spellen/<id>/index.html en spellen/index.html
  EN: en/spellen/<id>/index.html en en/spellen/index.html
Gebruik vanuit de projectmap: python3 build/games.py
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

HEAD = """<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} · Rise Above Creators</title>
<link rel="icon" href="{root}assets/img/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{root}assets/css/main.css">
</head>
<body data-root="{root}" data-page="spellen" data-path="{path}">
<div data-header></div>
<main>
"""
FOOT = """</main>
<div data-footer></div>
<script src="{root}assets/js/app.js"></script>
{scripts}
</body>
</html>
"""

# eenvoudige iconen in lijnstijl
ART = {
    'top-out': '<svg viewBox="0 0 200 150" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M70 140 L110 105 L80 70 L120 40 L100 12" stroke-dasharray="2 12"/><circle cx="110" cy="105" r="9" fill="currentColor"/><circle cx="80" cy="70" r="9" fill="currentColor"/><circle cx="120" cy="40" r="9"/><circle cx="100" cy="12" r="6"/></svg>',
    'beta': '<svg viewBox="0 0 200 150" fill="none" stroke="currentColor" stroke-width="4"><circle cx="60" cy="125" r="8" fill="currentColor"/><circle cx="95" cy="95" r="7"/><circle cx="140" cy="110" r="7"/><circle cx="75" cy="60" r="7"/><circle cx="130" cy="65" r="7"/><circle cx="105" cy="22" r="9" fill="currentColor"/><circle cx="60" cy="125" r="48" stroke-dasharray="3 7" stroke-width="2"/></svg>',
    'pump': '<svg viewBox="0 0 200 150" fill="none" stroke="currentColor" stroke-width="4"><rect x="34" y="20" width="16" height="110"/><rect x="34" y="70" width="16" height="60" fill="currentColor"/><circle cx="100" cy="110" r="9" fill="currentColor"/><circle cx="150" cy="80" r="9"/><circle cx="100" cy="50" r="15"/><circle cx="150" cy="20" r="9"/></svg>',
    'val-goed': '<svg viewBox="0 0 200 150" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><circle cx="100" cy="40" r="11" fill="currentColor"/><path d="M100 54 V80 M100 80 L118 98 L104 112 M100 80 L84 98 L96 112 M100 62 L122 76 M100 62 L78 78"/><rect x="30" y="118" width="140" height="22" fill="currentColor" stroke="none"/></svg>',
    'route-lezen': '<svg viewBox="0 0 200 150" fill="none" stroke="currentColor" stroke-width="4"><circle cx="50" cy="120" r="10" fill="currentColor"/><circle cx="110" cy="105" r="10" fill="currentColor"/><circle cx="80" cy="60" r="10"/><circle cx="145" cy="45" r="10"/><circle cx="160" cy="110" r="10"/><circle cx="40" cy="35" r="10"/><text x="46" y="125" font-size="13" fill="#0a0a0a" stroke="none" font-family="monospace">1</text><text x="106" y="110" font-size="13" fill="#0a0a0a" stroke="none" font-family="monospace">2</text></svg>',
}

# vaste teksten per taal
UI = {
    'nl': {
        'extra': {
            'beta': '<div class="controls"><button class="btn" type="button" data-undo>Zet terug</button><button class="btn" type="button" data-restart>Opnieuw</button></div>',
            'pump': '<div class="controls"><button class="btn btn--solid" type="button" data-hand="L">Links</button><button class="btn btn--solid" type="button" data-hand="R">Rechts</button></div>',
        },
        'all': '← Alle spellen', 'field': 'Speelveld', 'how': 'Zo speel je', 'unlock': 'Vrij te spelen', 'vault': 'Naar de kluis',
        'hub_title': 'Spellen', 'hub_eyebrow': 'Vijf spellen · tien visuals',
        'hub_lead': 'Elk spel gaat over iets wat je echt doet op de mat. Haal de score en de visual komt in je kluis.',
    },
    'en': {
        'extra': {
            'beta': '<div class="controls"><button class="btn" type="button" data-undo>Undo</button><button class="btn" type="button" data-restart>Restart</button></div>',
            'pump': '<div class="controls"><button class="btn btn--solid" type="button" data-hand="L">Left</button><button class="btn btn--solid" type="button" data-hand="R">Right</button></div>',
        },
        'all': '← All games', 'field': 'Game area', 'how': 'How to play', 'unlock': 'To unlock', 'vault': 'Go to the vault',
        'hub_title': 'Games', 'hub_eyebrow': 'Five games · ten visuals',
        'hub_lead': 'Every game is about something you really do on the mat. Hit the score and the visual goes into your vault.',
    },
}

GAMES = [
    ('top-out',
     {'nl': ('Top-out', 'Klim van greep naar greep.', ['Kijk naar de bereikmeter onderaan.', 'Tik als het blokje in het witte vak staat.', 'Raak: je pakt de greep en je grip laadt op.', 'Mis: je glijdt en verliest grip.', 'Hoe hoger, hoe sneller en smaller.']),
      'en': ('Top-out', 'Climb from hold to hold.', ['Watch the reach meter at the bottom.', 'Tap when the marker is in the white zone.', 'Hit: you catch the hold and your grip recovers.', 'Miss: you slip and lose grip.', 'The higher you get, the faster and narrower it gets.'])}),
    ('beta',
     {'nl': ('Beta van de dag', 'Puzzel van <span data-day></span>. Iedereen krijgt dezelfde wand.', ['Je start onderaan bij START.', 'Tik op een greep binnen je stippelcirkel.', 'Omlaag klimmen mag niet.', 'Haal de TOP in zo min mogelijk zetten.', 'Morgen staat er een nieuwe wand.']),
      'en': ('Beta of the Day', 'Puzzle for <span data-day></span>. Everyone gets the same wall.', ['You start at the bottom, at START.', 'Tap a hold inside your dotted circle.', 'No climbing down.', 'Reach the TOP in as few moves as you can.', 'A new wall tomorrow.'])}),
    ('pump',
     {'nl': ('Pump', 'Hou het vol tot de klok op nul staat.', ['Tik de hand die bij de volgende greep staat.', 'Op kleine grepen loopt je pomp vol.', 'Op een RUST-greep schud je uit.', 'Andere hand gekozen? Extra pomp.', 'Pomp vol of tijd op: einde.']),
      'en': ('Pump', 'Hang on until the clock hits zero.', ['Tap the hand shown at the next hold.', 'Small holds fill up your pump.', 'On a REST hold you shake out.', 'Wrong hand? Extra pump.', 'Fully pumped or out of time: game over.'])}),
    ('val-goed',
     {'nl': ('Val goed', 'Veilig vallen is de eerste les in boulderen.', ['Wacht tot de klimmer loslaat.', 'Tik vlak voor de voeten de mat raken.', 'Te vroeg of te laat telt niet.', 'Vijf vallen per ronde.']),
      'en': ('Fall Well', 'Falling safely is the first lesson in bouldering.', ['Wait for the climber to let go.', 'Tap just before the feet hit the mat.', 'Too early or too late does not count.', 'Five falls per round.'])}),
    ('route-lezen',
     {'nl': ('Route lezen', 'Goede klimmers lezen een route voordat ze beginnen.', ['Kijk hoe de route greep voor greep oplicht.', 'Tik daarna dezelfde grepen in dezelfde volgorde.', 'Elke ronde komt er een greep bij.', 'Eén fout en je valt.']),
      'en': ('Read the Route', 'Good climbers read a route before they start.', ['Watch the route light up hold by hold.', 'Then tap the same holds in the same order.', 'Every round adds a hold.', 'One mistake and you fall.'])}),
]


def base(lang):
    return ROOT / ('en' if lang == 'en' else '')


def game_page(lang, gid, texts):
    title, sub, howto = texts[lang]
    u = UI[lang]
    root = '../../../' if lang == 'en' else '../../'
    html = HEAD.format(title=title, root=root, lang=lang, path=f'spellen/{gid}/index.html')
    html += f"""  <section class="page-hero" style="padding-bottom:28px">
    <div class="container">
      <a class="eyebrow" href="../index.html">{u['all']}</a>
      <h1 style="font-size:clamp(48px,9vw,112px)">{title}</h1>
      <p class="lead">{sub}</p>
    </div>
  </section>
  <section class="section section--tight">
    <div class="container game-wrap">
      <div>
        <div class="stage" data-stage>
          <canvas aria-label="{u['field']} {title}"></canvas>
          <div class="hud"><span data-hud-l></span><span data-hud-r></span></div>
          <div class="overlay"></div>
        </div>
        {u['extra'].get(gid, '')}
      </div>
      <aside class="side card">
        <h3>{u['how']}</h3>
        <ol>{''.join(f'<li>{h}</li>' for h in howto)}</ol>
        <h3 style="margin-top:8px">{u['unlock']}</h3>
        <ul class="unlock-list" data-unlocks></ul>
        <p class="best" data-best style="margin-top:16px"></p>
        <a class="btn btn--small" href="../../kluis/index.html">{u['vault']}</a>
      </aside>
    </div>
  </section>
"""
    scripts = f'<script src="{root}assets/js/game-shell.js"></script>\n<script src="{root}assets/js/games/{gid}.js"></script>'
    html += FOOT.format(root=root, scripts=scripts)
    out = base(lang) / 'spellen' / gid / 'index.html'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding='utf-8')


def hub(lang):
    u = UI[lang]
    root = '../../' if lang == 'en' else '../'
    html = HEAD.format(title=u['hub_title'], root=root, lang=lang, path='spellen/index.html')
    cards = ''
    for i, (gid, texts) in enumerate(GAMES, 1):
        title = texts[lang][0]
        cards += f"""      <a class="card game-card" href="{gid}/index.html" data-game="{gid}">
        <div class="art"><span class="idx">0{i}</span>{ART[gid]}</div>
        <div class="body"><h3>{title}</h3><p data-blurb></p><ul class="unlock-list" data-unlocks></ul><span class="best" data-best></span></div>
      </a>
"""
    html += f"""  <section class="page-hero">
    <div class="container">
      <span class="eyebrow">{u['hub_eyebrow']}</span>
      <h1>{u['hub_title']}</h1>
      <p class="lead">{u['hub_lead']}</p>
    </div>
  </section>
  <section class="section section--tight">
    <div class="container">
      <div class="grid grid--3">
{cards}      </div>
    </div>
  </section>
"""
    script = """<script>
document.querySelectorAll('[data-game]').forEach(function (card) {
  var g = RA.GAMES.filter(function (x) { return x.id === card.getAttribute('data-game'); })[0];
  card.querySelector('[data-blurb]').textContent = g.blurb;
  card.querySelector('[data-unlocks]').innerHTML = g.tiers.map(function (t) {
    var v = RA.VAULT.filter(function (x) { return x.id === t.unlock; })[0];
    return '<li class="' + (RA.isUnlocked(v.id) ? 'done' : '') + '">' + RA.esc(v.title) + '</li>';
  }).join('');
  var b = RA.state.best[g.id];
  card.querySelector('[data-best]').textContent = b === undefined ? RA.t('Nog niet gespeeld', 'Not played yet') : RA.t('Beste: ', 'Best: ') + b + ' ' + g.unit;
});
</script>"""
    html += FOOT.format(root=root, scripts=script)
    out = base(lang) / 'spellen' / 'index.html'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding='utf-8')


if __name__ == '__main__':
    for lang in ('nl', 'en'):
        for gid, texts in GAMES:
            game_page(lang, gid, texts)
        hub(lang)
    print('spellen gebouwd (nl + en):', ', '.join(g[0] for g in GAMES))
