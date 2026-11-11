'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const queue=JSON.parse(fs.readFileSync(path.join(root,'data/photo-cleanup-queue.json'),'utf8'));
const errors=[];
const expected=new Set(['MBA-DINE-0068','MBA-DINE-0031','MBA-DINE-0042']);
for(const record of queue.records){
  if(!expected.has(record.id))continue;
  if(record.cleanupStatus==='approved'){
    if(record.reviewStatus!=='visually-approved')errors.push(record.id+' lacks visual approval');
    if(record.entranceConfirmed!==true)errors.push(record.id+' lacks entrance confirmation');
    if(!record.reviewer||!record.reviewedOn)errors.push(record.id+' lacks reviewer/date');
    if(!record.approvedDerivative)errors.push(record.id+' lacks derivative path');
  }
}
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log('Photo approval contract valid; pending previews are not approved.');
