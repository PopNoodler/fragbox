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
  // furthest from existing players
  let best = SPAWNS[0], bestScore = -1;
  for(const s of SPAWNS){
    let d = 1000;
    for(const p of players.values()) d = Math.min(d, Math.hypot(s[0]-p.pos[0], s[1]-p.pos[2]));
    d += Math.random()*8;
    if(d > bestScore){ bestScore = d; best = s; }
  }
  return [best[0], 0, best[1]];
}

function send(ws, msg){ if(ws.readyState === 1) ws.send(JSON.stringify(msg)); }
function broadcast(msg, exceptId){
  const s = JSON.stringify(msg);
  for(const p of players.values()) if(p.id !== exceptId && p.ws.readyState === 1) p.ws.send(s);
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
      send(ws, { t:'welcome', id, pos:p.pos, color:p.color,
        roster:[...players.values()].map(q=>({ id:q.id, name:q.name, color:q.color, pos:q.pos, yaw:q.yaw })) });
      broadcast({ t:'joined', id, name:p.name, color:p.color, pos:p.pos }, id);
      console.log(`[+] ${p.name} (#${id}) joined — ${players.size} online`);
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
      broadcast({ t:'shot', id, o, d:nd, w:m.w|0 }, id);

      for(let pe=0; pe<w.pellets; pe++){
        const spr = m.ads && w.adsSpread !== undefined ? w.adsSpread : w.spread;
        let d = [ nd[0]+(Math.random()-0.5)*2*spr, nd[1]+(Math.random()-0.5)*2*spr, nd[2]+(Math.random()-0.5)*2*spr ];
        const l = Math.hypot(...d) || 1; d = d.map(v=>v/l);
        const wallT = rayWorld(o, d);
        let victim = null, hitT = wallT, headshot = false;
        for(const q of players.values()){
          if(q.id === id || !q.alive) continue;
          const tH = raySphere(o, d, [q.pos[0], q.pos[1]+HITBOX.headY, q.pos[2]], HITBOX.headR);
          const tB = raySphere(o, d, [q.pos[0], q.pos[1]+HITBOX.bodyY, q.pos[2]], HITBOX.bodyR);
          let t = Infinity, hs = false;
          if(tH < t){ t = tH; hs = true; }
          if(tB < t){ t = tB; hs = false; }
          if(t < hitT){ hitT = t; victim = q; headshot = hs; }
        }
        if(victim) applyDamage(victim, headshot ? w.dmg*2 : w.dmg, p, headshot);
      }
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
      console.log(`[-] #${id} left — ${players.size} online`);
    }
  });
  ws.on('error', () => {});
});

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

setInterval(() => {
  if(!players.size) return;
  const now = Date.now();
  for(const p of players.values()){
    if(!p.alive && now >= p.deadUntil){
      p.alive = true; p.hp = 100;
      p.pos = spawnPos();
      p.lastMove = now;
      send(p.ws, { t:'spawn', pos:p.pos });
    }
  }
  const snap = {
    t:'snap',
    players: [...players.values()].map(p => ({
      id:p.id, pos:p.pos.map(v=>+v.toFixed(2)), yaw:+p.yaw.toFixed(3), hp:p.hp, k:p.kills, d:p.deaths, a:p.alive?1:0
    }))
  };
  broadcast(snap);
}, TICK);

server.listen(PORT, () => console.log(`KourHero server on http://localhost:${PORT} (ws same port)`));
