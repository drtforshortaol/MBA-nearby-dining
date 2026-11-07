// Run from repository root: node qc/check-coordinates.cjs
// Checks location data without claiming route or entrance accuracy.
const fs=require('node:fs');
const rows=JSON.parse(fs.readFileSync('data/eateries.json','utf8'));
const seen=new Set();let invalid=[],duplicates=[],missing=[],invalidId=[];
for(const r of rows){
  if(!/^MBA-DINE-\d{4}$/.test(r.id)) invalidId.push(r.id);\n  if(seen.has(r.id)) duplicates.push(r.id);seen.add(r.id);
  if(!Number.isFinite(r.lat)||!Number.isFinite(r.lon)) missing.push(r.id);
  else if(r.lat<36.4||r.lat>36.8||r.lon< -122.2||r.lon> -121.6) invalid.push(r.id);
}
const summary={total:rows.length,uniqueIds:seen.size,missingCoordinates:missing,coordinatesOutsideMontereyArea:invalid,duplicateIds:duplicates,invalidPermanentIds:invalidId,warning:'Approximate coordinates are not entrance-level verification; travel-time tolerances are +/-5 min walking, +/-10 min driving.'};
console.log(JSON.stringify(summary,null,2));
if(missing.length||invalid.length||duplicates.length||invalidId.length||rows.length!==205)process.exitCode=1;
