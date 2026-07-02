# FragBox

A fast low-poly browser arena FPS. Single `index.html` + vendored Three.js r160,
installable as an offline PWA, with an optional Node WebSocket server for real multiplayer.

## Play

**Windows: double-click `PLAY.bat`.** It starts the local server (multiplayer included) and
opens your browser. Don't open `index.html` directly — browsers block module scripts on
`file://`, so the menu can't work there (the page shows a notice instead of failing silently).

Single-player also works from any static server:

```
npx serve .        # or: python -m http.server
```

Free-for-all deathmatch against AI bots. Menu lets you pick bot count (3/5/7), difficulty
(Easy/Normal/Hard) and match length (3/5/10 min). First to 25 kills or best score at the
timer wins. Works on phones (touch stick + buttons) and installs as a PWA for offline play.

## Play (multiplayer)

```
node server/server.mjs            # http://localhost:8080  (ws on the same port)
```

Open the URL, click **MULTIPLAYER**. The server is authoritative for combat (validated fire
rate, ray-vs-world occlusion, head/body hitboxes, hp/kills/respawns) and keeps lobbies at
6 entities by filling with AI bots that yield slots to humans. Rounds last 5 minutes, then
standings are announced and everyone respawns fresh.

Server flags: `node server/server.mjs [port] [--pop=N] [--round=SECONDS] [--test]`
(`--test` enables the teleport message used by automated tests — never use in production).

## Controls

| Input | Action |
|---|---|
| WASD / left stick | Move (Shift or full stick = sprint) |
| Mouse / right-zone drag | Aim |
| LMB / FIRE button | Shoot |
| RMB | Aim-down-sights (sniper scopes) |
| Space / JUMP | Jump (ride the blue pads!) |
| 1–5 / scroll / ⇄ | Switch weapon (Rifle, SMG, Shotgun, Sniper, Pistol) |
| R | Reload |
| Tab (hold) | Scoreboard |
| Esc | Menu (in MP: click re-locks, Esc again leaves) |

## Architecture

```
index.html        the whole client: rendering, physics, AI, HUD, audio, net (ES module)
lib/three.module.js   vendored Three.js r160 (offline-capable, no CDN)
shared/map.mjs        arena geometry/spawns/pads/pickups — used by client AND server
shared/weapons.mjs    weapon stats + hitboxes — single source of truth for damage
server/server.mjs     static hosting + WebSocket: snapshots @20Hz, authoritative combat, lobby bots
sw.js                 service worker (network-first navigations; bump CACHE every release)
tools/                verify.mjs (static checks), playtest.js (headless solo), mptest.js (2-client MP)
```

## Hosting / shipping

**Solo (static, PWA):** push this folder to GitHub and enable GitHub Pages — the game plays
offline-installable at `https://<you>.github.io/<repo>/`. The service worker only registers
on github.io/localhost, so other hosts are safe too.

**Multiplayer:** run `node server/server.mjs [port] [--map=depot] [--mode=tdm|gungame] [--pop=N] [--round=S]`
on any Node host (Railway, Fly.io, a VPS) and share the URL. `PLAY.bat` passes flags
through: `PLAY.bat --mode=tdm --map=depot`.

**Game portals (CrazyGames / Poki / itch):** `node tools/build-portal.mjs` produces
`dist/fragbox-portal.zip` — the solo client bundle, iframe-safe. Upload as an HTML5 game.
See `MONETIZATION.md` for wiring their ad SDKs.

## Development

Each release: make a change, run the test suite, bump `CACHE` in `sw.js`, commit.

```
node tools/verify.mjs      # syntax, brace balance, el() id refs, sw version
node tools/playtest.js     # boots the game headless in Edge, simulates play, screenshots
node tools/mptest.js       # spawns server + 2 clients: movement sync, a duel, lobby bots
```

(`npm i` inside `tools/` once for puppeteer-core; inside `server/` for ws.)

See `PROGRESS.md` for the release-by-release changelog and backlog.
