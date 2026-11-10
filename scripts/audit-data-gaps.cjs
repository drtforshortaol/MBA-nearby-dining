#!/usr/bin/env node
// Read-only, reproducible research backlog. Run: node scripts/audit-data-gaps.cjs
const fs=require('node:fs');
const rows=JSON.parse(fs.readFileSync('data/eateries.json','utf8'));
const facets=['price','family','alcohol','ocean','entertainment'];
const missing=v=>v===null||v===undefined||String(v).trim()==='';
const records=rows.map(r=>{
  const gaps=[];
  if(missing(r.website))gaps.push('website');
  if(missing(r.phoneDigits))gaps.push('phone');
  if(missing(r.menuUrl))gaps.push('menu');
  if(missing(r.hours)||r.batchReview?.hoursVerified!==true)gaps.push('hours-verification');
  for(const f of facets)if(r.attributes?.[f]?.status!=='verified')gaps.push('facet-'+f);
  if(missing(r.statusNote)&&missing(r.batchReview?.visitorTip))gaps.push('visitor-tip');
  // Photos deliberately excluded from this research phase.
  const priority=(gaps.includes('hours-verification')?5:0)+(gaps.includes('website')?4:0)+(gaps.includes('phone')?3:0)+(gaps.includes('menu')?2:0)+facets.filter(f=>gaps.includes('facet-'+f)).length;
  return {id:r.id,name:r.name,website:r.website||'',priority,gaps:gaps.join(';'),reviewedOn:r.batchReview?.reviewedOn||'',sourceCount:r.batchReview?.sources?.length||0};
}).sort((a,b)=>b.priority-a.priority||a.id.localeCompare(b.id));
const totals={restaurantCount:rows.length,missingWebsite:records.filter(x=>x.gaps.split(';').includes('website')).length,missingPhone:records.filter(x=>x.gaps.split(';').includes('phone')).length,missingMenu:records.filter(x=>x.gaps.split(';').includes('menu')).length,hoursNeedingVerification:records.filter(x=>x.gaps.split(';').includes('hours-verification')).length,facets:Object.fromEntries(facets.map(f=>[f,records.filter(x=>x.gaps.split(';').includes('facet-'+f)).length]))};
const csvCell=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
const csv=['id,name,website,priority,gaps,reviewedOn,sourceCount',...records.map(x=>Object.values(x).map(csvCell).join(','))].join('\n')+'\n';
if(process.argv.includes('--csv'))process.stdout.write(csv);
else console.log(JSON.stringify({totals,topTen:records.slice(0,10)},null,2));
