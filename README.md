# Rise Above Creators (demo)

Creator-programma voor The Climbing Corner: makers spelen visuals vrij, posten Reels met hun eigen code en verdienen klimtegoed.
Prototype: plain HTML, CSS en JS, alle gegevens in localStorage. Nog niet live.
Tweetalig: Nederlands in de projectmap, Engels onder `en/`. De taalknop (NL/EN) staat rechtsboven en in de footer.

## Bekijken
Dubbelklik op `Open demo.command`. Die start een lokale server en opent http://localhost:8765/index.html.
Dubbelklikken op `index.html` werkt ook (alle links wijzen naar `.../index.html`), maar via de server werken de mp4-downloads het best.
Pitch voor de hal: /pitch/index.html, beheer: /admin/index.html.

## Structuur
- `assets/js/app.js`: spelregels (punten, maximum, beloningen), kluis-items, demo-data, header/footer.
- `assets/js/motion.js`: alle elf motion-video's als code: vijf die mensen naar de hal halen (eindkaart, eerste keer, wie gaat er mee, poging-teller, Rise Above opener) en zes logo-animaties (neon, krijt, raster, glitch, code, strepen). De eindkaart draait ook live op de site met de code van de maker.
- `assets/js/game-shell.js` + `assets/js/games/*.js`: de vijf spellen.
- `build/games.py`: maakt de spelpagina's. `python3 build/games.py`
- `build/render.mjs`: rendert motion.js naar mp4 (720p preview + 1080p download). Vereist server op :8765, puppeteer-core en ffmpeg.
- `assets/video/bob-*.mp4`: Bobs eigen animaties uit Documents/ClimbingCorner. Staan niet meer in de kluis, maar zijn bewaard.
- Op slot staande visuals kun je in de kluis al bekijken; downloaden kan pas na vrijspelen.

## Voor de echte versie
Accounts en database, uploads van screenshots, beheer achter een login, subdomein (bijv. crew.theclimbingcorner.com).

## Engelse versie
- Gedeelde scripts (`assets/js/*.js`) kiezen hun tekst via `RA.t('Nederlands', 'English')`, op basis van `<html lang>`.
- Vaste pagina's: de Nederlandse pagina is de bron. `python3 build/i18n.py` maakt de Engelse kopie onder `en/`.
  Pas je een Nederlandse tekst aan, pas dan ook de regel in `build/i18n.py` aan. Het script stopt met een melding als een tekst niet meer klopt.
- Spelpagina's: `python3 build/games.py` maakt beide talen.
- Pitchpagina: `python3 build/pitch.py` maakt beide talen.
- Video's met tekst (eindkaart, poging-teller) hebben een Engelse versie met `-en` in de naam:
  `node build/render.mjs --lang en eindkaart poging-teller eerste-keer klim-mee` (PORT=... als de server niet op 8765 draait)
- Alles opnieuw bouwen: `python3 build/games.py && python3 build/i18n.py && python3 build/pitch.py`
