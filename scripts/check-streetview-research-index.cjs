#!/usr/bin/env node
const fs = require('node:fs');
const assert = require('node:assert/strict');
const eateries = JSON.parse(fs.readFileSync('data/eateries.json', 'utf8'));
const all = ['a','b','c'].flatMap(worker => {
  const file = JSON.parse(fs.readFileSync('data/streetview-research-worker-' + worker + '.json', 'utf8'));
  assert.equal(file.worker.toLowerCase(), worker);
  return file.records;
});
assert.equal(all.length, eateries.length, 'Each eatery must have one research entry');
const ids = new Set(eateries.map(e => e.id));
const seen = new Set();
for (const entry of all) {
  assert(ids.has(entry.restaurantId), 'Unknown restaurant: ' + entry.restaurantId);
  assert(!seen.has(entry.restaurantId), 'Duplicate assignment: ' + entry.restaurantId);
  seen.add(entry.restaurantId);
  const u = new URL(entry.mapsResearchUrl);
  assert.equal(u.hostname, 'www.google.com');
  assert.equal(u.pathname, '/maps/search/');
  assert.equal(u.searchParams.get('api'), '1');
  assert(u.searchParams.get('query')?.includes(entry.name), 'Name missing from Maps query');
  assert.equal(entry.photoAcquired, false, 'Research links are not acquired images');
  assert.equal(entry.reuseRightsVerified, false, 'Research links do not establish reuse rights');
}
console.log('PASS: ' + all.length + ' unique research links cover ' + eateries.length + ' eateries across three workers.');
