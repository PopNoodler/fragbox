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
    )),
    // sightline breakers: walls on the diagonal mids
    ...[[-13,-13],[13,13],[-13,13],[13,-13]].map(([x,z],i)=>(
      { x, y:1.4, z, sx: i<2 ? 7 : 1.2, sy:2.8, sz: i<2 ? 1.2 : 7, color:WALLC, solid:true }
    )),
    // standing stones between mid and corners
    ...[[-26,8],[26,-8],[8,26],[-8,-26]].map(([x,z])=>(
      { x, y:2, z, sx:2.6, sy:4, sz:2.6, color:BLOCK, solid:true }
    )),
    // low crate pairs along the cardinal lanes
    ...[[-7,-18],[7,18],[18,-7],[-18,7]].map(([x,z])=>(
      { x, y:0.75, z, sx:3, sy:1.5, sz:3, color:CRATE, solid:true }
    )),
    // center-ring chokes (pass 2)
    ...[[-9,-9],[9,9]].map(([x,z])=>({ x, y:1.3, z, sx:5.5, sy:2.6, sz:1.2, color:WALLC, solid:true })),
    ...[[-9,9],[9,-9]].map(([x,z])=>({ x, y:1.3, z, sx:1.2, sy:2.6, sz:5.5, color:WALLC, solid:true })),
    { x:0, y:1.75, z:-16, sx:3, sy:3.5, sz:3, color:BLOCK, solid:true },
    { x:0, y:1.75, z:16,  sx:3, sy:3.5, sz:3, color:BLOCK, solid:true }
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
    { x:-36, y:1.5, z:8, sx:6, sy:3, sz:3, color:CONC, solid:true },
    // sightline breakers: mid-lane containers + pallet stacks
    cont(0, -14, CBLUE, 'x'),
    cont(-12, 26, RUST, 'z'),
    cont(12, -28, CYELLOW, 'x'),
    { x:-24, y:0.75, z:6, sx:3, sy:1.5, sz:3, color:CRATE, solid:true },
    { x:-21, y:0.75, z:6, sx:3, sy:1.5, sz:3, color:CRATE, solid:true },
    { x:-22.5, y:2.2, z:6, sx:3, sy:1.4, sz:3, color:CRATE, solid:true },
    { x:24, y:1.4, z:24, sx:1.2, sy:2.8, sz:7, color:CONC, solid:true },
    { x:-8, y:1.4, z:-20, sx:7, sy:2.8, sz:1.2, color:CONC, solid:true },
    // platform flanks + far-corner chokes (pass 2)
    { x:-9, y:0.75, z:-8, sx:3, sy:1.5, sz:3, color:CRATE, solid:true },
    { x:9, y:0.75, z:8, sx:3, sy:1.5, sz:3, color:CRATE, solid:true },
    { x:9, y:0.75, z:-8, sx:3, sy:1.5, sz:3, color:CRATE, solid:true },
    { x:-9, y:0.75, z:8, sx:3, sy:1.5, sz:3, color:CRATE, solid:true },
    { x:28, y:1.4, z:-6, sx:1.2, sy:2.8, sz:6, color:CONC, solid:true },
    { x:-28, y:1.4, z:14, sx:1.2, sy:2.8, sz:6, color:CONC, solid:true }
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
    ...stairs(13, 5.6, 0, 1, 8, 3),
    // street clutter: more cars, dumpsters, kiosks to cut the canyons
    { x:-8, y:0.7, z:30, sx:4.6, sy:1.4, sz:2.2, color:0x6d5c2e, solid:true },
    { x:10, y:0.7, z:-30, sx:4.6, sy:1.4, sz:2.2, color:0x3a5c6e, solid:true },
    { x:-30, y:0.7, z:-10, sx:2.2, sy:1.4, sz:4.6, color:0x5c3a6e, solid:true },
    { x:30, y:0.7, z:8, sx:2.2, sy:1.4, sz:4.6, color:0x2f4b7a, solid:true },
    { x:-2, y:0.65, z:12, sx:2.4, sy:1.3, sz:1.4, color:0x3d5c3a, solid:true },
    { x:2, y:0.65, z:-12, sx:2.4, sy:1.3, sz:1.4, color:0x3d5c3a, solid:true },
    { x:-12, y:1.1, z:-24, sx:3, sy:2.2, sz:3, color:CYELLOW, solid:true },
    { x:14, y:1.1, z:26, sx:3, sy:2.2, sz:3, color:CYELLOW, solid:true },
    { x:-34, y:0.9, z:20, sx:1.6, sy:1.8, sz:3.4, color:0x4a545e, solid:true },
    { x:34, y:0.9, z:-20, sx:1.6, sy:1.8, sz:3.4, color:0x4a545e, solid:true },
    // pass 2: fill the remaining street runs
    { x:-20, y:0.7, z:0, sx:2.2, sy:1.4, sz:4.6, color:0x6e3a3a, solid:true },
    { x:20, y:0.7, z:-2, sx:2.2, sy:1.4, sz:4.6, color:0x39536e, solid:true },
    { x:0, y:0.7, z:34, sx:4.6, sy:1.4, sz:2.2, color:0x55406e, solid:true },
    { x:4, y:0.7, z:-34, sx:4.6, sy:1.4, sz:2.2, color:0x406e50, solid:true },
    { x:-6, y:1.1, z:18, sx:3, sy:2.2, sz:3, color:CYELLOW, solid:true },
    { x:6, y:1.1, z:-18, sx:3, sy:2.2, sz:3, color:CYELLOW, solid:true }
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

// interior wall run along an axis with door gaps (door half-width 2.2)
function wallRun(axis, at, from, to, doors, h = 5){
  const out = [];
  let start = from;
  const cuts = [...doors].sort((a,b) => a-b);
  for(const d of cuts){
    if(d - 2.2 > start) out.push(seg(axis, at, start, d - 2.2, h));
    start = d + 2.2;
  }
  if(to > start) out.push(seg(axis, at, start, to, h));
  return out;
}
function seg(axis, at, a, b, h){
  const mid = (a + b) / 2, len = b - a;
  return axis === 'x'
    ? { x: mid, y: h/2, z: at, sx: len, sy: h, sz: 1, color: CONC, solid: true }
    : { x: at, y: h/2, z: mid, sx: 1, sy: h, sz: len, color: CONC, solid: true };
}

const BUNKER = {
  id:'bunker', name:'Bunker', ARENA:30,
  ground:'asphalt', outer:0x1a1c20, fog:0x1c2027, deco:'none',
  sky: { top:0x0b0d12, mid:0x151920, bot:0x232830 },
  sun: { color:0xfff2cc, intensity:0.7, hemi:1.5 },
  BOXES: [
    ...walls(30, 5),
    // full ceiling — grenades bounce, no sky
    { x:0, y:4.85, z:0, sx:62, sy:0.5, sz:62, color:0x23262b, solid:true },
    // 3x3 room grid: two horizontal + two vertical wall runs, doors at ±12 and 0
    ...wallRun('x', -10, -30, 30, [-12, 12]),
    ...wallRun('x',  10, -30, 30, [-12, 12]),
    ...wallRun('z', -10, -30, 30, [0]),
    ...wallRun('z',  10, -30, 30, [0]),
    // room furniture: crates and low cover
    { x:0, y:0.75, z:0, sx:3, sy:1.5, sz:3, color:CRATE, solid:true },
    { x:-20, y:0.75, z:-20, sx:3, sy:1.5, sz:3, color:CRATE, solid:true },
    { x:20, y:0.75, z:20, sx:3, sy:1.5, sz:3, color:CRATE, solid:true },
    { x:20, y:0.6, z:-20, sx:4, sy:1.2, sz:1.2, color:CYELLOW, solid:true },
    { x:-20, y:0.6, z:20, sx:1.2, sy:1.2, sz:4, color:CYELLOW, solid:true },
    { x:-20, y:1.1, z:2, sx:2.6, sy:2.2, sz:2.6, color:RUST, solid:true },
    { x:20, y:1.1, z:-2, sx:2.6, sy:2.2, sz:2.6, color:CBLUE, solid:true }
  ],
  SPAWNS: [
    [-24,-24],[24,24],[-24,24],[24,-24],[0,-24],[0,24],[-24,0],[24,0],
    [-24,-4],[24,4],[4,-24],[-4,24]
  ],
  PADS: [],
  PICKUPS: [
    { x:0, z:4, kind:'hp' },
    { x:-20, z:-24, kind:'ammo' }, { x:20, z:24, kind:'ammo' },
    { x:-24, z:20, kind:'hp' }, { x:24, z:-20, kind:'hp' }
  ],
  DOM: [ { x:-20, z:0, label:'A' }, { x:0, z:0, label:'B' }, { x:20, z:0, label:'C' } ]
};

// ============================================================================
// MODULAR PREFAB KIT — compose maps from rotatable structure pieces.
// Every prefab returns local-space BOX arrays; place(pieces, x, z, rot) drops
// them into the world (rot = 0..3 quarter-turns). Build levels smartly:
//   BOXES: [ ...walls(44,7), ...place(P.tower(3), -20, -20, 1), ... ]
// ============================================================================
function rotXZ(px, pz, r){
  switch(r & 3){
    case 0: return [px, pz];
    case 1: return [pz, -px];
    case 2: return [-px, -pz];
    default: return [-pz, px];
  }
}
export function place(pieces, x, z, r = 0){
  return pieces.map(b => {
    const [wx, wz] = rotXZ(b.x, b.z, r);
    const swap = (r % 2) === 1;
    return { ...b, x: x + wx, z: z + wz, sx: swap ? b.sz : b.sx, sz: swap ? b.sx : b.sz };
  });
}

export const P = {
  // Enclosed room: 4 walls with door gaps per side ('n','e','s','w'), optional roof.
  room(w = 12, d = 12, h = 4, doors = ['n', 's'], roof = false){
    const out = [];
    const hw = w/2, hd = d/2, DW = 2.2;
    const side = (axis, at, len, hasDoor) => {
      if(!hasDoor){ out.push(seg(axis, at, -len/2, len/2, h)); return; }
      out.push(seg(axis, at, -len/2, -DW, h));
      out.push(seg(axis, at, DW, len/2, h));
    };
    side('x', -hd, w, doors.includes('n'));
    side('x',  hd, w, doors.includes('s'));
    side('z', -hw, d, doors.includes('w'));
    side('z',  hw, d, doors.includes('e'));
    if(roof) out.push({ x:0, y: h + 0.2, z:0, sx: w + 1, sy: 0.4, sz: d + 1, color: 0x23262b, solid: true });
    return out;
  },
  // Multi-floor tower: stacked walkable slabs + corner pillars + stair run to floor 1.
  tower(floors = 2, size = 8){
    const out = [];
    const fh = 3;
    for(let f = 1; f <= floors; f++){
      out.push({ x:0, y: f*fh, z:0, sx: size, sy: 0.4, sz: size, color: CONC, solid: true });
    }
    const ps = size/2 - 0.5;
    for(const [px, pz] of [[-ps,-ps],[ps,ps],[-ps,ps],[ps,-ps]]){
      out.push({ x:px, y: floors*fh/2, z:pz, sx:1, sy: floors*fh, sz:1, color: BLOCK, solid: true });
    }
    // stair run up the north face to floor 1
    out.push(...stairs(0, -(size/2 + 9.9), 0, 1, Math.round(fh / 0.3), 3).map(b => b));
    // low parapet on the top floor
    const top = floors*fh;
    out.push({ x:0, y: top + 0.55, z: -size/2 + 0.15, sx: size, sy: 0.7, sz: 0.3, color: CONC, solid: true });
    out.push({ x:0, y: top + 0.55, z:  size/2 - 0.15, sx: size, sy: 0.7, sz: 0.3, color: CONC, solid: true });
    return out;
  },
  // Elevated walkway with support pillars every ~6u; connects towers/platforms at height y.
  bridge(len = 14, y = 3, w = 2.6){
    const out = [{ x:0, y: y + 0.15, z:0, sx: w, sy: 0.3, sz: len, color: CONC, solid: true }];
    for(let z = -len/2 + 2; z < len/2; z += 6){
      out.push({ x:0, y: y/2, z, sx: 0.8, sy: y, sz: 0.8, color: BLOCK, solid: true });
    }
    return out;
  },
  // Walkable platform slab on pillars (sniper perch / objective pad).
  platform(w = 6, h = 2.5, d = 6){
    return [
      { x:0, y: h, z:0, sx: w, sy: 0.4, sz: d, color: CONC, solid: true },
      { x:-w/2+0.5, y: h/2, z:-d/2+0.5, sx:1, sy:h, sz:1, color: BLOCK, solid: true },
      { x: w/2-0.5, y: h/2, z: d/2-0.5, sx:1, sy:h, sz:1, color: BLOCK, solid: true },
      { x:-w/2+0.5, y: h/2, z: d/2-0.5, sx:1, sy:h, sz:1, color: BLOCK, solid: true },
      { x: w/2-0.5, y: h/2, z:-d/2+0.5, sx:1, sy:h, sz:1, color: BLOCK, solid: true },
      ...stairs(0, -(d/2 + 9.35), 0, 1, Math.round(h / 0.3), 2.6)
    ];
  },
  // Deterministic crate/barrier cover cluster (seed varies the arrangement).
  cover(seed = 1){
    const arr = [[0,0],[2.6,1.2],[-1.8,2.4],[1.4,-2.2],[-2.8,-1.4]];
    const out = [];
    for(let i = 0; i < 3 + (seed % 3); i++){
      const [cx, cz] = arr[(seed + i * 2) % arr.length];
      out.push({ x: cx, y: 0.75, z: cz, sx: 3, sy: 1.5, sz: 3, color: CRATE, solid: true });
    }
    if(seed % 2) out.push({ x: 0, y: 2.2, z: 0, sx: 3, sy: 1.4, sz: 3, color: CRATE, solid: true });
    return out;
  },
  // Shipping container (existing helper, local space).
  container(color = RUST, axis = 'z', stacked = false){
    const out = [cont(0, 0, color, axis)];
    if(stacked) out.push(cont(0, 0, color === RUST ? CBLUE : RUST, axis, 3.9));
    return out;
  },
  // L-shaped wall corner for lane control.
  corner(len = 7, h = 2.8){
    return [
      { x: len/2, y: h/2, z: 0, sx: len, sy: h, sz: 1.1, color: WALLC, solid: true },
      { x: 0, y: h/2, z: len/2, sx: 1.1, sy: h, sz: len, color: WALLC, solid: true }
    ];
  },
  // Solid building block (skyline facade texture at 0x3a4652).
  building(w = 12, h = 6, d = 10){
    return [{ x:0, y: h/2, z:0, sx: w, sy: h, sz: d, color: 0x3a4652, solid: true }];
  }
};

// ---- COMPOUND: first map composed entirely from the prefab kit ----
const COMPOUND = {
  id:'compound', name:'Compound', ARENA:44,
  ground:'asphalt', outer:0x4a4f42, fog:0xa8b5a0, deco:'depot',
  BOXES: [
    ...walls(44, 7),
    // central 2-story tower — the power position
    ...place(P.tower(2, 9), 0, 0, 0),
    // four corner rooms, doors facing inward
    ...place(P.room(13, 13, 4, ['n', 'e'], true), -27, -27, 0),
    ...place(P.room(13, 13, 4, ['n', 'e'], true),  27, -27, 1),
    ...place(P.room(13, 13, 4, ['n', 'e'], true),  27,  27, 2),
    ...place(P.room(13, 13, 4, ['n', 'e'], true), -27,  27, 3),
    // two sniper platforms mid-edge, bridged toward the tower's airspace
    ...place(P.platform(6, 2.5, 6), -24, 0, 1),
    ...place(P.platform(6, 2.5, 6),  24, 0, 3),
    ...place(P.bridge(12, 2.5), -13, 0, 1),
    ...place(P.bridge(12, 2.5),  13, 0, 1),
    // container yard NE lane, L-corners SW lane
    ...place(P.container(RUST, 'z'), 14, -18, 0),
    ...place(P.container(CYELLOW, 'x', true), 20, -12, 0),
    ...place(P.corner(7), -18, 12, 2),
    ...place(P.corner(7), -12, 18, 0),
    // cover clusters breaking the diagonals
    ...place(P.cover(1), -14, -14, 0),
    ...place(P.cover(2),  14,  14, 0),
    ...place(P.cover(3),  0, -26, 0),
    ...place(P.cover(4),  0,  26, 0)
  ],
  SPAWNS: [
    [-38,-38],[38,38],[-38,38],[38,-38],[0,-38],[0,38],[-38,0],[38,0],
    [-27,-27],[27,27],[0,0,6.2],[24,0,2.9]
  ],
  PADS: [
    { x:-6, z:-6, v:15 }, { x:6, z:6, v:15 },
    { x:-36, z:20, v:15 }, { x:36, z:-20, v:15 }
  ],
  PICKUPS: [
    { x:0, z:0, kind:'hp', y:6.6 },
    { x:-27, z:-27, kind:'ammo' }, { x:27, z:27, kind:'ammo' },
    { x:-24, z:0, kind:'hp', y:3.2 }, { x:24, z:0, kind:'hp', y:3.2 }
  ],
  DOM: [ { x:-27, z:-27, label:'A' }, { x:0, z:0, label:'B' }, { x:27, z:27, label:'C' } ]
};

export const MAPS = { meadow: MEADOW, depot: DEPOT, skyline: SKYLINE, bunker: BUNKER, compound: COMPOUND };
export function getMap(id){ return MAPS[id] || MEADOW; }

export const PHYS = { GRAV:24, JUMP_V:9.0, WALK:7, SPRINT:10.4, PLAYER_R:0.45, PLAYER_H:1.8, EYE:1.62 };
