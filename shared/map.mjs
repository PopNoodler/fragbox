// Multi-map registry — consumed by the client (mesh building, themes) and the
// server (collision/validation, --map flag). Data only; no rendering deps.

const WALLC = 0x9aa7b0, CRATE = 0xc98f4e, BLOCK = 0x7d8ca3, ACC = 0x5e8d5a;
const RUST = 0xb5452e, CBLUE = 0x2e6f9e, CYELLOW = 0xc9a13b, CONC = 0x8a8f96;

function walls(A, sy = 6){
  return [
    { x:0, y:sy/2, z:-A-1, sx:A*2+2, sy, sz:2, color:WALLC, solid:true },
    { x:0, y:sy/2, z: A+1, sx:A*2+2, sy, sz:2, color:WALLC, solid:true },
    { x:-A-1, y:sy/2, z:0, sx:2, sy, sz:A*2+2, color:WALLC, solid:true },
    { x: A+1, y:sy/2, z:0, sx:2, sy, sz:A*2+2, color:WALLC, solid:true }
  ];
}

const MEADOW = {
  id:'meadow', name:'Meadow', ARENA:45,
  ground:'grass', outer:0x74854e, fog:0xa9c8de, deco:'meadow',
  BOXES: [
    ...walls(45),
    { x:0, y:2, z:0, sx:8, sy:4, sz:8, color:BLOCK, solid:true },
    { x:0, y:5, z:0, sx:5, sy:2, sz:5, color:0x6b7a91, solid:true },
    ...[[-16,-16],[16,16],[-16,16],[16,-16]].flatMap(([x,z])=>[
      { x, y:1.25, z, sx:5, sy:2.5, sz:5, color:CRATE, solid:true },
      { x, y:3.1,  z, sx:2.5, sy:1.2, sz:2.5, color:CRATE, solid:true }
    ]),
    ...[[-30,0],[30,0],[0,-30],[0,30]].map(([x,z])=>(
      { x, y:1.5, z, sx:10, sy:3, sz:3.5, color:ACC, solid:true }
    )),
    ...[[-32,-32],[32,32],[-32,32],[32,-32]].map(([x,z])=>(
      { x, y:2, z, sx:4, sy:4, sz:4, color:BLOCK, solid:true }
    )),
    ...[[-8,24],[8,-24],[24,8],[-24,-8]].map(([x,z])=>(
      { x, y:0.75, z, sx:3, sy:1.5, sz:3, color:CRATE, solid:true }
    ))
  ],
  SPAWNS: [
    [-38,-38],[38,38],[-38,38],[38,-38],[12,-38],[-12,38],[-38,12],[38,-12],
    [-22,10],[22,-10],[10,-22],[-10,22]
  ],
  PADS: [
    { x:-7, z:0, v:19 }, { x:7, z:0, v:19 },
    { x:-32, z:-24, v:15 }, { x:32, z:24, v:15 }
  ],
  PICKUPS: [
    { x:-16, z:0, kind:'hp' }, { x:16, z:0, kind:'hp' },
    { x:0, z:0, kind:'hp', y:6.7 },
    { x:0, z:-16, kind:'ammo' }, { x:0, z:16, kind:'ammo' }
  ],
  DOM: [ { x:-22, z:0, label:'A' }, { x:0, z:22, label:'B' }, { x:22, z:0, label:'C' } ]
};

// container helper: axis 'x' or 'z', optionally stacked
function cont(x, z, color, axis = 'z', y = 1.3){
  const [sx, sz] = axis === 'z' ? [2.4, 6] : [6, 2.4];
  return { x, y, z, sx, sy:2.6, sz, color, solid:true };
}

const DEPOT = {
  id:'depot', name:'Depot', ARENA:40,
  ground:'asphalt', outer:0x565a5f, fog:0x9fadb8, deco:'depot',
  BOXES: [
    ...walls(40, 7),
    // central loading platform + hut
    { x:0, y:1.25, z:0, sx:12, sy:2.5, sz:10, color:CONC, solid:true },
    { x:0, y:3.75, z:-2, sx:4, sy:2.5, sz:4, color:RUST, solid:true },
    // container rows (some stacked)
    cont(-20, -10, RUST), cont(-20, -3, CBLUE), cont(-20, -6.5, CYELLOW, 'z', 3.9),
    cont(18, 6, CYELLOW), cont(18, 13, RUST), cont(18, 9.5, CBLUE, 'z', 3.9),
    cont(8, 22, CBLUE, 'x'), cont(-6, -26, RUST, 'x'), cont(-28, 22, CYELLOW, 'x'),
    cont(26, -18, CBLUE), cont(30, -24, RUST, 'x'),
    // crate clusters + barriers
    { x:-32, y:0.75, z:-30, sx:3, sy:1.5, sz:3, color:CRATE, solid:true },
    { x:-29, y:0.75, z:-33, sx:3, sy:1.5, sz:3, color:CRATE, solid:true },
    { x:33, y:0.75, z:31, sx:3, sy:1.5, sz:3, color:CRATE, solid:true },
    { x:-10, y:0.6, z:12, sx:4, sy:1.2, sz:1.2, color:CYELLOW, solid:true },
    { x:12, y:0.6, z:-12, sx:4, sy:1.2, sz:1.2, color:CYELLOW, solid:true },
    { x:0, y:0.6, z:30, sx:1.2, sy:1.2, sz:4, color:CYELLOW, solid:true },
    // catwalk blocks by the east wall
    { x:36, y:1.5, z:0, sx:6, sy:3, sz:3, color:CONC, solid:true },
    { x:-36, y:1.5, z:8, sx:6, sy:3, sz:3, color:CONC, solid:true }
  ],
  SPAWNS: [
    [-34,-34],[34,34],[-34,34],[34,-34],[10,-34],[-10,34],[-34,-8],[34,8],
    [-18,18],[18,-18],[6,-14],[-6,14]
  ],
  PADS: [
    { x:-10, z:0, v:13 }, { x:10, z:0, v:13 },
    { x:-30, z:30, v:15 }, { x:30, z:-30, v:15 }
  ],
  PICKUPS: [
    { x:-16, z:16, kind:'hp' }, { x:16, z:-16, kind:'hp' },
    { x:0, z:0, kind:'hp', y:3.3 },
    { x:0, z:-18, kind:'ammo' }, { x:0, z:18, kind:'ammo' }
  ],
  DOM: [ { x:-28, z:-20, label:'A' }, { x:0, z:0, label:'B' }, { x:28, z:16, label:'C' } ]
};

// stair-run generator: walkable via the 0.35 step assist (steps 0.3 high)
function stairs(x, z, dx, dz, count, w = 2.6){
  const out = [];
  for(let i = 0; i < count; i++){
    const h = 0.3 * (i + 1);
    out.push({
      x: x + dx * i * 1.1, y: h - 0.15, z: z + dz * i * 1.1,
      sx: dz ? w : 1.1, sy: 0.3 + i * 0, sz: dx ? w : 1.1,
      color: 0x8a8f96, solid: true, _step: true
    });
  }
  return out;
}

const FACADE = 0x3a4652, ROOFC = 0x565a5f;

function building(x, z, sx, h, sz){
  return { x, y: h/2, z, sx, sy: h, sz, color: FACADE, solid: true };
}

const SKYLINE = {
  id:'skyline', name:'Skyline', ARENA:42,
  ground:'asphalt', outer:0x23262e, fog:0x2e3a52, deco:'skyline',
  sky: { top:0x0d1b3a, mid:0x35406b, bot:0xd97a4a },       // dusk gradient
  sun: { color:0xffab66, intensity:1.1, hemi:0.55 },
  BOXES: [
    ...walls(42, 8),
    // city blocks
    building(-22, -18, 16, 6, 14),      // B1 roof y6
    building(20, -20, 14, 8, 12),       // B2 roof y8
    building(-20, 20, 14, 6, 12),       // B3 roof y6
    building(22, 18, 16, 8, 14),        // B4 roof y8
    building(0, 0, 10, 9, 10),          // center tower roof y9
    // bridges between matched rooftops
    { x:21, y:8.15, z:-1, sx:3, sy:0.3, sz:26, color:CONC, solid:true },
    { x:-21, y:6.15, z:1, sx:3, sy:0.3, sz:26, color:CONC, solid:true },
    // street cover: cars + kiosks + planters
    { x:-6, y:0.7, z:-12, sx:2.2, sy:1.4, sz:4.6, color:0x7a2f2f, solid:true },
    { x:8, y:0.7, z:12, sx:2.2, sy:1.4, sz:4.6, color:0x2f4b7a, solid:true },
    { x:12, y:0.7, z:-9, sx:4.6, sy:1.4, sz:2.2, color:0x3d5c3a, solid:true },
    { x:-12, y:1.1, z:9, sx:3, sy:2.2, sz:3, color:CYELLOW, solid:true },
    { x:0, y:0.6, z:-24, sx:5, sy:1.2, sz:1.6, color:CONC, solid:true },
    { x:0, y:0.6, z:24, sx:5, sy:1.2, sz:1.6, color:CONC, solid:true },
    // terraces + stair runs up to them
    { x:-13, y:1.2, z:-10, sx:3, sy:2.4, sz:4, color:CONC, solid:true },
    ...stairs(-13, -3.6, 0, -1, 8, 3),
    { x:13, y:1.2, z:12, sx:3, sy:2.4, sz:4, color:CONC, solid:true },
    ...stairs(13, 5.6, 0, 1, 8, 3)
  ],
  SPAWNS: [
    [-36,-36],[36,36],[-36,36],[36,-36],[0,-36],[0,36],[-36,0],[36,0],
    [-22,-18,6],[20,-20,8],[-20,20,6],[0,0,9]
  ],
  PADS: [
    { x:-10, z:-24, v:19 }, { x:10, z:24, v:19 },        // street → B1/B3-height roofs
    { x:-30, z:0, v:19 }, { x:30, z:0, v:20.5 },         // street → bridge / B2 roofs
    { x:6, z:-6, v:21.5 }, { x:-6, z:6, v:21.5 },        // street → centre tower top
    { x:-22, z:-18, v:14 }, { x:22, z:18, v:14 }          // roof hops
  ],
  PICKUPS: [
    { x:0, z:0, kind:'hp', y:9.7 },                       // tower crown prize
    { x:20, z:-20, kind:'hp', y:8.7 },
    { x:-22, z:-18, kind:'ammo', y:6.7 },
    { x:0, z:-18, kind:'ammo' }, { x:0, z:18, kind:'hp' }
  ],
  DOM: [ { x:0, z:-24, label:'A' }, { x:-12, z:9, label:'B' }, { x:13, z:12, label:'C' } ]
};

export const MAPS = { meadow: MEADOW, depot: DEPOT, skyline: SKYLINE };
export function getMap(id){ return MAPS[id] || MEADOW; }

export const PHYS = { GRAV:24, JUMP_V:9.0, WALK:7, SPRINT:10.4, PLAYER_R:0.45, PLAYER_H:1.8, EYE:1.62 };
