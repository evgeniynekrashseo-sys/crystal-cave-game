const {chromium}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {spawn}=require('node:child_process');const assert=require('node:assert/strict');const path=require('node:path');
(async()=>{const server=spawn(process.execPath,['dev-server.mjs','--port','4196'],{cwd:path.resolve(__dirname,'..'),stdio:'ignore'});let browser;
 try{await new Promise(r=>setTimeout(r,600));browser=await chromium.launch({executablePath:'/tmp/chromium',args:['--no-sandbox','--disable-gpu']});
 const page=await browser.newPage({viewport:{width:1440,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:4196');
 await page.evaluate(async()=>{
  const {drawSettlement}=await import('./settlement-renderer.js?v=46'),{freshCity}=await import('./settlement-model.js?v=45'),{plannedSize}=await import('./settlement-footprints.js?v=44');
  document.body.innerHTML='<main style="display:grid;grid-template-columns:repeat(3,480px);background:#263029;color:#eee"></main>';
  const scenes=[];for(let level=1;level<=5;level++){const wrap=document.createElement('div');wrap.innerHTML='<b style="padding:12px;display:block">Завод · рівень '+level+' · '+plannedSize('factory',level).join('×')+'</b><canvas width="480" height="370" style="width:480px;height:370px"></canvas>';document.querySelector('main').append(wrap);
   const c=freshCity();c.seconds=100;c.extent=10;c.roads=[];c.buildings=[{id:1,type:'factory',x:3,y:4,level,footprint:plannedSize('factory',level),ready:0}];c.agents=[{id:0,job:1,x:2,y:4,path:[],state:'work',timer:3,truck:false,cargo:{}}];scenes.push({c,canvas:wrap.querySelector('canvas')});
  }
  window.paintQA=()=>scenes.forEach(({c,canvas})=>drawSettlement(canvas.getContext('2d'),canvas,c,{zoom:.95,pan:{x:0,y:-25},selected:null,tool:null,time:100.5,reduced:false}));window.paintQA();
 });await page.waitForTimeout(1000);await page.evaluate(()=>window.paintQA());
 await page.screenshot({path:path.resolve(__dirname,'../docs/factory-evolution-v46.png')});assert.deepEqual(errors,[]);console.log('PASS five factory levels: fixed building scales, additional workshops and machinery');
 }finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});

