#!/usr/bin/env node
// Browser acceptance smoke test; run by the GitHub Actions release workflow.
const {chromium}=require('playwright');
const {spawn}=require('node:child_process');
const assert=require('node:assert/strict');
const port=8765;
const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1'],{stdio:'ignore'});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
let browser;
(async()=>{
  try{
    await delay(1200);
    browser=await chromium.launch({headless:true});
    const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'allow'});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:'+port+'/',{waitUntil:'networkidle'});
    const expectedVersion=require('../data/metadata.json').appVersion;
    assert(await page.locator('footer').innerText().then(t=>t.includes('v'+expectedVersion)),'Current release version should be visible');
    await page.locator('.card').first().waitFor();
    assert.equal(await page.locator('.card').count(),30,'Initial list should show 30 cards');
    await page.getByRole('button',{name:/Show 30 more/}).click();
    assert.equal(await page.locator('.card').count(),60,'Show more should reveal 60 cards');
    const search=page.locator('#search');
    await search.fill('unfindable-restaurant-xyz');
    assert.equal(await page.locator('.card').count(),0,'Search should filter results');
    await page.getByRole('button',{name:/Reset Search & Filters/}).click();
    assert.equal(await page.locator('.card').count(),30,'Reset should restore first page');
    const map=page.locator('.mapdetails').first();
    await map.locator('summary').click();
    await map.locator('svg.realStreetMap').waitFor({timeout:15000});
    await map.getByRole('button',{name:/Zoom in/}).click();
    await map.getByRole('button',{name:/Fit All/}).click();
    assert.equal(await map.getAttribute('data-zoom'),'1','Fit All resets this map');
    await page.evaluate(async()=>{await Promise.race([navigator.serviceWorker.ready,new Promise((_,reject)=>setTimeout(()=>reject(Error('Service worker readiness timed out')),12000))]);if(!navigator.serviceWorker.controller)await Promise.race([new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true})),new Promise((_,reject)=>setTimeout(()=>reject(Error('Service worker control timed out')),12000))]);});
    await context.setOffline(true);
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('.card').first().waitFor({timeout:15000});
    assert.equal(await page.locator('.card').count(),30,'Offline list should load');
    const offlineMap=page.locator('.mapdetails').first();
    await offlineMap.locator('summary').click();
    await offlineMap.locator('svg.realStreetMap').waitFor({timeout:15000});
    assert.deepEqual(errors,[],'No unhandled browser exceptions');
    console.log('PASS: mobile search, pagination, offline map zoom/reset, offline reload');
  }finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
