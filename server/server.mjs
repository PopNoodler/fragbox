// KourHero multiplayer server — static hosting + WebSocket state sync.
// Usage: node server/server.mjs [port]   (default 8080)
// Iteration scope: join/leave + validated movement sync @20Hz. Combat next.
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { ARENA, SPAWNS, PHYS } from '../shared/map.mjs';

const PORT = +(process.argv[2] || 8080);
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

    if(m.t === 'in' && Array.isArray(m.pos) && m.pos.length === 3){
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

setInterval(() => {
  if(!players.size) return;
  const snap = {
    t:'snap',
    players: [...players.values()].map(p => ({
      id:p.id, pos:p.pos.map(v=>+v.toFixed(2)), yaw:+p.yaw.toFixed(3), hp:p.hp, k:p.kills, d:p.deaths
    }))
  };
  broadcast(snap);
}, TICK);

server.listen(PORT, () => console.log(`KourHero server on http://localhost:${PORT} (ws same port)`));
