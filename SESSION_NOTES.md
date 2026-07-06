# FragBox — Session Notes (2026-07-02 → 05)

**66 releases shipped (v036 → v100), every one test-gated.**
Hard-refresh once (Ctrl+Shift+R) and everything below is live.

## The core-feel arc (your 07-05 directive: "refine feel & UX, sounds & animation & models")

**Models — built in Blender, per your request (v095–v098)**
- Full headless pipeline: `tools/make_soldier.py / make_weapons.py / make_props.py`
  → Blender 5.1 → `models/*.glb` → loaded in-game (old primitives remain as offline fallback)
- New **soldier character**: beveled low-poly rig, vest plate, shoulder pads, helmet
  with brim, metallic cyan visor — walks, flinches, falls and holds its real weapon
- **All 10 first-person guns modeled**: AK wood furniture + curved mag, AWP scope with
  lens rings + side bolt, M249 bipod + box mag, Magnum silver vent-rib + fluted
  cylinder, FAMAS bullpup, MP5, M870 pump, M14, SSG, M1911
- **Pickup props**: white medkit case w/ glowing cross + latches, olive ammo crate
  w/ brass shells

**Animation (v087–v088, v092, v094)**
- Enemies no longer vanish: they **tip over, lie, and sink** (bots + online players)
- **Hit flinch** on every non-fatal shot, muzzle sparks when bots fire
- **Real reload**: gun drops + tilts (mag out), fiddles low, snaps back with overshoot,
  synced to staged mag-out/mag-in/rack sounds
- **ADS glide**: sights slide to center, sway melts away, recoil damped while aimed
- Weapon-switch dip, landing camera dip scaled to fall speed, sprint FOV + roll

**Sound (v089, v099)**
- Every close shot = **sub-bass thump + crack transient + per-gun timbre**; heavies
  hit deeper; **distant gunfire is a muffled boom** (battlefield ambience); Bunker
  adds an indoor slapback echo
- Landings and slides **read the surface** (soft grass vs sharp asphalt + click)

**UX & combat feedback (v082–v086, v093, v100)**
- 3-2-1-GO deploy countdown, low-ammo amber pulse, gold enlarged kill-marker
- Death recap ("also hurt by Vex 62"), FIRST BLOOD / REVENGE callouts with bonus XP
- Big hits (>35 dmg) punch your FOV with a deep red flash
- Heal/ammo pickups flash a vignette + float their reward
- **Bot aim telegraph**: a red muzzle glint warns you while a bot lines you up
- Crosshair customization (Cross/Dot/Circle × 4 colors), MVP gold row, menu parallax

**Earlier this session**: complete UI rework (glass + esports design system, v080-081),
modular level kit + 6 maps, 5 modes + Killhouse trainer, progression economy
(dailies → crates → cosmetics), ELO ranks, mobile support — see PROGRESS.md.

## Things only you can do
1. **Folder rename** `KourHero` → `FragBox` — still locked by a process on your side.
2. **Monetization go-live** — 4 placements wired behind the simulator; needs your
   accounts (`MONETIZATION.md`).
3. **Hosting** — ✅ LIVE at https://popnoodler.github.io/fragbox/ (repo:
   github.com/PopNoodler/fragbox, auto-deploys from main). Solo + Killhouse fully
   work there; ONLINE needs a Node host (Railway/Fly) for the ws server.
   `tools/build-portal.mjs` builds the portal zip for CrazyGames/Poki/itch.

## Engineering notes
- Full suite: `node tools/verify.mjs && node tools/playtest.js && node tools/mptest.js`
- Blender asset rebuild: `"C:/Program Files/Blender Foundation/Blender 5.1/blender.exe"
  --background --python tools/make_weapons.py -- models/weapons.glb`
- `PROGRESS.md` = complete release log; `GAME_DEV_PLAYBOOK.md` §9 = transferable lessons.
