// Single source of truth for weapon stats — client (visuals+feel) and
// server (authoritative damage/fire-rate validation) both import this.
// `type` drives logic (viewmodel shape, scope behavior); `name` is display.
// bloom = spread accumulated per shot (sustained fire widens the cone).
export const WEAPONS = [
  { name:'AK-47',     type:'rifle',    dmg:34, rpm:600, mag:30, reserve:90,  reload:1.6, spread:0.012, pellets:1, auto:true,  loud:0.35, color:0x37474f, len:0.9,  kick:0.011, bloom:0.08 },
  { name:'MP5',       type:'smg',      dmg:22, rpm:900, mag:35, reserve:105, reload:1.4, spread:0.028, pellets:1, auto:true,  loud:0.26, color:0x546e7a, len:0.55, kick:0.007, bloom:0.055 },
  { name:'M870',      type:'shotgun',  dmg:18, rpm:75,  mag:6,  reserve:24,  reload:2.2, spread:0.06,  pellets:7, auto:false, loud:0.5,  color:0x5d4037, len:0.8,  kick:0.035, bloom:0.3 },
  { name:'AWP',       type:'sniper',   dmg:115, rpm:40,  mag:5,  reserve:15,  reload:2.5, spread:0.045, adsSpread:0.001, pellets:1, auto:false, loud:0.6, color:0x33691e, len:1.25, kick:0.05, bloom:0.55 },
  { name:'M1911',     type:'pistol',   dmg:45, rpm:220, mag:12, reserve:48,  reload:1.2, spread:0.02,  pellets:1, auto:false, loud:0.3,  color:0x455a64, len:0.45, kick:0.018, bloom:0.14 },
  { name:'M249',      type:'lmg',      dmg:28, rpm:550, mag:60, reserve:120, reload:3.2, spread:0.03,  pellets:1, auto:true,  loud:0.45, color:0x3e4a54, len:1.05, kick:0.013, bloom:0.05 },
  { name:'M14',       type:'dmr',      dmg:52, rpm:280, mag:20, reserve:60,  reload:1.7, spread:0.007, adsSpread:0.002, pellets:1, auto:false, loud:0.4, color:0x5c4f3a, len:1.0, kick:0.022, bloom:0.2 },
  { name:'.44 Magnum',type:'revolver', dmg:80, rpm:130, mag:6,  reserve:24,  reload:2.1, spread:0.012, pellets:1, auto:false, loud:0.55, color:0x6a6f75, len:0.55, kick:0.042, bloom:0.32 },
  { name:'SSG 08',    type:'scout',    dmg:85, rpm:55,  mag:8,  reserve:32,  reload:2.0, spread:0.03,  adsSpread:0.0015, pellets:1, auto:false, loud:0.5, color:0x7a6a4f, len:1.1, kick:0.04, bloom:0.45 },
  { name:'FAMAS',     type:'burst',    dmg:30, rpm:800, mag:30, reserve:90,  reload:1.7, spread:0.016, pellets:1, auto:true, burst:3, loud:0.38, color:0x4a5240, len:0.85, kick:0.012, bloom:0.1 }
];

// Gun Game kill-ladder: weapon indices in advancement order (finish the
// .44 Magnum tier to win the round)
export const GG_LADDER = [0, 1, 9, 2, 5, 6, 8, 3, 4, 7];

// Frag grenade — same constants drive the client visual sim and the server's
// authoritative sim (bounce physics + AoE damage with LOS)
export const NADE = { speed:17, up:4.5, fuse:2.2, radius:7, dmg:95, minDmg:12, restitution:0.45, perLife:2 };

// Hitbox spec shared by server hit tests and (later) client prediction
export const HITBOX = { bodyY:1.0, bodyR:0.55, headY:1.66, headR:0.3 };
