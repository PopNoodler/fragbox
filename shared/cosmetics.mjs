// Skin catalog — client renders the locker from this; the server validates
// chosen colors against it (so nobody joins neon-white). lvl gates by player
// level; premium flips on when IAP exists.
export const SKINS = [
  { id:'ember', name:'Ember', color:0xe53935, lvl:1 },
  { id:'azure', name:'Azure', color:0x2196f3, lvl:2 },
  { id:'toxic', name:'Toxic', color:0x7cb342, lvl:4 },
  { id:'royal', name:'Royal', color:0x8e24aa, lvl:6 },
  { id:'gold',  name:'Gold',  color:0xffb300, lvl:9 },
  { id:'frost', name:'Frost', color:0x4dd0e1, lvl:12 },
  { id:'void',  name:'Void',  color:0x263238, lvl:15 },
  { id:'rose',  name:'Rose',  color:0xec407a, premium:true, soon:true },
  { id:'neon',     name:'Neon',     color:0x39ff14, crate:true },
  { id:'copper',   name:'Copper',   color:0xb87333, crate:true },
  { id:'midnight', name:'Midnight', color:0x1a1a4e, crate:true }
];
