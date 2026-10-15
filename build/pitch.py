"""Maakt de pitchpagina in het Nederlands (pitch/index.html) en het Engels (en/pitch/index.html).
Elke tekst staat hier als paar: (Nederlands, Engels).
Gebruik vanuit de projectmap: python3 build/pitch.py
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

STYLE = """<style>
  .p-top { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 18px 0; border-bottom: 1px solid var(--line); }
  .p-top .p-actions { display: flex; gap: 10px; align-items: center; }
  .sum { font-family: var(--mono); font-size: 14px; line-height: 1.9; }
  .sum .line { display: flex; justify-content: space-between; gap: 16px; border-bottom: 1px dashed var(--grey-2); padding: 4px 0; }
  .sum .total { font-weight: 500; border-bottom: 2px solid var(--ink); }
  .vs { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .vs .card .big { font-weight: 800; font-stretch: 75%; font-size: clamp(44px, 7vw, 80px); line-height: .9; }
  .tl { list-style: none; padding: 0; margin: 0; border-top: 1.5px solid var(--ink); }
  .tl li { display: grid; grid-template-columns: 140px 1fr; gap: 16px; padding: 16px 0; border-bottom: 1px solid var(--line); }
  .tl .mono { padding-top: 4px; }
  .compare { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .compare ul { list-style: none; padding: 0; margin: 14px 0 0; }
  .compare li { padding: 10px 0; border-top: 1px solid rgba(255,255,255,.16); }
  .compare .card--light li { border-color: var(--line); }
  @media (max-width: 620px) { .vs, .compare { grid-template-columns: 1fr; } .tl li { grid-template-columns: 1fr; gap: 4px; } }
  @media print {
    .p-top .btn, .p-top .lang-switch, .no-print { display: none !important; }
    .section { padding: 28px 0; break-inside: avoid; }
    .hero { padding-top: 28px; }
  }
</style>"""


def page(lang):
    L = 0 if lang == 'nl' else 1
    root = '../../' if lang == 'en' else '../'

    def t(nl, en):
        return (nl, en)[L]

    other = 'en' if lang == 'nl' else 'nl'
    switch = root + ('en/' if lang == 'nl' else '') + 'pitch/index.html'

    rows = lambda items: ''.join(f'<div class="row"><div><strong>{a}</strong><small>{b}</small></div></div>' for a, b in items)

    return f"""<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{t('Voorstel Rise Above Creators', 'Proposal Rise Above Creators')} · The Climbing Corner</title>
<meta name="robots" content="noindex">
<link rel="icon" href="{root}assets/img/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{root}assets/css/main.css">
{STYLE}
</head>
<body data-root="{root}" data-page="pitch" data-path="pitch/index.html">
<header class="container p-top">
  <a class="brand" href="../index.html"><img src="{root}assets/img/logo-mark.png" alt="" width="34" height="34"><span>Rise Above Creators<small>{t('Voorstel voor The Climbing Corner', 'A proposal for The Climbing Corner')}</small></span></a>
  <div class="p-actions">
    <a class="lang-switch" href="{switch}" hreflang="{other}" lang="{other}" aria-label="{t('Switch to English', 'Schakel naar Nederlands')}">{other.upper()}</a>
    <a class="btn btn--small btn--solid" href="../index.html">{t('Bekijk het prototype', 'View the prototype')}</a>
  </div>
</header>
<main>

  <section class="hero">
    <div class="container" style="grid-template-columns:1fr">
      <div class="hero-copy">
        <span class="eyebrow">{t('Voor Adam en Nika · oktober 2026', 'For Adam and Nika · October 2026')}</span>
        <h1 style="font-size:clamp(52px,10vw,140px)">{t('Jullie klimmers<br><span class="outline-text">delen het</span><br>al.', 'Your climbers<br><span class="outline-text">already</span><br>share it.')}</h1>
        <p class="lead">{t("De hal zit vol creatieve mensen die filmen, posten en hun sends delen. Rise Above Creators geeft die creativiteit een plek. Klimmers maken video's op hun eigen manier en krijgen er klimtegoed voor. De hal krijgt veel ogen op de content en, als het goed werkt, nieuwe mensen op de mat.",
                             "The gym is full of creative people who film, post and share their sends. Rise Above Creators gives that creativity a home. Climbers make videos in their own way and earn climbing credit for it. The gym gets a lot of eyes on the content and, if it works well, new people on the mats.")}</p>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container split">
      <div class="section-head">
        <span class="eyebrow">{t('Waarom', 'Why')}</span>
        <h2>{t('Advertenties<br>voelen als<br>advertenties', 'Ads<br>feel like<br>ads')}</h2>
      </div>
      <div class="rows">
        {rows([
          (t('Een hechte community', 'A close-knit community'),
           t('Wie binnenloopt bij The Climbing Corner, merkt het meteen: mensen kennen elkaar, helpen elkaar op de mat en zijn enthousiast over de hal. Dat enthousiasme is het mooiste wat er is om te delen.',
             'Anyone who walks into The Climbing Corner notices it straight away: people know each other, help each other on the mats and love the place. That enthusiasm is the best thing there is to share.')),
          (t('Bijna de helft is nieuw', 'Almost half are new'),
           t('Op jullie eigen site staat het: ongeveer 50% van de nieuwe bezoekers heeft nog nooit geklommen. Die mensen moeten zien dat het ook voor hen is. Een klimmer uit Heerlen laat dat beter zien dan een advertentie.',
             'Your own website says it: about 50% of new visitors have never climbed before. Those people need to see that it is for them too. A climber from Heerlen shows that better than any ad.')),
          (t('Er wordt al gefilmd', 'People already film'),
           t('Klimmers filmen hun pogingen en hun sends. Dit programma geeft ze visuals in jullie stijl, een eigen code en een beloning in klimtegoed. Wat ze ermee maken, bepalen ze zelf.',
             'Climbers film their attempts and their sends. This programme gives them visuals in your style, their own code and a reward of credits. What they make with it is up to them.')),
        ])}
      </div>
    </div>
  </section>

  <section class="section section--dark">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">{t('Hoe het werkt', 'How it works')}</span>
        <h2>{t('Speel. Post.<br>Verdien.', 'Play. Post.<br>Earn.')}</h2>
      </div>
      <div class="steps" style="border-color:rgba(255,255,255,.16)">
        <div class="step" style="border-color:rgba(255,255,255,.16)"><span class="num">01</span><h3>{t('Iets winnen', 'Win something')}</h3><p class="muted">{t("Makers spelen korte spellen over boulderen. Zo winnen ze motion-video's in jullie huisstijl en andere dingen voor hun eigen Reels.", 'Creators play short games about bouldering. That wins them motion videos in your house style and other things for their own Reels.')}</p></div>
        <div class="step" style="border-color:rgba(255,255,255,.16)"><span class="num">02</span><h3>{t('Posten met een code', 'Post with a code')}</h3><p class="muted">{t('Elke maker krijgt een eigen code op een eindkaart: "Eerste keer? Noem LOTTE aan de balie."', 'Every creator gets their own code on an end card: "First time? Mention LOTTE at reception."')}</p></div>
        <div class="step" style="border-color:rgba(255,255,255,.16)"><span class="num">03</span><h3>{t('Klimtegoed verdienen', 'Earn climbing credit')}</h3><p class="muted">{t('Punten voor gecontroleerde views en vooral voor nieuwe klimmers. Inwisselen voor entrees, schoenhuur, een les of een maand abonnement.', 'Points for checked views and above all for new climbers. Trade them for entries, shoe rental, a session or a month of membership.')}</p></div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container split">
      <div class="section-head">
        <span class="eyebrow">{t('Iedereen wint', 'Everyone wins')}</span>
        <h2>{t('Goed voor<br>de makers,<br>goed voor de hal', 'Good for<br>the creators,<br>good for the gym')}</h2>
      </div>
      <div class="rows">
        {rows([
          (t('Voor de makers', 'For the creators'),
           t("Een beloning in klimtegoed, en ruimte om zichzelf te laten zien. Ze maken video's op hun eigen manier, met visuals die ze zelf hebben vrijgespeeld.",
             'A reward of credits, and room to express themselves. They make videos their own way, with visuals they unlocked themselves.')),
          (t('Voor de hal', 'For the gym'),
           t('Veel ogen op de content, van mensen die de makers kennen en vertrouwen. Dat brengt de hal in beeld en kan nieuwe mensen naar de mat trekken.',
             'A lot of eyes on the content, from people who know and trust the creators. That puts the gym in view and can draw new people to the mats.')),
          (t('Zo blijft het draaien', 'That keeps it turning'),
           t("Makers spelen, maken video's, verdienen tegoed en komen terug. Het spel is één manier om dat gaande te houden. Er zijn er meer, en die bedenken we graag samen.",
             'Creators play, make videos, earn credit and come back. The game is one way to keep that going. There are more, and we would love to think them up together.')),
        ])}
      </div>
    </div>
  </section>

  <section class="section section--white">
    <div class="container split">
      <div class="section-head">
        <span class="eyebrow">{t('De rekensom', 'The sums')}</span>
        <h2>{t('Wat kost<br>een maand?', 'What does<br>a month cost?')}</h2>
        <p class="muted">{t('Een voorbeeld met 25 actieve makers, elk één video per maand. Dit is een schatting om het idee concreet te maken, geen belofte.', 'An example with 25 active creators, each making one video a month. This is an estimate to make the idea concrete, not a promise.')}</p>
      </div>
      <div class="stack">
        <div class="sum">
          <div class="line"><span>{t("25 video's × 3.000 views", '25 videos × 3,000 views')}</span><span>{t('75.000 views', '75,000 views')}</span></div>
          <div class="line"><span>{t('10 punten per 1.000 views', '10 points per 1,000 views')}</span><span>{t('750 punten', '750 points')}</span></div>
          <div class="line"><span>{t('+25% voor taggen (helft van de makers)', '+25% for tagging (half of the creators)')}</span><span>{t('+ 94 punten', '+ 94 points')}</span></div>
          <div class="line"><span>{t('10 nieuwe klimmers via codes × 150', '10 new climbers via codes × 150')}</span><span>{t('1.500 punten', '1,500 points')}</span></div>
          <div class="line total"><span>{t('Totaal', 'Total')}</span><span>{t('2.344 punten', '2,344 points')}</span></div>
          <div class="line total"><span>{t('Waarde in klimtegoed (1 punt = € 0,10)', 'Value in climbing credit (1 point = €0.10)')}</span><span>{t('€ 234', '€234')}</span></div>
        </div>
        <div class="vs">
          <div class="card"><span class="mono">{t('Via Rise Above Creators', 'Via Rise Above Creators')}</span><div class="big">{t('€ 234', '€234')}</div><p class="muted" style="margin:8px 0 0">{t('in tegoed, voor 75.000 views en in dit voorbeeld 10 nieuwe klimmers', 'in credit, for 75,000 views and, in this example, 10 new climbers')}</p></div>
          <div class="card card--ink"><span class="mono">{t('Zelfde views via Meta', 'Same views via Meta')}</span><div class="big">{t('€ 300 tot € 750', '€300 to €750')}</div><p style="margin:8px 0 0;color:var(--grey-2)">{t('bij € 4 tot € 10 per 1.000 vertoningen, en geen idee wie er binnenkomt', 'at €4 to €10 per 1,000 impressions, and no idea who walks in')}</p></div>
        </div>
        <p class="hint">{t('Meten kan, bijvoorbeeld met de codes aan de balie. Hoe we het precies meten en of het echt nieuwe mensen oplevert, bekijken we samen als we het gaan uitvoeren.', 'It can be measured, for example with the codes at reception. How exactly we measure it, and whether it really brings in new people, is something we work out together once we put it into practice.')}</p>
      </div>
    </div>
  </section>

  <section class="section section--dark">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">{t('Wat het voor jullie betekent', 'What it means for you')}</span>
        <h2>{t('Geld dat in<br>de hal <span class="outline-text">blijft</span>', 'Money that<br>stays in the <span class="outline-text">gym</span>')}</h2>
        <p class="muted" style="max-width:40em">{t('Bij advertenties gaat het budget naar een groot platform, ergens ver weg. Hier gaat het naar de mensen die al in de hal staan. Dat vind ik het mooiste aan dit idee.', 'With ads, the budget goes to a big platform somewhere far away. Here it goes to the people who are already in the gym. To me, that is the best thing about this idea.')}</p>
      </div>
      <div class="compare">
        <div class="card" style="background:transparent;border-color:rgba(255,255,255,.3);color:#fff"><span class="mono" style="color:var(--grey-2)">{t('Bij advertenties', 'With ads')}</span>
          <ul>
            <li>{t('Het budget gaat naar een groot platform', 'The budget goes to a big platform')}</li>
            <li>{t('Je betaalt ook voor kijkers ver buiten Parkstad', 'You also pay for viewers far outside Parkstad')}</li>
            <li>{t('Mensen zien een advertentie en scrollen door', 'People see an ad and scroll on')}</li>
          </ul>
        </div>
        <div class="card card--light" style="background:#fff;color:var(--ink)"><span class="mono">Rise Above Creators</span>
          <ul>
            <li>{t('Het budget gaat als klimtegoed naar je eigen klimmers', 'The budget goes to your own climbers as climbing credit')}</li>
            <li>{t("Video's van echte mensen uit de hal, in hun eigen stijl", 'Videos by real people from the gym, in their own style')}</li>
            <li>{t('Makers komen vaker klimmen, vaak met een vriend erbij', 'Creators climb more often, often bringing a friend')}</li>
            <li>{t('Veel ogen op de hal, en hopelijk nieuwe gezichten op de mat', 'Lots of eyes on the gym, and hopefully new faces on the mats')}</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section class="section section--white">
    <div class="container split">
      <div class="section-head">
        <span class="eyebrow">{t('Grip op de kosten', 'In control of the costs')}</span>
        <h2>{t('Jullie houden<br>de touwtjes', 'You hold<br>the reins')}</h2>
      </div>
      <div class="rows">
        {rows([
          (t('Maximum per maker', 'Maximum per creator'), t('Niemand verdient meer dan 600 punten per maand (€ 60 tegoed). Het maximum en alle bedragen stellen jullie zelf in.', 'Nobody earns more than 600 points a month (€60 in credit). You set the maximum and all the amounts yourselves.')),
          (t('Alles wordt gekeurd', 'Everything is checked'), t('Makers sturen hun link en een screenshot van hun views in. Pas na controle komen er punten bij.', 'Creators send in their link and a screenshot of their views. Points are only added after a check.')),
          (t('Tien seconden aan de balie', 'Ten seconds at reception'), t('Noemt iemand een code? Typ hem in het beheerscherm. Dat is het hele werk aan jullie kant.', 'Someone mentions a code? Type it into the admin screen. That is all the work on your side.')),
        ])}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">{t('Wat ik bouw', 'What I build')}</span>
        <h2>{t('Alles wat je in<br>het prototype ziet', 'Everything you see<br>in the prototype')}</h2>
      </div>
      <div class="grid grid--3">
        <div class="card"><h3>{t('De site', 'The site')}</h3><p class="muted">{t('Een eigen subsite, bijvoorbeeld crew.theclimbingcorner.com, in de huisstijl van de hal. Werkt op telefoon.', "A dedicated subsite, for example crew.theclimbingcorner.com, in the gym's house style. Works on phones.")}</p></div>
        <div class="card"><h3>{t('Spellen', 'Games')}</h3><p class="muted">{t('Vijf om mee te beginnen, twintig zijn er mogelijk. Ik bouw de spellen die passen bij jullie hal en bij wat makers leuk vinden.', 'Five to start with, and up to twenty are possible. I build the games that fit your gym and what creators enjoy.')}</p></div>
        <div class="card"><h3>{t('Een kluis die groeit', 'A growing vault')}</h3><p class="muted">{t('Om te beginnen elf motion-visuals, waaronder de eindkaart met code. Ik maak er meer bij, ook andere dingen om te winnen. Hoeveel, bespreken we samen.', 'To start, eleven motion visuals, including the end card with a code. I will add more, and other things to win too. How many, we can discuss together.')}</p></div>
        <div class="card"><h3>{t('Dashboard voor makers', 'Dashboard for creators')}</h3><p class="muted">{t('Code, punten, inzendingen, ranglijst en beloningen. Echte accounts in plaats van de opslag in de browser.', 'Code, points, submissions, leaderboard and rewards. Real accounts instead of storage in the browser.')}</p></div>
        <div class="card"><h3>{t('Beheer voor de hal', 'Admin for the gym')}</h3><p class="muted">{t('Keuren, codes registreren aan de balie en een maandoverzicht met views, nieuwe klimmers en uitgegeven tegoed.', 'Reviewing, registering codes at reception and a monthly overview of views, new climbers and credit given out.')}</p></div>
        <div class="card"><h3>{t('Lancering', 'Launch')}</h3><p class="muted">{t('Aankondiging op Instagram, een poster bij de balie en een startavond met de eerste makers.', 'An announcement on Instagram, a poster at reception and a kick-off evening with the first creators.')}</p></div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container split">
      <div class="section-head">
        <span class="eyebrow">{t('Planning', 'Planning')}</span>
        <h2>{t('Van ja<br>tot live', 'From yes<br>to live')}</h2>
      </div>
      <ol class="tl">
        <li><span class="mono">{t('Week 1 en 2', 'Weeks 1 and 2')}</span><span>{t('Samen de spelregels en de manier van meten vaststellen. Daarna bouwen: accounts, beheer, de database en de laatste visuals.', 'Agree the rules and how we measure together. Then build: accounts, admin, the database and the last visuals.')}</span></li>
        <li><span class="mono">{t('Week 3', 'Week 3')}</span><span>{t('Testen met vijf vaste klimmers die jullie kiezen.', 'Test with five regular climbers you choose.')}</span></li>
        <li><span class="mono">{t('Week 4', 'Week 4')}</span><span>{t('Lancering in de hal en op Instagram.', 'Launch in the gym and on Instagram.')}</span></li>
        <li><span class="mono">{t('Maand 1 tot 3', 'Months 1 to 3')}</span><span>{t('Draaien, bijsturen en na drie maanden samen kijken wat het oplevert.', 'Run it, adjust it and after three months look at the results together.')}</span></li>
      </ol>
    </div>
  </section>

  <section class="section section--white">
    <div class="container split">
      <div class="section-head">
        <span class="eyebrow">{t('Van jullie nodig', 'What I need from you')}</span>
        <h2>{t('Vier<br>dingen', 'Four<br>things')}</h2>
      </div>
      <div class="rows">
        {rows([
          (t('Akkoord op de beloningen', 'Agreement on the rewards'), t('Welke beloningen en hoeveel punten. Het prototype gebruikt jullie huidige prijzen als startpunt.', 'Which rewards and how many points. The prototype uses your current prices as a starting point.')),
          (t('Codes aan de balie', 'Codes at reception'), t('Het team vraagt nieuwe bezoekers of ze een code hebben.', 'The team asks new visitors whether they have a code.')),
          (t('Logo en beelden', 'Logo and images'), t('Toestemming om het logo en de huisstijl in de visuals te gebruiken.', 'Permission to use the logo and house style in the visuals.')),
          (t('Vijf eerste makers', 'Five first creators'), t('Klimmers die al posten en het leuk vinden om mee te testen.', 'Climbers who already post and would enjoy testing it.')),
        ])}
      </div>
    </div>
  </section>

  <section class="section section--dark">
    <div class="container center">
      <h2 style="margin-bottom:22px">Rise<br><span class="outline-text">above.</span></h2>
      <p class="muted" style="margin:0 auto 26px;max-width:36em">{t('Dit is een prototype. Er ligt nog niets vast en er kan nog van alles. Ik heb genoeg ideeën om het verder te brengen. Lijkt het jullie leuk om uit te proberen? Dan plannen we een gesprek en kijken we samen wat bij The Climbing Corner past.',
                                                                                                "This is a prototype. Nothing is fixed yet and a lot is still possible. I have plenty of ideas to take it further. Does it sound like something you would like to try? Then let's plan a meeting and work out together what suits The Climbing Corner.")}</p>
      <div class="btn-row on-dark no-print" style="justify-content:center">
        <a class="btn btn--solid" href="../index.html">{t('Open het prototype', 'Open the prototype')}</a>
        <a class="btn" href="../admin/index.html">{t('Bekijk het beheer', 'See the admin')}</a>
      </div>
      <p class="mono" style="margin-top:36px;color:var(--grey-2)">IBE MOTION</p>
    </div>
  </section>

</main>
</body>
</html>
"""


if __name__ == '__main__':
    for lang in ('nl', 'en'):
        out = ROOT / ('en/pitch' if lang == 'en' else 'pitch') / 'index.html'
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(page(lang), encoding='utf-8')
        print(out.relative_to(ROOT))
