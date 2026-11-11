#!/usr/bin/env node
// Standalone offline-photo manifest gate. Run: node scripts/validate-photo-manifest.cjs [manifest.json]
// A manifest is an array of records with restaurantId, localPath, sourceUrl, creator, license, attribution, addressVerified.
const fs = require('node:fs');
const path = require('node:path');
const manifestPath = process.argv[2] || 'data/photo-manifest.json';
if (!fs.existsSync(manifestPath)) { console.error('Missing photo manifest: ' + manifestPath); process.exit(1); }
let records;
try { records = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); } catch(e) { console.error('Invalid JSON: ' + e.message); process.exit(1); }
if (!Array.isArray(records)) { console.error('Manifest must be an array'); process.exit(1); }
let errors = [];
const ids = new Set();
for (const [index, record] of records.entries()) {
  const label = 'photo[' + index + ']';
  for (const key of ['restaurantId','localPath','sourceUrl','creator','license','attribution']) {
    if (typeof record?.[key] !== 'string' || !record[key].trim()) errors.push(label + ': missing ' + key);
  }
  if (record?.addressVerified !== true) errors.push(label + ': addressVerified must be true');
  if (record?.restaurantId && !/^MBA-DINE-\d{4}$/.test(record.restaurantId)) errors.push(label + ': invalid permanent ID');
  if (ids.has(record?.restaurantId)) errors.push(label + ': duplicate restaurant ID');
  ids.add(record?.restaurantId);
  if (record?.sourceUrl && !/^https:\/\//.test(record.sourceUrl)) errors.push(label + ': sourceUrl must use HTTPS');
  if (record?.localPath) {
    const local = record.localPath;
    const resolved = path.resolve(local);
    if (path.isAbsolute(local) || local.split(/[\\/]/).includes('..') || !resolved.startsWith(process.cwd() + path.sep)) errors.push(label + ': unsafe localPath');
    else if (!fs.existsSync(resolved)) errors.push(label + ': image file missing: ' + local);
    else if (!/\.(webp|jpe?g|png)$/i.test(local)) errors.push(label + ': unsupported image format');
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('PASS: ' + records.length + ' locally stored, attributed photo records');
