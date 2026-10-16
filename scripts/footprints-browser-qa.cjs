const {chromium}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {spawn}=require('node:child_process');const assert=require('node:assert/strict');
(async()=>{
 const server=spawn(process.execPath,['dev-server.mjs','--port','4194'],{cwd:require('node:path').resolve(__dirname,'..'),stdio:'ignore'});let browser;
 try{
 await new Promise(r=>setTimeout(r,600));browser=await chromium.launch({executablePath:'/tmp/chromium',args:['--no-sandbox','--disable-gpu']});
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 await page.goto('http://localhost:4194');
 const seed=await page.evaluate(async()=>{
  const {freshCity}=await import('./settlement-model.js?v=44');const c=freshCity();c.extent=20;c.tech=['steel'];
  for(const k in c.resources)c.resources[k]=5000;
  c.buildings.push({id:10,type:'factory',x:6,y:4,level:1,footprint:[2,1],ready:0},{id:11,type:'house',x:6,y:5,level:1,footprint:[1,1],ready:0});c.nextId=12;
  return JSON.stringify(c);
 });
 await page.addInitScript(seed=>{localStorage.setItem('chemlab_settlement_v2',seed);localStorage.setItem('chemlab_tutorial_v1','1');localStorage.setItem('chemlab_sound','false');},seed);
 await page.reload();await page.locator('#level-sheet').evaluate(e=>e.open=true);await page.locator('#city-button').click();await page.waitForTimeout(800);
 await page.screenshot({path:require('node:path').resolve(__dirname,'../docs/footprints-city-mobile.png')});
 await page.locator('[data-city-tab="build"]').click();
 const canvas=page.locator('#city-viewport canvas');await canvas.press('ArrowRight');await canvas.press('ArrowRight');await canvas.press('ArrowUp');
 assert(await page.locator('#city-upgrade').isDisabled());assert.match(await page.locator('[data-city-expansion-error]').textContent(),/Розширення неможливе/);
 await page.screenshot({path:require('node:path').resolve(__dirname,'../docs/footprints-blocked-upgrade.png')});
 await page.locator('#city-move').click();assert(await page.locator('#city-move-confirm').isDisabled());
 await canvas.press('ArrowRight');await canvas.press('ArrowRight');
 assert(!(await page.locator('#city-move-confirm').isDisabled()));
 await page.screenshot({path:require('node:path').resolve(__dirname,'../docs/footprints-relocate-preview.png')});
 await page.locator('#city-move-confirm').click();
 const save=await page.evaluate(()=>JSON.parse(localStorage.getItem('chemlab_settlement_v2'))),factory=save.buildings.find(b=>b.type==='factory');
 assert.equal(factory.x,8);assert.equal(factory.y,4);assert.deepEqual(factory.footprint,[2,1]);assert(factory.ready>save.seconds);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
 console.log('PASS mobile: occupied factory upgrade blocked, relocation preview and confirmation, persisted footprint, no runtime errors');
 }finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});

