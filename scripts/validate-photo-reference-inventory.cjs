'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const inventory=JSON.parse(fs.readFileSync(path.join(root,'data/photo-reference-inventory.json'),'utf8'));
const eateries=JSON.parse(fs.readFileSync(path.join(root,'data/eateries.json'),'utf8'));
const byId=new Map(eateries.map(r=>[r.id,r]));
const seen=new Set();const errors=[];let verified=0,candidates=0;
for(const r of inventory.records){
 if(!byId.has(r.restaurantId))errors.push('Unknown ID '+r.restaurantId);
 if(seen.has(r.restaurantId))errors.push('Duplicate ID '+r.restaurantId);
 seen.add(r.restaurantId);
 if(r.sourcePage&&!/^https:\/\//.test(r.sourcePage))errors.push('Non-HTTPS source '+r.restaurantId);
 if(r.referenceStatus==='verified-reference'){
   verified++;
   if(!r.referenceImageUrl||!r.referenceImageLicense||r.permissionStatus==='not-assessed'||!r.buildingVerified)errors.push('Incomplete verified record '+r.restaurantId);
 }else candidates++;
 if(r.referenceImageUrl&&!/^https:\/\//.test(r.referenceImageUrl))errors.push('Non-HTTPS image '+r.restaurantId);
}
console.log('Photo reference inventory:',seen.size,'records;',verified,'verified;',candidates,'unverified candidates');
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
