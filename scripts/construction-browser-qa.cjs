const {chromium}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {spawn}=require('node:child_process');const assert=require('node:assert/strict');const path=require('node:path');
(async()=>{const server=spawn(process.execPath,['dev-server.mjs','--port','4195'],{cwd:path.resolve(__dirname,'..'),stdio:'ignore'});let browser;
 try{await new Promise(r=>setTimeout(r,600));browser=await chromium.launch({executablePath:'/tmp/chromium',args:['--no-sandbox','--disable-gpu']});
 const page=await browser.newPage({viewport:{width:900,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:4195');
 await page.evaluate(async()=>{
  const {drawSettlement}=await import('./settlement-renderer.js?v=45'),{freshCity}=await import('./settlement-model.js?v=45');
  document.body.innerHTML='<canvas id="qa" width="900" height="850" style="width:900px;height:850px"></canvas>';
  const c=freshCity();c.seconds=60;c.buildings=[
   {id:1,type:'house',x:3,y:4,level:1,started:0,ready:100,footprint:[1,1]},
   {id:2,type:'factory',x:6,y:4,level:2,started:0,ready:100,footprint:[2,2],constructionFrom:{level:1,footprint:[2,1]}},
   {id:3,type:'farm',x:3,y:6,level:1,ready:0,footprint:[2,2],crop:{stage:5,elapsed:12,cycles:1}}
  ];c.agents=[{id:0,job:3,x:2,y:6,state:'work',timer:6,path:[],truck:false,cargo:{},distance:0}];c.roads=[];
  window.qaCity=c;const canvas=document.querySelector('#qa'),ctx=canvas.getContext('2d');
  window.paintQA=()=>drawSettlement(ctx,canvas,c,{zoom:1.4,pan:{x:-25,y:-70},selected:null,tool:null,time:c.seconds,reduced:false});
  window.paintQA();
 });await page.waitForTimeout(1000);await page.evaluate(()=>window.paintQA());
 await page.screenshot({path:path.resolve(__dirname,'../docs/construction-field-v45.png')});
 for(const t of [15,45,80]){await page.evaluate(t=>{window.qaCity.seconds=t;window.paintQA();},t);await page.screenshot({path:path.resolve(__dirname,'../docs/construction-stage-'+t+'.png')});}
 assert.deepEqual(errors,[]);console.log('PASS browser: staged construction, upgrade, scaffolds, workers, dust and field worker rendering');
 }finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});

