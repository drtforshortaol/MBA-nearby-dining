'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'data/eateries.json'),'utf8'));
const queue=JSON.parse(fs.readFileSync(path.join(root,'data/photo-cleanup-queue.json'),'utf8'));
const ids=new Set();const errors=[];
for(const r of queue.records){
 if(ids.has(r.id))errors.push('Duplicate '+r.id);
 ids.add(r.id);
 const eatery=data.find(x=>x.id===r.id);
 if(!eatery)errors.push('Unknown '+r.id);
 else if(eatery.photo!==r.existingPhoto)errors.push('Photo mismatch '+r.id);
 if(!r.source)errors.push('Missing source '+r.id);
 if(!r.reviewStatus||!r.cleanupStatus)errors.push('Missing status '+r.id);
 if(r.cleanupStatus==='approved'&&(!r.entranceConfirmed||r.reviewStatus!=='visually-approved'))errors.push('Unverified approval '+r.id);
}
console.log('Photo cleanup queue:',queue.records.length,'records; errors:',errors.length);
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
