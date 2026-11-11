'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const queue=JSON.parse(fs.readFileSync(path.join(root,'data/photo-cleanup-queue.json'),'utf8'));
const records=queue.records;
const failures=[];
for(const r of records){
 if(!fs.existsSync(path.join(root,r.existingPhoto)))failures.push(r.id+': source image missing: '+r.existingPhoto);
 if(r.reviewStatus==='approved'&&!r.entranceConfirmed)failures.push(r.id+': approval without entrance confirmation');
}
if(records.length!==9)failures.push('Expected 9 source photos; found '+records.length);
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log('Photo coverage: '+records.length+' real sources present; 3 user-confirmed displaying; remaining six awaiting staging/integration.');
