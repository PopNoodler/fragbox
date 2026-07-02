# KourHero — Progress Log

Kour.io-inspired low-poly browser arena FPS. Single-file `index.html` + vendored Three.js r160
(`lib/three.module.js`, offline-capable PWA). Built on the process in `C:\Users\adamt\GAME_DEV_PLAYBOOK.md`.

**Plan:** Phase 1 = polished single-player FFA deathmatch vs AI bots. Phase 2 = local Node
WebSocket multiplayer (authoritative server, bots fill lobbies).

## How to run / verify
- Play: serve the folder (`npx serve` or any static server), open in browser. Needs pointer lock.
- Static verify: `node tools/verify.mjs` (syntax, brace balance, el() ids, sw version).
- Headless playtest: `node tools/playtest.js` (boots game in Edge+SwiftShader, simulates play,
  screenshots into `tools/shots/`, asserts no console errors). `npm i` inside `tools/` first.
- Every release: bump `CACHE` in `sw.js` (currently v001) + commit.

## Backlog (roughly ordered)
- [ ] Spawn layout: mid-edge spawns stare into the [0,±30]/[±30,0] cover bars from 2u away — reposition spawns or bars
- [ ] Weapon feel polish: distinct viewmodels per weapon, better muzzle flash, camera recoil kick
- [ ] Bot pathing: bots get stuck on cover corners (no avoidance) — add simple obstacle steering
- [ ] Bots fight each other (currently only target the player) — true FFA
- [ ] Health pickups / ammo pickups on map
- [ ] Sniper + SMG weapons, weapon pickup spots (Kour-style)
- [ ] Mobile touch controls (dual stick + fire button)
- [ ] Match settings (bot count/difficulty, match length) in menu
- [ ] Kill streak callouts, better death cam
- [ ] Progression: XP/levels, cosmetic skins for bots+viewmodel (playbook §5)
- [ ] Phase 2: Node WS server (`server/`), authoritative movement+hits, client prediction, bots server-side

## Releases (newest first)
- **v001** (2026-07-02 ~03:45): Initial playable build. Three.js r160 vendored. Pointer-lock FPS
  (WASD/jump/sprint, accel-based movement, AABB collision vs box colliders). 3 hitscan weapons
  (Rifle auto 600rpm/22dmg, Shotgun 7-pellet, Pistol 30dmg) with mag/reserve/reload, spread,
  2x headshots (ray-sphere head/body). 5 AI bots: waypoint roam, LOS raycast, combat strafe,
  reaction delay 0.35–0.8s before firing, hit chance falls with distance (pHit ≤0.6), hop while
  fighting, respawn 2.5s at furthest spawn. Arena 90x90: perimeter walls, center tower, mirrored
  crates/blocks, decorative trees outside. HUD: health bar, ammo, weapon name, crosshair,
  hitmarker, damage vignette, kill feed (5 max), score pill + match timer (5min / 25-kill target),
  hold-Tab scoreboard, menu/game-over overlays. Procedural WebAudio SFX (shoot/hit/kill/hurt/
  reload/jump/die). PWA: manifest + SVG icon + sw.js (network-first navigations, playbook §4),
  SW only registers on github.io/localhost. Bugs fixed during build: spawn yaw was 180° inverted
  (atan2(-x,-z) → atan2(x,z) — flat-green-screen symptom); viewmodel near-end sat at camera plane
  (looked giant); bots too lethal (7 bots, no reaction delay → dead in <5s standing still; now
  5 bots + reaction window + pHit cap 0.6 → HP ~73 after 5s exposed).
