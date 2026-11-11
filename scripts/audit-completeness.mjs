import fs from 'node:fs';
const rows=JSON.parse(fs.readFileSync('data/eateries.json','utf8'));
const fields=['name','address','city','phone','cuisine','hours','website','lat','lon','photo','menuUrl'];
const quote=x=>'"'+String(x??'').replaceAll('"','""')+'"';
const report=rows.map(r=>{
 const missing=fields.filter(k=>r[k]===null||r[k]===undefined||String(r[k]).trim()==='');
 const unverified=Object.entries(r.attributes||{}).filter(([,v])=>v?.status!=='verified').map(([k])=>k);
 return {id:r.id,name:r.name,missing:missing.join('; '),missingCount:missing.length,unverified:unverified.join('; '),unverifiedCount:unverified.length};
});
const columns=['id','name','missing','missingCount','unverified','unverifiedCount'];
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/completeness.csv',columns.join(',')+'\n'+report.map(r=>columns.map(k=>quote(r[k])).join(',')).join('\n')+'\n');
const counts=Object.fromEntries(fields.map(k=>[k,report.filter(r=>r.missing.split('; ').includes(k)).length]));
console.log(JSON.stringify({restaurants:rows.length,missingByField:counts,restaurantsWithMissingFields:report.filter(r=>r.missingCount).length,output:'reports/completeness.csv'},null,2));
