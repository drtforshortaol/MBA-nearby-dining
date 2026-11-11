'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const records=JSON.parse(fs.readFileSync(path.join(root,'data/eateries.json'),'utf8'));
let checked=0,errors=[];
for(const r of records){if(!r.photo||!r.photo.endsWith('-concept.svg'))continue;
checked++;
const filename=path.resolve(root,r.photo);
if(!filename.startsWith(root+path.sep)){errors.push(r.id+': path outside repository');continue;}
if(!fs.existsSync(filename)){errors.push(r.id+': missing local artwork');continue;}
const svg=fs.readFileSync(filename,'utf8');
if(!svg.includes('<svg')||!svg.includes('</svg>'))errors.push(r.id+': malformed SVG container');
if(/<script\b|onload\s*=|<foreignObject\b|https?:\/\//i.test(svg.replace(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g,'')))errors.push(r.id+': external reference or active content');
for(const key of ['photoCaption','photoCaution','photoLicense','photoCreator','photoSource','photoDate'])if(!r[key])errors.push(r.id+': missing '+key);
if(!/illustration|concept/i.test(r.photoCaption+' '+r.photoCaution))errors.push(r.id+': missing illustration disclosure');
}
console.log('Concept illustration audit:',checked,'records;',errors.length,'errors');
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
