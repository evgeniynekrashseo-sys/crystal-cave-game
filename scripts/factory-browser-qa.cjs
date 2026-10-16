const {chromium}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {spawn}=require('node:child_process'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{const server=spawn(process.execPath,['dev-server.mjs','--port','4198'],{cwd:path.resolve(__dirname,'..'),stdio:'ignore'});let browser;
 try{await new Promise(r=>setTimeout(r,600));browser=await chromium.launch({executablePath:'/tmp/chromium',args:['--no-sandbox','--disable-gpu']});
 const page=await browser.newPage({viewport:{width:1500,height:1050}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:4198');
 await page.evaluate(async()=>{
  const {drawSettlement}=await import('./settlement-renderer.js?v=48'),{freshCity}=await import('./settlement-model.js?v=47'),{plannedSize}=await import('./settlement-footprints.js?v=44'),{factoryMetrics,factoryWidth}=await import('./settlement-factory.js?v=48'),{projectPoint,unitFor}=await import('./settlement-camera.js?v=47');
  const image=new Image();image.src='./factory-evolution-v48.webp';await image.decode();if(image.naturalWidth!==1536)throw Error('Factory atlas missing');
  document.body.innerHTML='<main style="display:grid;grid-template-columns:repeat(3,500px);background:#263029;color:#eee"></main>';
  const scenes=[];for(let panel=1;panel<=6;panel++){const level=panel===6?2:panel;const wrap=document.createElement('div');wrap.innerHTML='<b style="padding:12px;display:block">Завод · рівень '+level+' · '+plannedSize('factory',level).join('×')+'</b><canvas width="500" height="470" style="width:500px;height:470px"></canvas>';document.querySelector('main').append(wrap);
   const b={id:1,type:'factory',x:3,y:4,level,footprint:plannedSize('factory',level),ready:0},c=freshCity();if(panel===6)Object.assign(b,{started:0,ready:200,constructionFrom:{level:1,footprint:[2,1]}});c.seconds=100;c.extent=10;c.roads=[];c.buildings=[b,{id:2,type:'house',x:7,y:4,level:1,footprint:[1,1],ready:0}];c.agents=[{id:0,job:1,x:2,y:4,path:[],state:'work',timer:3,truck:false,cargo:{}}];
   const canvas=wrap.querySelector('canvas'),view={width:500,height:470};
   const m=factoryMetrics(b),p=projectPoint(view,{zoom:1,pan:{x:0,y:0}},m.anchor.x,m.anchor.y);
   scenes.push({c,canvas,pan:{x:250-p.x,y:365-p.y}});
  }
  window.paintQA=()=>scenes.forEach(({c,canvas,pan})=>drawSettlement(canvas.getContext('2d'),canvas,c,{zoom:1,pan,selected:null,tool:null,time:100.5,reduced:false}));window.paintQA();
 });await page.waitForTimeout(1200);await page.evaluate(()=>window.paintQA());await page.screenshot({path:path.resolve(__dirname,'../docs/factory-evolution-v48.png')});
 await page.setViewportSize({width:390,height:844});await page.goto('http://localhost:4198');
 await page.evaluate(async()=>{
  const {freshCity}=await import('./settlement-model.js?v=47'),{initCity}=await import('./city.js?v=48');
  const c=freshCity();c.seconds=100;c.buildings=[{id:1,type:'factory',x:2,y:4,level:3,footprint:[3,2],ready:0},{id:2,type:'house',x:6,y:4,level:2,footprint:[1,1],ready:0}];c.roads=[...Array.from({length:5},(_,i)=>({x:i+1,y:6,level:2})),{x:4,y:5,level:2}];c.agents=[];
  localStorage.setItem('chemlab_settlement_v2',JSON.stringify(c));window.qaCity=initCity({core:()=>({level:4,gold:900,discovered:[]}),canOpen:()=>true,enabled:()=>true,calm:()=>true,trade:()=>{},render:()=>{}});window.qaCity.open();
 });await page.waitForTimeout(1200);await page.screenshot({path:path.resolve(__dirname,'../docs/factory-v48-mobile.png')});
 assert.deepEqual(errors,[]);console.log('PASS four artwork eras/five levels, real renderer, mobile city, no runtime errors');
 }finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
