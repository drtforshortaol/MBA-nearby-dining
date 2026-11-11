import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const rows=JSON.parse(readFileSync(new URL('../data/eateries.json',import.meta.url),'utf8'));
const problems=[];
for(const r of rows){
  const numbers=(r.phone||'').match(/(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]*\d{3}[\s.-]*\d{4}/g)||[];
  if(numbers.length===1){
    const digits=numbers[0].replace(/\D/g,'').replace(/^1(?=\d{10}$)/,'');
    if(r.phoneDigits!==digits)problems.push(r.id+': single-number dial mismatch');
  }
  if(numbers.length>1&&r.phoneDigits&&!numbers.some(n=>n.replace(/\D/g,'').replace(/^1(?=\d{10}$)/,'')===r.phoneDigits))
    problems.push(r.id+': dial number absent from listed alternatives');
}
assert.deepEqual(problems,[]);
console.log('PASS: restaurant single-number dial links and listed alternate number consistency');
