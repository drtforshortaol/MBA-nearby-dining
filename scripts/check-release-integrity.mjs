// Run with: node scripts/check-release-integrity.mjs
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const restaurants=JSON.parse(read('data/eateries.json'));
const meta=JSON.parse(read('data/metadata.json'));
assert.equal(restaurants.length,meta.eligibleCount,'Restaurant count mismatch');
const ids=restaurants.map(r=>r.id);
assert.equal(new Set(ids).size,ids.length,'Duplicate restaurant IDs');
for(const r of restaurants){
 assert.match(r.id,/^MBA-DINE-\\d{4}$/,'Invalid restaurant ID');
 assert.ok(r.name?.trim(),'Missing restaurant name: '+r.id);
}
const version=String(meta.appVersion);
assert.ok(read('app.js').includes("APP_VERSION='"+version+"'"),'app.js version mismatch');
assert.ok(read('index.html').includes('v'+version+'</b>'),'index.html version mismatch');
assert.ok(read('sw.js').includes("mba-eatery-v"+version+"'"),'sw.js cache version mismatch');
const missing=restaurants.filter(r=>!String(r.hours||'').trim());
console.log('PASS: '+restaurants.length+' unique restaurants; '+missing.length+' missing hours; version '+version);
