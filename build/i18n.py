"""Maakt de Engelse versie van de vaste pagina's onder /en/.
De Nederlandse pagina is de bron. Per pagina staat hieronder welke tekst Engels wordt.
Elke Nederlandse tekst moet precies voorkomen, anders stopt het script met een melding.
Zo merk je het meteen als een Nederlandse pagina is aangepast en de vertaling mee moet.

Gebruik vanuit de projectmap: python3 build/i18n.py
De spelpagina's maakt build/games.py, de pitch maakt build/pitch.py.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

COMMON = [
    ('<html lang="nl">', '<html lang="en">'),
]

PAGES = {
'index.html': [
    ('content="Maak video\'s over The Climbing Corner, speel visuals vrij en verdien klimtegoed."', 'content="Make videos about The Climbing Corner, unlock visuals and earn climbing credit."'),
    ('Je klimt toch al. Film het, post het en verdien er klimtegoed mee. Speel visuals van de hal vrij, zet ze in je Reels en help nieuwe klimmers naar de mat.',
     "You're climbing anyway. Film it, post it and earn climbing credit with it. Unlock visuals of the gym, put them in your Reels and help new climbers onto the mat."),
    ('>Doe mee<', '>Join<'),
    ('>Speel een spel<', '>Play a game<'),
    ('alt="Klimmer die naar de volgende greep reikt"', 'alt="Climber reaching for the next hold"'),
    ('<span class="eyebrow">Zo werkt het</span>', '<span class="eyebrow">How it works</span>'),
    ('<h2>Speel. Post.<br>Verdien.</h2>', '<h2>Play. Post.<br>Earn.</h2>'),
    ('<h3>Speel visuals vrij</h3>', '<h3>Unlock visuals</h3>'),
    ("Vijf korte spellen over boulderen. Haal een score en je ontgrendelt motion-video's van de hal voor in je eigen Reels.",
     'Five short games about bouldering. Hit a score and you unlock motion videos of the gym for your own Reels.'),
    ('<h3>Post je video</h3>', '<h3>Post your video</h3>'),
    ('Film in de hal, zet er een visual in en sluit af met jouw eindkaart. Daarop staat je persoonlijke code.',
     'Film in the gym, add a visual and finish with your end card. It shows your personal code.'),
    ('<h3>Verdien klimtegoed</h3>', '<h3>Earn climbing credit</h3>'),
    ('Stuur de link en een screenshot van je views in. Aan het eind van de maand krijg je punten, die je inwisselt voor entrees en meer.',
     'Send in the link and a screenshot of your views. At the end of the month you get points, which you trade for entries and more.'),
    ('<span class="eyebrow">Punten</span>', '<span class="eyebrow">Points</span>'),
    ('<h2>Wat levert<br>het op?</h2>', '<h2>What do<br>you get?</h2>'),
    ('Views zijn leuk. Nieuwe klimmers in de hal zijn het mooiste. Daarom levert iemand die jouw code noemt aan de balie het meeste op.',
     'Views are nice. New climbers in the gym are the best part. That is why someone who mentions your code at reception earns you the most.'),
    ('<span class="eyebrow">De kluis</span>', '<span class="eyebrow">The vault</span>'),
    ('<h2>Elf visuals.<br><span class="outline-text">Eén is al van jou.</span></h2>', '<h2>Eleven visuals.<br><span class="outline-text">One is already yours.</span></h2>'),
    ('Je eindkaart met jouw code krijg je meteen. De rest speel je vrij.', 'Your end card with your code is yours straight away. You unlock the rest.'),
    ('>Open de kluis<', '>Open the vault<'),
    ('>Naar de spellen<', '>Go to the games<'),
    ('<span class="eyebrow">Spelregels</span>', '<span class="eyebrow">Rules</span>'),
    ('<h2>Eerlijk<br>spel</h2>', '<h2>Fair<br>play</h2>'),
    ('<strong>Echte views</strong><small>Gekochte views of bots? Dan vervallen je punten. Elke inzending wordt met de hand gecontroleerd.</small>',
     '<strong>Real views</strong><small>Bought views or bots? Then your points are void. Every submission is checked by hand.</small>'),
    ('<strong>Maximaal <span data-cap></span> punten per maand</strong><small>Zo blijft het eerlijk voor iedereen en weet de hal waar ze aan toe is.</small>',
     '<strong>Up to <span data-cap></span> points a month</strong><small>That keeps it fair for everyone, and the gym knows where it stands.</small>'),
    ('<strong>Klimtegoed, geen geld</strong><small>Punten wissel je in bij de balie voor entrees, schoenhuur, lessen of een maand abonnement.</small>',
     '<strong>Climbing credit, not money</strong><small>Trade your points at reception for entries, shoe rental, sessions or a month of membership.</small>'),
    ('<strong>Respect in de hal</strong><small>Film niemand die dat niet wil en sta niet in de valzone van een ander.</small>',
     "<strong>Respect in the gym</strong><small>Don't film anyone who doesn't want to be filmed, and stay out of other climbers' fall zones.</small>"),
    ('<h2 style="margin-bottom:24px">Klaar om<br><span class="outline-text">te klimmen?</span></h2>', '<h2 style="margin-bottom:24px">Ready to<br><span class="outline-text">climb?</span></h2>'),
    ('>Bekijk de ranglijst<', '>See the leaderboard<'),
    ("['1.000 views', 'Op een goedgekeurde video', R.pointsPer1000 + ' punten'],", "['1,000 views', 'On an approved video', R.pointsPer1000 + ' points'],"),
    ("['Tag de hal', 'Tag @the_climbingcorner of plaats als samenwerking',", "['Tag the gym', 'Tag @the_climbingcorner or post it as a collaboration',"),
    ("['Nieuwe klimmer', 'Iemand die nog nooit geweest is en jouw code noemt aan de balie', R.newVisitor + ' punten'],",
     "['New climber', 'Someone who has never been before and mentions your code at reception', R.newVisitor + ' points'],"),
    ("['Dagentree', 'Zoveel punten kost een dag klimmen', RA.REWARDS[1].cost + ' punten']", "['Day pass', 'What a day of climbing costs in points', RA.REWARDS[1].cost + ' points']"),
    ('<span class="tag">Van jou</span>', '<span class="tag">Yours</span>'),
    ("lock + 'Speel vrij</div>'", "lock + 'Unlock it</div>'"),
],

'kluis/index.html': [
    ('<title>De kluis · Rise Above Creators</title>', '<title>The vault · Rise Above Creators</title>'),
    ('<h1>De kluis</h1>', '<h1>The vault</h1>'),
    ("Motion-video's van The Climbing Corner, staand formaat (1080 × 1920) voor Reels en TikTok. Speel ze vrij in de spellen en download ze voor je eigen video's.",
     'Motion videos of The Climbing Corner, in portrait format (1080 × 1920) for Reels and TikTok. Unlock them in the games and download them for your own videos.'),
    ('Green screen-visuals: zet ze als laag boven je video en gebruik chroma key (CapCut: Uitknippen → Chroma key) om het groen weg te halen.',
     'Green screen visuals: put them as a layer over your video and use chroma key (CapCut: Cutout → Chroma key) to remove the green.'),
    ('data-close>Sluit</button>', 'data-close>Close</button>'),
    ("' van ' + RA.VAULT.length + ' vrijgespeeld'", "' of ' + RA.VAULT.length + ' unlocked'"),
    ("(unlocked ? ' bekijken' : ' is nog op slot')", "(unlocked ? ': view' : ' is still locked')"),
    ("(v.personal ? 'Jouw code' : 'Vrijgespeeld')", "(v.personal ? 'Your code' : 'Unlocked')"),
    ("'<p><strong>Nog op slot.</strong> '", "'<p><strong>Still locked.</strong> '"),
    ("'/index.html\">Speel ' + RA.esc(v.game.title)", "'/index.html\">Play ' + RA.esc(v.game.title)"),
    ('<span class="mono">Jouw code</span>', '<span class="mono">Your code</span>'),
    ('Je ziet nu een voorbeeld. <a href="../dashboard/index.html">Meld je aan</a> en je eigen code staat erop.',
     'This is an example. <a href="../dashboard/index.html">Sign up</a> and your own code will be on it.'),
    ("data-rec>Download met ' + (st.user ? 'jouw' : 'deze') + ' code</button>", "data-rec>Download with ' + (st.user ? 'your' : 'this') + ' code</button>"),
    ("De video wordt in je browser gemaakt en duurt ' + clip.duration + ' seconden.", "The video is made in your browser and takes ' + clip.duration + ' seconds."),
    ("'Je browser kan hier geen video maken. Probeer Chrome of Safari.'", "'Your browser cannot make a video here. Try Chrome or Safari.'"),
    ("'Klaar. Je video staat in je downloads (' + ext + ').'", "'Done. Your video is in your downloads (' + ext + ').'"),
    ("'Bezig met opnemen...'", "'Recording...'"),
],

'dashboard/index.html': [
    ('<title>Mijn crew · Rise Above Creators</title>', '<title>My crew · Rise Above Creators</title>'),
    ('<span class="eyebrow">Aanmelden</span><h1>Doe mee</h1>', '<span class="eyebrow">Sign up</span><h1>Join</h1>'),
    ('Klim je bij The Climbing Corner en post je weleens op Instagram? Meld je aan, krijg je eigen code en begin met vrijspelen.',
     'Do you climb at The Climbing Corner and post on Instagram now and then? Sign up, get your own code and start unlocking.'),
    ('<label for="f-name">Voornaam</label>', '<label for="f-name">First name</label>'),
    ('placeholder="@jouwnaam"', 'placeholder="@yourname"'),
    ('Ik ken de spelregels: echte views, respect in de hal, en punten zijn klimtegoed.', 'I know the rules: real views, respect in the gym, and points are climbing credit.'),
    ('>Maak mijn code<', '>Create my code<'),
    ('<strong>Je eigen code</strong><small>Staat op je eindkaart. Nieuwe klimmers noemen hem aan de balie.</small>',
     '<strong>Your own code</strong><small>It is on your end card. New climbers mention it at reception.</small>'),
    ('<strong>Meteen een visual</strong><small>De eindkaart met jouw code is direct van jou.</small>',
     '<strong>A visual straight away</strong><small>The end card with your code is yours right away.</small>'),
    ('<strong>Punten elke maand</strong><small>Inzendingen worden aan het eind van de maand gecontroleerd en uitbetaald in punten.</small>',
     '<strong>Points every month</strong><small>Submissions are checked at the end of the month and paid out in points.</small>'),
    ("'Vul je naam en Instagram in en vink de spelregels aan.'", "'Fill in your name and Instagram and tick the rules.'"),
    ("RA.toast('Welkom in de crew, ' + name);", "RA.toast('Welcome to the crew, ' + name);"),
    ("s.points + ' punten</span>'", "s.points + ' points</span>'"),
    ('badge--no">Afgekeurd</span>', 'badge--no">Rejected</span>'),
    ('<span class="badge">Wordt gecontroleerd</span>', '<span class="badge">Being checked</span>'),
    ("<h1>Hoi ' + RA.esc(u.name)", "<h1>Hi ' + RA.esc(u.name)"),
    ('<span class="mono">Punten</span>', '<span class="mono">Points</span>'),
    ("(nextReward ? 'Nog ' + (nextReward.cost - st.points) + ' tot ' + RA.esc(nextReward.title.toLowerCase()) : 'Je kunt alles inwisselen')",
     "(nextReward ? (nextReward.cost - st.points) + ' to go for a ' + RA.esc(nextReward.title.toLowerCase()) : 'You can redeem everything')"),
    ('<span class="mono">Deze maand</span>', '<span class="mono">This month</span>'),
    ('<span class="mono">Nieuwe klimmers via jou</span>', '<span class="mono">New climbers via you</span>'),
    ("R.newVisitor + ' punten per persoon</span>", "R.newVisitor + ' points per person</span>"),
    ('<span class="eyebrow">Jouw code</span>', '<span class="eyebrow">Your code</span>'),
    ('data-copy>Kopieer</button>', 'data-copy>Copy</button>'),
    ('Zeg in je video: "Eerste keer klimmen? Noem \' + RA.esc(u.code) + \' aan de balie." Je eindkaart doet de rest.',
     'Say in your video: "First time climbing? Mention \' + RA.esc(u.code) + \' at reception." Your end card does the rest.'),
    ('>Eindkaart downloaden<', '>Download end card<'),
    (">Spellen (' + unlocked", ">Games (' + unlocked"),
    ('<h3>Video insturen</h3>', '<h3>Submit a video</h3>'),
    ('Stuur je Reel in zodra hij een paar dagen online staat. Aan het eind van de maand keurt de hal alle inzendingen.',
     'Send in your Reel once it has been online for a few days. At the end of the month the gym reviews all submissions.'),
    ('<label for="s-url">Link naar je Reel</label>', '<label for="s-url">Link to your Reel</label>'),
    ('<label for="s-views">Aantal views (uit je inzichten)</label>', '<label for="s-views">Number of views (from your insights)</label>'),
    ('placeholder="bijvoorbeeld 4200"', 'placeholder="for example 4200"'),
    ('<label for="s-shot">Screenshot van je inzichten</label>', '<label for="s-shot">Screenshot of your insights</label>'),
    ('In dit prototype blijft het screenshot op je eigen apparaat.', 'In this prototype the screenshot stays on your own device.'),
    ('Ik heb @the_climbingcorner getagd of de video als samenwerking geplaatst (+', 'I tagged @the_climbingcorner or posted the video as a collaboration (+'),
    ('Vul je views in voor een schatting.', 'Enter your views for an estimate.'),
    ('type="submit">Insturen</button>', 'type="submit">Submit</button>'),
    ('<h3>Mijn inzendingen</h3>', '<h3>My submissions</h3>'),
    ('<h3>Mijn bonnen</h3>', '<h3>My vouchers</h3>'),
    ("(s.tagged ? ' · getagd' : '')", "(s.tagged ? ' · tagged' : '')"),
    ('Nog niets ingestuurd.', 'Nothing submitted yet.'),
    ("RA.toast('Code gekopieerd');", "RA.toast('Code copied');"),
    ("'Schatting: ' + p + ' punten na goedkeuring (' + RA.euro(p * R.pointValue) + ' klimtegoed).'", "'Estimate: ' + p + ' points after approval (' + RA.euro(p * R.pointValue) + ' climbing credit).'"),
    ("'Plak een link van Instagram.'", "'Paste an Instagram link.'"),
    ("'Vul het aantal views in.'", "'Enter the number of views.'"),
    ("RA.toast('Ingestuurd. De hal kijkt ernaar.');", "RA.toast('Submitted. The gym will take a look.');"),
],

'admin/index.html': [
    ('<title>Beheer · Rise Above Creators</title>', '<title>Admin · Rise Above Creators</title>'),
    ('<span class="eyebrow">Alleen voor The Climbing Corner</span>', '<span class="eyebrow">For The Climbing Corner only</span>'),
    ('<h1>Beheer</h1>', '<h1>Admin</h1>'),
    ('Inzendingen keuren, nieuwe klimmers registreren aan de balie en zien wat het programma deze maand oplevert.',
     'Review submissions, register new climbers at reception and see what the programme brings in this month.'),
    ('<h3>Te keuren</h3>', '<h3>To review</h3>'),
    ('Check de link en het screenshot. Kloppen de views? Dan goedkeuren.', 'Check the link and the screenshot. Do the views add up? Then approve.'),
    ('<h3>Balie: nieuwe klimmer</h3>', '<h3>Reception: new climber</h3>'),
    ('Iemand komt voor het eerst en noemt een code? Vul hem hier in. De maker krijgt <span data-nv></span> punten.',
     'Someone visits for the first time and mentions a code? Enter it here. The creator gets <span data-nv></span> points.'),
    ('placeholder="bijvoorbeeld LOTTE"', 'placeholder="for example LOTTE"'),
    ('type="submit">Registreer</button>', 'type="submit">Register</button>'),
    ('<h3>Spelregels</h3>', '<h3>Rules</h3>'),
    ("['1.000 views', R.pointsPer1000 + ' punten'], ['Getagd of samenwerking',", "['1,000 views', R.pointsPer1000 + ' points'], ['Tagged or collaboration',"),
    ("['Nieuwe klimmer', R.newVisitor + ' punten'], ['Maximum per maker', R.monthCap + ' / maand'], ['1 punt', RA.euro(R.pointValue) + ' tegoed']",
     "['New climber', R.newVisitor + ' points'], ['Maximum per creator', R.monthCap + ' / month'], ['1 point', RA.euro(R.pointValue) + ' credit']"),
    ("who: st.user ? st.user.name : 'Jij'", "who: st.user ? st.user.name : 'You'"),
    ("['Views deze maand', RA.fmt(s.views), 'goedgekeurde video\\'s'],", "['Views this month', RA.fmt(s.views), 'approved videos'],"),
    ("['Nieuwe klimmers', RA.fmt(s.visitors), 'via codes aan de balie'],", "['New climbers', RA.fmt(s.visitors), 'via codes at reception'],"),
    ("['Uitgegeven tegoed', RA.euro(s.points * R.pointValue), RA.fmt(s.points) + ' punten'],", "['Credit given out', RA.euro(s.points * R.pointValue), RA.fmt(s.points) + ' points'],"),
    ("['Zelfde bereik via Meta', RA.euro(lowMeta).replace(',00', '') + ' tot ' + RA.euro(highMeta).replace(',00', ''), 'schatting, € 4 tot € 10 per 1.000']",
     "['Same reach via Meta', RA.euro(lowMeta).replace('.00', '') + ' to ' + RA.euro(highMeta).replace('.00', ''), 'estimate, €4 to €10 per 1,000']"),
    ("(s.mine ? ' (jij)' : '')", "(s.mine ? ' (you)' : '')"),
    ("(s.tagged ? 'getagd' : 'niet getagd')", "(s.tagged ? 'tagged' : 'not tagged')"),
    ("'\">Goed · ' + p + ' pt</button>", "'\">Approve · ' + p + ' pt</button>"),
    ('">Afkeuren</button>', '">Reject</button>'),
    ('Alles is gekeurd. Stuur een video in via Mijn crew om dit te testen.', 'Everything has been reviewed. Submit a video via My crew to try this.'),
    ("RA.toast('Afgekeurd');", "RA.toast('Rejected');"),
    ("RA.toast('Goedgekeurd: ' + p + ' punten voor ' + s.who);", "RA.toast('Approved: ' + p + ' points for ' + s.who);"),
    ("who = st.user.name + ' (jij), +' + got + ' punten';", "who = st.user.name + ' (you), +' + got + ' points';"),
    ("who = c.name + ', +' + add + ' punten';", "who = c.name + ', +' + add + ' points';"),
    ("msg.textContent = 'Onbekende code: ' + code;", "msg.textContent = 'Unknown code: ' + code;"),
    ("msg.textContent = 'Geregistreerd voor ' + who + '.';", "msg.textContent = 'Registered for ' + who + '.';"),
],

'beloningen/index.html': [
    ('<title>Beloningen · Rise Above Creators</title>', '<title>Rewards · Rise Above Creators</title>'),
    ('<h1>Beloningen</h1>', '<h1>Rewards</h1>'),
    ('Wissel je punten in voor klimtegoed. Je krijgt een bon met code. Laat die zien aan de balie.', 'Trade your points for climbing credit. You get a voucher with a code. Show it at reception.'),
    ("'Jouw saldo: ' + RA.fmt(st.points) + ' punten' : 'Meld je eerst aan'", "'Your balance: ' + RA.fmt(st.points) + ' points' : 'Sign up first'"),
    ("' <small>PUNTEN</small></div>'", "' <small>POINTS</small></div>'"),
    ("(can ? 'Inwisselen' : st.user ? 'Nog ' + RA.fmt(r.cost - st.points) + ' punten' : 'Meld je aan')", "(can ? 'Redeem' : st.user ? RA.fmt(r.cost - st.points) + ' points to go' : 'Sign up')"),
    ("if (!confirm(r.title + ' inwisselen voor ' + r.cost + ' punten?')) return;", "if (!confirm('Redeem ' + r.title + ' for ' + r.cost + ' points?')) return;"),
    ('<div class="voucher">Laat deze bon zien aan de balie<strong>', '<div class="voucher">Show this voucher at reception<strong>'),
],

'ranglijst/index.html': [
    ('<title>Ranglijst · Rise Above Creators</title>', '<title>Leaderboard · Rise Above Creators</title>'),
    ('<h1>Ranglijst</h1>', '<h1>Leaderboard</h1>'),
    ('Punten van deze maand. Op de eerste van de maand begint iedereen weer bij nul. Je opgespaarde punten houd je.',
     "This month's points. On the first of the month everyone starts from zero again. You keep the points you have saved."),
    ('Voorbeelddata: de andere makers in dit prototype zijn verzonnen.', 'Sample data: the other creators in this prototype are made up.'),
    ("toLocaleDateString('nl-NL'", "toLocaleDateString('en-GB'"),
    ("(c.me ? ' (jij)' : '')", "(c.me ? ' (you)' : '')"),
    ("RA.fmt(c.pts) + ' punten</span>", "RA.fmt(c.pts) + ' points</span>"),
],
}

ASSET = re.compile(r'''(["'(])((?:\.\./)*)assets/''')


def deepen(html):
    """De Engelse pagina staat een map dieper: verwijzingen naar assets en data-root krijgen er ../ bij."""
    html = ASSET.sub(lambda m: m.group(1) + '../' + m.group(2) + 'assets/', html)
    html = re.sub(r'data-root="((?:\.\./)*|\./)"', lambda m: 'data-root="../' + ('' if m.group(1) == './' else m.group(1)) + '"', html)
    return html


def build():
    for rel, pairs in PAGES.items():
        src = (ROOT / rel).read_text(encoding='utf-8')
        out = src
        for nl, en in COMMON + pairs:
            if nl not in out:
                raise SystemExit(f'Niet gevonden in {rel}:\n  {nl}')
            out = out.replace(nl, en)
        out = deepen(out)
        dest = ROOT / 'en' / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(out, encoding='utf-8')
        print('en/' + rel)


if __name__ == '__main__':
    build()
