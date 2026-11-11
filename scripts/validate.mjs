import fs from 'node:fs';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const app = fs.readFileSync('app.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const worker = fs.readFileSync('sw.js', 'utf8');
const streets = JSON.parse(fs.readFileSync('data/roads.json', 'utf8'));
assert.ok(Array.isArray(streets.features) && streets.features.length >= 80, 'Real county roads missing');
const eateries = JSON.parse(fs.readFileSync('data/eateries.json', 'utf8'));
assert.equal(eateries.length, 208, 'Expected 208 visitor-eligible eateries');
assert.equal(new Set(eateries.map(r => r.id)).size, eateries.length, 'Duplicate eatery IDs');
for (const expression of [
  /function travelEstimate\s*\(/,
  /const travelLabel\s*=/,
  /const AQUARIUM_ENTRANCE\s*=/,
  /function offlineMapSVG\s*\(/,
  /function filtered\s*\(/,
  /function goView\s*\(/,
  /function render\s*\(/,
]) assert.match(app, expression, 'Missing critical app helper: ' + expression);
const version = app.match(/APP_VERSION='([^']+)'/)?.[1];
assert.ok(version, 'Missing app version');
assert.ok(html.includes('v' + version), 'HTML version differs from app');
assert.ok(worker.includes('mba-eatery-v' + version), 'Cache version differs from app');
for (const file of ['app.js', 'sw.js', 'qr-local.js']) {
  const check = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  assert.equal(check.status, 0, file + ': ' + check.stderr);
}
console.log('Eatery App integrity OK:', version, eateries.length, 'unique eateries');
