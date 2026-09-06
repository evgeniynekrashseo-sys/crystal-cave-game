import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import './style.css';
import './v52.css';

type SymbolKey = 'Na'|'Cl'|'Fe'|'O'|'C'|'H'|'Au'|'Li'|'He'|'Be'|'B'|'N'|'F'|'Ne'|'Mg'|'Al'|'Si'|'P'|'S';
type Tube = SymbolKey[];
type Persisted = {level:number;gold:number;nug:number;xp:number;score:number;discovered:SymbolKey[];streak?:number;bestStreak?:number};

const CAP=4;
const DISCOVERY:SymbolKey[]=['Na','Cl','Fe','O','C','H','Au','Li','He','Be','B','N','F','Ne','Mg','Al','Si','P','S'];
const COLORS:Record<SymbolKey,number>={Na:0xff4f73,Cl:0x35ef88,Fe:0xffc72f,O:0x27cfff,C:0xb56cff,H:0x50e8f1,Au:0xffd83d,Li:0x37ef75,He:0x82e64a,Be:0x4ee4dc,B:0xff71b6,N:0x76a3ff,F:0xc2ff61,Ne:0xff9857,Mg:0x74cdff,Al:0xb6c3d2,Si:0xbf89ff,P:0xff8667,S:0xffe85d};
const $=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
const els={level:$('levelTitle'),sub:$('levelSub'),moves:$('moves'),gold:$('gold'),nug:$('nugget'),xp:$('xpText'),xpFill:$('xpFill'),board:$('gameCanvas'),goal:$('goalText'),toast:$('toast'),win:$('win'),lose:$('lose'),winReward:$('winReward'),next:$('next'),retrySame:$('retrySame'),retryNew:$('retryNew'),undo:$('undo'),shuffle:$('shuffle'),addTube:$('addTube'),hint:$('hintBtn'),synth:$('station')};

function readState():Persisted{
  const fallback:Persisted={level:1,gold:0,nug:0,xp:0,score:0,discovered:['Na','Cl','Fe'],streak:0,bestStreak:0};
  try{
    const v50=JSON.parse(localStorage.getItem('chemlab_v50')||'null');
    if(v50)return{...fallback,...v50};
    const legacy=JSON.parse(localStorage.getItem('cl27_state')||'null');
    if(legacy)return{...fallback,level:+legacy.level||1,gold:+legacy.gold||0,nug:+legacy.nug||0,xp:+legacy.xp||0,score:+legacy.score||0,discovered:Array.isArray(legacy.discovered)&&legacy.discovered.length?legacy.discovered:['Na','Cl','Fe']};
  }catch{}
  return fallback;
}
const P=readState();
let tubes:Tube[]=[],selected=-1,moves=0,seed=0,solution:[number,number][]=[],history:{tubes:Tube[];moves:number}[]=[],extraUsed=false,currentSymbols:SymbolKey[]=[];
let app:Application,root:Container,boardW=360,boardH=470,resizeRaf=0,inputLocked=false,tubeViews:Container[]=[];
let soundOn=localStorage.getItem('chemlab_sound')!=='off';

function save(){
  localStorage.setItem('chemlab_v50',JSON.stringify(P));
  try{const legacy=JSON.parse(localStorage.getItem('cl27_state')||'{}');localStorage.setItem('cl27_state',JSON.stringify({...legacy,level:P.level,gold:P.gold,nug:P.nug,xp:P.xp,score:P.score,discovered:P.discovered}))}catch{}
}
function toast(msg:string,ms=1700){els.toast.textContent=msg;els.toast.classList.add('show');window.clearTimeout((toast as any)._t);(toast as any)._t=window.setTimeout(()=>els.toast.classList.remove('show'),ms)}
function rng(seedValue:number){let x=(seedValue|0)||123456789;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
function cloneTubes(v:Tube[]){return v.map(t=>t.slice()) as Tube[]}
function difficulty(level:number){return level<=3?3:level<=7?4:level<=14?5:6}
function discoveredTarget(level:number){return Math.min(DISCOVERY.length,3+Math.floor((level-1)/2))}
function unlockForLevel(level:number){const added:SymbolKey[]=[];const n=discoveredTarget(level);for(let i=0;i<n;i++)if(!P.discovered.includes(DISCOVERY[i])){P.discovered.push(DISCOVERY[i]);added.push(DISCOVERY[i])}return added}
function chooseSymbols(level:number):SymbolKey[]{unlockForLevel(level);const count=Math.min(difficulty(level),P.discovered.length),r=rng(level*9176+seed*31+31),pool=P.discovered.slice();for(let i=pool.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}return pool.slice(0,count)}

function simulateSolution(start:Tube[],path:[number,number][]){
  const sim=cloneTubes(start);
  const topRunAt=(t:Tube)=>{if(!t.length)return 0;const x=t[t.length-1];let n=1;for(let i=t.length-2;i>=0&&t[i]===x;i--)n++;return n};
  for(const [a,b] of path){if(!sim[a]?.length||!sim[b]||sim[b].length>=CAP)return false;const color=sim[a][sim[a].length-1];if(sim[b].length&&sim[b][sim[b].length-1]!==color)return false;const n=Math.min(topRunAt(sim[a]),CAP-sim[b].length);if(!n)return false;for(let k=0;k<n;k++)sim[b].push(sim[a].pop()!)}
  return sim.every(t=>t.length===0||(t.length===CAP&&t.every(x=>x===t[0])));
}
function generate(level:number,seedValue:number){
  seed=seedValue||1;currentSymbols=chooseSymbols(level);const r=rng(level*99991+seed*17+71),order=currentSymbols.slice();for(let i=order.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[order[i],order[j]]=[order[j],order[i]]}
  const chunk=level<=3?1:level<=9?2:(level%3===0?1:2),T:Tube[]=order.map(s=>Array(CAP).fill(s) as Tube);T.push([]);const buffer=T.length-1,reverse:[number,number][]=[];
  for(let k=0;k<chunk;k++)T[buffer].push(T[0].pop()!);reverse.unshift([buffer,0]);
  for(let i=1;i<order.length;i++){for(let k=0;k<chunk;k++)T[i-1].push(T[i].pop()!);reverse.unshift([i-1,i])}
  solution=reverse;
  if(!simulateSolution(T,solution)){const safe:Tube[]=order.map(s=>Array(CAP).fill(s) as Tube);safe.push([]);const b=safe.length-1;safe[b].push(safe[0].pop()!);solution=[[b,0]];return safe}
  return T;
}
function topRun(t:Tube){if(!t.length)return 0;const x=t[t.length-1];let n=1;for(let i=t.length-2;i>=0&&t[i]===x;i--)n++;return n}
function legal(a:number,b:number){if(a===b||a<0||b<0||!tubes[a]?.length||!tubes[b]||tubes[b].length>=CAP)return 0;const color=tubes[a][tubes[a].length-1],target=tubes[b];if(target.length&&target[target.length-1]!==color)return 0;return Math.min(topRun(tubes[a]),CAP-target.length)}
function solved(){return tubes.every(t=>t.length===0||(t.length===CAP&&t.every(x=>x===t[0])))}
function completedTube(i:number){const t=tubes[i];return t.length===CAP&&t.every(x=>x===t[0])}

async function initPixi(){app=new Application();await app.init({backgroundAlpha:0,antialias:true,resolution:Math.min(window.devicePixelRatio||1,2),autoDensity:true,preference:'webgl',powerPreference:'high-performance',autoStart:false});els.board.appendChild(app.canvas);app.canvas.setAttribute('aria-label','Ігрове поле ChemLab');root=new Container();app.stage.addChild(root);resizeBoard();new ResizeObserver(()=>{cancelAnimationFrame(resizeRaf);resizeRaf=requestAnimationFrame(resizeBoard)}).observe(els.board)}
function resizeBoard(){if(!app)return;const rect=els.board.getBoundingClientRect();boardW=Math.max(280,Math.floor(rect.width));const cols=tubes.length>=7?4:tubes.length,rows=Math.ceil(tubes.length/cols);boardH=rows>1?620:Math.max(430,Math.round(boardW*1.03));app.renderer.resize(boardW,boardH);renderBoard()}
function tubeGeometry(count:number){const twoRows=count>=7,cols=twoRows?4:count,desired=count<=4?82:count===5?72:count===6?62:64,gap=twoRows?22:Math.max(10,Math.min(24,(boardW-cols*desired)/(cols+1))),tubeW=Math.max(50,Math.min(desired,(boardW-gap*(cols+1))/cols)),tubeH=tubeW*3.5,total=cols*tubeW+(cols-1)*gap;return{twoRows,cols,gap,tubeW,tubeH,startX:(boardW-total)/2}}
function drawLiquid(c:Container,sym:SymbolKey,i:number,g:ReturnType<typeof tubeGeometry>){const slotH=(g.tubeH-38)/CAP,bottom=g.tubeH-16-i*slotH,ly=bottom-slotH+3,w=g.tubeW-18,h=slotH-1,x=9,color=COLORS[sym];const glow=new Graphics().roundRect(x-2,ly-3,w+4,h+6,Math.min(16,g.tubeW*.2)).fill({color,alpha:.16});c.addChild(glow);const liquid=new Graphics().roundRect(x,ly,w,h,Math.min(14,g.tubeW*.18)).fill({color,alpha:.96});liquid.roundRect(x+2,ly+3,w-4,h*.34,Math.min(10,g.tubeW*.14)).fill({color:0xffffff,alpha:.10});liquid.moveTo(x+2,ly+5).bezierCurveTo(x+w*.22,ly-1,x+w*.36,ly+9,x+w*.52,ly+4).bezierCurveTo(x+w*.68,ly-1,x+w*.82,ly+8,x+w-2,ly+3).stroke({color:0xffffff,width:1.4,alpha:.7});liquid.moveTo(x+2,ly+h-3).lineTo(x+w-2,ly+h-3).stroke({color:0x000000,width:1,alpha:.10});c.addChild(liquid);const label=new Text({text:sym,style:new TextStyle({fontFamily:'Inter,system-ui,sans-serif',fontSize:Math.max(18,g.tubeW*.31),fontWeight:'800',fill:0x07131d,align:'center'})});label.anchor.set(.5);label.x=g.tubeW/2;label.y=ly+h/2+2;c.addChild(label)}
function drawTube(tube:Tube,index:number,g:ReturnType<typeof tubeGeometry>){const row=g.twoRows?Math.floor(index/g.cols):0,col=index%g.cols,x=g.startX+col*(g.tubeW+g.gap),y=44+row*(g.tubeH+56),c=new Container();c.x=x;c.y=y;c.eventMode='static';c.cursor='pointer';c.on('pointertap',()=>void tap(index));const auraColor=tube.length?COLORS[tube[0]]:0x765cff;const floorGlow=new Graphics().ellipse(g.tubeW/2,g.tubeH+17,g.tubeW*.58,12).fill({color:auraColor,alpha:tube.length?.20:.14});floorGlow.ellipse(g.tubeW/2,g.tubeH+18,g.tubeW*.38,7).fill({color:0xffffff,alpha:.07});c.addChild(floorGlow);const outerGlow=new Graphics().roundRect(-2,5,g.tubeW+4,g.tubeH-5,g.tubeW*.38).stroke({color:selected===index?0x46eaff:0x5abfff,width:selected===index?5:3,alpha:selected===index?.38:.14});c.addChild(outerGlow);const glass=new Graphics().roundRect(2,7,g.tubeW-4,g.tubeH-8,g.tubeW*.34).fill({color:0x061522,alpha:.30}).stroke({color:selected===index?0x6defff:0xdff5ff,width:selected===index?3.2:2.3,alpha:.96});c.addChild(glass);const inner=new Graphics().roundRect(8,15,g.tubeW-16,g.tubeH-27,g.tubeW*.26).fill({color:0x00101b,alpha:.45});c.addChild(inner);tube.forEach((sym,i)=>drawLiquid(c,sym,i,g));const leftGlow=new Graphics().roundRect(8,24,3.6,g.tubeH-64,2).fill({color:0xffffff,alpha:.72}),rightGlow=new Graphics().roundRect(g.tubeW-11,28,2,g.tubeH-70,2).fill({color:0x7edcff,alpha:.22});c.addChild(leftGlow,rightGlow);const rimGlow=new Graphics().ellipse(g.tubeW/2,8,g.tubeW*.66,10).stroke({color:0x41d7ff,width:6,alpha:.18});c.addChild(rimGlow);const rim=new Graphics().ellipse(g.tubeW/2,8,g.tubeW*.64,10).fill({color:0x06101a,alpha:.98}).stroke({color:0xf2fbff,width:3.2,alpha:1});rim.ellipse(g.tubeW/2,7,g.tubeW*.48,5.4).stroke({color:0x74dfff,width:1.5,alpha:.78});rim.ellipse(g.tubeW/2,5.4,g.tubeW*.57,7.5).stroke({color:0xffffff,width:1.1,alpha:.55});c.addChild(rim);root.addChild(c);tubeViews[index]=c}
function renderBoard(){if(!root)return;const old=root.removeChildren();old.forEach(child=>child.destroy({children:true}));tubeViews=[];const g=tubeGeometry(tubes.length);tubes.forEach((t,i)=>drawTube(t,i,g));app.renderer.render(app.stage)}
function renderHud(){els.level.textContent=`Дослід ${P.level}`;els.sub.textContent=`${P.discovered.length}/118 · ${currentSymbols.join(' · ')}`;els.moves.textContent=String(moves);els.gold.textContent=String(P.gold);els.nug.textContent=String(P.nug);const ranks=[{x:0,n:'Учень лабораторії'},{x:180,n:'Лаборант'},{x:500,n:'Хімік'},{x:1200,n:'Дослідник'},{x:2500,n:'Майстер реакцій'}];let r=ranks[0],next=ranks[1];for(let i=0;i<ranks.length;i++)if(P.xp>=ranks[i].x){r=ranks[i];next=ranks[i+1]||ranks[i]}$('rankName').textContent=r.n;const pct=next.x===r.x?100:Math.min(100,(P.xp-r.x)/(next.x-r.x)*100);els.xpFill.style.width=`${pct}%`;els.xp.textContent=next.x===r.x?`${P.xp} XP`:`${P.xp} / ${next.x} XP`;els.goal.textContent=P.level<4?'Збери 4 однакові елементи в одній пробірці':P.level<10?'Розділи всі елементи, плануючи ходи наперед':'Розв’яжи реакційну послідовність з мінімумом вільного простору';const d=document.getElementById('discoverTag');if(d)d.textContent=`${P.discovered.length}/118`}
function render(){renderHud();renderBoard()}
function playTone(freq:number,duration=.07,volume=.025){if(!soundOn)return;try{const C=(window.AudioContext||(window as any).webkitAudioContext);if(!C)return;const ctx=(playTone as any)._ctx||((playTone as any)._ctx=new C()),o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=freq;o.type='sine';g.gain.value=volume;o.connect(g);g.connect(ctx.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);o.stop(ctx.currentTime+duration)}catch{}}
function haptic(ms=12){try{navigator.vibrate?.(ms)}catch{}}
function tween(ms:number,step:(p:number)=>void){return new Promise<void>(resolve=>{const start=performance.now();const frame=(now:number)=>{const p=Math.min(1,(now-start)/ms),e=1-Math.pow(1-p,3);step(e);app.renderer.render(app.stage);if(p<1)requestAnimationFrame(frame);else resolve()};requestAnimationFrame(frame)})}
async function animatePour(from:number,to:number,color:number){const src=tubeViews[from],dst=tubeViews[to];if(!src||!dst)return;const sx=src.x,sy=src.y,dx=dst.x,dy=dst.y,dir=dx>=sx?1:-1,stream=new Graphics();root.addChild(stream);await tween(150,p=>{src.x=sx+(dx-sx)*.42*p;src.y=sy-34*p;src.rotation=dir*.32*p});stream.clear();stream.moveTo(src.x+(dir>0?52:10),src.y+26).lineTo(dx+32,dy+20).stroke({color,width:5,alpha:.82});app.renderer.render(app.stage);playTone(560,.08,.02);haptic(10);await new Promise(r=>setTimeout(r,90));stream.destroy();await tween(130,p=>{src.x=(sx+(dx-sx)*.42)+(sx-(sx+(dx-sx)*.42))*p;src.y=(sy-34)+(sy-(sy-34))*p;src.rotation=dir*.32*(1-p)})}
async function flashTube(index:number){const c=tubeViews[index];if(!c)return;const ring=new Graphics().roundRect(-5,2,c.width+10,c.height-2,24).stroke({color:0x62f4ff,width:4,alpha:.9});c.addChild(ring);playTone(820,.12,.03);haptic(18);await tween(260,p=>{ring.alpha=1-p;ring.scale.set(1+p*.05);ring.x=-p*2;ring.y=-p*3});ring.destroy();app.renderer.render(app.stage)}
function start(level:number,newSeed:number){P.level=Math.max(1,level);seed=newSeed||1;selected=-1;history=[];extraUsed=false;inputLocked=false;const before=P.discovered.length;tubes=generate(P.level,seed);moves=Math.max(9,solution.length+(P.level<5?6:P.level<10?4:3));els.win.classList.remove('show');els.lose.classList.remove('show');save();render();resizeBoard();if(P.discovered.length>before){const unlocked=P.discovered[P.discovered.length-1];setTimeout(()=>{toast(`Відкрито новий елемент: ${unlocked}`,2200);playTone(920,.16,.035)},250)}}
async function tap(i:number){if(inputLocked)return;if(selected<0){if(tubes[i].length){selected=i;renderBoard();playTone(310,.04,.012)}return}if(selected===i){selected=-1;renderBoard();return}const n=legal(selected,i);if(!n){if(tubes[i].length){selected=i;renderBoard()}else toast('Сюди зараз не можна перелити');playTone(170,.05,.012);return}history.push({tubes:cloneTubes(tubes),moves});if(history.length>30)history.shift();const from=selected,color=COLORS[tubes[from][tubes[from].length-1]];selected=-1;inputLocked=true;await animatePour(from,i,color);for(let k=0;k<n;k++)tubes[i].push(tubes[from].pop()!);moves--;P.streak=(P.streak||0)+1;P.bestStreak=Math.max(P.bestStreak||0,P.streak);render();if(completedTube(i))await flashTube(i);inputLocked=false;if(solved())win();else if(moves<=0)lose()}
function win(){const efficiency=Math.max(0,moves),streakBonus=Math.min(25,(P.streak||0)*2),reward=50+P.level*5+Math.min(30,efficiency*2)+streakBonus,xp=25+P.level*2+Math.min(20,efficiency);P.gold+=reward;P.xp+=xp;P.score+=reward*10;P.streak=0;save();els.winReward.textContent=`+${reward} кредитів · +${xp} XP${efficiency>=4?' · Ідеальна серія':''}`;playTone(1040,.22,.04);haptic(28);setTimeout(()=>els.win.classList.add('show'),180)}
function lose(){P.streak=0;save();els.lose.classList.add('show');playTone(120,.16,.025)}
function hint(){const pair=solution.find(([a,b])=>a<tubes.length&&b<tubes.length&&legal(a,b)>0);if(pair)toast(`Підказка: пробірка ${pair[0]+1} → ${pair[1]+1}`);else{for(let a=0;a<tubes.length;a++)for(let b=0;b<tubes.length;b++)if(legal(a,b)){toast(`Підказка: пробірка ${a+1} → ${b+1}`);return}toast('Спробуй звільнити верхній елемент')}}

els.undo.addEventListener('click',()=>{if(inputLocked)return;const h=history.pop();if(!h)return toast('Немає ходу для скасування');tubes=cloneTubes(h.tubes);moves=h.moves;P.streak=Math.max(0,(P.streak||0)-1);selected=-1;render()});
els.shuffle.addEventListener('click',()=>{if(inputLocked)return;seed=(Date.now()%100000)||1;tubes=generate(P.level,seed);moves=Math.max(9,solution.length+(P.level<5?6:4));history=[];selected=-1;P.streak=0;render();toast('Нова гарантовано прохідна комбінація')});
els.addTube.addEventListener('click',()=>{if(inputLocked)return;if(extraUsed)return toast('Резервну пробірку вже використано');tubes.push([]);extraUsed=true;render();resizeBoard();toast('Резервна пробірка активована')});
els.hint.addEventListener('click',hint);
els.next.addEventListener('click',()=>start(P.level+1,(Date.now()%100000)||1));
els.retrySame.addEventListener('click',()=>start(P.level,seed));
els.retryNew.addEventListener('click',()=>start(P.level,(Date.now()%100000)||1));
els.synth.addEventListener('click',()=>{P.xp+=2;save();renderHud();toast('Реакцію записано в лабораторний журнал · +2 XP');playTone(700,.08,.02)});
$('settings').addEventListener('click',()=>$('settingsPanel').classList.add('show'));
$('closeSettings').addEventListener('click',()=>$('settingsPanel').classList.remove('show'));
const sound=document.getElementById('sound');sound?.addEventListener('click',()=>{soundOn=!soundOn;localStorage.setItem('chemlab_sound',soundOn?'on':'off');sound.textContent=soundOn?'🔊':'🔇';toast(soundOn?'Звук увімкнено':'Звук вимкнено')});
document.getElementById('hub')?.addEventListener('click',()=>toast(`Лабораторія · відкрито ${P.discovered.length}/118 · рекорд серії ${P.bestStreak||0}`,2200));
window.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='u')els.undo.click();if(e.key.toLowerCase()==='r')els.shuffle.click();if(e.key.toLowerCase()==='h')els.hint.click()});

await initPixi();
start(P.level,(Date.now()%100000)||1);