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
- **v133** (2026-07-07): ABOUT ROW + SW-BUMP DEFECT FIXED (defect #3 — found by our own
  feature). Settings panel gets a one-line About ("FRAGBOX V133 · built with Claude Code ·
  github") with the version fetched live from sw.js — and THAT fetch exposed a real bug:
  the sw.js CACHE bump seds had been silently NO-OPING since ~v098 (exact-match sed against
  a version string that wasn't there; sw.js sat at v034 for ~35 releases; network-first
  masked it online but offline precaches never refreshed). Fixed: regex version-agnostic
  bump, sw.js now truly v133, and verify.mjs HARDENED to fail whenever sw.js lags the
  newest PROGRESS.md release — this class of no-op can never ship again. Full suite green.
- **v132** (2026-07-07): PICKUP MAGNETISM (core-feel #32, WaterHero collection juice).
  Eligible pickups now drift toward you — within 2.3u a medkit (when hurt) or ammo crate
  accelerates into your hands (4→13 u/s as it closes); ineligible pickups (medkit at full
  HP) stay put, and a magnetized pickup eases back home if you walk away without collecting.
  Respawn resets any drift. Verified: wounded player at 2.0u → medkit drifted 2.0→1.29u
  into the collect radius, +40 HP, hands-free. Full suite green. SW → v132.
- **audit** (2026-07-07): BUG TEST PASS #17 (map-vote e2e) — no defects. Two live clients
  through a full round-end → intermission → vote → swap cycle: vote bar appears on both,
  both vote Depot, server tallies and switches, BOTH clients rebuild the world in sync
  (116→108 colliders) and play continues; zero errors. (First attempt "failed" from test
  timing — votes clicked after the 7s intermission window; the hidden votebar DOM lingers.
  Vote windows need event-driven polling, not fixed waits.) Seventeen bug passes; defect
  count still 2 (v104).
- **v131** (2026-07-07): KILLFEED EXIT + SCOREBOARD HOVER (polish). Killfeed rows now fade
  and slide out gracefully at end-of-life (0.3s ease-in exit at 4.2s) instead of vanishing
  abruptly — matching their slide-in entrance; scoreboard rows get a subtle cyan hover
  highlight. Full suite green. SW → v131.
- **v130** (2026-07-07): HEADSHOT AUDIO IDENTITY (core-feel #31). Headshots now SOUND
  different — a crisp rising 2100→2600Hz skull ping replaces the flat 1200Hz hit tick
  (which stays for body shots), wired through both the solo hit path and the MP hitfx
  message (m.hs). You can now track headshot consistency by ear, COD-style. Assists
  audited: already complete (server assist msg → "+50" callout + stats). Verified: head
  volley 5 pings/0 body tones, torso volley the inverse. Full suite green. SW → v130.
- **audit** (2026-07-07): BUG TEST PASS #16 (settings panel) — no defects. Sens/FOV/volume
  sliders apply live with correct labels, music toggles, all persist across reload; playing
  at MAX extremes (FOV 110 applied to camera, sens 2.2x, vol 0) and MIN extremes (60/0.3x)
  is clean with the viewmodel intact. Zero errors. Sixteen bug passes; defect count
  still 2 (v104).
- **v129** (2026-07-07): SHARE BUTTONS (polish + organic growth). Match results and
  Killhouse results now have 📋 SHARE — one click copies a bragging line with the live URL
  ("I went 7K/3D in FragBox — play it at popnoodler.github.io/fragbox") / ("I hit N targets
  grade S in the Killhouse — beat me at ...") with a COPIED ✓ swap. Verified end-to-end
  headlessly: clipboard contents exact. Every match end is now a viral loop hook. Full
  suite green. SW → v129.
- **v128** (2026-07-07): IRONS MICRO-DRIFT + INSPECT SFX (core-feel #30). Fully-seated iron
  sights now wander almost imperceptibly (±0.0004 rad slow figure-8 — held by hands, not a
  vice; 1/3 of scope sway, no hold-breath for irons). The F-key weapon inspect finally has
  sound: cloth rustle on raise, mechanical tick at the flourish apex, settle rustle at the
  end. Verified: hip drift 0 vs seated 0.0006 rad; tick + rustle in the log. Full suite
  green. SW → v128.
- **audit** (2026-07-07): BUG TEST PASS #15 (touch controls) — no defects. Mobile landscape
  (844x390, hasTouch): menu boots in touch mode with PLAY visible; in-match the virtual
  joystick moves the player, fire button shoots (30→23 rounds), the ADS button engages the
  new COD centered-irons (adsT 1, FOV 62, 'on' class) and toggles off cleanly, nade button
  throws (2→1). Zero errors. The v125 ADS work is verified cross-platform. Fifteen bug
  passes; defect count still 2 (v104).
- **v127** (2026-07-07): MENU WEATHER PREVIEW (polish). Selecting a weather in the menu now
  restyles the 3D backdrop live — rain streaks + overcast fog, snow, or clear — and map
  swaps re-apply the chosen weather (auto previews as clear). The AAA menu preview now
  reflects every setting: map, skin, AND weather. Verified: rain click → fog 88a1b3 +
  streak LineSegments in the preview scene (note: rain = LineSegments, snow = Points).
  Full suite green. SW → v127.
- **audit** (2026-07-07): BUG TEST PASS #14 (ADS regression sweep) — no defects. The new
  COD ADS (v125/v126) survives all edge combos: ADS during reload, ADS mid-slide, weapon
  switch mid-seat, grenade throw while sighted, and 10x rapid ADS spam — every case
  settles to the identical rest state (adsT 0, FOV 75, crosshair visible, viewmodel at
  hip pose, no stuck reload), zero errors. Fourteen bug passes; defect count still 2.
- **v126** (2026-07-07): ADS FEEL COMPLETE (COD follow-through). Per-class ADS zoom tiers —
  DMR/LMG 16°, rifles 13°, SMG/shotgun 9°, pistols/revolver 6° (was flat −10 for all);
  snipers/scouts unchanged. Sights SEAT with a shoulder click + tiny settle dip the frame
  adsT hits 1, and lowering plays a soft whoosh. Verified: AK 75→62, M1911 75→69, seat
  click + out-whoosh in the log. Full suite green. SW → v126.
- **v125** (2026-07-07): REAL COD-STYLE ADS (user directive: "Implement real ADS for the
  guns like COD"). Aiming now brings the gun to SCREEN CENTER with the iron sights rising
  to the exact eye line — per-weapon sight alignment table (ADS_POSE: 8 non-scoped weapons
  tuned via screenshot passes; front posts verified on-center for AK/M1911/MP5/M870), gun
  pulled in closer on z, crosshair HIDDEN once sights are up (adsT>0.65) so you aim with
  the irons like COD, and ADS walk speed reduced to ~65%. Snipers/scouts keep their
  fullscreen scope (already COD-correct). Hip-fire pose, sway fade, kick damping, breathe,
  reload/inspect poses all preserved through the new lerp. Full suite green. SW → v125.
- **v124** (2026-07-07): NEAR-MISS WALL IMPACTS (core-feel #29). Bot rounds that whiz past
  you now visibly STRIKE the surface behind/beside you — gold spark burst at the impact
  point + proximity-scaled thud (200Hz) and ricochet tick (3kHz), 30ms after the ear-snap.
  Only fires when the impact lands within 7u of you (recast extends 14u past the target).
  Verified deterministically: player backed against Bunker's west wall → 6 whizzes, 6
  impacts, 6 ticks, zero errors. Cover fire finally FEELS like cover fire. Full suite
  green. SW → v124.
- **audit** (2026-07-07): BUG TEST PASS #13 (extreme settings) — no defects. 60s soak at
  max stress (7 hard bots, Bunker, HIGH quality, forced rain, music on, player pinned in
  the low-HP band, clutch armed via 28s close match): all systems coexisted — low-HP
  desat + heartbeat + clutch drone + barks + rain suppression — with ZERO errors and sane
  frames (worst 70ms on SwiftShader). Bonus: the match ended mid-soak, proving cleanup —
  clutch class/drone removed, desaturation cleared on death. Thirteen bug passes; defect
  count still 2 (v104).
- **v123** (2026-07-07): LOW-HP SURVIVAL STATE (core-feel #28). Below 30% health the world
  desaturates (canvas saturate .72, owned by a baseFilter() that the kill-impact frame now
  resets to — no filter fights) and a slow wounded heartbeat thumps at 1.1s (52/44Hz —
  slower + deeper than the hold-breath beat), on top of the existing red vignette pulse.
  All of it clears the moment you heal past 30% or respawn. Verified: hp 20 → desat + 6
  thumps/3s; heal → baseline filter, silence. Full suite green. SW → v123.
- **audit** (2026-07-07): BUG TEST PASS #12 (audio/system) — no defects. AudioContext is
  lazily created only on first gesture (nothing pre-gesture, resumes if suspended); 60s of
  menu idle leaks no music/ambient timers (setMusicMode clears before re-arming); 20 rapid
  pause/unpause cycles → clean play state, no drift, zero errors. Twelve bug passes;
  defect count still 2 (both v104).
- **v122** (2026-07-07): BOOT SPLASH (polish). Slow-network audit (emulated slow-3G,
  400ms RTT): first paint was ~2s of PURE BLACK before the single-file HTML arrived. Added
  an instant-paint boot splash — FRAGBOX wordmark + pulsing LOADING, styled in the first
  CSS bytes and placed first in <body> so it renders progressively as soon as the initial
  chunk lands (verified visible at 1s on slow-3G); hidden when the game module finishes
  booting. Sub-100ms flash on fast connections. Full suite green (suite also proves the
  splash unhides — it overlays all UI at z-200). SW → v122.
- **audit** (2026-07-07): BUG TEST PASS #11 (input edges) — no defects. Probed: 10-event
  weapon-scroll spam mid-reload (lands on a valid slot, full state, no stuck reload timer
  or viewmodel); grenade throw while ADS (clean, nade spent, aim released); sprint→slide→
  jump→shoot combo (eyeH restores 1.62, crouch clears, no residual velocity); R-spam
  through weapon switches (no stuck reload); Escape during killcam (respawn proceeds,
  label clears). Zero page errors across all probes. Eleven bug passes; defect count
  still 2 (v104).
- **v121** (2026-07-07): FOOTSTEP VARIATION (core-feel #27) + hit-direction audit. Every
  footstep now varies ±8% in pitch and slightly in length — walking no longer sounds like
  a metronome (verified: 9 consecutive steps, 9 unique frequencies). Also audited the
  hit-direction indicator empirically: attacker due right → arc rendered right (+100°,
  ~10° aim-punch skew) — bearing math CORRECT, no change needed. Full suite green.
  SW → v121.
- **audit** (2026-07-07): BUG TEST PASS #10 (gamemode matrix) — no defects. Booted a live
  server + client in each MP mode: TDM (team scoreboard shows), GunGame (weapon-ladder
  chip shows), DOM (3 capture-point chips), CTF (flag state synced, pole meshes visible in
  scene); all four join, play, and shut down with zero client or server errors. Ten bug
  passes total — defect count still 2 (both fixed v104).
- **v120** (2026-07-07): KILLCAM POLISH (core-feel #26). Death now holds the killing frame
  for 0.4s before the orbit starts (you see exactly what got you), and the killer stands on
  a pulsing red ring for the whole killcam — instantly readable even mid-brawl. Ring hidden
  on respawn/class-pick/match-end (all three exit paths). Verified live: orbit angle static
  through the freeze window (0.099 rad) then orbiting (0.694 rad), ring visible, label
  "KILLED BY Nova · AWP · 18 HP". Full suite green. SW → v120.
- **audit** (2026-07-07): BUG TEST PASS #9 (progression integrity) — no defects.
  Attachment unlocked at EXACTLY the 25th weapon kill with callout ("ATTACHMENT: AK-47
  EXTENDED MAG"); corrupted killhouse ghost JSON → killhouse boots clean; XP level
  boundary (600 XP = Level 3) consistent between menu chip and career stats; crate pulls
  filter to unowned items by construction with a dupe→+300 XP fallback. Nine bug passes
  total, still only the two v104 defects ever found.
- **v119** (2026-07-07): CLUTCH TIME + BULLET WHIZ (core-feel #25, WaterHero tension juice).
  Last 30s of a close solo match (score gap ≤3 vs best bot) triggers "⚡ CLUTCH TIME" — the
  timer pulses red and a low 110Hz tension drone hums until the match ends (cleaned up on
  restart/menu). Bot shots that narrowly miss you (<45u, 55%) now SNAP past your ear
  (2600Hz crack + 880Hz tail, volume by proximity) — danger you can hear. Verified: clutch
  callout + timer class at setMatchT(28) 0-0; 7 whiz snaps through a forced miss volley.
  Full suite green. SW → v119.
- **v118** (2026-07-07): CAREER STATS JUICE (polish) + BUG PASS #8. Opening career stats now
  counts up XP/kills/KD/accuracy/matches/wins/assists with staggered ease-out ticks (reuses
  v108 countUp; K/D 2-decimal, accuracy %-suffixed). BUG PASS #8 (2-browser MP soak, one
  client walking a square while the other measures): remote interp SMOOTH — 1120 frames,
  max frame-to-frame delta 1.14u, ZERO spikes >5u, killfeed bounded, clean disconnect, no
  errors. (Harness note: same-browser background pages freeze rAF — multi-client sims need
  one browser process per client.) Full suite green. SW → v118.
- **v117** (2026-07-07): GRENADE FEEL (core-feel #24). Pulling the pin (G-down) clicks;
  the throw gets a whoosh + low huff on top of the swap sound; and any armed grenade within
  9u (true 3D distance to your chest) blinks a red ⚠ GRENADE warning under the crosshair
  with urgent 1350Hz beeps every 0.55s — covers your own cooked bounces (self-damage is
  real) and MP enemy nades. Verified: pin click, whoosh, warning + 3 beeps through a lofted
  self-throw's danger window. Full suite green. SW → v117.
- **v116** (2026-07-07): KILLFEED GLYPHS (polish) + BUG PASS #7. Killfeed icons now read
  per weapon class: 💥 shotgun, ⌖ sniper/scout, 🔥 LMG, 🧨 grenade, 🎯 headshot (always
  wins), 🔫 everything else — applied to your kills, bot-vs-bot lines, deaths, and all MP
  lines (killGlyph helper). BUG PASS #7: service worker installs + activates, OFFLINE
  reload boots to menu from cache with the server dead (PWA verified end-to-end headless),
  second-tab double-launch clean. Verified shotgun kill renders "💥 M870". Full suite
  green. SW → v116.
- **v115** (2026-07-07): BOT RADIO BARKS (core-feel #23). Bots now chatter over radio —
  squelch click + 2-3 warbled sawtooth "words" + click (~0.5s), distance-attenuated from
  the barking bot: 30% when a bot scores a kill, 20% when one first locks onto you (paired
  with the aim-telegraph glint — an audio tell), 40% panic bark when your streak hits 5+.
  Global 4s cooldown keeps it sparse. Verified: barks fired through a 45s hard-bot brawl,
  correctly rate-limited, zero errors. Full suite green. SW → v115.
- **v114** (2026-07-07): MENU SOLDIER IDLE LIFE (polish) + BUG PASS #6 complete. The menu
  preview soldier no longer spins robotically — he breathes (subtle bob), shifts his weight,
  and his gaze wanders while the camera orbits; arms sway faintly with the breath. BUG PASS
  #6 remainder: mid-match resize 800x600↔1920x1080 updates camera aspect + canvas cleanly;
  10 rapid menu↔play cycles leak ZERO preview soldiers, zero errors. Six bug passes done.
  Full suite green. SW → v114.
- **v113** (2026-07-07): HOLD-BREATH AUDIO (core-feel #22) + resilience audit. Steadying
  your scope (SHIFT while ADS on sniper/scout) now plays a slow 56/48Hz lub-dub heartbeat
  (~0.85s cycle), and releasing exhales a soft breath — completes the v112 scope-sway loop.
  Verified: 3 lub-dubs per 2s steadied + exhale on release. BUG PASS #6 (partial): poisoned
  ALL kh_ localStorage keys with garbage — boots clean to menu and plays with zero errors
  (every parse guarded). Full suite green. SW → v113.
- **v112** (2026-07-07): SCOPE SWAY + KILL-POP + SOAK AUDIT. Snipers/scouts now have a slow
  figure-8 scope wander when ADS (0.0013 rad) — hold SHIFT to steady your breath (6× calmer,
  verified 0.0026→0.00043 rad range); crosshair pops (1→1.55→1 scale, 220ms) on every kill,
  stacking with the impact frame. BUG PASS #5 (3-min soak, 7 hard bots + 5 respawn cycles):
  NO leaks — meshes 549→512 (pools recycle), killfeed DOM bounded, heap 20→45→20MB healthy
  GC sawtooth, zero errors. Five bug passes total: still only the 2 v104 defects ever found.
  Full suite green. SW → v112.
- **v111** (2026-07-07): AUDIO COHESION (core-feel #20). Bunker gets its own ambient bed —
  tight 90Hz room tone + 50Hz electrical hum with occasional fluorescent buzz-and-zap
  (matches the v110 ceiling lights); Compound gets an outdoor bed with low wind gusts
  (both previously fell through to the generic bed). Killhouse final 10 seconds now
  tick-tocks (alternating 1050/880Hz per second) for urgency. Footstep cadence audited:
  already speed-scaled correctly, untouched. Also: __dbg.setMatchT test hook. Verified:
  bunker bed builds, 4 ticks logged in final-10s window. Full suite green. SW → v111.
- **audit** (2026-07-07): BUG TEST PASS #4 — no defects. Weather × quality matrix (forced
  rain on sealed Bunker = 0 particles ✓ indoor handling correct; meadow snow renders 280;
  low tier clean); camo applies to ALL cm_-prefixed GLB viewmodel furniture at the earned
  kill threshold (3/3 meshes textured); daily challenge progress persists mid-match across
  reload. Zero page errors across every boot. Four bug passes total: 2 real defects found
  and fixed (both v104), everything since clean.
- **v110** (2026-07-07): BUNKER ATMOSPHERE (polish). New Blender prop_ceillight (steel
  housing, cooling fins, glowing tube, mount stem) hung in every one of Bunker's 9 rooms
  (y4.45 under the ceiling slab; primitive emissive fallback until the GLB loads); one
  fixture FLICKERS (sine shimmer + rare dropouts); two warm PointLights add local glow on
  med+ quality (skipped on low). Fixtures live in worldGroup so map swaps clean them.
  Screenshot-verified glowing fixture overhead. Full suite green. SW → v110.
- **v109** (2026-07-07): MOVEMENT MICRO-FEEL (core-feel #19). Starts from standstill now
  ease in over ~60ms (ground accel ramps 35%→100%; top speed, strafe, and air control
  untouched — competitive responsiveness preserved); stopping from a sprint (>5 u/s) scuffs
  with a surface-pitched skid sound + dust puffs at the feet. Verified: skid fired on
  release from 10.4 u/s, ramp active with top speed intact, mptest walk assertions green.
  Full suite green. SW → v109.
- **audit** (2026-07-07): BUG TEST PASS #3 (MP, live server + 2 clients) — no defects.
  Verified: client disconnect mid-match removes the remote cleanly (0 remotes, 0 stray
  meshes on the survivor); scoreboard open during another player's death — no errors;
  respawn cycle clean; zero page errors on both clients through join/play/leave. Kill-flow
  reprobe was inconclusive due to a harness limit (client-side teleports don't stick under
  server-authoritative movement) but that path runs green in every mptest duel. Suite green.
- **v108** (2026-07-07): MATCH-END RESULTS JUICE (polish, WaterHero-style). Gameover stats
  (kills, deaths, +XP) and Killhouse results (targets, accuracy, avg TTK) now COUNT UP from
  zero with ease-out curves, staggered starts, and rising tick sounds; the Killhouse GRADE
  pops in last with a scale-down reveal + stinger. Shared countUp(el, target, {dur, decimals,
  suffix}) helper. Verified live on the Killhouse results screen (values settle, grade
  reveal). Full suite green. SW → v108.
- **v107** (2026-07-07): IDLE BREATHE + KILL IMPACT FRAME (core-feel #18). Standing still
  ≥1.5s eases the viewmodel into a subtle 0.25Hz breathing sway (position + roll, gone the
  moment you move/fire/ADS). Every kill now lands a 70ms impact frame: canvas saturation/
  brightness blink + 1.5° FOV pinch that snaps back — stacks with the chain gold pulse for
  escalating hits. Verified via rAF: breathe oscillation at idleT 5.8s, filter blink + fov
  75→73.5→75 on kill. Full suite green. SW → v107.
- **audit** (2026-07-07): BUG TEST PASS #2 — no defects. Probed: crate flow (spend
  decrements 2→1, prize persists; the earlier "no decrement" reading was the +750 XP prize
  triggering a level-up that awards a crate back — designed economy); settings persistence
  across reload (map/diff/crosshair + active button states + world rebuilt to saved map);
  all 10 weapons hot-swapped → GLB viewmodels present, no stale meshes; Esc-during-countdown
  (headless artifact: synthetic Escape can't trigger native pointer-lock exit — real browsers
  route through the pointerlockchange→openPause handler, verified present). Suite green.
- **v106** (2026-07-07): KILL-CHAIN JUICE (polish, WaterHero combo-style). Multikill callouts
  are now TIME-CHAINED — rapid kills within a 4s window escalate DOUBLE→TRIPLE→QUAD→RAMPAGE→
  UNSTOPPABLE with growing callout size (38→66px), rising two-tone pitch per tier, and a gold
  screen pulse that intensifies with the chain. Chain resets after 4s or on death (solo+MP);
  previously "DOUBLE KILL" fired off the life streak even for kills minutes apart. Killstreak
  REWARDS (UAV/shield/airstrike) stay life-based, unchanged. Verified: rapid triple →
  DOUBLE, TRIPLE callouts + UAV at streak 3. Full suite green. SW → v106.
- **v105** (2026-07-07): DIRECTIONAL DEATH FALLS (core-feel #17). Kills now read physically:
  the victim snaps to face its killer and tips over BACKWARD away from the shot (with a
  slight side wobble), and heavy killing blows (>60 dmg) shove the body backward as it falls
  (2.4 u/s stagger vs 0.7 standard). Solo bots use the attacker position (player when null);
  MP victims fall away from you when you get the kill (deathYaw from the kill msg), random
  side otherwise; remote deathYaw cleared on respawn. Verified: bot due +x fell with yaw
  snapped to -π/2 (facing shooter) and rotation.x -0.94 backward tip + 0.7 push. Full suite
  green. SW → v105.
- **v104** (2026-07-07): BUG TEST PASS #1 (user directive: "do bug test passes"). Probed 6
  edge-case flows headlessly: skin swap → preview retints ✓; play→Esc→menu → preview returns,
  vm hidden ✓; Killhouse enter/exit cycle ✓; death/respawn recoil state decays clean ✓;
  FOUND+FIXED: (1) picking a map in the menu didn't rebuild the world — the character preview
  kept showing the old map (now buildWorld runs live on map click in MENU, solo only);
  (2) mobile/small-screen menu opened with PLAY pushed 137px above the viewport — small-
  screen layout now scrolls the whole shell with PLAY first and compact paddings (verified
  844x390: PLAY at y67, visible). Full suite green. SW → v104.
- **v103** (2026-07-07): AAA MAIN MENU (user: "make the main menu AAA... look at KOUR for
  inspiration"). Full Kour-style shell: transparent overlay revealing the live 3D map with a
  slow orbit camera around YOUR SKINNED SOLDIER (GLB clone at 60% toward center from spawn 0,
  rotates, holds its gun; viewmodel hidden in menu, restored in play; rebuilt on skin change).
  Top bar: animated gradient brand + level chip + crates/career/settings buttons. Left card:
  LOCKER (name, skins, kill fx, reticle). Center: hero PLAY (glow pulse) + ONLINE/KILLHOUSE +
  map/difficulty quickbar. Right card: TODAY'S CHALLENGES + MATCH settings. Responsive
  single-column under 1020px. Fixed en route: SPAWNS are Vector3s (isVector3 crash), opaque
  overlay hid the scene, vm bleed. Full suite green. SW → v103.
- **v102** (2026-07-07): GUNPLAY FEEL PASS (core-feel #16 — user: "focus on improving the
  core gameplay feel"). Recoil is now three-axis: vertical kick + per-shot horizontal drift
  (±0.4×kick) + camera roll shake (±0.55×kick), each with its own recovery rate — sustained
  fire wanders and shakes like a real gun. AIM PUNCH: taking >20 dmg flicks your aim up
  (scales with damage, solo + MP). Per-weapon ADS speed: snipers/LMG raise sights slow (4.5),
  pistols/SMGs snap fast (10), rifles 7.5; lowering is always fast (9). SPRINT CARRY: the gun
  drops and tilts while sprinting, snapping back instantly when you fire/ADS/stop. Verified
  live: recoil jitter + decay, sprint pose cycle. Full suite green. SW → v102.
- **v101** (2026-07-05): VIEWMODEL LOOK-SWAY (core-feel #15). The gun now lags behind camera
  turns (yaw/pitch deltas → clamped, smoothed offsets applied to viewmodel rotation +
  position, damped 70% in ADS, eases back at 9/s). Verified: swayX 0→0.044 during a fast
  spin, decays to ~0 at rest. Headless note: capture viewmodel node references fresh —
  the async GLB-arrival rebuild orphans old references. Full suite green. SW → v101.
- **v100** (2026-07-05): MILESTONE — BOT AIM TELEGRAPHING + arc wrap. While a bot has you in
  its sights during its pre-fire reaction window, a red muzzle glint flashes on its gun
  (visible from ~35% of the reaction time until the first shot) — deaths from ambush now
  telegraph fairly. Verified: glint on at seeT 0.2, off at fire. SESSION_NOTES.md fully
  rewritten around the core-feel arc (v082-v100: UX feedback, animation, layered audio,
  Blender models across characters/arsenal/props, movement feel, surface audio). 66 releases
  this session. Full suite green. SW → v100.
- **v099** (2026-07-05): SURFACE AUDIO (core-feel #13). Landing thuds now read the ground:
  soft 300Hz on grass maps, 520Hz + a 1600Hz click on asphalt/concrete (Depot/Bunker/
  Skyline). Sliding plays a 0.4s friction scrape pitched by surface (900Hz hard / 550Hz
  grass). Jump pads already had their boing. Verified via __sfxLog: Depot landing = 520+1600,
  slide = 900. Full suite green. SW → v099.
- **v098** (2026-07-05): WORLD PROP MODELS (core-feel #12). tools/make_props.py →
  models/props.glb: medkit (rounded white case, glowing red cross both faces, steel latch/
  hinge/handle) and ammo crate (olive box, dark stencil bands, 4 brass shells w/ steel tips,
  side handles) replace the primitive pickups. Emissive carried through the Lambert
  conversion (capped 0.8); spin/bob/ring/collection unchanged; primitives remain the offline
  fallback and an in-place upgrade swaps visuals when the GLB arrives after world build.
  Screenshot-verified on Depot. Full suite green. SW → v098 + props.glb precached.
- **v097** (2026-07-05): ALL 10 WEAPONS BLENDER-MODELED (core-feel #11). Added the remaining
  seven viewmodels to models/weapons.glb (554KB total): MP5 (suppressor tip + folding stock
  bar), AWP (fluted barrel, big scope w/ lens rings, side bolt, green chassis), M249 (bipod
  legs, olive box mag, carry handle), M14 (full-length wood stock + top metal), .44 Magnum
  (silver vent-rib + fluted cylinder), SSG 08 (tan scout chassis + compact scope), FAMAS
  (bullpup wedge + carry handle on legs). GLB_VM covers every weapon name; procedural boxes
  remain solely as the offline fallback. Screenshot-verified magnum/awp/mp5/m249/famas in
  hand. Full suite green. SW → v097.
- **v096** (2026-07-05): BLENDER WEAPON VIEWMODELS (core-feel #10). First three hero guns
  modeled in Blender (tools/make_weapons.py → models/weapons.glb, 180KB): AK-47 (cylinder
  barrel + gas tube, front sight, muzzle brake, wood handguard/stock w/ rear taper, 3-segment
  curved mag, angled grip), M1911 (beveled slide, hammer, sights, angled grip, trigger
  guard), M870 (barrel + mag tube, silver bead, 3-ring pump, tapered stock). Client uses the
  GLB when the weapon has one (AK-47/M1911/M870), procedural boxes remain for the rest +
  offline fallback; camo skins now also match GLB furniture via the cm_ name prefix
  (color-hex matching breaks under glTF color management). Screenshot-verified both in hand.
  Full suite green. SW → v096 + weapons.glb precached.
- **v095** (2026-07-05): BLENDER CHARACTER MODELS (core-feel #9 — user installed Blender and
  asked for it to be used for modeling). New asset pipeline: tools/make_soldier.py runs
  Blender 5.1 headless → models/soldier.glb (170KB) loaded via vendored GLTFLoader +
  BufferGeometryUtils (r160, importmap-relative). The soldier: beveled low-poly rig with
  tapered torso, vest plate + pouch, shoulder pads, helmet w/ brim, metallic cyan visor,
  articulated legs (hip-pivot empties) + forward-posed arms (shoulder pivots) — same
  animation contract as the box rig (userData.legs/arms/gun + armBase 0 vs -1.0), so walk
  swing, flinch, death falls, crouch squash and per-class held guns all work unchanged.
  Materials Lambert-converted at load for the game's flat-lit look; body/dark tinted per
  bot color/skin. Box rig remains as offline fallback until the GLB loads; GLB + loaders
  added to SW precache. Blender pipeline gotchas learned: matrix_parent_inverse does NOT
  survive glTF export (use explicit local TRS), matrix_world is stale mid-build, and
  primitive size=1 cubes mean scale values are half-extents. Full suite green. SW → v095.
- **v094** (2026-07-05): ADS + HANDLING SMOOTHING (core-feel #8). Aiming down sights is now
  an animated glide (adsT 0→1 lerp at 7/s): the viewmodel slides from hip (x .26) to screen
  center (x .06), rises slightly, and its bob/sway fades 85% while aimed; recoil kick on the
  viewmodel is damped 45% in ADS. Muzzle flash light now scales by class (heavies 4.5,
  smg/pistol 2.2, rifles 3.2). Verified via rAF capture: full slide in/out cycle. Full suite
  green. SW → v094.
- **v093** (2026-07-05): PICKUP FEEDBACK (core-feel #7). Health pickups now flash a green
  edge vignette + float a rising "+40 HP" beside the crosshair; ammo pickups float
  "+ AMMO · NADE" in gold. Exact healed amount shown (clamped at max hp). Verified live:
  hp 30→70 with float + vignette cycle on Meadow's west pickup. Full suite green. SW → v093.
- **v092** (2026-07-05): MOVEMENT FEEL (core-feel #6). Landing from a fall dips the camera
  (amplitude + duration scale with impact speed, capped 0.22u/0.3s) with a landing thud
  scaled likewise; sprinting widens FOV by +3 (folded into the single ADS fov-lerp target so
  nothing fights) plus a subtle 9Hz camera roll oscillation while grounded. Verified in-page:
  14u drop → full 0.22 dip curve; sprint fov 75→78.8 and back. Full suite green. SW → v092.
- **v091** (2026-07-05): SHELLS + IMPACT DEBRIS (core-feel #5). Every trigger pull ejects a
  spinning brass casing right+up from the breech (camera-relative) with gravity and a
  dampened floor bounce; bullet wall-impacts kick out 2 gray chips along the surface normal.
  Shared debris pool (cap 30, shared geometry + per-color material cache, skipped entirely on
  the low quality tier). Verified in-page: 15 simultaneous pieces during autofire, arcs to
  y0.95, floor bounce at 0.04, full decay after fire stops. Full suite green. SW → v091.
- **v090** (2026-07-05): CHARACTER MODELS (core-feel #4). Held weapons now MATCH the
  carrier's loadout — six silhouettes (long scoped sniper/dmr, stubby wood shotgun, short
  long-mag SMG, one-handed pistol/revolver, box-mag LMG, rifle default) rebuilt live via
  buildHeldGun when a bot swaps (gungame!) or a remote's shoot msg reveals a new weapon.
  Arms now counter-swing with the leg walk cycle (bots + remotes). Added shoulder pads,
  narrowed the head. Verified: 3-bot lineup screenshot + per-type gun group check
  (sniper/shotgun/lmg). Full suite green. SW → v090.
- **v089** (2026-07-05): WEAPON AUDIO LAYERING (core-feel #3). Every close shot now stacks
  three layers: a sub-bass body thump (52Hz heavies / 64Hz lights, heavier class = deeper +
  longer), a 12ms high-pass crack transient for snap, then the per-class timbre recipe.
  DISTANT gunfire (bots/remotes past ~35u) collapses to a muffled low boom instead of a
  quieter copy of the near sound — reads as battlefield ambience. Bunker adds a 72ms indoor
  slapback echo to every shot. noiseBurst/tone gained a window.__sfxLog test hook; verified
  the full layer stack + distant muffle + slapback in the log on Bunker. Full suite green.
  SW → v089.
- **v088** (2026-07-05): RELOAD ANIMATION (core-feel #2). The viewmodel now performs a real
  reload: drops 0.15u + tilts 0.42rad over the first 30% (mag out), holds a low fiddle pose
  with subtle wiggle, snaps back up with overshoot in the last 32%. Staged audio replaces the
  flat two-tone: mag-out thunk at 0%, mag-in at 50%, double-click rack at 82% (scaled to each
  weapon's reload time). Reload pose owns the viewmodel over the inspect flourish. Verified
  via in-page rAF capture (61 samples, rz peak 0.42, y dip to -0.385); headless probing note:
  use anti-throttle flags + in-page rAF sampling, external polls can hit stalled frames.
  Full suite green. SW → v088.
- **v087** (2026-07-05): COMBAT READABILITY — first iteration of the user's new CORE-FEEL
  directive ("refine feel/UX/sounds/animation/models, no new modes"). Characters no longer
  vanish on death: they TIP OVER sideways (0.36s fall with forward lean), lie for a beat,
  sink into the ground and only then hide — solo bots AND MP remotes (client-side, keyed off
  the snap alive-flag transition). Non-fatal hits now FLINCH the target (0.16s back-jerk).
  Bots emit a muzzle spark when firing (matching their tracers). Verified: fall to -1.45rad
  then cleanup, flinch peak 0.082rad. Full suite green. SW → v087.
- **v086** (2026-07-05): FIRST BLOOD + REVENGE. 🩸 FIRST BLOOD (+50 XP, UAV stinger) for the
  match's literal first kill — consumed by ANY kill including bot-vs-bot (solo damageBot +
  all MP killfeed branches); ⚔ REVENGE (+75 XP) for killing whoever last killed you (solo +
  MP tracking, cleared on payback). Round resets re-arm first blood in MP. showCallout gained
  a window.__calloutLog test hook. Verified: full revenge cycle in the log; first-blood
  consumption confirmed by bots winning the race. Full suite green. SW → v086.
- **v085** (2026-07-04): DEATH RECAP + SWITCH ANIMATION. The killcam label now shows who else
  hurt you this life ("also hurt by Vex 62") — client-side damage-source ledger (solo
  damagePlayer + MP dmg handler), killer excluded, top 2 by damage, reset per life. Weapon
  switching dips the viewmodel down-and-up over 0.24s. Verified live: chip-then-finish
  scenario produced "KILLED BY Piko · M249 · 110 HP / also hurt by Vex 62". Full suite
  green. SW → v085.
- **v084** (2026-07-04): BIG-HIT FEEDBACK + MVP HIGHLIGHT. Taking >35 damage in a single hit
  punches the FOV +5 (recovers via the frame lerp), flashes a deeper 170px red vignette, and
  nudges camera shake — wired in both the solo damage path and the MP dmg handler (delta
  computed before hp reassignment). Scoreboard leader row now carries a gold left edge +
  faint gold wash beside the crown. Verified: AWP bot hit (115 dmg) punched fov 75→80;
  MVP class renders. Full suite green. SW → v084.
- **v083** (2026-07-04): DEPLOY COUNTDOWN + LOW-AMMO WARNING. 3-2-1-GO overlay pops on every
  deploy (cyan digits, gold GO, scale-pop animation + tick sounds — visual only, no fire
  block so tests/duels unaffected); ammo numeral turns amber with a glow pulse at ≤25% mag.
  Verified: full countdown sequence observed, low class engages at 2 rounds. Full suite
  green. SW → v083.
- **v082** (2026-07-04): COMBAT FEEDBACK + MENU MOTION. Crosshair customization in settings:
  style (Cross/Dot/Circle) + reticle color (White/Cyan/Green/Gold) via CSS classes + --xh
  var, applied at boot and on click. KILL-CONFIRM hitmarker: gold, 1.7x scale pop with eased
  settle (solo + MP kill paths; plain hit markers can't stomp a fresh kill marker for 280ms).
  Menu background now has a slow orbital camera parallax over the 3D world. Fixed: patch had
  landed applyCrosshair inside the quality-button branch (anchor collision — first-occurrence
  hazard when a call site exists in two places). Verified: st-circle+green at boot, gold
  marker on kill, camera drift. Full suite green. SW → v082.
- **v081** (2026-07-03): UI AUDIT PASS 2 — screenshot-verified the remaining screens under
  the v080 design system: settings (cyan sliders, glass card, angled buttons), in-game
  scoreboard (glass, gold header, level chips, crown, cyan self-row), pause menu; killhouse
  results / round-over / crates inherit the shared .pausecard/.statcell/.overlay tokens.
  No stragglers found beyond v080's fixes. Full suite green. SW → v081.
- **v080** (2026-07-03 ~mid-morning): COMPLETE UI SYSTEM REWORK (user: "full complete UI
  style rework, more flash, modern standards"). New token-based design system replacing the
  entire 222-line stylesheet: CSS custom properties (color/radius/shadow/clip tokens),
  glassmorphism panels (blur + translucent + gradient top-line accent), esports angled
  clip-path buttons/chips/pills with hover shine-sweep + lift, animated gradient FRAGBOX logo
  (7s hue drift + glow), scanline texture on menu overlays, card entrance animations, tabular
  numerals everywhere. HUD: glass health panel (green edge) + glass ammo panel (cyan edge,
  36px numerals), angled score pill, glowing minimap frame, glass killfeed chips, restyled
  streak/ability/rank chips. Menu REORGANIZED hero-first: PLAY/ONLINE/KILLHOUSE CTAs directly
  under the logo (were below the fold at 720p!). Class cards: hover lift, gold glow active,
  diagonal-stripe locked. Fixed: crate-only skins showed "undefined" on locked swatches (now
  📦 + tooltip). All JS display/state semantics preserved (verified across menu/deploy/HUD/
  career/crates screenshots + full suite, mptest rerun after one flake). SW → v080.
- **v079** (2026-07-03 ~11:45): Minimap background now tints toward each map's fog theme
  (dusk-blue on Skyline, industrial gray on Depot, etc.); SESSION_NOTES.md brought current
  through v078 with the session stats line (45 releases / 55+ commits). Full suite green.
  SW → v079.
- **v078** (2026-07-03 ~11:15): WATCHTOWER PREFAB + JACKPOT FLASH. New P.watchtower(h):
  4-leg raised cabin with flush stair run, waist-high sills on all sides (protected firing
  slit), post-mounted roof — two placed on Compound's open diagonals (first placement sat
  inside a corner-room footprint and blocked the stairs; relocated — kit lesson: check prefab
  footprint overlap). Climb-verified 0.9→3.3 into the cabin, sills hold. Crate screen:
  gold radial flash + capture stinger on JACKPOT and new-skin pulls (verified via RNG stub).
  Full suite green. SW → v078.
- **v077** (2026-07-03 ~10:45): KILLHOUSE MOVING TARGETS. Results screen gains a MOVING
  TARGETS button (toggles per retry): dummies strafe sinusoidally ±2.6u perpendicular to
  your approach (arena-clamped); separate best scores and replay ghosts per mode (kh_trainM /
  kh_trainghostM), results labeled STATIC/MOVING. Verified: static drift 0, moving path 8.2u
  sinusoid sampled. Full suite green. SW → v077.
- **v076** (2026-07-03 ~10:10): LIVE PING. Client pings every 2s ({t:'ping',ts} → server pong
  echo), RTT shown in the score pill color-coded (green <60ms / yellow <120 / red), cleaned
  up on disconnect. Verified live: 36ms chip. SESSION_NOTES.md refreshed with v072-v076.
  Full suite green ×2. SW → v076.
- **v075** (2026-07-03 ~09:40): GRENADE ARC PREVIEW. Hold G (or the 🧨 touch button) to aim:
  a gold trajectory line simulates the real bounce physics (same nadeStep the grenade uses —
  wall bounces and rolls included) with a landing ring; release to throw. Cancels cleanly on
  death/pause. Verified: line visible while held, throw fires on release (2→1 nades), line
  hidden after. Full suite green. SW → v075.
- **v074** (2026-07-03 ~09:10): "Double-join ghost" SOLVED — it never existed. myName()
  prefers the #namefield input (populated at page boot), so same-profile test tabs inherited
  tab 1's name and clobbered localStorage; server always had two distinct clients joining
  once each. mptest now sets the field alongside storage (logs: "Alice joined / Bob joined").
  Feature: killfeed lines show the kill weapon (solo curW/grenade context; MP kwn field) as a
  dim label. Full suite green ×2. SW → v074.
- **v073** (2026-07-03 ~08:40): MP DEATH SPECTATE. Click while dead cycles a chase-cam through
  living players (behind-shoulder at +2.6y, SPECTATING label, auto-falls back to killcam if
  the target dies/leaves, cleared on respawn/round spawn). Live-verified via forced duel.
  Backlog note: tests show clients double-joining the ws server (ghost remote of self) —
  investigate the join handshake someday. Full suite green. SW → v073.
- **v072** (2026-07-03 ~08:10): Daily challenge pool 12→20 entries: DMR/revolver/scout/burst/
  LMG type kills (new weapons now surface in dailies automatically), kill-while-SLIDING,
  use-8-abilities (hooked useAbility), Killhouse grade B+ (hooked endTrain). Fixture-verified
  ability tick 0→1 on Q. Full suite green. SW → v072.
- **v071** (2026-07-03 ~07:45): POLISH BUNDLE. Per-map tactical tips on the deploy screen
  (3 per map, randomized — "Skyline: buildings B1/B3 are enterable"); warm interior lighting
  + emissive ceiling panels in the enterable Skyline buildings; announcer stingers — distinct
  two/three-tone signatures for UAV, Overshield, Airstrike warning, flag captures, and point
  captures (replacing the generic streak chime). Full suite green. SW → v071.
- **v070** (2026-07-03 ~07:20): SKYLINE INTERIORS — level rework arc COMPLETE. Two of the four
  corner buildings are now enterable: hollow ground floors (walls to y4 w/ two street-facing
  doors), WINDOW SLITS at eye height (sill 0-1.2 / gap 1.2-1.9 / lintel 1.9-4 — shoot out,
  can't crawl through, grenades fit), solid caps up to the original roof height so rooftops
  remain playable pad-landing surfaces (flight-verified apex 7.1 over roof 6), interior cover
  crate + hp prize inside B1. hollowBuilding() composes from P.room + fills. Verified: walked
  through the door to the interior center, slit geometry exact, pad landings intact, double
  mptest green. LEVEL REWORK TOTALS: 10-prefab kit, Compound built new, Meadow 2.0 (elevated
  spine), Depot 2.0 (crane walkway), Skyline interiors, Bunker grid — six maps, each with a
  vertical/spatial identity, all composable in minutes. SW → v070.
- **v069** (2026-07-03 ~06:50): DEPOT 2.0 — industrial rebuild with the kit. Central loading
  dock (platform + stair runs BOTH ends), signature CRANE WALKWAY: two 2-floor stair towers
  east/west linked by a railed catwalk at deck ~6.1 spanning the whole yard (verified walking
  x -27→+3 at height; jump pads v17.5 at each tower arc to 6.1 for quick access — flight-
  sampled), ammo prize on the crane, 8 container placements incl. stacked crane-height cover,
  tunnel underpass on the south lane (walked through), L-corners + 4 seeded cover clusters,
  refreshed spawns (validated clear of solids). 108 boxes from kit composition. Both mptest
  runs green + playtest. SW → v069.
- **v068** (2026-07-03 ~06:15): MEADOW 2.0 — the original map fully rebuilt with the prefab
  kit (level-design rework continues per user directive). New layout: central 2-story tower
  fort, four walled corner yards (11x11, inward doors) with seeded cover, north/south sniper
  platforms feeding an ELEVATED SPINE — catwalks running platform→tower→platform (verified by
  walking the entire route in one take: stairs 1.2 → platform 2.7 → catwalk 2.95 → tower 3.2
  → catwalk → far platform → down), east/west TUNNEL flank routes (walkable roofs), L-corners
  + cover clusters on diagonals. TWO NEW PREFABS: P.catwalk(len,y) — railed walkway on
  pillars; P.tunnel(len,w,h) — enclosed corridor with walkable roof. KIT FIXES from real
  playtesting: platform stair runs now END flush at the slab edge (computed from step count —
  was 1.65u short, players fell through), catwalk deck top math corrected (y+0.3). mptest
  duel lane moved to the clear west edge (old spot now blocked by design — proof the cover
  works). 114 boxes from ~25 lines. Full suite green. SW → v068.
- **v067** (2026-07-03 ~05:40): MODULAR LEVEL KIT + FIFTH MAP (user: "rework level creation —
  modular pieces to build levels smartly"). shared/map.mjs now exports place(pieces,x,z,rot)
  (quarter-turn rotation with sx/sz swap) and a prefab library P: room(w,d,h,doors,roof) —
  4 walls w/ door gaps per side + optional roof; tower(floors,size) — stacked walkable slabs,
  corner pillars, AUTO-GENERATED stair run + parapet; bridge(len,y) — elevated walkway on
  pillars; platform(w,h,d) — sniper perch w/ stairs; cover(seed) — deterministic crate
  clusters; container(color,axis,stacked); corner(len,h) L-walls; building(w,h,d). New map
  COMPOUND (ARENA 44) composed 100% from prefabs: central 2-story tower (power position,
  hp on top), 4 roofed corner rooms w/ inward doors, 2 bridged sniper platforms, container
  yard, L-corner lanes, seeded cover — 107 boxes from ~20 lines of composition. Verified:
  tower stairs walkable (height samples 0.9→1.8→3.0→3.2 across the floor), rooms clear of
  spawns, MP-ready (auto in vote pool + --map=compound). Future maps now take minutes.
  Full suite green. SW → v067.
- **v066** (2026-07-03 ~05:10): POLISH SWEEP. Ghost pace HUD moved below the score pill
  (no dom-chip overlap possible); panel-stacking torture passed (modals correctly block
  background buttons); 45s random-input monkey test: ZERO console errors; Bunker verified in
  MP Domination (bots captured indoor points); README fully refreshed (all 4 maps, 5 modes +
  Killhouse, grenade/ability/inspect/crouch controls table, progression overview, updated
  server flags). Full suite green. SW → v066.
- **v065** (2026-07-03 ~04:50): KILLHOUSE REPLAY GHOST. Best run's per-target split times
  persist (kh_trainghost {targets, splits}); later runs race it live: 👻 chip under the timer
  shows the ghost's target count ticking up in real time as its splits pass, plus a ±N.Ns
  split delta at your current target count — green when ahead, red when behind; GHOST BEATEN
  callout + new ghost saved when you out-score it. Fixture-verified ghost ticking + behind-
  pace coloring. Full suite green. SW → v065.
- **v064** (2026-07-03 ~04:30): CRATE MONETIZATION WIRING. Crate panel: FREE DAILY CRATE
  (rewarded-ad sim → +1 crate, date-gated kh_freecrate, reward-exactly-once audit, button
  flips to ✓ CLAIMED TODAY) + 5 CRATES $1.99 buy stub (COMING SOON via Monetize.buyPremium).
  MONETIZATION.md gains placements 3 & 4 with go-live notes (daily-crate = highest-frequency
  ad slot; bundle anchors crate economy pricing). Verified: ad overlay ran, crate granted
  once, same-day repeat refused, stub callout. Full suite green. SW → v064.
- **v063** (2026-07-03 ~04:10): FOURTH MAP "BUNKER" — indoor CQC built for the fast TTK.
  ARENA 30, full ceiling slab (grenades bounce back down, no sky, black overhead), 3x3 room
  grid via wallRun() generator (two horizontal + two vertical runs with 4.4u door gaps at
  ±12/0), crate + barrel furniture per room, hp/ammo spread across rooms, DOM A/B/C down the
  center corridor, 12 room/corridor spawns, NO jump pads. Dark fog + flat bright hemi (0.7
  sun / 1.5 hemi) for even indoor light; deco:'none' branch added. Auto-joins the map-vote
  pool and server --map=bunker. Verified: bots roam between rooms, corridor sightlines
  screenshot (auto-tuner + rank chip visible working too). Full suite green. SW → v063.
- **v062** (2026-07-03 ~03:45): KILLHOUSE AIM TRAINER (wave 8). 🎯 menu button starts a 60s
  practice run: gray static dummies pop one at a time (8-30u, biased ahead of your view,
  arena-clamped), destroy → next pops instantly with TARGET n banner; scores shots/hits/
  time-to-kill per target; results screen with TARGETS/ACCURACY/AVG-TTK/GRADE (S≥28 A≥22
  B≥16 C), best-run persistence (kh_train), fixed +100 XP (no farming — dummies skip the
  kill/streak/XP pipeline), RETRY/MENU buttons. Deploy screen and flyby skipped for instant
  action. Verified full run: 3 targets, 64% acc, 1.03s avg TTK, grade C, best persisted.
  Full suite green. SW → v062.
- **v061** (2026-07-03 ~03:20): SUPPLY CRATES (wave 8). Earn 1 crate per level-up + 1 per
  completed daily challenge (📦 callouts); menu 📦 button w/ count badge opens the crate
  screen: 2.2s roulette strip (decoy cards, eased cubic-bezier, gold marker line) landing on
  a weighted pull — 60% XP 250-750, 25% crate-exclusive skin you lack (new: Neon/Copper/
  Midnight in cosmetics.mjs, crate:true — only obtainable here, tracked in kh_owned),
  12% kill FX you lack (kh_ownedfx bypasses the level gate), 3% JACKPOT 2000 XP; dupes →
  +300 XP. Locker shows crate skins locked until pulled. Verified: 5-crate session pulled
  XP + Skull + Lightning FX, all persisted. Full suite green. SW → v061.
- **v060** (2026-07-03 ~03:00): RANKED RATING (wave 8). ELO-style profile rating: starts 1000,
  updates on every solo match end (placement-normalized score vs 900/1100/1300 opponent
  strength by effective difficulty) and MP round end (placement in standings vs 1000),
  K-factor 40→32→16 tapering by matches played, floor 400. Rank bands with colored badges:
  BRONZE <900 / SILVER <1100 / GOLD <1300 / PLATINUM <1500 / DIAMOND — menu chip next to the
  XP bar, RATING headline cell in career (band-colored) + last-10 sparkline, RATING ±N
  callout after each match. Fixture-verified exact ELO math (1240 + win → 1250, K32×0.31).
  Also: tonight's seven engineering lessons appended to GAME_DEV_PLAYBOOK.md §9 (stale-SW
  delivery trap, CRLF bats, exact-launch testing, atomic writes, headless traps, balance
  delivery checks, zombie ports). Full suite green. SW → v060.
- **v059** (2026-07-03 ~02:35): MOBILE POLISH + AMBIENT BEDS (wave 8). Touch: bigger fire
  button (104px) with safe-area insets, viewport-fit=cover, joystick deadzone (0.12 rescaled),
  ROTATE YOUR DEVICE overlay in portrait, and AUTO-FIRE assist (settings toggle, default on):
  fires when an enemy sits within a ~4° crosshair cone with LOS, gated during flyby/pause —
  verified live (bot 100→66, one 34-dmg AK round). Ambient sound beds per map through the
  MUSIC bus: Meadow birdsong chirps + soft wind, Depot 55Hz industrial drone + metallic
  clanks, Skyline 42Hz city rumble + distant two-tone sirens. __dbg exposes SET/isTouch/
  flybyT for testing. Full suite green. SW → v059.
- **v058** (2026-07-03 ~02:00): STALE-BUILD FIX + TTK PASS 2 + COVER PASS 2 + ARSENAL
  (user: "still havent reduced TTK / maps too open" — ROOT CAUSE: sw.js served assets
  cache-first, so shared/weapons.mjs + map.mjs stayed STALE across refreshes; users never
  saw v053/v055. SW now network-first for everything with cache as offline fallback.)
  TTK pass 2 on top of v053: AK 34 (3-SHOT body, 0.20s), MP5 22, M870 18/pellet, M1911 45,
  M249 28 (4-shot), M14 52 (2-SHOT), Magnum 80, AWP 115 (1-shot) — Kour-speed lethality.
  Cover pass 2: center-ring walls + N/S pillars on Meadow (44 boxes), platform-flank crates +
  corner walls on Depot (39), six more street pieces on Skyline (51). ARSENAL EXPANSION:
  SSG 08 scout sniper (85 dmg — 2-body/1-head, quick 34° scope, verified 100→12hp hit) and
  FAMAS 3-round burst rifle (30 dmg, 800rpm bursts w/ 0.30s gap); viewmodels for both; new
  classes Scout (lvl 20, SSG+M1911, 1.1x speed) and Commando (lvl 24, FAMAS+Magnum) extend
  the grind; Gun Game ladder now 10 rungs (dynamic HUD); bots use both. Attachments/camos/
  challenges auto-apply by name. Full suite green. SW → v058.
- **v057** (2026-07-03 ~02:30): FLYBY + ASSISTS + AFK KICK (wave 6). Match intro flyby: 3s
  smoothstep camera arc (high orbit easing down toward the deploy view) behind the class-pick
  screen on every match start; click skips. Kill assists (MP): server logs recent damagers
  per victim (4s window, ≥25 dmg, non-killer) → {t:'assist'} to each helper (+50 XP, "ASSIST ·
  name" callout, career ASSISTS stat) and the killfeed shows "Killer + Helper 🔫 Victim".
  AFK kick: humans silent 90s → {t:'kicked'} + close; client returns to menu with a
  DISCONNECTED callout. Verified: flyby cam y32.7 sweep, live 3-client assist (Ann chipped
  Bob to 10hp, Cid finished, Ann got the assist callout). Full suite green. SW → v057.
- **v056** (2026-07-03 ~02:05): ADAPTIVE BOTS + INSPECT + INVITE (wave 5 complete). Adaptive
  difficulty option in settings: effective tier re-resolves each respawn from session K/D
  (<0.8 easy, 0.8-1.6 normal, >1.6 hard — skill/aim-lock/damage/bot-grenades all route
  through effDiff; "BOTS STEPPING UP" callouts on shift). Gun inspect: F key 1.2s flourish
  (Y-spin + tilt + raise on the viewmodel; blocked during ADS/reload, canceled by firing).
  Invite friends: server ships its LAN IPv4s in welcome; MP pause menu shows http://ip:port
  with a COPY INVITE button (clipboard + COPIED! feedback) — anyone on the network joins your
  lobby. All verified live (invite showed http://192.168.0.170:PORT). Full suite green.
  SW → v056.
- **v055** (2026-07-03 ~01:40): MAP COVER DENSITY PASS (user: "maps are too open, more stuff
  blocking sight lines" — extra urgent post-TTK-buff). Meadow +12 pieces (diagonal-mid walls,
  4 standing stones between mid and corners, crate pairs on cardinal lanes; 26→38 boxes).
  Depot +8 (three mid-lane containers incl. crossing orientations, double-stacked pallet
  cluster SW, two concrete walls plugging the wall-hug lanes; 25→33). Skyline +10 street
  clutter (4 more parked cars, 2 planters mid-plaza, 2 kiosks, 2 dumpsters; 35→45). Server
  hitscan/nade/bot AABBs inherit automatically via shared map data. Survey screenshots
  confirm no clean cross-map lanes remain. Full suite green. SW → v055.
- **v054** (2026-07-03 ~01:30): Graphics quality tiers (wave 5 #18): Auto/Low/Med/High in
  settings — pixel ratio 2/1/0.75, shadows 2048/1024/off, particle counts ×1/0.7/0.5 (puffs +
  weather), clouds & skyline silhouettes off on Low; Auto samples 5s of match fps and steps
  down below 40/55 (persisted, "GRAPHICS AUTO-TUNED" callout); live-applies on setting click.
- **v053** (2026-07-03 ~01:15): TTK REDUCTION (user: "reduce time to kill") — ~33% damage
  buff across the arsenal in shared/weapons.mjs (drives solo AND server MP identically):
  AK 22→30 (0.30s / 2-tap headshot), MP5 13→18, M870 12→16/pellet (one-pull up close),
  AWP 90→115 (BODY ONE-SHOT — even 115hp Breachers), M1911 30→40, M249 18→24, M14 34→45
  (3-shot), Magnum 55→72 (2-tap). Bots inherit the same lethality (symmetric). Full suite
  green. SW → v053.
- **v052** (2026-07-03 ~02:50): ROUND-OVER PODIUM (wave 4 complete). Round end now stages a
  ceremony on a floating stage at y60: gold/silver/bronze pedestals, top-3 character rigs in
  their real colors (skin for You, remote/bot rig colors otherwise) with "1. Name K/D" tags,
  winner bounce loop, confetti bursts, slow orbiting camera; viewmodel + crosshair hidden for
  the shot. MP: driven by the over standings during the 7s vote intermission (pairs with the
  NEXT MAP bar), cleared on respawn. Solo: same ceremony behind the results panel. Verified
  live: podium up during intermission (cam y62.6), tags visible, clean teardown. Full suite
  green. SW → v052.
- **v051** (2026-07-03 ~02:25): MAP VOTING + LIVE MAP SWAP (wave 4 #16). Round end now opens
  a 7s intermission: over msg carries vote options (current + 2 shuffled others), clients get
  a NEXT MAP vote bar over the scoreboard, {t:'vote'} tallied server-side (last vote per
  player, ties keep current). Server map state made live-swappable (MAP/ARENA/BOXES/SPAWNS/
  AABBS let-bound + applyMap() rebuilds hitscan AABBs, CTF flag bases, Domination points),
  everyone teleports to fresh spawns on the winning map, {t:'mapchange'} → clients
  buildWorld(id) + clear stray nade visuals + NEW MAP callout. Verified live: two clients
  voted meadow→depot, server logged the switch, client colliders rebuilt (26→25), killfeed
  announced. Full suite green. SW → v051.
- **v050** (2026-07-03 ~02:00): WEAPON CAMOS (wave 4 #15). Per-gun kill tiers past attachments:
  50 = FOREST (blotch canvas texture), 150 = DIGITAL (pixel grid), 400 = GOLD (emissive shine).
  Auto-equips best earned; applied to viewmodel furniture (receiver/wood/body — barrel and mag
  stay black for contrast) via material swap in buildViewmodel; live reskin the moment the
  threshold kill lands; CAMO UNLOCKED callouts; camo tag on deploy cards ([GOLD] colored).
  Verified: gold AK (3 emissive parts) + digital M1911 (textured), screenshots. Full suite
  green. SW → v050.
- **v049** (2026-07-03 ~01:35): DAILY CHALLENGES (wave 4 #14) — the come-back-tomorrow hook.
  3 challenges rolled per calendar day from a 12-entry pool (kills, headshots, grenade kills,
  crouched kills, 5-streak, win, captures, and per-weapon-type: smg/sniper/shotgun/pistol/
  rifle), seeded deterministically via mulberry32(date-hash) so everyone gets the same board;
  250-600 XP each. kh_daily persists progress and resets on date change. Menu panel section
  with progress bars; DAILY COMPLETE callouts in-match. Tracking hooks: both kill paths
  (weapon TYPE via server kwn field in MP — grenade kills attributed via killContext solo /
  kwn='Grenade' MP), crouch state at kill time, streak threshold, solo + gungame wins, CTF/
  Dom capture events. Verified: deterministic roll, UI render, rifle kill → 1/12. Full suite
  green. SW → v049.
- **v048** (2026-07-03 ~01:10): KILL EFFECTS + WEATHER (wave 3 complete). Kill FX locker row
  (kh_killfx): None / Confetti Lv1 (5-color burst) / Skull Lv8 (rising 💀 sprite + smoke) /
  Lightning Lv15 (sky beam + sparks + crack) — plays at victim position on your kills, solo
  and MP (victim remote lookup). Weather setting (Auto/Clear/Rain/Snow): rain = 400 recycled
  line-segment streaks tracking the player + fog ×0.62; snow = 400 drifting sway flakes +
  fog whitened 35%; Auto rolls per match (30% rain on depot/skyline, 30% snow on meadow).
  Verified: locker swatches, rain streaks + darkened fog on Depot screenshot, lightning kill.
  Full suite green. SW → v048.
- **v047** (2026-07-03 ~00:50): CLASS ABILITIES (wave 3 #11) — every class gets a Q-key
  signature, 20s cooldown, HUD chip w/ countdown next to ammo: Assault FRAG RESTOCK (+1 nade;
  MP server-validated via {t:'ability'} handler w/ 18s server cooldown), Gunner DASH (4s
  1.35x — verified 10.2u/s exactly), Breacher FORTIFY (5s half damage, solo), Marksman RECON
  (8s personal UAV), Support RESUPPLY (full reserves), Ranger QUICKDRAW (instant reload +
  bloom reset), Outlaw FAN THE HAMMER (dumps up to 6 rounds rapid-fire; MP-rate-cap aware).
  Ability names on class cards ("Q: DASH"), ABILITY READY callout, resets per life. Dash
  respects the server speed cap so no MP rejection. Full suite green. SW → v047.
- **v046.1** (2026-07-03 ~00:30): PLAY.bat launch chain fully fixed after user report ("play.bat
  isnt working" x2). THREE stacked root causes: (1) zombie server from 14:54 held port 8080 —
  new server died EADDRINUSE while the browser silently loaded the ancient in-memory build
  (v046 added stale-server kill + friendly error); (2) rewritten PLAY.bat had LF-only line
  endings — cmd.exe misparses bare-LF batch files (window flash-closes); now CRLF; (3) server
  parsed --open as the port → NaN crash on listen; PORT now takes the first numeric arg.
  LESSON (playbook-worthy): verify the EXACT launch command users run — every earlier test
  passed ports explicitly and never executed "node server.mjs --open". Verified by running
  PLAY.bat itself: listening + page served + browser opened. Also: sw.js only caches r.ok
  responses; index.html patches now written atomically (tmp+rename) since the user loads live.
- **v045** (2026-07-03 ~03:55): DOMINATION (wave 3 #10) — fifth game mode. --mode=dom on any
  map (DOM point trios added to all three: Meadow lanes, Depot incl. platform top, Skyline
  streets). Server: 4u capture radius, ~2.2s solo capture (stacking teammates up to 3x,
  contested = frozen, abandoned progress decays), owned points pay +1 ticket/sec each, first
  to 200 wins; dm snap payload; bots HOLD points while flipping them (initial bug: constant
  retargeting — now they stand on a point until it turns, then move to the next unowned one).
  Client: beacon pillars + ground rings recolored live (gray/red/blue, capturing team tints
  the ring), A/B/C HUD chips under the score pill, capture progress bar while standing in a
  flipping point, minimap letters, killfeed ◆ events, +150 XP if you're on the point when it
  captures. Live-verified: bot captured B by holding it, tickets ticked RED 23, win path
  wired. Full suite green. SW → v045.
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
