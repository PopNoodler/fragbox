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
  ]
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
  ]
};

export const MAPS = { meadow: MEADOW, depot: DEPOT };
export function getMap(id){ return MAPS[id] || MEADOW; }

export const PHYS = { GRAV:24, JUMP_V:9.0, WALK:7, SPRINT:10.4, PLAYER_R:0.45, PLAYER_H:1.8, EYE:1.62 };
