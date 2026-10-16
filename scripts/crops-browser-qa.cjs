const {chromium}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {spawn}=require('node:child_process');
const assert=require('node:assert/strict');
(async()=>{
 const server=spawn(process.execPath,['dev-server.mjs','--port','4193'],{cwd:require('node:path').resolve(__dirname,'..'),stdio:'ignore'});
 let browser;
 try{
 await new Promise(r=>setTimeout(r,600));
 browser=await chromium.launch({executablePath:'/tmp/chromium',args:['--no-sandbox','--disable-gpu']});
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 await page.addInitScript(()=>{localStorage.setItem('chemlab_tutorial_v1','1');localStorage.setItem('chemlab_sound','false');});
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 await page.goto('http://localhost:4193');
 const seeded=await page.evaluate(async()=>{
 const {freshCity}=await import('./settlement-model.js?v=43');const c=freshCity();
 c.buildings.find(b=>b.type==='farm').crop={stage:4,elapsed:2,cycles:1};
 return JSON.stringify(c);
 });
 await page.addInitScript(value=>localStorage.setItem('chemlab_settlement_v2',value),seeded);
 await page.reload();
 await page.locator('#level-sheet').evaluate(e=>e.open=true);
 await page.locator('#city-button').click();await page.waitForTimeout(1200);
 await page.screenshot({path:require('node:path').resolve(__dirname,'../docs/crops-mobile.png')});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.evaluate(async()=>{
 const {drawSettlement}=await import('./settlement-renderer.js?v=43');
 const {freshCity}=await import('./settlement-model.js?v=43');
 document.body.innerHTML='<canvas id="qa" width="900" height="700" style="width:900px;height:700px"></canvas>';
 const c=freshCity();c.buildings=Array.from({length:6},(_,stage)=>({id:stage+1,type:'farm',x:2+(stage%3)*2,y:3+Math.floor(stage/3)*2,level:1,crop:{stage,elapsed:stage===5?12:10,cycles:0}}));c.agents=[];
 const canvas=document.querySelector('#qa'),ctx=canvas.getContext('2d');
 drawSettlement(ctx,canvas,c,{zoom:1.8,pan:{x:0,y:30},selected:null,time:1,reduced:false});
 });
 await page.setViewportSize({width:900,height:700});await page.screenshot({path:require('node:path').resolve(__dirname,'../docs/crops-stages.png')});
 assert.deepEqual(errors,[]);console.log('PASS mobile app, mature field, all six stages, no page errors or horizontal overflow');
 }finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
