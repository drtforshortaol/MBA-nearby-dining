#!/usr/bin/env node
// Read-only enrichment coverage report. Photos intentionally excluded.
// Usage: node scripts/audit-enrichment-coverage.cjs [--csv]
'use strict';
const fs = require('node:fs');
const rows = JSON.parse(fs.readFileSync('data/eateries.json', 'utf8'));
if (!Array.isArray(rows)) throw new Error('Expected restaurant array');
const ids = new Set();
const records = rows.map((r) => {
  if (typeof r.id !== 'string' || !r.id || ids.has(r.id)) throw new Error('Missing or duplicate restaurant ID: ' + r.id);
  ids.add(r.id);
  const d = r.diningDetails;
  const hasDetails = !!d && typeof d === 'object' && !Array.isArray(d);
  const sources = hasDetails && Array.isArray(d.sources) ? d.sources.filter(s => typeof s === 'string' && s.trim()) : [];
  const status = hasDetails ? (d.status || 'status-unspecified') : 'not-enriched';
  const gaps = [];
  if (!hasDetails) gaps.push('dining-details');
  else {
    if (!sources.length) gaps.push('detail-sources');
    if (!d.reviewedOn) gaps.push('detail-review-date');
    for (const field of ['food', 'experience', 'seating', 'accessibility', 'dietary', 'family', 'reservation', 'entrance']) {
      if (typeof d[field] !== 'string' || !d[field].trim()) gaps.push(field);
    }
  }
  return {id:r.id,name:r.name||'',city:r.city||'',status,sourceCount:sources.length,gaps:gaps.join(';')};
}).sort((a,b) => Number(a.status !== 'not-enriched') - Number(b.status !== 'not-enriched') || b.gaps.split(';').length - a.gaps.split(';').length || a.id.localeCompare(b.id));
const enriched = records.filter(x => x.status !== 'not-enriched').length;
const totals = {restaurantCount:rows.length,enriched,notEnriched:rows.length-enriched,withUnresolvedDetailGaps:records.filter(x=>x.status!=='not-enriched'&&x.gaps).length,statusCounts:{}};
for (const x of records) totals.statusCounts[x.status] = (totals.statusCounts[x.status]||0)+1;
if (process.argv.includes('--csv')) {
  const cell = v => '"' + String(v??'').replace(/"/g,'""') + '"';
  process.stdout.write(['id,name,city,status,sourceCount,gaps',...records.map(x=>[x.id,x.name,x.city,x.status,x.sourceCount,x.gaps].map(cell).join(','))].join('\n')+'\n');
} else console.log(JSON.stringify({totals,nextTen:records.filter(x=>x.status==='not-enriched').slice(0,10),reviewNeeded:records.filter(x=>x.status!=='not-enriched'&&x.gaps)},null,2));
