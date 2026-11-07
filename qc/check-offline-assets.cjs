// Run from repository root: node qc/check-offline-assets.cjs
// Static preflight only; not a substitute for iPhone airplane-mode testing.
const fs=require('node:fs');
const sw=fs.readFileSync('sw.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const data=JSON.parse(fs.readFileSync('data/eateries.json','utf8'));
const required=['index.html','style.css','app.js','qr-local.js','icon.svg','manifest.webmanifest','data/eateries.json','data/metadata.json','data/roads.json'];
const missing=required.filter(p=>!fs.existsSync(p));
const missingPhotos=[...new Set(data.filter(r=>r.photo&&!fs.existsSync(r.photo)).map(r=>r.photo))];
const checks={serviceWorkerCachesCore:sw.includes('cache.addAll(CORE)'),offlineDataIncluded:sw.includes('./data/eateries.json'),offlineRoadsIncluded:sw.includes('./data/roads.json'),navigationOnlyFallback:sw.includes("req.mode==='navigate'?caches.match('./index.html'):Response.error()"),manifestLinked:html.includes('manifest.webmanifest')};
console.log(JSON.stringify({checks,missingCoreFiles:missing,missingReferencedPhotos:missingPhotos,records:data.length,disclaimer:'Static checks only; browser and device testing still required.'},null,2));
if(missing.length||missingPhotos.length||Object.values(checks).some(v=>!v))process.exitCode=1;
