import fs from 'node:fs';
import assert from 'node:assert/strict';
const [originalFile,candidateFile]=process.argv.slice(2);
if(!originalFile||!candidateFile){console.error('Usage: node scripts/check-database-import.mjs ORIGINAL.json CANDIDATE.json');process.exit(2)}
const old=JSON.parse(fs.readFileSync(originalFile,'utf8')),next=JSON.parse(fs.readFileSync(candidateFile,'utf8'));
assert.ok(Array.isArray(old)&&Array.isArray(next),'Both files must contain arrays');
const ids=new Set();for(const r of next){assert.match(r.id||'',/^MBA-DINE-\d{4}$/,'Invalid permanent ID');assert.ok(!ids.has(r.id),'Duplicate ID '+r.id);ids.add(r.id);assert.ok(typeof r.name==='string'&&r.name.trim(),'Missing name '+r.id)}
const originalIds=new Set(old.map(r=>r.id));
const removed=[...originalIds].filter(id=>!ids.has(id));
assert.equal(removed.length,0,'Existing records cannot be deleted during batch import: '+removed.join(', '));
const oldMap=new Map(old.map(r=>[r.id,r]));
const changes=next.filter(r=>JSON.stringify(r)!==JSON.stringify(oldMap.get(r.id)));
console.log(JSON.stringify({oldCount:old.length,newCount:next.length,changedOrAdded:changes.length,changedIds:changes.map(r=>r.id)},null,2));
console.log('Import preflight OK. Manual review and GitHub PR required; no files modified.');
