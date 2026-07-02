# FragBox — Progress Log

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
- [ ] Progression: XP/levels, cosmetic skins for bots+viewmodel (playbook §5)
- [ ] MP polish: interpolation buffer (currently rate-lerp)

## Releases (newest first)
- **v018** (2026-07-02 ~15:30): Scoreboard + HUD polish. Scoreboard: LV chip column (player =
  real level from xp; solo bots + server lobby bots get random 1–15), K/D ratio, 👑 on the
  leader, zebra rows, mode line ("FREE-FOR-ALL · first to 25" / "ONLINE FFA"), restyled card.
  Levels flow join → roster → snapshot (`l` field). Weapon slot pills above ammo (1 RIFLE /
  2 PISTOL, active highlighted) rendered in updateAmmoHUD. Full suite green. SW → v018.
- **v017** (2026-07-02 ~15:25): Arsenal + roster expansion. 3 new weapons in shared/weapons.mjs
  (server auto-validates): LMG (18dmg/550rpm/60mag/3.2s reload), DMR (34dmg semi, adsSpread
  0.002), Revolver (55dmg = 2-body/1-head). Distinct viewmodels (LMG bipod+box mag, DMR low
  scope, Revolver cylinder+wood grip). 3 new classes extending the grind ladder: Support
  (LMG+Pistol, 110hp, lvl 10), Ranger (DMR+Revolver, 95hp, lvl 13), Outlaw (Revolver+Shotgun,
  1.05x, lvl 16) — 8 cards total, grid auto-fits. BUG FIX: solo bots spawned via
  spawnPoint(null) which ignores the player → bots could spawn inside you (screenshots showed
  body parts clipping the camera; looked like a render glitch). Now spawnPoint(player.pos).
  Test lesson: '.clscard[data-c=N]' matches the hidden death-picker copy first — scope test
  selectors to '#classrow'. Full suite green. SW → v017.
- **v016** (2026-07-02 ~14:40): Kour-style feedback + in-game class picker + CRITICAL movement
  fixes (user-reported). BUGS: right-vector was fwd×up flipped → A/D (and touch strafe)
  inverted since v001 — headless tests only asserted "moved", never direction (lesson: assert
  signs); pointer-lock movementX spikes clamped ±180 (Windows re-lock glitch = "view teleports");
  step-up assist snapped from 1.0 below a box top onto it ("position teleports") → 0.35.
  FEEDBACK: floating damage numbers (world→screen projected divs, headshots red), kill banner
  "+100 ELIMINATED name"/"+150 HEADSHOT" feeding persistent XP (kh_xp, level=√(xp/150)+1),
  level badge + XP bar in HUD + menu, LEVEL UP callout re-renders class locks; hit-direction
  red arrow rotating around crosshair (rel = atan2(dx,dz) − yaw−π); low-HP heartbeat vignette.
  CLASSES: data-driven cards rendered from CLASSES[] into menu AND death screen; unlock levels
  (Assault 1 / Gunner 3 / Breacher 5 / Marksman 8), locked = greyed 🔒 Level N; Phantom
  ★ PREMIUM "coming soon" slot establishes the paywall pattern (classUnlocked() gates).
  DEATH PICKER: on death (solo+MP) pointer unlocks and CHANGE CLASS panel shows; picking
  applies on respawn (MP sends {t:'cls'} → server updates maxHp for next spawn). Flow bug
  fixed: solo lock-release on death was triggering menu — lock-loss→menu now requires alive.
  Server: hitfx carries dmg+victim pos (damage numbers), dmg carries attacker pos (hit arrow).
  Full suite + strafe-direction + death-picker functional tests green. SW → v016.
- **v015** (2026-07-02 ~14:15): Class + loadout system (user request: Kour-style class/gun
  selection). 4 classes — Assault (Rifle, 100hp), Gunner (SMG, 90hp, 1.08x speed), Breacher
  (Shotgun, 115hp, 0.93x), Marksman (Sniper, 90hp) — each with Pistol sidearm. Loadout = 2
  slots (keys 1/2, scroll/swap cycles); `player.loadout` maps slots → WEAPONS indices, all
  weapon lookups via curW(); ammo/reserves per slot; ammo pickup refills loadout only. Class
  hp/speed applied everywhere hp=100 used to be (player.maxHp, HUD bar shows %, heal caps).
  MP: join sends maxhp (server clamps 80–120, owns it through respawns/round resets); fire
  msg sends global weapon index. Menu: class card grid (active highlight, persisted in
  kh_set.cls). Headless: Marksman→Sniper/90hp, Breacher→Shotgun/115hp/0.93x, slot switch,
  menu return; playtest expectation Digit2→Pistol; full suite green. SW → v015.
- **v014** (2026-07-02 ~13:55, after machine slept overnight): Visual polish round 2.
  First-person arms: olive sleeves + skin hands on every viewmodel (trigger hand always,
  forend hand except pistol; positions derived from tipZ). Bullet impact decals: radial-splat
  canvas texture on tiny planes at castWorldHit() point+normal (world boxes are unrotated so
  object normal == world normal), polygonOffset to avoid z-fighting, 14s life with 2s fade,
  45 cap. Jump pads: emissive pulse (sin fxTime), hovering glow ring that bobs and jumps with
  the pad pulse (NOTE: spinning a torus is invisible — bob it instead). Pickups: emissive
  cross/shells + warm hovering glow ring under each item. Folder rename to FragBox still
  blocked by an external lock. Full suite green. SW → v014.
- **v013** (2026-07-02 ~05:45): Graphics fidelity pass (user request: match Kour.io polish).
  ACES filmic tone mapping (exposure 1.15) + stronger sun/hemi + shadow bias. Gradient sky dome
  (shader, BackSide sphere), 10 drifting cloud sprites (radial-gradient canvas), low-poly
  mountain ring fading into fog (far 210). Procedural canvas textures — grass (speckled),
  wood-plank crates w/ grain+frame, seamed concrete walls, riveted metal, painted green metal —
  per-box cloned+tiled by size via matFor(); textured ground + darker outer ring. New soldier
  model: hip-pivoted swinging legs+boots, vest+pouch+belt, forward arms w/ hands, two-handed
  rifle, helmet+rim+visor (head kept at hitbox height 1.62). Leg walk-cycle for remotes AND
  solo bots. Pines (3-tier cones)+rocks replace box trees. CSS grade saturate(1.05)
  contrast(1.03) + permanent subtle vignette. Tuned after first screenshots: grass smaller/
  lower-contrast speckle, sky desaturated, mountains darker. Full suite green. SW → v013.
- **v012** (2026-07-02 ~05:35): User feedback round. REBRAND KourHero → **FragBox** everywhere
  (title/logo/manifest/SW cache prefix/server logs/docs; no Kour references left; folder rename
  to FragBox pending a file lock on the user's side). Fixed "menu buttons don't work": opening
  via file:// blocks module imports (CORS) killing all JS — added classic-script guard that
  shows a friendly overlay + PLAY.bat one-click launcher (starts server, opens browser). Menu
  redesigned: compact setup card (name field + settings), PLAY/ONLINE side by side, scrollable
  overlay. file:// guard verified headlessly; full suite green. SW → v012.
- **v011** (2026-07-02 ~05:20): Name entry + touch ADS. Menu name field (14 chars, persisted to
  kh_name, used for MP join; falls back to generated Hero###). Touch ⊕ button toggles ADS
  (button highlights while on; FOV verified 75→55→75). Full suite green. SW → v011.
  **Overnight loop wrap: 11 releases, both phases complete, QA'd twice, all tests green.**
- **v010** (2026-07-02 ~04:55): QA sweep (playbook §9 checklist). Fixed: dying while scoped left
  the death cam stuck at FOV 26 (dead branch now lerps FOV back); ads/mouseDown not reset on
  menu exit (re-entered matches zoomed/firing); stale NET.roundT/lastOver after MP disconnect;
  server message handler wrapped in try/catch (a handler exception could kill the whole lobby).
  Audited clean: state resets across solo↔MP + round resets, NaN guards on normalizations,
  backward iteration on FX arrays, key-repeat guards, fire-rate/self-hit/dead-entity server
  checks, no showMenu↔mpDisconnect recursion. 45s hard-mode soak (7 bots): 0 errors, scene
  graph stable (±transient VFX only). Full suite green. SW → v010.
- **v009** (2026-07-02 ~04:45): MP rounds + polish + README. Server: 5-min rounds (`--round=S`),
  armed when first human joins; at 0 → broadcast standings ('over'), reset all scores/hp/pos,
  respawn everyone, next round. Snapshot carries `rt` (seconds left) → client HUD shows a real
  MP countdown. Client round-over: winner callout ("YOU WIN THE ROUND!" if you), scoreboard
  auto-shows 4s. Remote players now have a walk cycle (sway + body bob scaled by measured
  speed) and join/leave sounds. README.md: play/run/controls/architecture/dev-workflow.
  mptest additions: round-over seen + timer format asserted (server run with --round=7; note
  round reset zeroes bot k/d — don't assert on botKills). SW → v009.
- **v008** (2026-07-02 ~04:38): Phase 2c — lobby bots. Server keeps population at TARGET_POP=6
  (`--pop=N` to override): bots join when humans are short, leave when humans arrive, all gone
  when server empties. Bot entities share the player pipeline (same snapshot/kill/spawn paths,
  send() now null-safe for socketless bots). Server AI @20Hz: nearest-visible-enemy targeting
  (ray-vs-AABB LOS), combat strafe, waypoint roam with per-axis AABB collision, reaction window,
  fires rifles via the same authoritative doFire() as humans. Test run: 1 human → 5 bots, all 5
  roamed, 11 shot events reached the client, 2 bot-vs-bot kills in 8s, bots interleave with the
  human duel (combat test isolated via --pop=0). ORIGINAL SPEC NOW COMPLETE (Phase 1 + Phase 2).
  SW → v008 (no client asset changes beyond shot counter).
- **v007** (2026-07-02 ~04:30): Phase 2b — server-authoritative MP combat. Weapons →
  `shared/weapons.mjs` (+HITBOX spec). Server: `fire` msg validated (rate cap 0.7x interval,
  origin within 3u of known pos, finite checks), slab-method ray-vs-AABB world occlusion +
  head/body sphere hit tests against all players, damage/kill/respawn state machine (3s dead,
  spawn furthest), events: shot (relayed for tracers/sound), hitfx (shooter), dmg (victim),
  die, kill (broadcast, names+ids+hs), spawn. Client: MP fire sends origin+aim+ads; snap syncs
  server-authoritative k/d and hides dead remotes; kill events drive killfeed/streak callouts;
  die/spawn drive death cam + server respawn; MP scoreboard from remote k/d; pickups disabled
  in MP (server doesn't own them yet). `--test` server flag enables tp for automated tests.
  mptest combat scenario: Alice tp'd 10u from Bob, aimed via yaw/pitch math, 14 rifle shots →
  Bob hp 0, died, killfeed correct, respawned hp100, Alice kills=1 server-verified. SW → v007.
- **v006** (2026-07-02 ~04:20): Phase 2a — multiplayer foundation. Map extracted to
  `shared/map.mjs` (boxes/spawns/pads/pickups/phys consts; client builds meshes from it, solo
  playtest confirmed identical). `server/server.mjs`: static hosting + ws (same port), join/leave
  with roster, 20Hz snapshots, movement validation (speed cap sprint*1.6+slack, arena bounds,
  finite checks). Client: MULTIPLAYER button (connect to location.host, 3s fail hint), remote
  avatars = bot mesh + canvas-sprite name tags, target-lerp interpolation with angle-wrap fix,
  join/leave killfeed lines, 20Hz input send, ONLINE HUD mode, no local bots/match-end in MP.
  Key fix: pointer-lock loss in MP no longer exits to menu (was disconnecting players on
  alt-tab/focus loss — canvas click re-locks, 2nd Esc leaves). tools/mptest.js: spawns server +
  2 headless clients; Alice's 7.2u move seen by Bob with 0.0 gap; remote removed on leave; 0
  errors. NOTE for tests: background tabs pause rAF — assert on r.target, not mesh position.
  Playtest MIME map needed .mjs. SW → v006 (caches shared/map.mjs).
- **v005** (2026-07-02 ~04:09): 5-weapon roster + ADS + streaks + death cam. New SMG (13dmg/
  900rpm/35mag) and Sniper (90dmg = 2-body/1-head, 5mag, huge hip spread 0.045, adsSpread 0.001).
  Right-mouse ADS: sniper → FOV 26 + full scope overlay (crosshair+viewmodel hidden, slower look
  scaled by fov/75), other weapons → FOV 55 steady-aim with 0.4x spread. Kill streak callouts
  (DOUBLE/TRIPLE/QUAD/RAMPAGE/UNSTOPPABLE + HEADSHOT) with rising jingle; streak resets on death.
  Death cam: camera sinks + rolls 0.45rad, "Respawning in N…" countdown. Weapon keys 1–5.
  Gotcha: ADS block needed its own WEAPONS lookup (`wpn`) — `const w` later in updatePlayer = TDZ.
  Headless: ADS fov 26/75 + scope show/hide + death/respawn cycle asserted, 0 errors. SW → v005.
- **v004** (2026-07-02 ~04:03): Mobile touch controls + match settings. Touch: floating left
  stick (move; >0.92 deflection = sprint), right-zone look drag, FIRE/JUMP/swap/reload/pause
  buttons, touch-specific HUD layout (`body.touch` CSS, not width media query — 900px landscape
  phones missed the breakpoint). Pointer lock skipped on touch. Menu settings with localStorage
  persistence (`kh_set`): bots 3/5/7, difficulty Easy/Normal/Hard (bot skill base 0.4/0.6/0.78 +
  damage x0.7/1.0/1.3), match length 3/5/10min. Emulated-touch headless test: fire tap −1 ammo,
  look drag Δyaw 1.0rad, stick drag moved 9.5u, settings applied (3 bots, skills .46–.56, 3:00),
  0 errors. SW cache → v004.
- **v003** (2026-07-02 ~03:57): Weapon feel + pickups + jump pads. Distinct low-poly viewmodels
  per weapon (rifle barrel/receiver/mag/stock, shotgun pump, pistol slide), muzzle-flash sprite
  at barrel tip (45ms) + camera recoil kick per weapon (springs back at 9/s). Pickups: 3 health
  (+40) incl. one on the tower top, 2 ammo (+1 mag each weapon, cap 2x reserve), spin/bob,
  15s respawn, bots grab health when <65hp. Kour-style jump pads: 2 launch to tower top (v=19),
  2 corner pads (v=15); work for bots too; pulse+boing on use. JUMP_V 8.5→9.0 and small crates
  1.8→1.5 so crates are jumpable steps. Functional headless tests: pad apex 6.3 (tower=6 ✓),
  hp 30→70 ✓, reserve 10→40 ✓, 0 errors. SW cache → v003.
- **v002** (2026-07-02 ~03:50): True FFA — bots now acquire the nearest visible enemy (player OR
  other bots) via `acquireEnemy()`, fight/strafe/shoot whoever it is; kill credit + kill feed for
  bot-vs-bot. Generalized `botShoot(b, enemy)` and `damageBot(..., attacker)`; gunshot volume now
  scales with distance to the *player* (listener), not the target. Obstacle steering: 2.2u feeler
  raycast ahead, slide toward the clearer of ±57° when blocked. Mid-edge spawns shifted sideways
  so they no longer stare into the cover bars. Enemy switch resets the reaction window. Soak
  test (45s headless): 7 bot-vs-bot kills, 0 stuck bots, 0 errors. SW cache → v002.
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
