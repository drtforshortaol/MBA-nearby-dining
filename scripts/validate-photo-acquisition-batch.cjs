'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const batch=JSON.parse(fs.readFileSync(path.join(root,'data/photo-acquisition-batch-02.json'),'utf8'));
const eateries=JSON.parse(fs.readFileSync(path.join(root,'data/eateries.json'),'utf8'));
const known=new Map(eateries.map(r=>[r.id,r]));
const errors=[];const ids=new Set();
for(const r of batch.records){
 if(ids.has(r.restaurantId))errors.push('duplicate '+r.restaurantId);ids.add(r.restaurantId);
 const e=known.get(r.restaurantId);
 if(!e)errors.push('unknown '+r.restaurantId);
 if(e&&e.photo)errors.push('already has photo '+r.restaurantId);
 if(r.referenceStatus==='verified-photo'&&(!r.referenceImageUrl||!r.referenceImageLicense||!r.entranceVerified))errors.push('unsupported verified photo '+r.restaurantId);
 if(r.referenceStatus==='source-page-candidate-only'&&r.referenceImageUrl)errors.push('source-only record has image '+r.restaurantId);
}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log('Acquisition queue valid:',batch.records.length,'restaurants; verified photos:',batch.records.filter(r=>r.referenceStatus==='verified-photo').length);
