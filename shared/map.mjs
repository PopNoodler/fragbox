// Shared arena definition — consumed by the client (mesh building) and the
// server (collision/validation). Data only; no rendering deps.
export const ARENA = 45;               // half-size of playable square

const WALLC = 0x9aa7b0, CRATE = 0xc98f4e, BLOCK = 0x7d8ca3, ACC = 0x5e8d5a;

// {x,y,z, sx,sy,sz, color, solid}
export const BOXES = [
  // perimeter walls
  { x:0, y:3, z:-ARENA-1, sx:ARENA*2+2, sy:6, sz:2, color:WALLC, solid:true },
  { x:0, y:3, z: ARENA+1, sx:ARENA*2+2, sy:6, sz:2, color:WALLC, solid:true },
  { x:-ARENA-1, y:3, z:0, sx:2, sy:6, sz:ARENA*2+2, color:WALLC, solid:true },
  { x: ARENA+1, y:3, z:0, sx:2, sy:6, sz:ARENA*2+2, color:WALLC, solid:true },
  // center tower
  { x:0, y:2, z:0, sx:8, sy:4, sz:8, color:BLOCK, solid:true },
  { x:0, y:5, z:0, sx:5, sy:2, sz:5, color:0x6b7a91, solid:true },
  // stacked crates
  ...[[-16,-16],[16,16],[-16,16],[16,-16]].flatMap(([x,z])=>[
    { x, y:1.25, z, sx:5, sy:2.5, sz:5, color:CRATE, solid:true },
    { x, y:3.1,  z, sx:2.5, sy:1.2, sz:2.5, color:CRATE, solid:true }
  ]),
  // long cover bars
  ...[[-30,0],[30,0],[0,-30],[0,30]].map(([x,z])=>(
    { x, y:1.5, z, sx:10, sy:3, sz:3.5, color:ACC, solid:true }
  )),
  // corner blocks
  ...[[-32,-32],[32,32],[-32,32],[32,-32]].map(([x,z])=>(
    { x, y:2, z, sx:4, sy:4, sz:4, color:BLOCK, solid:true }
  )),
  // low crates (jumpable steps)
  ...[[-8,24],[8,-24],[24,8],[-24,-8]].map(([x,z])=>(
    { x, y:0.75, z, sx:3, sy:1.5, sz:3, color:CRATE, solid:true }
  ))
];

export const SPAWNS = [
  [-38,-38],[38,38],[-38,38],[38,-38],[12,-38],[-12,38],[-38,12],[38,-12],
  [-22,10],[22,-10],[10,-22],[-10,22]
];

export const PADS = [
  { x:-7, z:0, v:19 }, { x:7, z:0, v:19 },
  { x:-32, z:-24, v:15 }, { x:32, z:24, v:15 }
];

export const PICKUPS = [
  { x:-16, z:0, kind:'hp' }, { x:16, z:0, kind:'hp' },
  { x:0, z:0, kind:'hp', y:6.7 },
  { x:0, z:-16, kind:'ammo' }, { x:0, z:16, kind:'ammo' }
];

export const PHYS = { GRAV:24, JUMP_V:9.0, WALK:7, SPRINT:10.4, PLAYER_R:0.45, PLAYER_H:1.8, EYE:1.62 };
