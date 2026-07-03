// FragBox multiplayer server — static hosting + WebSocket state sync.
// Usage: node server/server.mjs [port]   (default 8080)
// Iteration scope: join/leave + validated movement sync @20Hz. Combat next.
import http from 'http';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { getMap, MAPS, PHYS } from '../shared/map.mjs';
const mapArg = (process.argv.find(a => a.startsWith('--map=')) || '').split('=')[1];
let MAP = getMap(mapArg);
const modeRaw = (process.argv.find(a => a.startsWith('--mode=')) || '').split('=')[1];
const MODE = ['tdm','gungame','ctf','dom'].includes(modeRaw) ? modeRaw : 'ffa';
const TEAMED = MODE === 'tdm' || MODE === 'ctf' || MODE === 'dom';
const TEAM_COLORS = [0xe53935, 0x2196f3];   // red, blue
const teamScores = [0, 0];
function pickTeam(){
  let a = 0, b = 0;
  for(const e of ents()){ if(e.team === 0) a++; else if(e.team === 1) b++; }
  return a <= b ? 0 : 1;
}
let ARENA = MAP.ARENA, BOXES = MAP.BOXES, SPAWNS = MAP.SPAWNS;
import { WEAPONS, HITBOX, GG_LADDER, NADE } from '../shared/weapons.mjs';
import { SKINS } from '../shared/cosmetics.mjs';
const SKIN_COLORS = new Set(SKINS.filter(s => !s.premium).map(s => s.color));

// Solid world AABBs for authoritative hitscan
function buildAABBs(boxes){
  return boxes.filter(b=>b.solid !== false).map(b => ({
    min: [b.x-b.sx/2, b.y-b.sy/2, b.z-b.sz/2],
    max: [b.x+b.sx/2, b.y+b.sy/2, b.z+b.sz/2]
  }));
}
let AABBS = buildAABBs(BOXES);

// Live map swap (between rounds, driven by votes)
function applyMap(id){
  MAP = getMap(id);
  ARENA = MAP.ARENA; BOXES = MAP.BOXES; SPAWNS = MAP.SPAWNS;
  AABBS = buildAABBs(BOXES);
  if(flags) for(const f of flags){
    f.base = [SPAWNS[f.team][0], SPAWNS[f.team][2] || 0, SPAWNS[f.team][1]];
    f.pos = [...f.base]; f.state = 'home'; f.carrier = null; f.returnT = 0;
  }
  if(domPoints){
    domPoints.length = 0;
    if(MAP.DOM) for(const d of MAP.DOM) domPoints.push({ x:d.x, z:d.z, label:d.label, owner:-1, prog:0, progTeam:-1 });
  }
  console.log('[▣] map switched to ' + MAP.name);
}

function rayBox(o, d, b){
  let tmin = 0, tmax = 300;
  for(let a=0; a<3; a++){
    if(Math.abs(d[a]) < 1e-9){
      if(o[a] < b.min[a] || o[a] > b.max[a]) return Infinity;
    } else {
      let t1 = (b.min[a]-o[a])/d[a], t2 = (b.max[a]-o[a])/d[a];
      if(t1 > t2){ const t = t1; t1 = t2; t2 = t; }
      tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2);
      if(tmin > tmax) return Infinity;
    }
  }
  return tmin;
}
function rayWorld(o, d){
  let best = Infinity;
  for(const b of AABBS){ const t = rayBox(o, d, b); if(t < best) best = t; }
  return best;
}
function raySphere(o, d, c, r){
  const oc = [c[0]-o[0], c[1]-o[1], c[2]-o[2]];
  const t = oc[0]*d[0] + oc[1]*d[1] + oc[2]*d[2];
  if(t < 0) return Infinity;
  const d2 = (oc[0]*oc[0] + oc[1]*oc[1] + oc[2]*oc[2]) - t*t;
  if(d2 > r*r) return Infinity;
  return t - Math.sqrt(r*r - d2);
}

const PORT = (() => { const a = process.argv.slice(2).find(x => /^[0-9]+$/.test(x)); return a ? +a : 8080; })();
const TEST = process.argv.includes('--test');   // enables {t:'tp'} for automated tests only
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.json':'application/json', '.svg':'image/svg+xml' };

process.on('uncaughtException', err => {
  if(err && err.code === 'EADDRINUSE'){
    console.error('Port ' + PORT + ' is already in use — close the other FragBox window (or run: taskkill /f /im node.exe) and try again.');
    process.exit(1);
  }
  throw err;
});
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const file = path.normalize(path.join(ROOT, p));
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});

const wss = new WebSocketServer({ server });

const TICK = 50;                    // ms → 20Hz
const players = new Map();          // id → player
let nextId = 1;

const COLORS = [0xe53935, 0x8e24aa, 0xfb8c00, 0x00897b, 0x3949ab, 0xc0ca33, 0xd81b60, 0x00acc1];

function spawnPos(team){
  // furthest from living threats (in TDM: only the enemy team counts)
  let best = SPAWNS[0], bestScore = -1;
  for(const s of SPAWNS){
    let d = 1000;
    for(const p of ents()){
      if(!p.alive) continue;
      if(TEAMED && team !== undefined && p.team === team) continue;
      d = Math.min(d, Math.hypot(s[0]-p.pos[0], s[1]-p.pos[2]));
    }
    d += Math.random()*8;
    if(d > bestScore){ bestScore = d; best = s; }
  }
  return [best[0], best[2] || 0, best[1]];
}

function send(ws, msg){ if(ws && ws.readyState === 1) ws.send(JSON.stringify(msg)); }
function broadcast(msg, exceptId){
  const s = JSON.stringify(msg);
  for(const p of players.values()) if(p.id !== exceptId && p.ws.readyState === 1) p.ws.send(s);
}

// ---------- Lobby bots ----------
const BOT_NAMES = ['Vex','Nova','Rusty','Ghost','Piko','Zed','Mango','Bolt','Frost','Kilo','Echo','Juno'];
const popArg = process.argv.find(s => s.startsWith('--pop='));
const TARGET_POP = popArg ? +popArg.split('=')[1] : 6;
const roundArg = process.argv.find(s => s.startsWith('--round='));
const ROUND_LEN = (roundArg ? +roundArg.split('=')[1] : 300) * 1000;
let roundEnd = 0;   // armed when the first human joins
const bots = [];
let botIdx = 0;

function ents(){ return [...players.values(), ...bots]; }

function addBot(){
  const id = nextId++;
  const team = TEAMED ? pickTeam() : -1;
  const wPool = [0,0,1,1,2,4,5,6,7,8,9];    // weighted arsenal (AWP excluded from bots)
  const b = {
    id, ws:null, isBot:true, team, gg: 0, streak: 0, shield: 0,
    wIdx: wPool[Math.floor(Math.random()*wPool.length)],
    name: BOT_NAMES[botIdx++ % BOT_NAMES.length],
    color: TEAMED ? TEAM_COLORS[team] : COLORS[id % COLORS.length],
    pos: spawnPos(team), yaw: 0, pitch: 0,
    hp: 100, kills: 0, deaths: 0, alive: true, deadUntil: 0, lastFire: 0,
    lvl: 1 + Math.floor(Math.random()*15),
    target: null, enemy: null, thinkT: Math.random(), fireT: 0, strafeDir: 1, strafeT: 0, seeT: 0,
    skill: 0.45 + Math.random()*0.3
  };
  bots.push(b);
  broadcast({ t:'joined', id, name:b.name, color:b.color, pos:b.pos, team:b.team });
}
function removeBot(){
  const b = bots.pop();
  if(b) broadcast({ t:'left', id:b.id });
}
function balanceBots(){
  while(players.size + bots.length < TARGET_POP && players.size > 0) addBot();
  while(players.size + bots.length > TARGET_POP && bots.length > 0) removeBot();
  if(players.size === 0) bots.length = 0;   // empty server: no one to entertain
}

wss.on('connection', ws => {
  const id = nextId++;
  let joined = false;

  ws.on('message', raw => {
    try {
    let m;
    try { m = JSON.parse(raw); } catch(e){ return; }

    if(m.t === 'join' && !joined){
      joined = true;
      const p = {
        id, ws,
        name: String(m.name || 'Player').slice(0, 14),
        team: TEAMED ? pickTeam() : -1,
        gg: 0, nades: NADE.perLife, streak: 0, shield: 0,
        color: SKIN_COLORS.has(+m.skin) ? +m.skin : COLORS[id % COLORS.length],
        maxHp: Math.max(80, Math.min(120, +m.maxhp || 100)),   // class hp, clamped
        lvl: Math.max(1, Math.min(99, (+m.lvl|0) || 1)),
        pos: spawnPos(), yaw: 0, pitch: 0,
        hp: 100, kills: 0, deaths: 0,
        alive: true, deadUntil: 0, lastFire: 0,
        lastMove: Date.now(),
        lastInput: Date.now()
      };
      if(TEAMED) p.color = TEAM_COLORS[p.team];
      p.pos = spawnPos(p.team);
      p.hp = p.maxHp;
      players.set(id, p);
      if(players.size === 1) roundEnd = Date.now() + ROUND_LEN;   // first human starts the round
      balanceBots();
      const lanIps = Object.values(os.networkInterfaces()).flat()
        .filter(i => i && i.family === 'IPv4' && !i.internal).map(i => i.address);
      send(ws, { t:'welcome', id, pos:p.pos, color:p.color, map: MAP.id, mode: MODE, team: p.team, ips: lanIps,
        roster: ents().map(q=>({ id:q.id, name:q.name, color:q.color, pos:q.pos, yaw:q.yaw, lvl:q.lvl, team:q.team })) });
      broadcast({ t:'joined', id, name:p.name, color:p.color, pos:p.pos, team:p.team }, id);
      console.log(`[+] ${p.name} (#${id}) joined — ${players.size} human(s), ${bots.length} bot(s)`);
      return;
    }

    const p = players.get(id);
    if(!p) return;

    if(m.t === 'cls' && Number.isFinite(+m.maxhp)){
      const undamaged = p.alive && p.hp === p.maxHp;
      p.maxHp = Math.max(80, Math.min(120, +m.maxhp));   // applies from next respawn
      if(undamaged) p.hp = p.maxHp;                       // pre-fight class swap heals to new max
      return;
    }

    if(m.t === 'tp' && TEST && Array.isArray(m.pos)){
      p.pos = m.pos.map(Number);
      p.lastMove = Date.now();
      return;
    }

    if(m.t === 'vote' && typeof m.map === 'string'){
      if(intermission && voteOpts && voteOpts.includes(m.map)) votes.set(p.id, m.map);
      return;
    }

    if(m.t === 'ability' && p.alive && m.k === 'nade'){
      const nowMs = Date.now();
      if(p.abilityAt && nowMs - p.abilityAt < 18000) return;   // server-side cooldown
      p.abilityAt = nowMs;
      p.nades = Math.min(NADE.perLife + 1, (p.nades|0) + 1);
      return;
    }

    if(m.t === 'nade' && p.alive && Array.isArray(m.o) && Array.isArray(m.v) && m.o.length === 3){
      if((p.nades|0) <= 0) return;
      const o = m.o.map(Number), v = m.v.map(Number);
      if(![...o, ...v].every(Number.isFinite)) return;
      if(Math.hypot(o[0]-p.pos[0], o[1]-(p.pos[1]+PHYS.EYE), o[2]-p.pos[2]) > 4) return;
      const sp = Math.hypot(...v);
      if(sp > NADE.speed + NADE.up + 4) return;          // speed cap
      p.nades--;
      liveNades.push({ pos:[...o], vel:[...v], t: 0, owner: p.id });
      broadcast({ t:'nadeSpawn', owner: p.id, o, v });
      return;
    }

    if(m.t === 'fire' && p.alive && Array.isArray(m.o) && Array.isArray(m.d) && m.o.length === 3){
      const w = MODE === 'gungame' ? WEAPONS[GG_LADDER[Math.min(p.gg, GG_LADDER.length-1)]] : WEAPONS[m.w|0];
      if(!w) return;
      const now = Date.now();
      if(now - p.lastFire < (60000/w.rpm) * 0.7) return;   // fire-rate cap (30% net slack)
      p.lastFire = now;
      const o = m.o.map(Number), baseD = m.d.map(Number);
      if(![...o, ...baseD].every(Number.isFinite)) return;
      // origin must be near the player the server knows about
      if(Math.hypot(o[0]-p.pos[0], o[1]-(p.pos[1]+PHYS.EYE), o[2]-p.pos[2]) > 3) return;
      const bl = Math.hypot(baseD[0], baseD[1], baseD[2]) || 1;
      const nd = [baseD[0]/bl, baseD[1]/bl, baseD[2]/bl];
      doFire(p, o, nd, w, !!m.ads, Math.max(1, Math.min(4, +m.bl || 1)));
      return;
    }

    if(m.t === 'in' && Array.isArray(m.pos) && m.pos.length === 3){
      if(!p.alive) return;                     // the dead don't move
      const now = Date.now();
      const dtMs = Math.max(16, now - p.lastMove);
      p.lastMove = now;
      const [nx, ny, nz] = m.pos.map(Number);
      if(![nx,ny,nz].every(Number.isFinite)) return;
      // validate: bounds + horizontal speed cap (sprint * slack; pads make y legal anyway)
      const maxD = (PHYS.SPRINT * 1.6) * (dtMs/1000) + 0.5;
      const dx = nx - p.pos[0], dz = nz - p.pos[2];
      if(Math.hypot(dx, dz) <= maxD){
        p.pos[0] = Math.max(-ARENA, Math.min(ARENA, nx));
        p.pos[2] = Math.max(-ARENA, Math.min(ARENA, nz));
      } // else: reject (client will be snapped by next snapshot echo)
      p.pos[1] = Math.max(0, Math.min(40, ny));
      p.yaw = +m.yaw || 0;
      p.pitch = +m.pitch || 0;
      p.crouch = !!m.c;
      p.lastInput = Date.now();
    }
    } catch(err){ console.error('[!] message handler error:', err.message); }
  });

  ws.on('close', () => {
    if(flags) for(const f of flags){
      if(f.carrier === id){ dropFlag(f, f.pos); flagEvent('dropped', f.team, null); }
    }
    if(players.delete(id)){
      broadcast({ t:'left', id });
      balanceBots();
      console.log(`[-] #${id} left — ${players.size} human(s), ${bots.length} bot(s)`);
    }
  });
  ws.on('error', () => {});
});

let lastKillWeapon = '';
function doFire(shooter, o, nd, w, ads, bloomMult = 1){
  lastKillWeapon = w.name;
  broadcast({ t:'shot', id:shooter.id, o, d:nd, w:WEAPONS.indexOf(w) }, shooter.id);
  for(let pe=0; pe<w.pellets; pe++){
    const spr = (ads && w.adsSpread !== undefined ? w.adsSpread : w.spread) * bloomMult;
    let d = [ nd[0]+(Math.random()-0.5)*2*spr, nd[1]+(Math.random()-0.5)*2*spr, nd[2]+(Math.random()-0.5)*2*spr ];
    const l = Math.hypot(...d) || 1; d = d.map(v=>v/l);
    const wallT = rayWorld(o, d);
    let victim = null, hitT = wallT, headshot = false;
    for(const q of ents()){
      if(q.id === shooter.id || !q.alive) continue;
      if(TEAMED && q.team === shooter.team) continue;   // no friendly fire
      const hY = q.crouch ? HITBOX.headY * 0.68 : HITBOX.headY;
      const bY = q.crouch ? HITBOX.bodyY * 0.7  : HITBOX.bodyY;
      const tH = raySphere(o, d, [q.pos[0], q.pos[1]+hY, q.pos[2]], HITBOX.headR);
      const tB = raySphere(o, d, [q.pos[0], q.pos[1]+bY, q.pos[2]], HITBOX.bodyR);
      let t = Infinity, hs = false;
      if(tH < t){ t = tH; hs = true; }
      if(tB < t){ t = tB; hs = false; }
      if(t < hitT){ hitT = t; victim = q; headshot = hs; }
    }
    if(victim) applyDamage(victim, headshot ? w.dmg*2 : w.dmg, shooter, headshot);
  }
}

function scheduleAirstrike(striker){
  setTimeout(()=>{
    let delay = 0;
    for(const e of ents()){
      if(!e.alive || e.id === striker.id) continue;
      if(TEAMED && striker.team >= 0 && e.team === striker.team) continue;
      for(let k = 0; k < 2; k++){
        const at = [e.pos[0] + (Math.random()-0.5)*4, 0.4, e.pos[2] + (Math.random()-0.5)*4];
        setTimeout(()=>explodeNade({ pos: at, owner: striker.id }), delay);
        delay += 140;
      }
    }
  }, 1500);
}

// ---- Domination ----
const DOM_WIN = 200, DOM_RADIUS = 4;
const domPoints = MODE === 'dom' && MAP.DOM ? MAP.DOM.map(d => ({
  x: d.x, z: d.z, label: d.label, owner: -1, prog: 0, progTeam: -1
})) : null;
let domAcc = 0;
function tickDom(dt){
  if(!domPoints) return;
  for(let i = 0; i < domPoints.length; i++){
    const pt = domPoints[i];
    let c0 = 0, c1 = 0;
    for(const e of ents()){
      if(!e.alive || e.team < 0) continue;
      if(Math.hypot(e.pos[0] - pt.x, e.pos[2] - pt.z) > DOM_RADIUS) continue;
      if(e.team === 0) c0++; else c1++;
    }
    if(c0 > 0 && c1 > 0) continue;                      // contested: progress frozen
    const team = c0 > 0 ? 0 : c1 > 0 ? 1 : -1;
    if(team === -1){
      pt.prog = Math.max(0, pt.prog - dt * 0.2);        // slow decay when abandoned
      continue;
    }
    if(pt.owner === team){ pt.prog = 0; pt.progTeam = -1; continue; }
    if(pt.progTeam !== team){ pt.progTeam = team; pt.prog = 0; }
    pt.prog += dt * 0.45 * Math.min(3, team === 0 ? c0 : c1);   // ~2.2s solo, faster stacked
    if(pt.prog >= 1){
      pt.owner = team; pt.prog = 0; pt.progTeam = -1;
      broadcast({ t:'dom', ev:'captured', i, label: pt.label, team });
      console.log('[◆] ' + pt.label + ' captured by team' + team);
    }
  }
  domAcc += dt;
  while(domAcc >= 1){
    domAcc -= 1;
    for(const pt of domPoints) if(pt.owner >= 0) teamScores[pt.owner]++;
    if(teamScores[0] >= DOM_WIN || teamScores[1] >= DOM_WIN) roundEnd = Date.now();
  }
}

// ---- Capture the Flag ----
const CTF_CAPS_TO_WIN = 3;
const flags = MODE === 'ctf' ? [0, 1].map(team => {
  const base = [SPAWNS[team][0], SPAWNS[team][2] || 0, SPAWNS[team][1]];
  return { team, base, pos: [...base], state: 'home', carrier: null, returnT: 0 };
}) : null;

function flagEvent(ev, team, by){
  broadcast({ t:'flag', ev, team, by: by ? by.name : undefined });
  console.log('[⚑] ' + ev + ' team' + team + (by ? ' by ' + by.name : ''));
}
function dropFlag(f, at){
  f.state = 'dropped';
  f.carrier = null;
  f.pos = [at[0], 0.2, at[2]];
  f.returnT = 15;
}
function carrierOf(f){ return f.carrier === null ? null : ents().find(e => e.id === f.carrier); }
function tickFlags(dt){
  if(!flags) return;
  for(const f of flags){
    if(f.state === 'carried'){
      const c = carrierOf(f);
      if(!c || !c.alive){ dropFlag(f, c ? c.pos : f.pos); flagEvent('dropped', f.team, c); continue; }
      f.pos = [c.pos[0], c.pos[1] + 2.1, c.pos[2]];
      // capture: carrier at own base while own flag is home
      const own = flags[c.team];
      const d = Math.hypot(c.pos[0] - own.base[0], c.pos[2] - own.base[2]);
      if(d < 2.4 && own.state === 'home'){
        teamScores[c.team]++;
        f.state = 'home'; f.carrier = null; f.pos = [...f.base];
        flagEvent('captured', f.team, c);
        send(c.ws, { t:'streak', tier: 0 });   // no-op tier keeps protocol simple; capture XP client-side via flag event
        if(teamScores[c.team] >= CTF_CAPS_TO_WIN) roundEnd = Date.now();   // triggers round over
      }
      continue;
    }
    if(f.state === 'dropped'){
      f.returnT -= dt;
      if(f.returnT <= 0){
        f.state = 'home'; f.pos = [...f.base];
        flagEvent('returned', f.team, null);
        continue;
      }
    }
    // pickups / returns by touch
    for(const e of ents()){
      if(!e.alive || e.team < 0) continue;
      const d = Math.hypot(e.pos[0] - f.pos[0], e.pos[2] - f.pos[2]);
      if(d > 1.8) continue;
      if(e.team !== f.team && (f.state === 'home' || f.state === 'dropped')){
        f.state = 'carried'; f.carrier = e.id;
        flagEvent('taken', f.team, e);
        break;
      }
      if(e.team === f.team && f.state === 'dropped'){
        f.state = 'home'; f.pos = [...f.base]; f.returnT = 0;
        flagEvent('returned', f.team, e);
        break;
      }
    }
  }
}

// ---- Map voting (intermission between rounds) ----
let intermission = false, voteOpts = null;
const votes = new Map();

const liveNades = [];
function stepNade(g, dt){
  g.vel[1] -= PHYS.GRAV * 0.85 * dt;
  const nx = g.pos[0] + g.vel[0]*dt, ny = g.pos[1] + g.vel[1]*dt, nz = g.pos[2] + g.vel[2]*dt;
  if(ny <= 0.13 && g.vel[1] < 0){
    g.pos[1] = 0.13;
    g.vel[1] = -g.vel[1] * NADE.restitution;
    g.vel[0] *= 0.75; g.vel[2] *= 0.75;
    if(Math.abs(g.vel[1]) < 1.2) g.vel[1] = 0;
  } else g.pos[1] = ny;
  let hitX = false, hitZ = false;
  for(const c of AABBS){
    if(g.pos[1] > c.max[1] + 0.13 || g.pos[1] < c.min[1] - 0.13) continue;
    const inZ = g.pos[2] > c.min[2] - 0.13 && g.pos[2] < c.max[2] + 0.13;
    const inX = g.pos[0] > c.min[0] - 0.13 && g.pos[0] < c.max[0] + 0.13;
    if(inZ && nx > c.min[0] - 0.13 && nx < c.max[0] + 0.13 && !inX) hitX = true;
    if(inX && nz > c.min[2] - 0.13 && nz < c.max[2] + 0.13 && !inZ) hitZ = true;
    if(inX && inZ && g.vel[1] < 0 && g.pos[1] >= c.max[1] - 0.2 && ny <= c.max[1] + 0.13){
      g.pos[1] = c.max[1] + 0.13;
      g.vel[1] = -g.vel[1] * NADE.restitution;
      g.vel[0] *= 0.75; g.vel[2] *= 0.75;
    }
  }
  if(hitX) g.vel[0] = -g.vel[0] * NADE.restitution; else g.pos[0] = nx;
  if(hitZ) g.vel[2] = -g.vel[2] * NADE.restitution; else g.pos[2] = nz;
}
function explodeNade(g){
  lastKillWeapon = 'Grenade';
  broadcast({ t:'boom', pos: g.pos.map(v=>+v.toFixed(2)) });
  const owner = ents().find(e => e.id === g.owner) || { id:g.owner, name:'Grenade', ws:null, kills:0, team:-1 };
  for(const e of ents()){
    if(!e.alive || e.id === g.owner) continue;                       // no MP self-damage
    if(TEAMED && owner.team >= 0 && e.team === owner.team) continue;
    const c = [e.pos[0], e.pos[1]+1, e.pos[2]];
    const dx = c[0]-g.pos[0], dy = c[1]-g.pos[1], dz = c[2]-g.pos[2];
    const dist = Math.hypot(dx, dy, dz);
    if(dist > NADE.radius) continue;
    const d = [dx/(dist||1), dy/(dist||1), dz/(dist||1)];
    if(rayWorld(g.pos, d) < dist - 0.3) continue;                     // wall blocks blast
    applyDamage(e, Math.round(Math.max(NADE.minDmg, NADE.dmg * (1 - dist/NADE.radius))), owner, false);
  }
}

function ggWin(winner){
  const standings = ents().slice().sort((a,b)=>b.gg-a.gg || b.kills-a.kills)
    .map(e => ({ name:e.name, k:e.kills, d:e.deaths, g:e.gg }));
  broadcast({ t:'over', top: standings.slice(0, 10), gg: winner.name });
  console.log(`[◷] gun game won by ${winner.name}`);
  for(const e of ents()){
    e.kills = 0; e.deaths = 0; e.gg = 0;
    e.hp = e.maxHp || 100; e.alive = true; e.deadUntil = 0;
    e.pos = spawnPos(e.team);
    if(e.isBot){ e.enemy = null; e.target = null; e.seeT = 0; }
    send(e.ws, { t:'spawn', pos:e.pos });
    send(e.ws, { t:'gg', idx: 0 });
  }
  roundEnd = Date.now() + ROUND_LEN;
}

function applyDamage(victim, dmg, attacker, headshot){
  if(!victim.alive) return;
  if(!victim.recentDmg) victim.recentDmg = [];
  victim.recentDmg.push({ id: attacker.id, dmg, t: Date.now() });
  if(victim.recentDmg.length > 12) victim.recentDmg.shift();
  if((victim.shield|0) > 0){
    const abs = Math.min(victim.shield, dmg);
    victim.shield -= abs;
    dmg -= abs;
  }
  victim.hp -= dmg;
  send(attacker.ws, { t:'hitfx', hs:!!headshot, dmg, pos:victim.pos.map(v=>+v.toFixed(1)) });
  if(victim.hp > 0){
    send(victim.ws, { t:'dmg', hp:victim.hp, sh:victim.shield|0, from:attacker.name, apos:attacker.pos.map(v=>+v.toFixed(1)) });
    return;
  }
  victim.hp = 0;
  victim.alive = false;
  victim.deaths++;
  victim.deadUntil = Date.now() + 3000;
  attacker.kills++;
  attacker.streak = (attacker.streak || 0) + 1;
  victim.streak = 0;
  victim.shield = 0;
  if(flags) for(const f of flags){
    if(f.carrier === victim.id){ dropFlag(f, victim.pos); flagEvent('dropped', f.team, victim); }
  }
  if(attacker.streak === 3) send(attacker.ws, { t:'streak', tier:3 });
  else if(attacker.streak === 5){ attacker.shield = 50; send(attacker.ws, { t:'streak', tier:5, sh:50 }); }
  else if(attacker.streak === 7){
    send(attacker.ws, { t:'streak', tier:7 });
    broadcast({ t:'strike', by: attacker.name });
    scheduleAirstrike(attacker);
  }
  if(MODE === 'tdm' && attacker.team >= 0) teamScores[attacker.team]++;
  if(MODE === 'gungame'){
    attacker.gg++;
    if(attacker.gg >= GG_LADDER.length){
      ggWin(attacker);
    } else {
      send(attacker.ws, { t:'gg', idx: attacker.gg });
    }
  }
  send(victim.ws, { t:'die', by:attacker.name, bhp:Math.max(1, Math.round(attacker.hp)), kid:attacker.id, kw:lastKillWeapon });
  // assists: ≥25 dmg in the last 4s from someone other than the killer
  const cutoff = Date.now() - 4000;
  const contrib = {};
  for(const r of (victim.recentDmg || [])) if(r.t >= cutoff && r.id !== attacker.id) contrib[r.id] = (contrib[r.id] || 0) + r.dmg;
  let asn;
  for(const idStr in contrib){
    if(contrib[idStr] < 25) continue;
    const helper = ents().find(e => e.id === +idStr && e.alive !== undefined);
    if(!helper) continue;
    if(!asn) asn = helper.name;
    send(helper.ws, { t:'assist', victim: victim.name });
  }
  victim.recentDmg = [];
  broadcast({ t:'kill', killer:attacker.name, killerId:attacker.id, victim:victim.name, victimId:victim.id, hs:!!headshot, kwn:lastKillWeapon, asn });
  console.log(`[x] ${attacker.name} killed ${victim.name}${headshot?' (headshot)':''}`);
}

// ---------- Bot AI (server tick) ----------
const BOT_SPEED = 6.2, BOT_R = 0.45, BOT_H = 1.8;

function canSee(from, to){
  const o = [from.pos[0], from.pos[1]+1.55, from.pos[2]];
  const e = [to.pos[0], to.pos[1]+1.3, to.pos[2]];
  const dx = e[0]-o[0], dy = e[1]-o[1], dz = e[2]-o[2];
  const dist = Math.hypot(dx, dy, dz);
  if(dist > 60) return 0;
  const d = [dx/dist, dy/dist, dz/dist];
  return rayWorld(o, d) >= dist - 0.05 ? dist : 0;
}

function randomWaypoint(){
  for(let t=0; t<12; t++){
    const x = (Math.random()*2-1)*(ARENA-3), z = (Math.random()*2-1)*(ARENA-3);
    let inside = false;
    for(const c of AABBS){
      if(x > c.min[0]-0.6 && x < c.max[0]+0.6 && z > c.min[2]-0.6 && z < c.max[2]+0.6 && c.min[1] < 1.5){ inside = true; break; }
    }
    if(!inside) return [x, 0, z];
  }
  return [0, 0, 0];
}

function moveBot(b, mx, mz, dt){
  let nx = b.pos[0] + mx*dt;
  for(const c of AABBS){
    if(b.pos[1] < c.max[1] && b.pos[1]+BOT_H > c.min[1] && b.pos[2]+BOT_R > c.min[2] && b.pos[2]-BOT_R < c.max[2]){
      if(nx+BOT_R > c.min[0] && nx-BOT_R < c.max[0]) nx = mx > 0 ? c.min[0]-BOT_R : c.max[0]+BOT_R;
    }
  }
  b.pos[0] = Math.max(-ARENA+BOT_R, Math.min(ARENA-BOT_R, nx));
  let nz = b.pos[2] + mz*dt;
  for(const c of AABBS){
    if(b.pos[1] < c.max[1] && b.pos[1]+BOT_H > c.min[1] && b.pos[0]+BOT_R > c.min[0] && b.pos[0]-BOT_R < c.max[0]){
      if(nz+BOT_R > c.min[2] && nz-BOT_R < c.max[2]) nz = mz > 0 ? c.min[2]-BOT_R : c.max[2]+BOT_R;
    }
  }
  b.pos[2] = Math.max(-ARENA+BOT_R, Math.min(ARENA-BOT_R, nz));
}

function tickBot(b, dt){
  if(!b.alive) return;
  b.thinkT -= dt;
  if(b.thinkT <= 0){
    b.thinkT = 0.4 + Math.random()*0.5;
    let best = null, bestD = Infinity;
    for(const e of ents()){
      if(e.id === b.id || !e.alive) continue;
      if(TEAMED && e.team === b.team) continue;
      const d = canSee(b, e);
      if(d && d < bestD){ best = e; bestD = d; }
    }
    if(best !== b.enemy) b.seeT = 0;
    b.enemy = best;
    if(b.enemy) b.target = null;
    else if(!b.target || Math.hypot(b.target[0]-b.pos[0], b.target[2]-b.pos[2]) < 2) b.target = randomWaypoint();
  }

  // Domination: hold a point you're flipping; otherwise head for one you don't own
  if(domPoints && !b.enemy){
    const inPt = domPoints.find(pt => pt.owner !== b.team && Math.hypot(b.pos[0]-pt.x, b.pos[2]-pt.z) < 3.2);
    if(inPt) b.target = [inPt.x, 0, inPt.z];        // stand on it until it flips
    else {
      const onMission = b.target && domPoints.some(pt =>
        pt.owner !== b.team && Math.hypot(b.target[0]-pt.x, b.target[2]-pt.z) < 4);
      if(!onMission && Math.random() < 0.6){
        const want = domPoints.filter(pt => pt.owner !== b.team);
        if(want.length){
          const pt = want[Math.floor(Math.random() * want.length)];
          b.target = [pt.x + (Math.random()-0.5)*2, 0, pt.z + (Math.random()-0.5)*2];
        }
      }
    }
  }
  // CTF objectives override roaming
  if(flags){
    const mine = flags.find(f => f.carrier === b.id);
    if(mine){
      const own = flags[b.team];
      b.target = [own.base[0], 0, own.base[2]];        // run it home
    } else {
      const enemyFlag = flags[1 - b.team];
      const ownFlag = flags[b.team];
      if(ownFlag.state === 'carried' && Math.random() < 0.6){
        const c = carrierOf(ownFlag);
        if(c) b.target = [c.pos[0], 0, c.pos[2]];      // hunt the carrier
      } else if(!b.enemy && Math.random() < 0.35){
        b.target = [enemyFlag.pos[0], 0, enemyFlag.pos[2]];   // go for the grab
      }
    }
  }
  const enemy = (b.enemy && b.enemy.alive) ? b.enemy : null;
  const seeDist = enemy ? canSee(b, enemy) : 0;

  let mx = 0, mz = 0;
  if(enemy && seeDist){
    b.strafeT -= dt;
    if(b.strafeT <= 0){ b.strafeT = 0.7 + Math.random(); b.strafeDir *= -1; }
    const tx = enemy.pos[0]-b.pos[0], tz = enemy.pos[2]-b.pos[2];
    const tl = Math.hypot(tx, tz) || 1;
    const ux = tx/tl, uz = tz/tl;
    mx = uz*b.strafeDir; mz = -ux*b.strafeDir;
    if(seeDist > 25){ mx += ux*0.8; mz += uz*0.8; }
    else if(seeDist < 8){ mx -= ux*0.7; mz -= uz*0.7; }
    const carrySlow = flags && flags.some(f => f.carrier === b.id) ? 0.9 : 1;
    const ml = Math.hypot(mx, mz) || 1; mx = mx/ml*BOT_SPEED*carrySlow; mz = mz/ml*BOT_SPEED*carrySlow;
    b.yaw = Math.atan2(tx, tz);
  } else if(b.target){
    // unstick: barely moving toward a waypoint for 2s → reroll it
    if(b._lx !== undefined && Math.hypot(b.pos[0]-b._lx, b.pos[2]-b._lz) < 0.05){
      b.stuckT = (b.stuckT || 0) + dt;
      if(b.stuckT > 2){ b.target = randomWaypoint(); b.stuckT = 0; }
    } else b.stuckT = 0;
    b._lx = b.pos[0]; b._lz = b.pos[2];
    const tx = b.target[0]-b.pos[0], tz = b.target[2]-b.pos[2];
    const tl = Math.hypot(tx, tz) || 1;
    mx = tx/tl*BOT_SPEED; mz = tz/tl*BOT_SPEED;
    b.yaw = Math.atan2(tx, tz);
  }
  if(mx || mz) moveBot(b, mx, mz, dt);

  // shoot with human-ish reaction window
  b.fireT -= dt;
  if(seeDist){ b.seeT += dt; } else { b.seeT = Math.max(0, b.seeT - dt*2); }
  const reaction = 0.35 + (1-b.skill)*0.5;
  if(enemy && seeDist && seeDist < 55 && b.fireT <= 0 && b.seeT >= reaction){
    const bwv = MODE === 'gungame' ? WEAPONS[GG_LADDER[Math.min(b.gg, GG_LADDER.length-1)]] : WEAPONS[b.wIdx || 0];
    b.fireT = bwv.auto ? (0.8 + (1-b.skill)*0.8 + Math.random()*0.3) : Math.max(0.6, 60/bwv.rpm*1.5) + (1-b.skill)*0.5;
    const o = [b.pos[0], b.pos[1]+PHYS.EYE, b.pos[2]];
    const err = (1-b.skill) * 1.3;
    const t = [ enemy.pos[0]+(Math.random()-0.5)*err, enemy.pos[1]+1.0+(Math.random()-0.5)*err, enemy.pos[2]+(Math.random()-0.5)*err ];
    let d = [t[0]-o[0], t[1]-o[1], t[2]-o[2]];
    const l = Math.hypot(...d) || 1; d = d.map(v=>v/l);
    const bw = MODE === 'gungame' ? WEAPONS[GG_LADDER[Math.min(b.gg, GG_LADDER.length-1)]] : WEAPONS[b.wIdx || 0];
    doFire(b, o, d, bw, false);
  }
}

setInterval(() => {
  if(!players.size) return;
  const now = Date.now();
  const dt = TICK/1000;

  // round over → intermission with map vote, then reset onto the winning map
  if(now >= roundEnd && !intermission){
    intermission = true;
    const others = Object.keys(MAPS).filter(id => id !== MAP.id).sort(() => Math.random() - 0.5);
    voteOpts = [MAP.id, ...others.slice(0, 2)];
    votes.clear();
    const standings = ents().slice().sort((a,b)=>b.kills-a.kills || a.deaths-b.deaths)
      .map(e => ({ name:e.name, k:e.kills, d:e.deaths }));
    broadcast({ t:'over', top: standings.slice(0, 10), ts: TEAMED ? [...teamScores] : undefined,
      vote: voteOpts.map(id => ({ id, name: MAPS[id].name })) });
    console.log(`[◷] round over — winner: ${standings[0] ? standings[0].name : '—'} · voting: ${voteOpts.join('/')}`);
    roundEnd = now + 7000;
  } else if(now >= roundEnd && intermission){
    intermission = false;
    // tally: most votes wins, ties keep the current map
    const tally = {};
    for(const v of votes.values()) tally[v] = (tally[v] || 0) + 1;
    let winner = MAP.id, best = tally[MAP.id] || 0;
    for(const id of voteOpts) if((tally[id] || 0) > best){ best = tally[id]; winner = id; }
    if(winner !== MAP.id){
      applyMap(winner);
      broadcast({ t:'mapchange', id: winner });
    }
    voteOpts = null;
    for(const e of ents()){
      e.kills = 0; e.deaths = 0; e.gg = 0; e.streak = 0; e.shield = 0;
      e.hp = e.maxHp || 100; e.alive = true; e.deadUntil = 0;
      e.pos = spawnPos(e.team);
      if(e.isBot){ e.enemy = null; e.target = null; e.seeT = 0; }
      send(e.ws, { t:'spawn', pos:e.pos });
      if(MODE === 'gungame') send(e.ws, { t:'gg', idx: 0 });
    }
    teamScores[0] = 0; teamScores[1] = 0;
    if(flags) for(const f of flags){ f.state = 'home'; f.carrier = null; f.pos = [...f.base]; f.returnT = 0; }
    if(domPoints) for(const pt of domPoints){ pt.owner = -1; pt.prog = 0; pt.progTeam = -1; }
    roundEnd = now + ROUND_LEN;
  }

  // AFK kick: humans silent for 90s get dropped
  for(const p of players.values()){
    if(now - (p.lastInput || now) > 90000){
      console.log('[⏻] kicked ' + p.name + ' (AFK)');
      send(p.ws, { t:'kicked', reason: 'AFK' });
      try { p.ws.close(); } catch(e){}
      p.lastInput = now;   // avoid double-kick before close completes
    }
  }
  tickFlags(dt);
  tickDom(dt);
  for(let i = liveNades.length-1; i >= 0; i--){
    const g = liveNades[i];
    g.t += dt;
    stepNade(g, dt);
    if(g.t >= NADE.fuse){ liveNades.splice(i, 1); explodeNade(g); }
  }
  for(const b of bots) tickBot(b, dt);
  for(const p of ents()){
    if(!p.alive && now >= p.deadUntil){
      p.alive = true; p.hp = p.maxHp || 100;
      p.nades = NADE.perLife;
      p.pos = spawnPos(p.team);
      p.lastMove = now;
      if(p.isBot){ p.enemy = null; p.target = null; p.seeT = 0; }
      send(p.ws, { t:'spawn', pos:p.pos });
    }
  }
  const snap = {
    t:'snap',
    rt: Math.max(0, Math.ceil((roundEnd - now)/1000)),
    ts: TEAMED ? [teamScores[0], teamScores[1]] : undefined,
    fl: flags ? flags.map(f => ({ p: f.pos.map(v=>+v.toFixed(1)), s: f.state[0], c: f.carrier })) : undefined,
    dm: domPoints ? domPoints.map(pt => ({ o: pt.owner, g: +pt.prog.toFixed(2), gt: pt.progTeam })) : undefined,
    players: ents().map(p => ({
      id:p.id, pos:p.pos.map(v=>+v.toFixed(2)), yaw:+p.yaw.toFixed(3), hp:p.hp, k:p.kills, d:p.deaths, a:p.alive?1:0, l:p.lvl, g:p.gg, c:p.crouch?1:0
    }))
  };
  broadcast(snap);
}, TICK);

server.listen(PORT, () => {
  console.log(`FragBox server on http://localhost:${PORT} (ws same port) — map: ${MAP.name}`);
  if(process.argv.includes('--open')){
    import('node:child_process').then(cp =>
      cp.spawn('cmd', ['/c', 'start', '', `http://localhost:${PORT}`], { detached: true, stdio: 'ignore' }));
  }
});
