// Read-only research readiness report; no claims of live verification.
// Run: node scripts/research-readiness.mjs
import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const eateries=read('data/eateries.json'),meta=read('data/metadata.json');
const counts=new Map(),missing={website:[],phone:[],hours:[],coordinates:[],diningDetails:[],sources:[]};
const seen=new Set(),duplicates=[];
for(const r of eateries){
  if(seen.has(r.id))duplicates.push(r.id);
  seen.add(r.id);
  const status=r.diningDetails?.status||'missing';
  counts.set(status,(counts.get(status)||0)+1);
  if(!r.website)missing.website.push(r.id);
  if(!r.phone)missing.phone.push(r.id);
  if(!r.hours&&!r.hoursProvisional)missing.hours.push(r.id);
  if(!Number.isFinite(r.lat)||!Number.isFinite(r.lon))missing.coordinates.push(r.id);
  if(!r.diningDetails)missing.diningDetails.push(r.id);
  if(!r.diningDetails?.sources?.length)missing.sources.push(r.id);
}
const report={recordCount:eateries.length,metadataEligibleCount:meta.eligibleCount,countsMatch:eateries.length===meta.eligibleCount,duplicateIds:duplicates,statusCounts:Object.fromEntries([...counts].sort()),missingCounts:Object.fromEntries(Object.entries(missing).map(([k,v])=>[k,v.length])),missingIds:missing};
console.log(JSON.stringify(report,null,2));
if(!report.countsMatch||duplicates.length)process.exitCode=1;
