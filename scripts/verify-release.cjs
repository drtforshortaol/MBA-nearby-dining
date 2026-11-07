#!/usr/bin/env node
// Run from the repository root: node scripts/verify-release.cjs
const fs=require('node:fs');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const data=JSON.parse(read('data/eateries.json'));
assert.equal(data.length,205,'Expected 205 visitor-eligible eateries');
const ids=new Set();
for(const [i,r] of data.entries()){
  assert.match(r.id||'',/^MBA-DINE-\d{4}$/, 'Invalid ID at record '+i);
  assert(!ids.has(r.id),'Duplicate ID: '+r.id);
  ids.add(r.id);
  assert(r.name&&r.address,'Missing name or address: '+r.id);
  assert(Number.isFinite(r.lat)&&r.lat>36&&r.lat<37,'Invalid latitude: '+r.id);
  assert(Number.isFinite(r.lon)&&r.lon> -123&&r.lon< -121,'Invalid longitude: '+r.id);
  if(r.photo)assert(r.photoCaution||r.photoSource,'Photo lacks caution/source: '+r.id);
}
const photoRecords=data.filter(r=>r.photo);
const missingHours=data.filter(r=>!r.hours);
const reviewedHours=data.filter(r=>r.batchReview?.hoursVerified===true);
for(const r of photoRecords){
  // Only relative bundled image paths can be used offline.
  assert(!/^(?:https?:|\\/|\\.\\.)/i.test(r.photo),'Non-bundled photo: '+r.id);
  assert(fs.existsSync(path.join(root,r.photo)),'Missing bundled photo: '+r.id+' '+r.photo);
}
assert(reviewedHours.length<=data.length,'Invalid hours verification count');
const app=read('app.js'),sw=read('sw.js'),html=read('index.html');
for(const token of ['function offlineMapSVG(','function travelEstimate(','case\'loadMore\'','case\'mapReset\'','data-action="resetSearch"','shown.map(card)','slot.innerHTML=offlineMapSVG(r,roadData,1)'])
  assert(app.includes(token),'Missing application feature: '+token);
assert(html.includes('app.js')&&html.includes('style.css'),'Missing app entrypoints');
assert(sw.includes('data/eateries.json')&&sw.includes('data/roads.json'),'Offline essentials not cached');
assert(fs.existsSync(path.join(root,'data/roads.json')),'Offline road data missing');
const cache=sw.match(/mba-eatery-v[^'"]+/);
assert(cache,'Offline cache version missing');
console.log('PASS: '+data.length+' unique eateries, coordinates, '+photoRecords.length+' bundled photos, required app controls, offline assets; cache '+cache[0]);\nconsole.log('AUDIT: '+reviewedHours.length+' records marked hours-verified; '+missingHours.length+' records missing hours. These counts do not establish current opening status.');
