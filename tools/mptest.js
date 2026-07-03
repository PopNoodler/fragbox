// Multiplayer smoke test: starts server/server.mjs, connects two headless
// clients via the MULTIPLAYER button, moves client A, asserts client B sees
// A's remote avatar at a matching, moving position.
// Usage: node tools/mptest.js
const { spawn } = require('child_process');
const path = require('path');
const puppeteer = require(path.resolve(__dirname, 'node_modules/puppeteer-core'));

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORT = 18790;

(async () => {
  // combat server: no lobby bots, so the duel is deterministic
  const srv = spawn('node', [path.resolve(__dirname, '../server/server.mjs'), String(PORT), '--test', '--pop=0'], { stdio: 'pipe' });
  const srvLog = [];
  srv.stdout.on('data', d => srvLog.push(d.toString().trim()));
  srv.stderr.on('data', d => srvLog.push('ERR ' + d.toString().trim()));
  await new Promise(r => setTimeout(r, 1200));

  const browser = await puppeteer.launch({
    executablePath: EDGE, headless: 'new',
    args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox']
  });

  const mkClient = async name => {
    const page = await browser.newPage();
    await page.setViewport({ width: 1024, height: 600 });
    const errors = [];
    page.on('pageerror', e => errors.push(name + ': ' + e.message));
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2200));
    await page.evaluate(n => { localStorage.kh_name = n; const f = document.getElementById('namefield'); if(f) f.value = n; }, name);
    await page.click('#mpbtn');
    await new Promise(r => setTimeout(r, 900));
    await page.click('#resumebtn').catch(()=>{});   // DEPLOY through spawn class picker
    await new Promise(r => setTimeout(r, 500));
    return { page, errors, name };
  };

  const A = await mkClient('Alice');
  const B = await mkClient('Bob');
  await new Promise(r => setTimeout(r, 800));

  const stateOf = c => c.page.evaluate(() => ({
    mode: window.__dbg.mode,
    myId: window.__dbg.NET.id,
    // r.target is the last network-received position (mesh lerps only while
    // the tab's rAF runs, and background tabs pause rAF)
    remotes: [...window.__dbg.NET.remotes.entries()].map(([id, r]) => ({
      id, name: r.name, pos: r.target.toArray().map(v => +v.toFixed(1))
    })),
    myPos: window.__dbg.player.pos.toArray().map(v => +v.toFixed(1))
  }));

  const a1 = await stateOf(A), b1 = await stateOf(B);

  // Move Alice forward for 1.5s
  await A.page.bringToFront();
  // walk from a known-clear west-edge lane facing north (map layouts change; spawns may abut prefabs)
  await A.page.evaluate(() => {
    const d = window.__dbg;
    d.player.pos.set(-40, 0, 25); d.player.vel.set(0, 0, 0);
    d.player.yaw = 0; d.player.pitch = 0;
    d.NET.ws.send(JSON.stringify({ t:'tp', pos:[-40, 0, 25] }));
  });
  await new Promise(r => setTimeout(r, 400));
  await A.page.keyboard.down('KeyW');
  await new Promise(r => setTimeout(r, 1500));
  await A.page.keyboard.up('KeyW');
  await new Promise(r => setTimeout(r, 600));

  const a2 = await stateOf(A), b2 = await stateOf(B);

  const bSeesA1 = b1.remotes.find(r => r.name === 'Alice');
  const bSeesA2 = b2.remotes.find(r => r.name === 'Alice');
  const aliceMovedLocally = Math.hypot(a2.myPos[0]-a1.myPos[0], a2.myPos[2]-a1.myPos[2]);
  const aliceMovedRemotely = bSeesA1 && bSeesA2
    ? Math.hypot(bSeesA2.pos[0]-bSeesA1.pos[0], bSeesA2.pos[2]-bSeesA1.pos[2]) : -1;
  const posMatch = bSeesA2
    ? Math.hypot(bSeesA2.pos[0]-a2.myPos[0], bSeesA2.pos[2]-a2.myPos[2]) : 999;

  await B.page.screenshot({ path: path.join(__dirname, 'shots', '5-mp-bob.png') });

  // ---- Combat: teleport A and B 10u apart, Alice aims at Bob and fires ----
  const tp = (c, x, y, z) => c.page.evaluate((x, y, z) => {
    const d = window.__dbg;
    d.player.pos.set(x, y, z); d.player.vel.set(0,0,0);
    d.NET.ws.send(JSON.stringify({ t:'tp', pos:[x, y, z] }));
  }, x, y, z);
  // west-edge lane — kept clear of Meadow 2.0 prefab structures
  await tp(A, -40, 0, -10);
  await tp(B, -40, 0, -20);
  await new Promise(r => setTimeout(r, 400));

  await A.page.bringToFront();
  // focus loss (Bob's tab opening) auto-pauses Alice — dismiss the pause overlay first
  const unpause = async c => {
    const shown = await c.page.evaluate(() => getComputedStyle(document.getElementById('pausemenu')).display !== 'none');
    if (shown) { await c.page.click('#resumebtn'); await new Promise(r => setTimeout(r, 300)); }
  };
  await unpause(A);
  // aim Alice at Bob's chest, then hold fire (auto rifle)
  await A.page.evaluate(() => {
    const d = window.__dbg;
    const bob = [...d.NET.remotes.values()][0];
    const t = bob.target;
    const eye = d.player.pos.clone(); eye.y += 1.62;
    const dir = t.clone(); dir.y += 1.0; dir.sub(eye).normalize();
    d.player.pitch = Math.asin(dir.y);
    d.player.yaw = Math.atan2(-dir.x, -dir.z);
  });
  await A.page.mouse.down();
  await new Promise(r => setTimeout(r, 1400));   // ~14 rifle shots
  await A.page.mouse.up();
  await new Promise(r => setTimeout(r, 700));

  const aFight = await stateOf(A), bFight = await stateOf(B);
  const bHp = await B.page.evaluate(() => window.__dbg.player.hp);
  const bAlive = await B.page.evaluate(() => window.__dbg.player.alive);
  const aScore = await A.page.evaluate(() => ({ k: window.__dbg.player.kills, d: window.__dbg.player.deaths }));
  const bScore = await B.page.evaluate(() => ({ k: window.__dbg.player.kills, d: window.__dbg.player.deaths }));
  const bKillfeed = await B.page.evaluate(() => document.getElementById('killfeed').innerText);

  // Bob should respawn ~3s after dying
  await new Promise(r => setTimeout(r, 3500));
  const bAfter = await B.page.evaluate(() => ({ hp: window.__dbg.player.hp, alive: window.__dbg.player.alive,
    pos: window.__dbg.player.pos.toArray().map(v=>+v.toFixed(0)) }));

  // Disconnect A → B should drop the remote
  await A.page.close();
  await new Promise(r => setTimeout(r, 900));
  const b3 = await stateOf(B);

  srv.kill();

  // ---- Lobby bots: fresh server with default pop=6, one human joins ----
  const srv2 = spawn('node', [path.resolve(__dirname, '../server/server.mjs'), '18792', '--round=7'], { stdio: 'pipe' });
  srv2.stdout.on('data', d => srvLog.push('S2: ' + d.toString().trim()));
  await new Promise(r => setTimeout(r, 1000));
  const C = await (async () => {
    const page = await browser.newPage();
    await page.setViewport({ width: 1024, height: 600 });
    const errors = [];
    page.on('pageerror', e => errors.push('Cara: ' + e.message));
    await page.goto('http://127.0.0.1:18792/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2200));
    await page.evaluate(() => { localStorage.kh_name = 'Cara'; const f = document.getElementById('namefield'); if(f) f.value = 'Cara'; });
    await page.click('#mpbtn');
    await new Promise(r => setTimeout(r, 900));
    await page.click('#resumebtn').catch(()=>{});   // DEPLOY through spawn class picker
    await new Promise(r => setTimeout(r, 700));
    return { page, errors };
  })();
  const botInfo1 = await C.page.evaluate(() => ({
    n: window.__dbg.NET.remotes.size,
    pos: [...window.__dbg.NET.remotes.values()].map(r => r.target.toArray().map(v=>+v.toFixed(1)))
  }));
  await new Promise(r => setTimeout(r, 8000));   // let bots roam and fight
  const botInfo2 = await C.page.evaluate(() => ({
    n: window.__dbg.NET.remotes.size,
    pos: [...window.__dbg.NET.remotes.values()].map(r => r.target.toArray().map(v=>+v.toFixed(1))),
    shotsSeen: window.__dbg.NET.shotsSeen || 0,
    botKills: [...window.__dbg.NET.remotes.values()].reduce((s,r)=>s+(r.k||0), 0),
    kf: document.getElementById('killfeed').innerText,
    roundOverSeen: !!window.__dbg.NET.lastOver,
    timerText: document.getElementById('timeleft').textContent
  }));
  const botsMoved = botInfo1.pos.length === botInfo2.pos.length
    ? botInfo1.pos.filter((p,i)=>Math.hypot(p[0]-botInfo2.pos[i][0], p[2]-botInfo2.pos[i][2]) > 2).length
    : -1;
  await C.page.screenshot({ path: path.join(__dirname, 'shots', '6-mp-bots.png') });

  await browser.close();
  srv2.kill();

  const result = {
    aMode: a2.mode, bMode: b2.mode,
    bSeesAliceInitially: !!bSeesA1,
    aliceMovedLocally: +aliceMovedLocally.toFixed(1),
    aliceMovedRemotely: +aliceMovedRemotely.toFixed(1),
    remoteVsLocalGap: +posMatch.toFixed(1),
    combat: { bobHpAfterFire: bHp, bobDied: !bAlive, aliceKills: aScore.k, bobDeaths: bScore.d,
      bobKillfeedSawKill: /Alice/.test(bKillfeed), bobRespawned: bAfter.alive && bAfter.hp === 100 },
    remoteRemovedOnLeave: !b3.remotes.find(r => r.name === 'Alice'),
    lobbyBots: { count: botInfo2.n, moved: botsMoved, shotsSeen: botInfo2.shotsSeen, botKills: botInfo2.botKills,
      roundOverSeen: botInfo2.roundOverSeen, timerText: botInfo2.timerText },
    errors: [...A.errors, ...B.errors, ...C.errors],
    serverLog: srvLog
  };
  console.log(JSON.stringify(result, null, 2));
  const c = result.combat;
  const lb = result.lobbyBots;
  const pass = result.aMode === 'mp' && result.bMode === 'mp' && result.bSeesAliceInitially &&
    aliceMovedLocally > 3 && aliceMovedRemotely > 3 && posMatch < 2 &&
    c.bobDied && c.aliceKills >= 1 && c.bobDeaths >= 1 && c.bobKillfeedSawKill && c.bobRespawned &&
    lb.count === 5 && lb.moved >= 3 && lb.shotsSeen > 0 && lb.roundOverSeen && /^\d+:\d\d$/.test(lb.timerText) &&
    result.remoteRemovedOnLeave && !result.errors.length;
  console.log(pass ? 'MPTEST OK' : 'MPTEST FAILED');
  process.exit(pass ? 0 : 1);
})().catch(e => { console.error('MPTEST ERROR:', e.message); process.exit(1); });
