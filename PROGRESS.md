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
- [ ] Real ad-network SDK + IAP wiring (needs user's accounts — see MONETIZATION.md)
- [ ] More cosmetics: viewmodel gun skins, kill effects

## Releases (newest first)
- **v044** (2026-07-03 ~03:15): FOOTSTEPS + KILLCAM (wave 2 complete). Footsteps: procedural
  taps (soft thud on grass, sharp on asphalt/concrete per map ground), cadence from horizontal
  speed via stride accumulator, quieter+slower crouched, silent airborne/sliding; solo bots
  and MP remotes emit steps with 26u distance falloff — audio intel that pairs with the
  tactical minimap. Killcam: on death the camera orbits your killer (5.2u ring, auto-tracking)
  with a label (name · weapon · remaining HP); solo uses the killer bot ref (weapon known),
  MP via new kid+kw fields on the die msg mapped to remote meshes; falls back to the classic
  sink+roll cam when the killer is gone; label cleaned on respawn/menu paths. Verified: orbit
  at 6.1u with "KILLED BY Vex · MP5 · 90 HP". Full suite green. SW → v044.
- **v043** (2026-07-03 ~02:45): CAREER STATS PAGE (wave 2 #7). 📊 menu button opens CAREER
  overlay: headline grid (level/XP/kills/KD/accuracy/matches/wins/playtime) + per-weapon table
  (kills, accuracy, shots, attachment stars). kh_stats tracks shots (per pellet at trigger
  time), hits (solo pellet hits + MP hitfx confirmations), deaths (both modes), matches,
  wins (solo victory, MP gungame win; team wins TODO), playtime (accumulated per frame,
  persisted every ~300 events + on menu/close). Fixtures verified (45% acc computes, 1h30m
  playtime formats) and live fire persists. Full suite green. SW → v043.
- **v042** (2026-07-03 ~02:20): CAPTURE THE FLAG (wave 2 #6). Server --mode=ctf: team infra
  generalized to TEAMED (tdm||ctf — colors/FF/spawns/nade/airstrike team rules shared; kill-
  scoring stays TDM-only, CTF teamScores = captures, first to 3 ends the round). Flag state
  machines (home/carried/dropped): touch pickup by enemies, drop on death/disconnect, 15s
  return timer, teammates touch-return, capture requires own flag home; flags ride carriers
  at +2.1y in snap (fl payload). Bots PLAY THE OBJECTIVE: carriers run home (10% slowed),
  teammates hunt the enemy carrier, others make grabs. Client: pole+cloth flag meshes with
  spin, "YOU HAVE THE FLAG" banner + 10% carry slow, minimap ⚑ markers, killfeed lines for
  taken/dropped/returned/captured, +300 XP capture callout, RED·BLUE pill shows captures.
  Live test: full taken→dropped→returned cycles from pure bot play, carrier-hunting confirmed.
  Full suite green. SW → v042.
- **v041** (2026-07-03 ~01:50): WEAPON ATTACHMENTS (max-grind #5 — queue complete). Per-gun
  kill milestones auto-unlock: 25 kills = EXTENDED MAG (+50% mag, flows through resetLoadout/
  reload/gungame paths via wMag()), 100 kills = LASER (hip spread ×0.85 + bloom accumulation
  ×0.7 — client-side stat mods; MP-safe since bl multiplier only ever adds spread server-side).
  Stars everywhere: deploy cards ("AK-47 ★"), slot pills ("M1911 ★★"), unlock callouts at the
  25/100 thresholds. Fixtures verified: 45-round AK mag at 30 kills, tier-2 pistol 18 rounds +
  measurably tighter crosshair. Full suite green. SW → v041.
- **v040** (2026-07-03 ~01:25): THIRD MAP "SKYLINE" — vertical dusk cityscape (max-grind #4).
  Five buildings (6-9 stories of blocks: 4 corner blocks + centre tower), two rooftop bridges,
  walkable stair runs to terraces, 8 jump pads incl. direct street→tower-crown chains (v21.5),
  rooftop hp/ammo as high-value spots (tower crown hp at y9.7), street cover (cars, kiosk,
  planters, jersey barriers). ENGINE ADDITIONS: true walk-up steps (X/Z collision passes now
  step-up ≤0.36 instead of blocking — players AND solo bots climb stairs; the old assist only
  worked falling onto ledges), elevated spawns ([x,z,y] third element, client+server), per-map
  sky gradients + sun/hemi config (Skyline = deep-night top, ember horizon, amber dim sun),
  per-face building materials (lit-window facade texture on sides, dark gravel roof — box
  material arrays). Deco: roof antennas w/ red beacons, AC units, distant black tower
  silhouettes. Verified: stairs climbed (y+1.5 walking), pad chain reached y8.2 toward tower,
  35 colliders, street/roof screenshots. Full suite green. SW → v040.
- **v039** (2026-07-03 ~00:55): BOT AI OVERHAUL (max-grind #3). Solo bots now play classes:
  random class per bot (weapon/hp/speed from CLASSES — Breacher shotgunners tank at 115hp,
  Gunners rush at 1.08x, Marksmen run AWPs), per-weapon combat model (auto weapons fire 3-5
  round bursts at true rpm spacing; semis at rpm-derived cadence; shotgun damage ≈2.2 pellets),
  aim smoothing (aimErr 1→0 at difficulty-scaled lock-on rate 0.5/0.95/1.6 per sec, resets on
  target switch/LOS loss, multiplies pHit — bots now "acquire" you instead of instant-beaming),
  hurt bots run to health packs, healthy ones occasionally ride jump pads, bots crouch to
  steady long-range shots (smaller player-facing hitbox + squash visual + slower move), and
  on HARD they throw grenades (8-26u band, 9-14s cooldown) that hurt you AND other bots with
  proper attribution. Server lobby bots: weighted random arsenal (AWP excluded) with weapon-
  appropriate cadence. Verified: class roster diversity, aimErr 1→0.52 lock-on, live bot nade.
  Full suite green. SW → v039.
- **v038** (2026-07-03 ~00:30): KILLSTREAK REWARDS (max-grind #2). Streak 3 = UAV (10s full
  minimap reveal w/ gold border + enlarged pings); 5 = OVERSHIELD (+50 absorbed before hp,
  blue bar segment, server-side in MP); 7 = AIRSTRIKE (1.5s "INBOUND" warning broadcast, then
  2 blasts per enemy using grenade explosion pipeline — kills credited, chains streaks; solo
  local / MP server-authoritative via scheduleAirstrike+explodeNade). Server now tracks per-
  entity streak/shield (bots get rewards too), {t:'streak'} tiers to the earner, dmg msgs
  carry shield. HUD streak chip ("STREAK n · next: X"). BIG minimap rework to make UAV matter:
  enemies now ping only when recently loud (2.5s after firing — tracked solo + via MP shot
  events), within 16u, or UAV-revealed; TDM teammates always green. Solo ladder verified end
  to end (airstrike wiped 5 bots, streak chained to 12). Full suite green. SW → v038.
- **v037** (2026-07-03 ~00:05): Crouch + slide movement (max-grind queue #1). Ctrl/C (or touch
  ▼ toggle): 0.5x speed, eye lerps 1.62→1.08, collision height 1.2, accuracy bonus (bloom mult
  ×0.7 when steady). Sprint+crouch = SLIDE: 0.55s momentum burst (1.35× sprint), input accel
  damped to 2.2 so momentum carries, eye 0.9 + camera tilt, slide adds spread (+0.7). Crouch
  flag rides the 'in' msg → server stores p.crouch and scales hit spheres (head ×0.68 /
  body ×0.7) so crouching genuinely shrinks you online; snap 'c' → remotes squash-scale 0.66
  visually. playerEye() now uses dynamic eye height (shots originate lower when crouched;
  bots aim at your real eye). Functional: crouch eye/speed, stand restore, slide burst 13.3u/s.
  Full suite green. SW → v037.
- **v036** (2026-07-02 ~23:40): GRENADES — first big core-combat expansion (user: "bigger
  changes… more everything"). Shared NADE constants; client: G key / 🧨 touch button, 2 per
  life (+1 from ammo pickups), thrown from eye with arc, full bounce physics (ground + axis-
  wise AABB reflection + top bounces, restitution 0.45, rolling friction), accelerating fuse
  blink, explosion = orange/smoke/spark particle burst + transient point light + scorch decal
  + distance-scaled camera shake + deep boom SFX. Solo damage: bots full (LOS-checked radial
  falloff 95→12 over 7u), self half ("killed by your own grenade"). MP: server-authoritative —
  {t:'nade'} validated (count/origin/speed caps), server steps identical physics at 20Hz and
  applies blast damage (no self-damage, no TDM team damage, walls block via rayWorld);
  nadeSpawn broadcast animates remote grenades (own throw renders instantly locally), boom
  syncs fx and reaps stray local visuals. HUD 🧨 counter. Verified: solo bot+self damage,
  MP point-blank 100→18 with thrower safe. Full suite green. SW → v036.
- **v035** (2026-07-02 ~22:35): Deploy packaging (roadmap #8 — ROADMAP COMPLETE).
  tools/build-portal.mjs stages client files and Compress-Archives dist/fragbox-portal.zip
  (203 KB, 8 files; SW self-gates so portal iframes are safe). README "Hosting / shipping"
  guide: GitHub Pages (solo PWA), Node hosts for MP with full flag reference, portal upload
  path. PLAY.bat passes flags through (PLAY.bat --mode=tdm --map=depot). No client changes
  (no SW bump). Full suite green. Product roadmap delivered end to end.
- **v034** (2026-07-02 ~22:20): Dormant monetization (roadmap #7, playbook §7). Monetize
  abstraction (provider:'sim'): showRewarded plays a simulated 2s AD BREAK overlay then
  rewards exactly once (onFail restores UI for no-fill), buyPremium → "COMING SOON" callout.
  Placement built: match-end "▶ AD — 2× XP (+N)" doubles that match's XP (once per match).
  Premium Phantom class + Rose skin clicks route through buyPremium. MONETIZATION.md documents
  placements, go-live steps (portal SDK mapping, reward-exactly-once audit rules), and what
  requires the user's accounts (portal/ad network, payments). BUG: matchXpStart||xp treated
  a legit 0-XP start as unset → matchXp 0 → button hidden on fresh profiles; explicit
  undefined check. Full flow verified headlessly (100→200 XP). Full suite green. SW → v034.
- **v033** (2026-07-02 ~22:00): First-run interactive tutorial (roadmap #6, playbook §8).
  Six action-gated steps in the first solo match (starts on DEPLOY when kh_tut unset): move
  4u → fire → ADS → eliminate a bot → ride a jump pad → ready message; gold pulsing banner
  top-center advances with a chime per step; kh_tut=1 on completion; leaves cleanly on menu
  exit; "Replay tutorial" button in settings clears the flag. Hooks piggyback existing events
  (playerShoot, damageBot kill, checkPad). Headless walkthrough advanced all 6 steps and
  persisted. Gotcha: apostrophe in a single-quoted tutorial string — verify caught it. Full
  suite green. SW → v033.
- **v032** (2026-07-02 ~21:45): Audio pass (roadmap #5). Per-weapon shot timbres via
  SHOT_RECIPES keyed on weapon type: AK punchy mid, MP5 snappy square, M870 700Hz boom,
  AWP 3.2kHz crack + rolling tail, M249 heavy chug, M14 sharp semi, .44 thunder + sub,
  M1911 clean pop; remote/bot shots use the real fired weapon's recipe scaled by listener
  distance. Procedural music engine: menu = Am↔G triangle arpeggio + filtered saw bass +
  sparkle (210ms step, setInterval), game = looped lowpass wind ambience; all through
  MUSIC.gain → masterGain (volume slider covers it); Music ON/OFF in settings (persisted);
  state machine setMusicMode driven by showMenu/startMatch, applied at first audio gesture.
  Headless: menu timer on, toggle persists off, game swaps to ambience, 0 errors. Full suite
  green. SW → v032.
- **v031** (2026-07-02 ~21:25): Gun Game mode (roadmap #4, Kour reference). Server
  --mode=gungame: shared GG_LADDER [AK-47→MP5→M870→M249→M14→AWP→M1911→.44 Magnum]; every
  entity tracks gg index; kills advance it ({t:'gg'} to the killer), finishing the ladder →
  ggWin: broadcast over w/ winner, full reset (scores+gg), respawn all; server ENFORCES the
  ladder weapon on fire (ignores client w) and bots fire their own ladder gun; timed round
  reset also zeroes gg. Client: single-slot loadout from ladder (class picker skipped — classes
  are irrelevant in GG), 'gg' msg hot-swaps weapon with WEAPON UP callout, GUN n/8 score pill
  (third static pill layout), scoreboard shows ⟨n/8⟩ per player, "YOU WIN THE GUN GAME!" on
  ladder finish. Functional test: kill → MP5 + GUN 2/8 (test lesson: re-aim each frame at
  moving bots — chase-aim loop). Full suite green. SW → v031.
- **v030** (2026-07-02 ~21:05): Team Deathmatch (roadmap #3, Kour reference). Server
  --mode=tdm: balanced team assignment on join (humans + lobby bots, pickTeam counts both),
  team colors override skins (red 0xe53935 / blue 0x2196f3), spawnPos avoids only ENEMIES in
  TDM, no friendly fire (doFire skips teammates), bot AI never targets teammates, kills
  increment teamScores (broadcast in snap ts + round-over msg, reset per round). Client:
  NET.gameMode/team from welcome; dual-layout score pill (static FFA K/D + TDM RED·BLUE
  spans toggled — NOTE: never innerHTML-destroy elements other code looks up by id, and the
  static verifier regexes ids inside JS strings too); minimap teammates green/enemies red;
  scoreboard team dots; round-over announces RED/BLUE TEAM WINS (VICTORY prefix if yours).
  Gotcha: mid-template rep broke a literal — verify caught it. TDM functional test: 3v3
  balance, cross-team kill scored, pill "RED 0 · 1 BLUE", 0 errors. Full suite green. SW → v030.
- **v029** (2026-07-02 ~20:45): Second map "Depot" + multi-map system (roadmap #2, Kour
  reference: multiple maps). shared/map.mjs → MAPS registry (meadow, depot) + getMap();
  each map carries BOXES/SPAWNS/PADS/PICKUPS + theme (ground tex, fog/outer colors, deco set).
  Depot: 40-half tighter industrial arena — corrugated shipping containers (rust/blue/yellow,
  new ribbed container texture tinted by material color, some stacked), central concrete
  loading platform + rust hut, yellow barriers, catwalk blocks, asphalt ground w/ painted
  lines, grayer fog, light-pole + pallet decorations. Client world is now REBUILDABLE:
  worldGroup + buildWorld(mapId) tears down colliders/worldMeshes/pads/pickups/decals/tracers/
  puffs and rebuilds; ground material texture-swaps; SPAWNS/ARENA are live bindings. Menu Map
  row (Meadow/Depot, persisted kh_set.map — setbtn wiring now string-safe); solo applies at
  match start; MP obeys server (--map=depot flag, map id in welcome). Verified: depot 25
  colliders / meadow 26 both directions, server --map=depot pushes depot to clients, screenshots,
  full suite green. SW → v029.
- **v028** (2026-07-02 ~20:25): Settings panel (product roadmap #1). Mouse sensitivity
  (0.3–2.2x), field of view (60–110, live-applied: menu preview immediate, in-game via the
  existing FOV lerp; ADS steady-aim = min(55, fov−10), AWP scope stays 26), master volume
  (WebAudio masterGain node — all tone/noiseBurst routed through it). Persisted in kh_set;
  ⚙ button top-right of menu + ⚙ in pause card; DONE closes. Touch look also scaled by sens.
  Headless: sliders persist {150,100,40}, FOV 100 in menu + in game, panel opens from both
  entry points. Full suite green. SW → v028. USER GUIDANCE: when in doubt, reference Kour.io.
- **v027** (2026-07-02 ~20:10): Class selection fully in-game (user request) + picker restyle
  (user: "clashes horribly with background"). Menu class grid REMOVED; match start (solo +
  MP) opens an in-game CHOOSE YOUR CLASS deploy screen (pause machinery in deployMode: title/
  button swap to DEPLOY, closing applies loadout + heals to class max; MAIN MENU quits).
  Pause (Esc) and death pickers remain for mid-match changes. Server cls handler heals to new
  max when still undamaged (pre-fight swaps). Class cards restyled: opaque #141a2a cards,
  2px borders, weapon name in blue, gold active state w/ glow, hover lift, high-contrast lock
  text; picker panels near-opaque + blur + heavy shadow. Test harnesses click DEPLOY after
  PLAY/ONLINE. Verified: pick Gunner on deploy screen → spawn MP5 90/90. Full suite green.
  SW → v027. USER DIRECTIVE: full product mode — manufacture work, implement good ideas.
- **v026** (2026-07-02 ~19:10): Viewmodel character pass — each gun now looks like its real
  counterpart: AK-47 (wood handguard/stock, stamped receiver, curved two-segment mag, front
  sight post), MP5 (slim body, curved mag, sliding stock), M870 (under-barrel mag tube, wood
  pump/stock), AWP (olive body, long scope w/ objective+ocular rims, muzzle brake), M249
  (olive belt box, carry handle, bipod), M14 (full wood stock line + scope), .44 Magnum
  (silver frame, top strap, hammer). Gotcha: stray Cyrillic char corrupted a hex literal —
  caught by verify. Screenshots confirmed AK/AWP silhouettes. Full suite green. SW → v026.
- **v025** (2026-07-02 ~19:00): Real-world arsenal (user request). Weapons renamed to iconic
  counterparts — AK-47, MP5, M870, AWP, M1911, M249, M14, .44 Magnum — via new `type` field
  in shared/weapons.mjs: logic (viewmodel shapes, sniper scope/FOV, pistol one-hand) now keys
  on type, `name` is display-only. kh_wkills challenge counts auto-migrate old→new names on
  load. Class cards/HUD/slot pills/challenges all show real names automatically. playtest
  expectation Digit2→'M1911'. Full suite green. SW → v025.
- **v024** (2026-07-02 ~16:30): Progression loop deepened — weapon challenges + skin locker.
  CHALLENGES: per-weapon kill counts (kh_wkills) with tiers 10/50/250 kills → +250/+1000/+5000
  XP, completion callout ("RIFLE I COMPLETE +250"), menu shows 3 nearest-to-complete. Hooked
  into both solo and MP kill paths (weapon attributed via curW()). SKINS: shared/cosmetics.mjs
  catalog (7 level-gated colors Lv1–15 + premium "Rose" coming-soon slot); locker swatches in
  menu (locked = grey + level number, current = ring); selection persists (kh_skin), tints
  first-person sleeves immediately, and is sent at MP join — server validates against the
  catalog (SKIN_COLORS set) so invalid colors fall back to palette; other players see your
  skin color on your avatar. Level-ups refresh locker + class locks. Verified: gating at lvl 3
  (2/8 unlocked, locked pick rejected), challenge completion XP math, full suite. SW → v024.
- **v023** (2026-07-02 ~16:20): QA sweep of v022 surface. Fixed: bloom persisted through
  death→respawn (now reset in resetLoadout); crosshair rendered over the death cam (hidden in
  dead branch, alive branch restores). Audited clean: pause-while-dead guards, die-closes-pause,
  solo sim freeze (matchT/kill-target unreachable while paused), MP quit-from-pause disconnect,
  touch resume without pointer lock, Escape in menu no-ops, bl≈1 under sniper ADS, sendInput
  continues while MP-paused (intended). Full suite green. SW → v023.
- **v022** (2026-07-02 ~16:20): Bloom + pause menu + progression juice + arm fix (user requests).
  BLOOM: per-weapon bloom-per-shot in shared/weapons.mjs; currentSpread() = base(ads-aware) ×
  (1 + bloom×2.2), airborne +1.3, sprinting +0.9, ADS tames movement/spray bloom to 30%;
  decays 1.7/s (0.45 while holding fire). Crosshair reworked to center-relative lines and its
  size now shows live spread (24px rest → 29px spraying → 36px airborne, verified). MP fire
  sends bl multiplier; server multiplies its spread (clamped 1–4; only ever ADDS spread so not
  a cheat vector). PAUSE MENU: Esc/lock-loss while alive opens PAUSED overlay (both modes) with
  full class grid (applies next spawn), RESUME (re-locks), MAIN MENU (quits/disconnects); solo
  freezes the sim, MP keeps running; touch ☰ toggles it; shooting/ADS input blocked while
  paused; death closes it. Replaces the old lock-loss→menu flow. PROGRESSION: level-ups now
  announce each newly UNLOCKED class; menu shows "next unlock: X at Lv N"; match end shows
  "+N XP earned". VIEWMODEL: arms rebuilt as exact shoulder→hand limbs via quaternion
  setFromUnitVectors (user reported left arm not aligned with hand — it wasn't; eyeballed
  angles replaced with computed geometry). TEST regression: focus loss now auto-pauses in MP
  (by design) — mptest must dismiss the pause overlay before firing. Full suite green. SW → v022.
- **v021** (2026-07-02 ~15:55): QA sweep over v016–v020. Found+fixed: "RELOADING…" label stuck
  forever after weapon-switch-during-reload (switchWeapon zeroed reloadT without hiding the
  label) and shown through the death screen when dying mid-reload — now hidden on switch, in
  resetLoadout, and in the dead branch. Audited clean: locked-class fallback, XP re-render with
  open death picker, MP class-change → server maxHp → respawn chain, minimap during death cam
  and with MP remotes, interpolation buffer on join/round-teleport (1-snapshot slide, fine),
  hitdir/dmg guards while dead, timers across state changes. Full suite green. SW → v021.
- **v020** (2026-07-02 ~15:50): MP snapshot-buffer interpolation. Remotes render 110ms in the
  past, lerping pos+yaw (angle-wrapped) between the two snapshots bracketing render time —
  buttery instead of rubber-band. Mesh micro-lerp rate raised to 25/s. GOTCHA repeat: snap
  handler must ALSO set r.target directly — background tabs pause rAF so interpolation never
  runs there (mptest asserts on r.target from a backgrounded tab). Full suite green. SW → v020.
- **v019** (2026-07-02 ~15:40): Minimap + killed-by + streak XP. Minimap (150px canvas,
  top-left; 110px below pause btn on touch): walls/cover as translucent rects, red enemy dots
  (alive only; MP uses remote visibility), green hp-pickup dots (solo), rotating player arrow
  (rotate(-yaw), fwd=(-sin,-cos) → screen-up at yaw 0). Death screen adds "Killed by NAME ·
  N HP left" (solo from bot state; MP server sends bhp in die msg). STREAKS now carry XP
  bonuses (+50/+75/+100/+150/+250) shown in the callout and added via addXp. Full suite green.
  SW → v019.
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
