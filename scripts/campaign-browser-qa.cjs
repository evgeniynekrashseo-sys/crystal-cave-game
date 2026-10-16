const {chromium}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {spawn}=require('node:child_process'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{const server=spawn(process.execPath,['dev-server.mjs','--port','4197'],{cwd:path.resolve(__dirname,'..'),stdio:'ignore'});let browser;
 try{await new Promise(r=>setTimeout(r,600));browser=await chromium.launch({executablePath:'/tmp/chromium',args:['--no-sandbox','--disable-gpu']});
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:4197');
 await page.evaluate(async()=>{
  const {freshCity}=await import('./settlement-model.js?v=47'),{STORIES,ensureStory}=await import('./city-story.js?v=47'),{initCity}=await import('./city.js?v=47');
  const c=freshCity();ensureStory(c);c.story.claimed=STORIES.slice(0,12).map(q=>q.id);c.story.path='science';c.resources.food=500;c.resources.goods=100;c.resources.metal=100;c.resources.research=100;
  localStorage.setItem('chemlab_settlement_v2',JSON.stringify(c));
  window.qaCity=initCity({core:()=>({level:4,gold:900,discovered:[]}),canOpen:()=>true,enabled:()=>true,calm:()=>true,trade:()=>{},render:()=>{}});window.qaCity.open();
 });await page.waitForTimeout(900);await page.locator('#city-research').click();
 assert.match(await page.locator('#city-panel').innerText(),/Кому віддати перший сигнал/);
 await page.screenshot({path:path.resolve(__dirname,'../docs/campaign-v47-mobile.png')});
 await page.locator('[data-decision="signal"][data-option="rescue"]').click();
 assert(await page.locator('[data-decision="signal"][data-option="archive"]').isDisabled());
 let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('chemlab_settlement_v2')));assert.equal(saved.story.decisions.signal,'rescue');assert(saved.resources.goods<=80);
 await page.locator('#story-claim').click();assert.match(await page.locator('#city-panel').innerText(),/Не ще одна труба/);
 await page.evaluate(()=>window.qaCity.close());
 saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('chemlab_settlement_v2')));assert(saved.story.claimed.includes('signal'));
 assert.deepEqual(errors,[]);console.log('PASS mobile story HUD, decision cost, single choice, reward, next chapter and saved state');
 }finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
