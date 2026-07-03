# FragBox — Overnight Session Notes (2026-07-02 → 03)

**47 releases shipped this session (v036 → v081), every one test-gated.**
Refresh your browser once (Ctrl+Shift+R the first time) and everything below is live.

## What shipped tonight, by theme

**Core combat**
- Frag grenades (G) with bounce physics, server-authoritative online
- Crouch + slide (Ctrl) with server-synced smaller hitboxes
- Time-to-kill cut twice at your request — AK 3-shots, AWP/SSG one-shot potential
- 10-weapon arsenal (added SSG 08 scout + FAMAS burst) with per-gun attachments
  (25/100 kills), camos (Forest 50 / Digital 150 / GOLD 400), and challenges

**Systems**
- Killstreaks: UAV (3) / Overshield (5) / Airstrike (7) + tactical minimap
- Class abilities on Q (dash, fortify, recon, resupply, quickdraw, fan-the-hammer…)
- 2 new classes (Scout lv20, Commando lv24) — 10 total
- Daily challenges (3/day, date-seeded) → supply crates → roulette cosmetic pulls
  (3 crate-exclusive skins) + free daily rewarded-ad crate + $1.99 bundle stub
- ELO rating with Bronze→Diamond bands, career page (K/D, accuracy, playtime, sparkline)
- Kill effects (confetti/skull/lightning), weather (rain/snow), podium ceremonies,
  killcam, kill assists, match intro flyby, map voting between rounds (live map swap)

**Modes** — FFA, TDM, Gun Game (10 rungs), **Capture the Flag**, **Domination**,
plus the **Killhouse** aim trainer with replay ghost. Bots play every objective.

**Level design (your directive)**
- Modular prefab kit in `shared/map.mjs`: rooms, towers w/ auto-stairs, bridges,
  platforms, catwalks, tunnels, cover clusters, containers, corners —
  `place(P.tower(2,9), x, z, rotation)` composes a map in ~25 lines
- **6 maps**, each with a spatial identity: Meadow 2.0 (elevated catwalk spine),
  Depot 2.0 (crane walkway over the container yard), Skyline (enterable buildings
  with window slits), Bunker (indoor 3×3 CQC), Compound (kit showcase), all verified
  by literally walking every elevated route headlessly

**Mobile & polish** — auto-fire assist, rotate hint, graphics quality tiers with
FPS auto-tune, footstep audio, per-map ambient beds, announcer stingers, map tips,
bot AI overhaul (classes, lock-on aim, grenades on Hard, unstick), AFK kick, LAN
COPY INVITE button in the multiplayer pause menu.

**Since the first draft of these notes** (v072-v078): daily challenge pool doubled to 20
(slide kills, ability uses, Killhouse grades, all new weapon types), MP death spectate
(click to cycle a chase-cam), killfeed weapon labels, grenade ARC PREVIEW (hold G to aim
with a real-physics trajectory line), live ping display in the score pill, and the
"double-join ghost" turned out to be a test artifact (name field vs localStorage), not a bug.
Killhouse gained MOVING TARGETS (strafing dummies, separate records); the prefab kit gained a
WATCHTOWER (raised lookout cabin w/ firing slit — two on Compound); crate jackpots flash gold.

**COMPLETE UI REWORK (v080-v081, your "modern standards" directive):** token-based design
system — glassmorphism panels, esports angled buttons with shine sweeps, animated gradient
logo, hero-first menu (PLAY was below the fold before!), reborn HUD with accent-edged glass
health/ammo panels, themed minimap, every screen audited. Hard-refresh once to see it.

## Things only you can do

1. **Folder rename** `KourHero` → `FragBox`: still locked by some process on your
   side (Explorer/editor?). Close it and rename; everything is path-relative.
2. **Monetization go-live**: all 4 placements are wired behind a simulator
   (`Monetize.provider='sim'`). Needs your accounts — see `MONETIZATION.md`.
3. **Hosting**: solo build deploys to GitHub Pages as-is; multiplayer needs any
   Node host (Railway/Fly/VPS). `tools/build-portal.mjs` makes the portal zip
   for CrazyGames/Poki/itch.

## Known engineering notes
- Full test suite: `node tools/verify.mjs && node tools/playtest.js && node tools/mptest.js`
- The service worker is now network-first for everything (a cache-first bug was why
  your TTK/map feedback appeared unaddressed — fixed in v058, lesson in the playbook).
- `PROGRESS.md` has the complete release-by-release log; `GAME_DEV_PLAYBOOK.md` §9
  has the seven transferable lessons from tonight.
