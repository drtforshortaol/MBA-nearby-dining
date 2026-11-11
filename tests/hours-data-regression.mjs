// Run: node tests/hours-data-regression.mjs
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const eateries=JSON.parse(readFileSync(new URL('../data/eateries.json',import.meta.url),'utf8'));
assert.equal(eateries.length,208,'Expected 208 restaurant records');
assert.equal(new Set(eateries.map(r=>r.id)).size,eateries.length,'Duplicate permanent ID');
assert(eateries.every(r=>Number.isFinite(r.lat)&&Number.isFinite(r.lon)),'Missing coordinates');
const ids=['0002','0017','0115','0144','0217','0218','0229'].map(n=>'MBA-DINE-'+n);
for(const id of ids){
  const r=eateries.find(x=>x.id===id);
  assert(r,'Missing audited restaurant: '+id);
  assert(['unknown','unverified'].includes(r.hoursConfidence),id+' incorrectly classified as published');
  assert(!r.hours,id+' has unverified hours in published field');
  assert(r.hoursCaution?.trim(),id+' lacks visitor warning');
  assert.equal(r.batchReview?.hoursVerified,false,id+' incorrectly marked verified');
  if(r.hoursConfidence==='unverified')assert(r.hoursProvisional?.trim(),id+' missing provisional display text');
  if(r.hoursConfidence==='unknown')assert(!r.hoursProvisional,id+' has unexpected provisional schedule');
}
console.log('PASS: 208 unique eateries, coordinates complete, 7 uncertain hours safely labeled');
