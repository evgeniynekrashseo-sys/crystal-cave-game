import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import './style.css';

type SymbolKey = 'Na'|'Cl'|'Fe'|'O'|'C'|'H'|'Au'|'Li'|'He'|'Be'|'B'|'N'|'F'|'Ne'|'Mg'|'Al'|'Si'|'P'|'S';
type Tube = SymbolKey[];

type Persisted = {
  level:number; gold:number; nug:number; xp:number; score:number; discovered:SymbolKey[];
};

const CAP = 4;
const DISCOVERY: SymbolKey[] = ['Na','Cl','Fe','O','C','H','Au','Li','He','Be','B','N','F','Ne','Mg','Al','Si','P','S'];
const COLORS: Record<SymbolKey, number> = {
  Na:0xff5f6d, Cl:0x45ee98, Fe:0xffc34d, O:0x34c8ff, C:0xae6cff, H:0x69ebee,
  Au:0xffdc55, Li:0x4cf08b, He:0x8be84a, Be:0x5ce7df, B:0xff7ab8, N:0x7fa8ff,
  F:0xc7ff69, Ne:0xff9f5e, Mg:0x7dd2ff, Al:0xb8c5d6, Si:0xc190ff, P:0xff8f6d, S:0xffec62
};

const $ = <T extends HTMLElement>(id:string) => document.getElementById(id) as T;
const els = {
  level: $('levelTitle'), sub: $('levelSub'), moves: $('moves'), gold: $('gold'), nug: $('nugget'),
  xp: $('xpText'), xpFill: $('xpFill'), board: $('gameCanvas'), goal: $('goalText'), toast: $('toast'),
  win: $('win'), lose: $('lose'), winReward: $('winReward'), next: $('next'), retrySame: $('retrySame'), retryNew: $('retryNew'),
  undo: $('undo'), shuffle: $('shuffle'), addTube: $('addTube'), hint: $('hintBtn'), synth: $('station')
};

function readState():Persisted {
  const fallback:Persisted={level:1,gold:0,nug:0,xp:0,score:0,discovered:['Na','Cl','Fe']};
  try {
    const v50=JSON.parse(localStorage.getItem('chemlab_v50')||'null');
    if(v50) return {...fallback,...v50};
    const legacy=JSON.parse(localStorage.getItem('cl27_state')||'null');
    if(legacy) return {
      level:+legacy.level||1, gold:+legacy.gold||0, nug:+legacy.nug||0, xp:+legacy.xp||0,
      score:+legacy.score||0, discovered:Array.isArray(legacy.discovered)&&legacy.discovered.length?legacy.discovered:['Na','Cl','Fe']
    };
  } catch {}
  return fallback;
}

const P = readState();
let tubes:Tube[]=[];
let selected=-1;
let moves=0;
let seed=0;
let solution:[number,number][]=[];
let history:{tubes:Tube[];moves:number}[]=[];
let extraUsed=false;
let currentSymbols:SymbolKey[]=[];

function save(){
  localStorage.setItem('chemlab_v50',JSON.stringify(P));
  try {
    const legacy=JSON.parse(localStorage.getItem('cl27_state')||'{}');
    localStorage.setItem('cl27_state',JSON.stringify({...legacy,level:P.level,gold:P.gold,nug:P.nug,xp:P.xp,score:P.score,discovered:P.discovered}));
  } catch {}
}

function toast(msg:string){
  els.toast.textContent=msg; els.toast.classList.add('show');
  window.clearTimeout((toast as any)._t); (toast as any)._t=window.setTimeout(()=>els.toast.classList.remove('show'),1700);
}

function rng(seedValue:number){
  let x=(seedValue|0)||123456789;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};
}
function cloneTubes(v:Tube[]){return v.map(t=>t.slice()) as Tube[];}
function difficulty(level:number){return level<=3?3:level<=7?4:level<=14?5:6;}
function discoveredTarget(level:number){return Math.min(DISCOVERY.length,3+Math.floor((level-1)/2));}
function unlock(){
  const n=discoveredTarget(P.level);
  for(let i=0;i<n;i++) if(!P.discovered.includes(DISCOVERY[i])) P.discovered.push(DISCOVERY[i]);
}
function chooseSymbols(level:number):SymbolKey[]{
  unlock();
  const count=Math.min(difficulty(level),P.discovered.length);
  const r=rng(level*9176+31);
  const pool=P.discovered.slice();
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  return pool.slice(0,count);
}

function generate(level:number, seedValue:number){
  currentSymbols=chooseSymbols(level);
  const r=rng(level*99991+seedValue*17+71);
  const T:Tube[]=currentSymbols.map(s=>Array(CAP).fill(s) as Tube);
  T.push([]);
  const inverse:[number,number][]=[];
  const scrambleSteps=Math.min(36,10+level*2+currentSymbols.length*2);
  let guard=0;
  for(let step=0;step<scrambleSteps && guard<scrambleSteps*20;guard++){
    const sources=T.map((t,i)=>({t,i})).filter(x=>x.t.length>0);
    const src=sources[Math.floor(r()*sources.length)]?.i;
    const dests=T.map((t,i)=>({t,i})).filter(x=>x.i!==src&&x.t.length<CAP);
    if(src===undefined||!dests.length) continue;
    const dst=dests[Math.floor(r()*dests.length)].i;
    const color=T[src][T[src].length-1];
    const dstTop=T[dst][T[dst].length-1];
    if(dstTop===color && r()<0.8) continue;
    T[dst].push(T[src].pop()!);
    inverse.push([dst,src]);
    step++;
  }
  solution=inverse.reverse();
  return T;
}

function topRun(t:Tube){if(!t.length)return 0;const x=t[t.length-1];let n=1;for(let i=t.length-2;i>=0&&t[i]===x;i--)n++;return n;}
function legal(a:number,b:number){
  if(a===b||a<0||b<0||!tubes[a]?.length||!tubes[b]||tubes[b].length>=CAP)return 0;
  const color=tubes[a][tubes[a].length-1], target=tubes[b];
  if(target.length&&target[target.length-1]!==color)return 0;
  return Math.min(topRun(tubes[a]),CAP-target.length);
}
function solved(){return tubes.every(t=>t.length===0||(t.length===CAP&&t.every(x=>x===t[0])));}

let app:Application;
let root:Container;
let boardW=360, boardH=360;
let resizeRaf=0;

async function initPixi(){
  app=new Application();
  await app.init({
    backgroundAlpha:0,
    antialias:true,
    resolution:Math.min(window.devicePixelRatio||1,2),
    autoDensity:true,
    preference:'webgl',
    powerPreference:'high-performance',
    autoStart:false
  });
  els.board.appendChild(app.canvas);
  app.canvas.setAttribute('aria-label','Ігрове поле ChemLab');
  root=new Container(); app.stage.addChild(root);
  resizeBoard();
  new ResizeObserver(()=>{
    cancelAnimationFrame(resizeRaf);
    resizeRaf=requestAnimationFrame(resizeBoard);
  }).observe(els.board);
}

function resizeBoard(){
  if(!app)return;
  const rect=els.board.getBoundingClientRect();
  boardW=Math.max(280,Math.floor(rect.width));
  const cols=tubes.length>=8?4:tubes.length;
  const rows=Math.ceil(tubes.length/cols);
  boardH=rows>1?520:360;
  app.renderer.resize(boardW,boardH);
  renderBoard();
}

function tubeGeometry(count:number){
  const twoRows=count>=8;
  const cols=twoRows?4:count;
  const gap=twoRows?18:Math.max(8,Math.min(18,(boardW-cols*58)/(cols+1)));
  const maxTube=twoRows?64:Math.min(64,(boardW-gap*(cols+1))/cols);
  const tubeW=Math.max(48,maxTube);
  const tubeH=tubeW*3.35;
  const total=cols*tubeW+(cols-1)*gap;
  return {twoRows,cols,gap,tubeW,tubeH,startX:(boardW-total)/2};
}

function drawTube(tube:Tube,index:number,g:ReturnType<typeof tubeGeometry>){
  const row=g.twoRows?Math.floor(index/g.cols):0;
  const col=index%g.cols;
  const x=g.startX+col*(g.tubeW+g.gap);
  const y=34+row*(g.tubeH+34);
  const c=new Container(); c.x=x; c.y=y; c.eventMode='static'; c.cursor='pointer';
  c.on('pointertap',()=>tap(index));

  const shadow=new Graphics().ellipse(g.tubeW/2,g.tubeH+11,g.tubeW*.52,9).fill({color:0x000000,alpha:.35});
  c.addChild(shadow);

  const glass=new Graphics()
    .roundRect(1,5,g.tubeW-2,g.tubeH-6,g.tubeW*.34)
    .fill({color:0x061523,alpha:.42})
    .stroke({color:selected===index?0x54e7ff:0xcfeeff,width:selected===index?3:2,alpha:selected===index?1:.92});
  c.addChild(glass);

  const inner=new Graphics().roundRect(7,12,g.tubeW-14,g.tubeH-22,g.tubeW*.25).fill({color:0x00101d,alpha:.52});
  c.addChild(inner);

  const slotH=(g.tubeH-32)/CAP;
  tube.forEach((sym,i)=>{
    const bottom=g.tubeH-13-i*slotH;
    const ly=bottom-slotH+3;
    const liquid=new Graphics()
      .roundRect(8,ly,g.tubeW-16,slotH-2,Math.min(10,g.tubeW*.16))
      .fill({color:COLORS[sym],alpha:.94})
      .stroke({color:0xffffff,width:1,alpha:.2});
    liquid.ellipse(g.tubeW/2,ly+2,(g.tubeW-18)/2,3.5).fill({color:0xffffff,alpha:.22});
    c.addChild(liquid);

    const label=new Text({text:sym,style:new TextStyle({fontFamily:'Inter, system-ui, sans-serif',fontSize:Math.max(15,g.tubeW*.32),fontWeight:'800',fill:0x07131d,align:'center'})});
    label.anchor.set(.5); label.x=g.tubeW/2; label.y=ly+(slotH-2)/2+1; c.addChild(label);
  });

  const highlight=new Graphics().roundRect(7,19,3,g.tubeH-50,2).fill({color:0xffffff,alpha:.62}); c.addChild(highlight);
  const rim=new Graphics()
    .ellipse(g.tubeW/2,6,g.tubeW*.58,8)
    .fill({color:0x06101a,alpha:.96})
    .stroke({color:0xe8f8ff,width:3,alpha:.98});
  rim.ellipse(g.tubeW/2,5.5,g.tubeW*.43,4.5).stroke({color:0x6ccfff,width:1.2,alpha:.55});
  c.addChild(rim);

  root.addChild(c);
}

function renderBoard(){
  if(!root)return;
  const old=root.removeChildren();
  old.forEach(child=>child.destroy({children:true}));
  const g=tubeGeometry(tubes.length);
  tubes.forEach((t,i)=>drawTube(t,i,g));
  app.renderer.render(app.stage);
}

function renderHud(){
  els.level.textContent=`Дослід ${P.level}`;
  els.sub.textContent=`${P.discovered.length}/118 · ${currentSymbols.join(' · ')}`;
  els.moves.textContent=String(moves);
  els.gold.textContent=String(P.gold); els.nug.textContent=String(P.nug);
  const ranks=[{x:0,n:'Учень лабораторії'},{x:180,n:'Лаборант'},{x:500,n:'Хімік'},{x:1200,n:'Дослідник'}];
  let r=ranks[0],next=ranks[1]; for(let i=0;i<ranks.length;i++)if(P.xp>=ranks[i].x){r=ranks[i];next=ranks[i+1]||ranks[i];}
  $('rankName').textContent=r.n;
  const pct=next.x===r.x?100:Math.min(100,(P.xp-r.x)/(next.x-r.x)*100); els.xpFill.style.width=`${pct}%`; els.xp.textContent=next.x===r.x?`${P.xp} XP`:`${P.xp} / ${next.x} XP`;
  els.goal.textContent=P.level<4?'Збери 4 однакові елементи в одній пробірці':'Розділи всі елементи, використавши мінімум вільного простору';
}

function render(){renderHud();renderBoard();}

function start(level:number,newSeed:number){
  P.level=Math.max(1,level); seed=newSeed||1; selected=-1; history=[]; extraUsed=false;
  tubes=generate(P.level,seed);
  moves=Math.max(10,solution.length+(P.level<5?7:P.level<10?5:4));
  els.win.classList.remove('show'); els.lose.classList.remove('show');
  save(); render(); resizeBoard();
}

function tap(i:number){
  if(selected<0){if(tubes[i].length){selected=i;renderBoard();}return;}
  if(selected===i){selected=-1;renderBoard();return;}
  const n=legal(selected,i);
  if(!n){if(tubes[i].length){selected=i;renderBoard();}else toast('Сюди зараз не можна перелити');return;}
  history.push({tubes:cloneTubes(tubes),moves}); if(history.length>20)history.shift();
  const from=selected; selected=-1;
  for(let k=0;k<n;k++)tubes[i].push(tubes[from].pop()!);
  moves--; render();
  if(solved())win(); else if(moves<=0)lose();
}

function win(){
  const reward=50+P.level*5; const xp=25+P.level*2;
  P.gold+=reward;P.xp+=xp;P.score+=reward*10;save();
  els.winReward.textContent=`+${reward} кредитів · +${xp} XP`; els.win.classList.add('show');
}
function lose(){els.lose.classList.add('show');}

function hint(){
  const pair=solution.find(([a,b])=>a<tubes.length&&b<tubes.length&&legal(a,b)>0);
  if(pair)toast(`Підказка: пробірка ${pair[0]+1} → ${pair[1]+1}`); else toast('Знайди пару однакових верхніх елементів');
}

els.undo.addEventListener('click',()=>{const h=history.pop();if(!h)return toast('Немає ходу для скасування');tubes=cloneTubes(h.tubes);moves=h.moves;selected=-1;render();});
els.shuffle.addEventListener('click',()=>{seed=(Date.now()%100000)||1;tubes=generate(P.level,seed);moves=Math.max(10,solution.length+5);history=[];selected=-1;render();toast('Нова прохідна комбінація');});
els.addTube.addEventListener('click',()=>{if(extraUsed)return toast('Резервну пробірку вже використано');tubes.push([]);extraUsed=true;render();resizeBoard();});
els.hint.addEventListener('click',hint);
els.next.addEventListener('click',()=>start(P.level+1,(Date.now()%100000)||1));
els.retrySame.addEventListener('click',()=>start(P.level,seed));
els.retryNew.addEventListener('click',()=>start(P.level,(Date.now()%100000)||1));
els.synth.addEventListener('click',()=>toast('Синтез зафіксовано в лабораторному журналі'));
$('settings').addEventListener('click',()=>$('settingsPanel').classList.add('show'));
$('closeSettings').addEventListener('click',()=>$('settingsPanel').classList.remove('show'));

await initPixi();
start(P.level,(Date.now()%100000)||1);