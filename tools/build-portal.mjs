// Builds dist/fragbox-portal.zip — the solo (client-only) bundle for game
// portals (CrazyGames / Poki / itch). The service worker self-gates to
// github.io/localhost so it stays inert inside portal iframes (playbook §4).
// Usage: node tools/build-portal.mjs
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const STAGE = path.join(DIST, 'stage');
const ZIP = path.join(DIST, 'fragbox-portal.zip');

const INCLUDE = [
  'index.html', 'manifest.json', 'icon.svg', 'sw.js',
  'lib/three.module.js',
  'shared/map.mjs', 'shared/weapons.mjs', 'shared/cosmetics.mjs'
];

fs.rmSync(STAGE, { recursive: true, force: true });
for (const rel of INCLUDE) {
  const src = path.join(ROOT, rel);
  const dst = path.join(STAGE, rel);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
}

fs.rmSync(ZIP, { force: true });
execSync(
  `powershell -NoProfile -Command "Compress-Archive -Path '${STAGE}\\*' -DestinationPath '${ZIP}' -Force"`,
  { stdio: 'inherit' }
);
fs.rmSync(STAGE, { recursive: true, force: true });

const kb = Math.round(fs.statSync(ZIP).size / 1024);
console.log(`built ${path.relative(ROOT, ZIP)} (${kb} KB, ${INCLUDE.length} files)`);
