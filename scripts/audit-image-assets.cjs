'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'data/eateries.json'),'utf8'));
const stats={total:data.length,unpictured:0,genericConcepts:0,realPhotoCandidates:0,otherIllustrations:0,missingLocalAssets:[],records:[]};
for(const r of data){
 const p=r.photo||'';let classification='unpictured';
 if(p){
  if(/-concept\.svg$/i.test(p))classification='generic-concept-unapproved';
  else if(/illustration/i.test(p))classification='illustration-needs-visual-review';
  else classification='real-photo-candidate-needs-visual-review';
  const full=path.resolve(root,p);
  if(!full.startsWith(root+path.sep)||!fs.existsSync(full))stats.missingLocalAssets.push({id:r.id,path:p});
 }
 if(classification==='unpictured')stats.unpictured++;
 else if(classification==='generic-concept-unapproved')stats.genericConcepts++;
 else if(classification==='illustration-needs-visual-review')stats.otherIllustrations++;
 else stats.realPhotoCandidates++;
 stats.records.push({id:r.id,name:r.name,photo:p||null,classification});
}
console.log(JSON.stringify(stats,null,2));
if(stats.missingLocalAssets.length)process.exitCode=1;
