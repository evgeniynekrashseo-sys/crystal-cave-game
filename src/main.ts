import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import './style.css';
import './v52.css';

type SymbolKey = 'Na'|'Cl'|'Fe'|'O'|'C'|'H'|'Au'|'Li'|'He'|'Be'|'B'|'N'|'F'|'Ne'|'Mg'|'Al'|'Si'|'P'|'S';
type Tube = SymbolKey[];
type Persisted = {level:number;gold:number;nug:number;xp:number;score:number;discovered:SymbolKey[]};

const CAP=4;
const DISCOVERY:SymbolKey[]=['Na','Cl','Fe','O','C','H','Au','Li','He','Be','B','N','F','Ne','Mg','Al','Si','P','S'];
const COLORS:Record<SymbolKey,number>={Na:0xff4f73,Cl:0x35ef88,Fe:0xffc72f,O:0x27cfff,C:0xb56cff,H:0x50e8f1,Au:0xffd83d,Li:0x37ef75,He:0x82e64a,Be:0x4ee4dc,B:0xff71b6,N:0x76a3ff,F:0xc2ff61,Ne:0xff9857,Mg:0x74cdff,Al:0xb6c3d2,Si:0xbf89ff,P:0xff8667,S:0xffe85d};
const $=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
const els={level:$('levelTitle'),sub:$('levelSub'),moves:$('moves'),gold:$('gold'),nug:$('nugget'),xp:$('xpText'),xpFill:$('xpFill'),board:$('gameCanvas'),goal:$('goalText'),toast:$('toast'),win:$('win'),lose:$('lose'),winReward:$('winReward'),next:$('next'),retrySame:$('retrySame'),retryNew:$('retryNew'),undo:$('undo'),shuffle:$('shuffle'),addTube:$('addTube'),hint:$('hintBtn'),synth:$('station')};

function readState():Persisted{const fallback:Persisted={level:1,gold:0,nug:0,xp:0,score:0,discovered:['Na','Cl','Fe']};try{const v50=JSON.parse(localStorage.getItem('chemlab_v50')||'null');if(v50)return{...fallback,...v50};const legacy=JSON.parse(localStorage.getItem('cl27_state')||'null');if(legacy)return{level:+legacy.level||1,gold:+legacy.gold||0,nug:+legacy.nug||0,xp:+legacy.xp||0,score:+legacy.score||0,discovered:Array.isArray(legacy.discovered)&&legacy.discovered.length?legacy.discovered:['Na','Cl','Fe']}}catch{}return fallback}
const P=readState();
let tubes:Tube[]=[],selected=-1,moves=0,seed=0,solution:[number,number][]=[],history:{tubes:Tube[];moves:number}[]=[],extraUsed=false,currentSymbols:SymbolKey[]=[];
function save(){localStorage.setItem('chemlab_v50',JSON.stringify(P));try{const legacy=JSON.parse(localStorage.getItem('cl27_state')||'{}');localStorage.setItem('cl27_state',JSON.stringify({...legacy,level:P.level,gold:P.gold,nug:P.nug,xp:P.xp,score:P.score,discovered:P.discovered}))}catch{}}
function toast(msg:string){els.toast.textContent=msg;els.toast.classList.add('show');window.clearTimeout((toast as any)._t);(toast as any)._t=window.setTimeout(()=>els.toast.classList.remove('show'),1700)}
function rng(seedValue:number){let x=(seedValue|0)||123456789;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
function cloneTubes(v:Tube[]){return v.map(t=>t.slice()) as Tube[]}
function difficulty(level:number){return level<=3?3:level<=7?4:level<=14?5:6}
function discoveredTarget(level:number){return Math.min(DISCOVERY.length,3+Math.floor((level-1)/2))}
function unlock(){const n=discoveredTarget(P.level);for(let i=0;i<n;i++)if(!P.discovered.includes(DISCOVERY[i]))P.discovered.push(DISCOVERY[i])}
function chooseSymbols(level:number):SymbolKey[]{unlock();const count=Math.min(difficulty(level),P.discovered.length),r=rng(level*9176+31),pool=P.discovered.slice();for(let i=pool.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}return pool.slice(0,count)}
function generate(level:number,seedValue:number){currentSymbols=chooseSymbols(level);const r=rng(level*99991+seedValue*17+71),T:Tube[]=currentSymbols.map(s=>Array(CAP).fill(s) as Tube);T.push([]);const inverse:[number,number][]=[];const scrambleSteps=Math.min(36,10+level*2+currentSymbols.length*2);let guard=0;for(let step=0;step<scrambleSteps&&guard<scrambleSteps*20;guard++){const sources=T.map((t,i)=>({t,i})).filter(x=>x.t.length>0),src=sources[Math.floor(r()*sources.length)]?.i,dests=T.map((t,i)=>({t,i})).filter(x=>x.i!==src&&x.t.length<CAP);if(src===undefined||!dests.length)continue;const dst=dests[Math.floor(r()*dests.length)].i,color=T[src][T[src].length-1],dstTop=T[dst][T[dst].length-1];if(dstTop===color&&r()<.8)continue;T[dst].push(T[src].pop()!);inverse.push([dst,src]);step++}solution=inverse.reverse();return T}
function topRun(t:Tube){if(!t.length)return 0;const x=t[t.length-1];let n=1;for(let i=t.length-2;i>=0&&t[i]===x;i--)n++;return n}
function legal(a:number,b:number){if(a===b||a<0||b<0||!tubes[a]?.length||!tubes[b]||tubes[b].length>=CAP)return 0;const color=tubes[a][tubes[a].length-1],target=tubes[b];if(target.length&&target[target.length-1]!==color)return 0;return Math.min(topRun(tubes[a]),CAP-target.length)}
function solved(){return tubes.every(t=>t.length===0||(t.length===CAP&&t.every(x=>x===t[0])))}

let app:Application,root:Container,boardW=360,boardH=470,resizeRaf=0;
async function initPixi(){app=new Application();await app.init({backgroundAlpha:0,antialias:true,resolution:Math.min(window.devicePixelRatio||1,2),autoDensity:true,preference:'webgl',powerPreference:'high-performance',autoStart:false});els.board.appendChild(app.canvas);app.canvas.setAttribute('aria-label','Ігрове поле ChemLab');root=new Container();app.stage.addChild(root);resizeBoard();new ResizeObserver(()=>{cancelAnimationFrame(resizeRaf);resizeRaf=requestAnimationFrame(resizeBoard)}).observe(els.board)}
function resizeBoard(){if(!app)return;const rect=els.board.getBoundingClientRect();boardW=Math.max(280,Math.floor(rect.width));const cols=tubes.length>=8?4:tubes.length,rows=Math.ceil(tubes.length/cols);boardH=rows>1?620:Math.max(430,Math.round(boardW*1.03));app.renderer.resize(boardW,boardH);renderBoard()}
function tubeGeometry(count:number){const twoRows=count>=8,cols=twoRows?4:count;const desired=count<=4?82:count===5?72:count===6?62:56;const gap=twoRows?22:Math.max(10,Math.min(24,(boardW-cols*desired)/(cols+1)));const tubeW=Math.max(50,Math.min(desired,(boardW-gap*(cols+1))/cols));const tubeH=tubeW*3.5,total=cols*tubeW+(cols-1)*gap;return{twoRows,cols,gap,tubeW,tubeH,startX:(boardW-total)/2}}

function drawLiquid(c:Container,sym:SymbolKey,i:number,g:ReturnType<typeof tubeGeometry>){const slotH=(g.tubeH-38)/CAP;const bottom=g.tubeH-16-i*slotH,ly=bottom-slotH+3,w=g.tubeW-18,h=slotH-1,x=9,color=COLORS[sym];
  const glow=new Graphics().roundRect(x-2,ly-3,w+4,h+6,Math.min(16,g.tubeW*.2)).fill({color,alpha:.16});c.addChild(glow);
  const liquid=new Graphics().roundRect(x,ly,w,h,Math.min(14,g.tubeW*.18)).fill({color,alpha:.96});
  liquid.roundRect(x+2,ly+3,w-4,h*.34,Math.min(10,g.tubeW*.14)).fill({color:0xffffff,alpha:.10});
  liquid.moveTo(x+2,ly+5).bezierCurveTo(x+w*.22,ly-1,x+w*.36,ly+9,x+w*.52,ly+4).bezierCurveTo(x+w*.68,ly-1,x+w*.82,ly+8,x+w-2,ly+3).stroke({color:0xffffff,width:1.4,alpha:.7});
  liquid.moveTo(x+2,ly+h-3).lineTo(x+w-2,ly+h-3).stroke({color:0x000000,width:1,alpha:.10});c.addChild(liquid);
  const label=new Text({text:sym,style:new TextStyle({fontFamily:'Inter,system-ui,sans-serif',fontSize:Math.max(18,g.tubeW*.31),fontWeight:'800',fill:0x07131d,align:'center'})});label.anchor.set(.5);label.x=g.tubeW/2;label.y=ly+h/2+2;c.addChild(label)}

function drawTube(tube:Tube,index:number,g:ReturnType<typeof tubeGeometry>){const row=g.twoRows?Math.floor(index/g.cols):0,col=index%g.cols,x=g.startX+col*(g.tubeW+g.gap),y=44+row*(g.tubeH+56);const c=new Container();c.x=x;c.y=y;c.eventMode='static';c.cursor='pointer';c.on('pointertap',()=>tap(index));
  const auraColor=tube.length?COLORS[tube[0]]:0x765cff;const floorGlow=new Graphics().ellipse(g.tubeW/2,g.tubeH+17,g.tubeW*.58,12).fill({color:auraColor,alpha:tube.length?.20:.14});floorGlow.ellipse(g.tubeW/2,g.tubeH+18,g.tubeW*.38,7).fill({color:0xffffff,alpha:.07});c.addChild(floorGlow);
  const outerGlow=new Graphics().roundRect(-2,5,g.tubeW+4,g.tubeH-5,g.tubeW*.38).stroke({color:selected===index?0x46eaff:0x5abfff,width:selected===index?5:3,alpha:selected===index?.38:.14});c.addChild(outerGlow);
  const glass=new Graphics().roundRect(2,7,g.tubeW-4,g.tubeH-8,g.tubeW*.34).fill({color:0x061522,alpha:.30}).stroke({color:selected===index?0x6defff:0xdff5ff,width:selected===index?3.2:2.3,alpha:.96});c.addChild(glass);
  const inner=new Graphics().roundRect(8,15,g.tubeW-16,g.tubeH-27,g.tubeW*.26).fill({color:0x00101b,alpha:.45});c.addChild(inner);
  tube.forEach((sym,i)=>drawLiquid(c,sym,i,g));
  const leftGlow=new Graphics().roundRect(8,24,3.6,g.tubeH-64,2).fill({color:0xffffff,alpha:.72});const rightGlow=new Graphics().roundRect(g.tubeW-11,28,2,g.tubeH-70,2).fill({color:0x7edcff,alpha:.22});c.addChild(leftGlow,rightGlow);
  const rimGlow=new Graphics().ellipse(g.tubeW/2,8,g.tubeW*.66,10).stroke({color:0x41d7ff,width:6,alpha:.18});c.addChild(rimGlow);
  const rim=new Graphics().ellipse(g.tubeW/2,8,g.tubeW*.64,10).fill({color:0x06101a,alpha:.98}).stroke({color:0xf2fbff,width:3.2,alpha:1});rim.ellipse(g.tubeW/2,7,g.tubeW*.48,5.4).stroke({color:0x74dfff,width:1.5,alpha:.78});rim.ellipse(g.tubeW/2,5.4,g.tubeW*.57,7.5).stroke({color:0xffffff,width:1.1,alpha:.55});c.addChild(rim);root.addChild(c)}

function renderBoard(){if(!root)return;const old=root.removeChildren();old.forEach(child=>child.destroy({children:true}));const g=tubeGeometry(tubes.length);tubes.forEach((t,i)=>drawTube(t,i,g));app.renderer.render(app.stage)}
function renderHud(){els.level.textContent=`Дослід ${P.level}`;els.sub.textContent=`${P.discovered.length}/118 · ${currentSymbols.join(' · ')}`;els.moves.textContent=String(moves);els.gold.textContent=String(P.gold);els.nug.textContent=String(P.nug);const ranks=[{x:0,n:'Учень лабораторії'},{x:180,n:'Лаборант'},{x:500,n:'Хімік'},{x:1200,n:'Дослідник'}];let r=ranks[0],next=ranks[1];for(let i=0;i<ranks.length;i++)if(P.xp>=ranks[i].x){r=ranks[i];next=ranks[i+1]||ranks[i]}$('rankName').textContent=r.n;const pct=next.x===r.x?100:Math.min(100,(P.xp-r.x)/(next.x-r.x)*100);els.xpFill.style.width=`${pct}%`;els.xp.textContent=next.x===r.x?`${P.xp} XP`:`${P.xp} / ${next.x} XP`;els.goal.textContent=P.level<4?'Збери 4 однакові елементи в одній пробірці':'Розділи всі елементи, використавши мінімум вільного простору'}
function render(){renderHud();renderBoard()}
function start(level:number,newSeed:number){P.level=Math.max(1,level);seed=newSeed||1;selected=-1;history=[];extraUsed=false;tubes=generate(P.level,seed);moves=Math.max(10,solution.length+(P.level<5?7:P.level<10?5:4));els.win.classList.remove('show');els.lose.classList.remove('show');save();render();resizeBoard()}
function tap(i:number){if(selected<0){if(tubes[i].length){selected=i;renderBoard()}return}if(selected===i){selected=-1;renderBoard();return}const n=legal(selected,i);if(!n){if(tubes[i].length){selected=i;renderBoard()}else toast('Сюди зараз не можна перелити');return}history.push({tubes:cloneTubes(tubes),moves});if(history.length>20)history.shift();const from=selected;selected=-1;for(let k=0;k<n;k++)tubes[i].push(tubes[from].pop()!);moves--;render();if(solved())win();else if(moves<=0)lose()}
function win(){const reward=50+P.level*5,xp=25+P.level*2;P.gold+=reward;P.xp+=xp;P.score+=reward*10;save();els.winReward.textContent=`+${reward} кредитів · +${xp} XP`;els.win.classList.add('show')}
function lose(){els.lose.classList.add('show')}
function hint(){const pair=solution.find(([a,b])=>a<tubes.length&&b<tubes.length&&legal(a,b)>0);if(pair)toast(`Підказка: пробірка ${pair[0]+1} → ${pair[1]+1}`);else toast('Знайди пару однакових верхніх елементів')}
els.undo.addEventListener('click',()=>{const h=history.pop();if(!h)return toast('Немає ходу для скасування');tubes=cloneTubes(h.tubes);moves=h.moves;selected=-1;render()});
els.shuffle.addEventListener('click',()=>{seed=(Date.now()%100000)||1;tubes=generate(P.level,seed);moves=Math.max(10,solution.length+5);history=[];selected=-1;render();toast('Нова прохідна комбінація')});
els.addTube.addEventListener('click',()=>{if(extraUsed)return toast('Резервну пробірку вже використано');tubes.push([]);extraUsed=true;render();resizeBoard()});
els.hint.addEventListener('click',hint);els.next.addEventListener('click',()=>start(P.level+1,(Date.now()%100000)||1));els.retrySame.addEventListener('click',()=>start(P.level,seed));els.retryNew.addEventListener('click',()=>start(P.level,(Date.now()%100000)||1));els.synth.addEventListener('click',()=>toast('Синтез зафіксовано в лабораторному журналі'));$('settings').addEventListener('click',()=>$('settingsPanel').classList.add('show'));$('closeSettings').addEventListener('click',()=>$('settingsPanel').classList.remove('show'));
await initPixi();start(P.level,(Date.now()%100000)||1);
