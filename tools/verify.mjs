// Static verification (playbook §3, adapted for ES-module game script).
// Usage: node tools/verify.mjs
import fs from 'fs';
import { execSync } from 'child_process';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const js = [...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n;\n');
if (!js.trim()) { console.error('FAIL: no module script found'); process.exit(1); }
fs.writeFileSync('.v.mjs', js);

let ok = true;
const bal = (s, o, c) => { let n = 0; for (const ch of s) { if (ch === o) n++; else if (ch === c) n--; } return n; };
for (const [o, c, name] of [['{','}','brace'], ['(',')','paren'], ['[',']','bracket']]) {
  const n = bal(js, o, c);
  if (n !== 0) { console.error(`FAIL: ${name} balance = ${n}`); ok = false; }
}

const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
const refs = [...js.matchAll(/\bel\('([^']+)'\)/g)].map(m => m[1]);
const missing = [...new Set(refs)].filter(i => !ids.has(i));
if (missing.length) { console.error('FAIL: missing el ids: ' + missing.join(',')); ok = false; }

const arr = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
const dup = arr.filter((v, i) => arr.indexOf(v) !== i);
if (dup.length) { console.error('FAIL: duplicate ids: ' + [...new Set(dup)].join(',')); ok = false; }

try { execSync('node --check .v.mjs', { stdio: 'pipe' }); }
catch (e) { console.error('FAIL: syntax\n' + e.stderr); ok = false; }
fs.unlinkSync('.v.mjs');

// SW cache version must exist
const sw = fs.readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const ver = sw.match(/CACHE = 'fragbox-v(\d+)'/);
if (!ver) { console.error('FAIL: sw.js cache version missing'); ok = false; }
else console.log('sw cache version:', ver[1]);

console.log(ok ? 'VERIFY OK' : 'VERIFY FAILED');
process.exit(ok ? 0 : 1);
