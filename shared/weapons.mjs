// Single source of truth for weapon stats — client (visuals+feel) and
// server (authoritative damage/fire-rate validation) both import this.
export const WEAPONS = [
  { name:'Rifle',   dmg:22, rpm:600, mag:30, reserve:90,  reload:1.6, spread:0.012, pellets:1, auto:true,  loud:0.35, color:0x37474f, len:0.9,  kick:0.011 },
  { name:'SMG',     dmg:13, rpm:900, mag:35, reserve:105, reload:1.4, spread:0.028, pellets:1, auto:true,  loud:0.26, color:0x546e7a, len:0.55, kick:0.007 },
  { name:'Shotgun', dmg:12, rpm:75,  mag:6,  reserve:24,  reload:2.2, spread:0.06,  pellets:7, auto:false, loud:0.5,  color:0x5d4037, len:0.8,  kick:0.035 },
  { name:'Sniper',  dmg:90, rpm:40,  mag:5,  reserve:15,  reload:2.5, spread:0.045, adsSpread:0.001, pellets:1, auto:false, loud:0.6, color:0x33691e, len:1.25, kick:0.05 },
  { name:'Pistol',  dmg:30, rpm:220, mag:12, reserve:48,  reload:1.2, spread:0.02,  pellets:1, auto:false, loud:0.3,  color:0x455a64, len:0.45, kick:0.018 }
];

// Hitbox spec shared by server hit tests and (later) client prediction
export const HITBOX = { bodyY:1.0, bodyR:0.55, headY:1.66, headR:0.3 };
