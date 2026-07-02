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
  const srv = spawn('node', [path.resolve(__dirname, '../server/server.mjs'), String(PORT)], { stdio: 'pipe' });
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
    await page.evaluate(n => { localStorage.kh_name = n; }, name);
    await page.click('#mpbtn');
    await new Promise(r => setTimeout(r, 1200));
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

  // Disconnect A → B should drop the remote
  await A.page.close();
  await new Promise(r => setTimeout(r, 900));
  const b3 = await stateOf(B);

  await browser.close();
  srv.kill();

  const result = {
    aMode: a2.mode, bMode: b2.mode,
    bSeesAliceInitially: !!bSeesA1,
    aliceMovedLocally: +aliceMovedLocally.toFixed(1),
    aliceMovedRemotely: +aliceMovedRemotely.toFixed(1),
    remoteVsLocalGap: +posMatch.toFixed(1),
    remoteRemovedOnLeave: !b3.remotes.find(r => r.name === 'Alice'),
    errors: [...A.errors, ...B.errors],
    serverLog: srvLog
  };
  console.log(JSON.stringify(result, null, 2));
  const pass = result.aMode === 'mp' && result.bMode === 'mp' && result.bSeesAliceInitially &&
    aliceMovedLocally > 3 && aliceMovedRemotely > 3 && posMatch < 2 &&
    result.remoteRemovedOnLeave && !result.errors.length;
  console.log(pass ? 'MPTEST OK' : 'MPTEST FAILED');
  process.exit(pass ? 0 : 1);
})().catch(e => { console.error('MPTEST ERROR:', e.message); process.exit(1); });
