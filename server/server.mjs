// KourHero multiplayer server — static hosting + WebSocket state sync.
// Usage: node server/server.mjs [port]   (default 8080)
// Iteration scope: join/leave + validated movement sync @20Hz. Combat next.
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { ARENA, BOXES, SPAWNS, PHYS } from '../shared/map.mjs';
import { WEAPONS, HITBOX } from '../shared/weapons.mjs';

// Solid world AABBs for authoritative hitscan
const AABBS = BOXES.filter(b=>b.solid !== false).map(b => ({
  min: [b.x-b.sx/2, b.y-b.sy/2, b.z-b.sz/2],
  max: [b.x+b.sx/2, b.y+b.sy/2, b.z+b.sz/2]
}));

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

const PORT = +(process.argv[2] || 8080);
const TEST = process.argv.includes('--test');   // enables {t:'tp'} for automated tests only
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.json':'application/json', '.svg':'image/svg+xml' };

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

function spawnPos(){
  // furthest from every living entity
  let best = SPAWNS[0], bestScore = -1;
  for(const s of SPAWNS){
    let d = 1000;
    for(const p of ents()) if(p.alive) d = Math.min(d, Math.hypot(s[0]-p.pos[0], s[1]-p.pos[2]));
    d += Math.random()*8;
    if(d > bestScore){ bestScore = d; best = s; }
  }
  return [best[0], 0, best[1]];
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
const bots = [];
let botIdx = 0;

function ents(){ return [...players.values(), ...bots]; }

function addBot(){
  const id = nextId++;
  const b = {
    id, ws:null, isBot:true,
    name: BOT_NAMES[botIdx++ % BOT_NAMES.length],
    color: COLORS[id % COLORS.length],
    pos: spawnPos(), yaw: 0, pitch: 0,
    hp: 100, kills: 0, deaths: 0, alive: true, deadUntil: 0, lastFire: 0,
    target: null, enemy: null, thinkT: Math.random(), fireT: 0, strafeDir: 1, strafeT: 0, seeT: 0,
    skill: 0.45 + Math.random()*0.3
  };
  bots.push(b);
  broadcast({ t:'joined', id, name:b.name, color:b.color, pos:b.pos });
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
    let m;
    try { m = JSON.parse(raw); } catch(e){ return; }

    if(m.t === 'join' && !joined){
      joined = true;
      const p = {
        id, ws,
        name: String(m.name || 'Player').slice(0, 14),
        color: COLORS[id % COLORS.length],
        pos: spawnPos(), yaw: 0, pitch: 0,
        hp: 100, kills: 0, deaths: 0,
        alive: true, deadUntil: 0, lastFire: 0,
        lastMove: Date.now()
      };
      players.set(id, p);
      balanceBots();
      send(ws, { t:'welcome', id, pos:p.pos, color:p.color,
        roster: ents().map(q=>({ id:q.id, name:q.name, color:q.color, pos:q.pos, yaw:q.yaw })) });
      broadcast({ t:'joined', id, name:p.name, color:p.color, pos:p.pos }, id);
      console.log(`[+] ${p.name} (#${id}) joined — ${players.size} human(s), ${bots.length} bot(s)`);
      return;
    }

    const p = players.get(id);
    if(!p) return;

    if(m.t === 'tp' && TEST && Array.isArray(m.pos)){
      p.pos = m.pos.map(Number);
      p.lastMove = Date.now();
      return;
    }

    if(m.t === 'fire' && p.alive && Array.isArray(m.o) && Array.isArray(m.d) && m.o.length === 3){
      const w = WEAPONS[m.w|0];
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
      doFire(p, o, nd, w, !!m.ads);
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
    }
  });

  ws.on('close', () => {
    if(players.delete(id)){
      broadcast({ t:'left', id });
      balanceBots();
      console.log(`[-] #${id} left — ${players.size} human(s), ${bots.length} bot(s)`);
    }
  });
  ws.on('error', () => {});
});

function doFire(shooter, o, nd, w, ads){
  broadcast({ t:'shot', id:shooter.id, o, d:nd, w:WEAPONS.indexOf(w) }, shooter.id);
  for(let pe=0; pe<w.pellets; pe++){
    const spr = ads && w.adsSpread !== undefined ? w.adsSpread : w.spread;
    let d = [ nd[0]+(Math.random()-0.5)*2*spr, nd[1]+(Math.random()-0.5)*2*spr, nd[2]+(Math.random()-0.5)*2*spr ];
    const l = Math.hypot(...d) || 1; d = d.map(v=>v/l);
    const wallT = rayWorld(o, d);
    let victim = null, hitT = wallT, headshot = false;
    for(const q of ents()){
      if(q.id === shooter.id || !q.alive) continue;
      const tH = raySphere(o, d, [q.pos[0], q.pos[1]+HITBOX.headY, q.pos[2]], HITBOX.headR);
      const tB = raySphere(o, d, [q.pos[0], q.pos[1]+HITBOX.bodyY, q.pos[2]], HITBOX.bodyR);
      let t = Infinity, hs = false;
      if(tH < t){ t = tH; hs = true; }
      if(tB < t){ t = tB; hs = false; }
      if(t < hitT){ hitT = t; victim = q; headshot = hs; }
    }
    if(victim) applyDamage(victim, headshot ? w.dmg*2 : w.dmg, shooter, headshot);
  }
}

function applyDamage(victim, dmg, attacker, headshot){
  if(!victim.alive) return;
  victim.hp -= dmg;
  send(attacker.ws, { t:'hitfx', hs:!!headshot });
  if(victim.hp > 0){
    send(victim.ws, { t:'dmg', hp:victim.hp, from:attacker.name });
    return;
  }
  victim.hp = 0;
  victim.alive = false;
  victim.deaths++;
  victim.deadUntil = Date.now() + 3000;
  attacker.kills++;
  send(victim.ws, { t:'die', by:attacker.name });
  broadcast({ t:'kill', killer:attacker.name, killerId:attacker.id, victim:victim.name, victimId:victim.id, hs:!!headshot });
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
      const d = canSee(b, e);
      if(d && d < bestD){ best = e; bestD = d; }
    }
    if(best !== b.enemy) b.seeT = 0;
    b.enemy = best;
    if(b.enemy) b.target = null;
    else if(!b.target || Math.hypot(b.target[0]-b.pos[0], b.target[2]-b.pos[2]) < 2) b.target = randomWaypoint();
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
    const ml = Math.hypot(mx, mz) || 1; mx = mx/ml*BOT_SPEED; mz = mz/ml*BOT_SPEED;
    b.yaw = Math.atan2(tx, tz);
  } else if(b.target){
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
    b.fireT = 0.8 + (1-b.skill)*0.8 + Math.random()*0.3;
    const o = [b.pos[0], b.pos[1]+PHYS.EYE, b.pos[2]];
    const err = (1-b.skill) * 1.3;
    const t = [ enemy.pos[0]+(Math.random()-0.5)*err, enemy.pos[1]+1.0+(Math.random()-0.5)*err, enemy.pos[2]+(Math.random()-0.5)*err ];
    let d = [t[0]-o[0], t[1]-o[1], t[2]-o[2]];
    const l = Math.hypot(...d) || 1; d = d.map(v=>v/l);
    doFire(b, o, d, WEAPONS[0], false);   // bots run rifles
  }
}

setInterval(() => {
  if(!players.size) return;
  const now = Date.now();
  const dt = TICK/1000;
  for(const b of bots) tickBot(b, dt);
  for(const p of ents()){
    if(!p.alive && now >= p.deadUntil){
      p.alive = true; p.hp = 100;
      p.pos = spawnPos();
      p.lastMove = now;
      if(p.isBot){ p.enemy = null; p.target = null; p.seeT = 0; }
      send(p.ws, { t:'spawn', pos:p.pos });
    }
  }
  const snap = {
    t:'snap',
    players: ents().map(p => ({
      id:p.id, pos:p.pos.map(v=>+v.toFixed(2)), yaw:+p.yaw.toFixed(3), hp:p.hp, k:p.kills, d:p.deaths, a:p.alive?1:0
    }))
  };
  broadcast(snap);
}, TICK);

server.listen(PORT, () => console.log(`KourHero server on http://localhost:${PORT} (ws same port)`));
