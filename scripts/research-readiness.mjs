// Read-only research readiness report; no claims of live verification.
// Run: node scripts/research-readiness.mjs
import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const eateries=read('data/eateries.json'),meta=read('data/metadata.json');
const counts=new Map(),missing={website:[],phone:[],hours:[],coordinates:[],diningDetails:[],sources:[]};
const seen=new Set(),duplicates=[],priorityQueue=[];
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
  const flags=[];
  if(/possibly-closed|reopening-unconfirmed/.test(status))flags.push('operating-status-uncertain');
  if(!r.hours&&!r.hoursProvisional)flags.push('hours-missing');
  if(!r.phone)flags.push('phone-missing');
  if(!r.website)flags.push('website-missing');
  if(!r.diningDetails?.sources?.length)flags.push('research-sources-missing');
  if(status.startsWith('provisional'))flags.push('provisional-research');
  if(flags.length)priorityQueue.push({id:r.id,name:r.name,flags,score:flags.reduce((sum,flag)=>sum+({'operating-status-uncertain':100,'hours-missing':30,'phone-missing':15,'website-missing':10,'research-sources-missing':8,'provisional-research':5}[flag]||0),0)});
}
const report={recordCount:eateries.length,metadataEligibleCount:meta.eligibleCount,countsMatch:eateries.length===meta.eligibleCount,duplicateIds:duplicates,statusCounts:Object.fromEntries([...counts].sort()),missingCounts:Object.fromEntries(Object.entries(missing).map(([k,v])=>[k,v.length])),missingIds:missing,priorityQueue:priorityQueue.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)),priorityQueuePolicy:'Flags identify research needs, not confirmed inaccuracies. Operating status first, then missing visitor-critical details.'};
console.log(JSON.stringify(report,null,2));
if(!report.countsMatch||duplicates.length)process.exitCode=1;
