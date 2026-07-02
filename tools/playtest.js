// Headless playtest: serves the game, boots it in Edge (SwiftShader GL),
// starts a match, simulates input, reports errors + game state + screenshots.
// Usage: node tools/playtest.js   (run from the KourHero folder; npm i in tools/ first)
const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const ROOT = path.join(__dirname, '..');
const SHOTS = path.join(__dirname, 'shots');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml' };
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

const server = http.createServer((req, res) => {
  let p = req.url.split('?')[0];
  if (p === '/') p = '/index.html';
  fs.readFile(path.join(ROOT, p), (err, data) => {
    if (err) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
    res.end(data);
  });
});

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  await new Promise(r => server.listen(18777, r));
  const browser = await puppeteer.launch({
    executablePath: EDGE, headless: 'new',
    args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error' && !m.text().includes('favicon')) errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));

  await page.goto('http://127.0.0.1:18777/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await new Promise(r => setTimeout(r, 2500));
  const menuVisible = await page.$eval('#menu', m => m.classList.contains('show'));
  await page.screenshot({ path: path.join(SHOTS, '1-menu.png') });

  await page.click('#playbtn');
  await new Promise(r => setTimeout(r, 700));
  await page.screenshot({ path: path.join(SHOTS, '2-spawn.png') });

  // simulate some play
  await page.keyboard.down('KeyW');
  await new Promise(r => setTimeout(r, 1200));
  await page.keyboard.up('KeyW');
  await page.mouse.down(); await new Promise(r => setTimeout(r, 400)); await page.mouse.up();
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: path.join(SHOTS, '3-play.png') });

  const info = await page.evaluate(() => {
    const d = window.__dbg;
    return {
      hudShown: document.getElementById('hud').style.display === 'block',
      playerPos: d.player.pos.toArray().map(v => +v.toFixed(1)),
      playerHp: d.player.hp, playerAlive: d.player.alive,
      botsAlive: d.bots.filter(b => b.alive).length,
      botKillsTotal: d.bots.reduce((s, b) => s + b.kills, 0),
      time: document.getElementById('timeleft').textContent
    };
  });

  await page.keyboard.press('Digit2');
  await new Promise(r => setTimeout(r, 300));
  info.weaponSwitch = await page.$eval('#wname', e => e.textContent);
  await page.keyboard.down('Tab');
  await new Promise(r => setTimeout(r, 200));
  info.scoreboardHold = await page.$eval('#scoreboard', e => e.style.display === 'block');
  await page.keyboard.up('Tab');

  await browser.close(); server.close();
  info.menuVisible = menuVisible;
  info.consoleErrors = errors;
  console.log(JSON.stringify(info, null, 2));
  const pass = menuVisible && info.hudShown && !errors.length && info.scoreboardHold && info.weaponSwitch === 'M1911';
  console.log(pass ? 'PLAYTEST OK' : 'PLAYTEST FAILED');
  process.exit(pass ? 0 : 1);
})().catch(e => { console.error('PLAYTEST ERROR:', e.message); server.close(); process.exit(1); });
