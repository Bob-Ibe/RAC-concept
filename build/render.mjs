// Rendert de motion-clips naar mp4. Gebruik: node build/render.mjs [--lang en] [id ...]
// Met --lang en krijgen de bestanden de toevoeging -en (bijv. eindkaart-en-1080.mp4).
// Vereist: lokale server op :8765 (of PORT=...) vanuit de projectmap, puppeteer-core, ffmpeg.
import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(process.env.PUPPETEER_DIR ? path.join(process.env.PUPPETEER_DIR, 'x.js') : import.meta.url);
const puppeteer = require('puppeteer-core');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2), li = args.indexOf('--lang');
const lang = li !== -1 ? args.splice(li, 2)[1] : 'nl';
const FPS = 30, only = args, sfx = lang === 'nl' ? '' : '-' + lang;
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--force-device-scale-factor=1'] });
const page = await browser.newPage();
await page.goto('http://localhost:' + (process.env.PORT || 8765) + '/build/render.html', { waitUntil: 'networkidle0' });
await page.evaluate(() => window.ready);
const clips = await page.evaluate(() => RAMotion.CLIPS.map(c => ({ id: c.id, duration: c.duration })));
for (const c of clips) {
  if (only.length && !only.includes(c.id)) continue;
  const tmp = fs.mkdtempSync('/tmp/ra-'); const n = Math.round(c.duration * FPS);
  for (let i = 0; i < n; i++) {
    const url = await page.evaluate((id, t, lang) => frame(id, t, { lang }), c.id, i / FPS, lang);
    fs.writeFileSync(path.join(tmp, String(i).padStart(4, '0') + '.jpg'), Buffer.from(url.split(',')[1], 'base64'));
  }
  const out = (f) => path.join(root, 'assets', f);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', path.join(tmp, '%04d.jpg'), '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out(`video/${c.id}${sfx}-1080.mp4`)]);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', out(`video/${c.id}${sfx}-1080.mp4`), '-vf', 'scale=720:1280', '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out(`video/${c.id}${sfx}.mp4`)]);
  const mid = Math.min(n - 1, Math.round(n * 0.8));
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(tmp, String(mid).padStart(4, '0') + '.jpg'), '-vf', 'scale=360:640', '-q:v', '4', out(`poster/${c.id}${sfx}.jpg`)]);
  fs.rmSync(tmp, { recursive: true });
  console.log('klaar', c.id + sfx, n, 'frames');
}
await browser.close();
