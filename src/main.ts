import { Application, Container, Graphics } from 'pixi.js';
import { drawPremiumTube } from './v60-renderer';
import './style.css';
import './v52.css';

type SymbolKey='Na'|'Cl'|'Fe'|'O'|'C'|'H'|'Au'|'Li'|'He'|'Be'|'B'|'N'|'F'|'Ne'|'Mg'|'Al'|'Si'|'P'|'S';
type Tube=SymbolKey[];
type Persisted={level:number;gold:number;nug:number;xp:number;score:number;discovered:SymbolKey[];streak?:number;bestStreak?:number};
const CAP=4,DISCOVERY:SymbolKey[]=['Na','Cl','Fe','O','C','H','Au','Li','He','Be','B','N','F','Ne','Mg','Al','Si','P','S'];
const COLORS:Record<SymbolKey,number>={Na:0xff4f78,Cl:0xff4f9a,Fe:0xffc229,O:0x25d7ff,C:0xa95cff,H:0x25d8ff,Au:0xffca2e,Li:0x35ee70,He:0x2dcfff,Be:0x42e5da,B:0xff6bb1,N:0x70a0ff,F:0xb9f45d,Ne:0xff8c4d,Mg:0x70c9ff,Al:0xb9c8d5,Si:0xba84ff,P:0xff785f,S:0xffe35a};
const $=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
const els={level:$<HTMLElement>('levelTitle'),sub:$<HTMLElement>('levelSub'),moves:$<HTMLElement>('moves'),gold:$<HTMLElement>('gold'),nug:$<HTMLElement>('nugget'),xp:$<HTMLElement>('xpText'),xpFill:$<HTMLElement>('xpFill'),board:$<HTMLElement>('gameCanvas'),goal:$<HTMLElement>('goalText'),toast:$<HTMLElement>('toast'),win:$<HTMLElement>('win'),lose:$<HTMLElement>('lose'),winReward:$<HTMLElement>('winReward'),next:$<HTMLButtonElement>('next'),retrySame:$<HTMLButtonElement>('retrySame'),retryNew:$<HTMLButtonElement>('retryNew'),undo:$<HTMLButtonElement>('undo'),shuffle:$<HTMLButtonElement>('shuffle'),addTube:$<HTMLButtonElement>('addTube'),hint:$<HTMLButtonElement>('hintBtn'),synth:$<HTMLElement>('station')};
function readState():Persisted{const f:Persisted={level:1,gold:0,nug:0,xp:0,score:0,discovered:['Na','Cl','Fe'],streak:0,bestStreak:0};try{const x=JSON.parse(localStorage.getItem('chemlab_v50')||'null');if(x)return{...f,...x}}catch{}return f}
const P=readState();
let tubes:Tube[]=[],selected=-1,moves=0,seed=1,solution:[number,number][]=[],history:{tubes:Tube[];moves:number}[]=[],extraUsed=false,currentSymbols:SymbolKey[]=[],app:Application,root:Container,boardW=360,boardH=470,inputLocked=false,tubeViews:Container[]=[];
let soundOn=localStorage.getItem('chemlab_sound')!=='off';
const clone=(v:Tube[])=>v.map(t=>t.slice()) as Tube[];
function save(){localStorage.setItem('chemlab_v50',JSON.stringify(P))}
function toast(s:string,ms=1700){els.toast.textContent=s;els.toast.classList.add('show');clearTimeout((toast as any)._t);(toast as any)._t=setTimeout(()=>els.toast.classList.remove('show'),ms)}
function rng(s:number){let x=s|0||12345;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
function difficulty(l:number){return l<=3?3:l<=7?4:l<=14?5:6}
function unlock(l:number){const n=Math.min(DISCOVERY.length,3+Math.floor((l-1)/2));for(let i=0;i<n;i++)if(!P.discovered.includes(DISCOVERY[i]))P.discovered.push(DISCOVERY[i])}
function choose(l:number){unlock(l);const r=rng(l*9176+seed*31),p=P.discovered.slice();for(let i=p.length-1;i;i--){const j=Math.floor(r()*(i+1));[p[i],p[j]]=[p[j],p[i]]}return p.slice(0,Math.min(difficulty(l),p.length))}
function topRun(t:Tube){if(!t.length)return 0;let n=1,x=t[t.length-1];for(let i=t.length-2;i>=0&&t[i]===x;i--)n++;return n}
function legal(a:number,b:number){if(a===b||!tubes[a]?.length||!tubes[b]||tubes[b].length>=CAP)return 0;const x=tubes[a].at(-1)!,d=tubes[b];if(d.length&&d.at(-1)!==x)return 0;return Math.min(topRun(tubes[a]),CAP-d.length)}
function solved(){return tubes.every(t=>!t.length||(t.length===CAP&&t.every(x=>x===t[0])))}
function complete(i:number){const t=tubes[i];return t.length===CAP&&t.every(x=>x===t[0])}
function generate(l:number,s:number){seed=s||1;currentSymbols=choose(l);const r=rng(l*99991+seed*17),order=currentSymbols.slice();for(let i=order.length-1;i;i--){const j=Math.floor(r()*(i+1));[order[i],order[j]]=[order[j],order[i]]}const k=l<=3?1:l<=9?2:(l%3?2:1),T=order.map(x=>Array(CAP).fill(x) as Tube);T.push([]);const b=T.length-1,rev:[number,number][]=[];for(let q=0;q<k;q++){T[b].push(T[0].pop()!);rev.unshift([b,0])}for(let i=1;i<order.length;i++)for(let q=0;q<k;q++){T[i-1].push(T[i].pop()!);rev.unshift([i-1,i])}solution=rev;return T}
async function init(){app=new Application();await app.init({backgroundAlpha:0,antialias:true,resolution:Math.min(devicePixelRatio||1,2),autoDensity:true,preference:'webgl',powerPreference:'high-performance',autoStart:false});els.board.appendChild(app.canvas);root=new Container();app.stage.addChild(root);new ResizeObserver(resize).observe(els.board);resize()}
function geometry(n:number){const mobile=boardW<=520,two=(mobile&&n>=5)||n>=7,cols=mobile&&n>=5?3:(n>=7?4:n),desired=mobile&&n>=5?82:n<=4?96:n===5?88:n===6?82:76,gap=mobile&&n>=5?Math.max(24,Math.min(36,(boardW-cols*desired)/(cols+1))):Math.max(18,Math.min(34,(boardW-cols*desired)/(cols+1))),w=Math.max(60,Math.min(desired,(boardW-gap*(cols+1))/cols)),h=w*3.28,total=cols*w+(cols-1)*gap;return{two,cols,gap,w,h,start:(boardW-total)/2}}
function resize(){if(!app)return;boardW=Math.max(280,Math.floor(els.board.getBoundingClientRect().width));const g=geometry(tubes.length),rows=Math.max(1,Math.ceil(tubes.length/g.cols));boardH=rows>1?Math.ceil(34+rows*g.h+(rows-1)*38+24):Math.max(380,Math.round(boardW*.58));app.renderer.resize(boardW,boardH);renderBoard()}
function drawTube(t:Tube,i:number,g:ReturnType<typeof geometry>){const row=g.two?Math.floor(i/g.cols):0,col=i%g.cols,rowCount=g.two?Math.min(g.cols,tubes.length-row*g.cols):g.cols,rowWidth=rowCount*g.w+(rowCount-1)*g.gap,rowStart=(boardW-rowWidth)/2,holder=new Container();holder.x=rowStart+col*(g.w+g.gap);holder.y=24+row*(g.h+38);holder.eventMode='static';holder.cursor='pointer';holder.on('pointertap',()=>void tap(i));drawPremiumTube(holder,t,s=>COLORS[s as SymbolKey],g,selected===i);if(selected===i)holder.y-=5;root.addChild(holder);tubeViews[i]=holder}
function renderBoard(){if(!root)return;root.removeChildren().forEach(x=>x.destroy({children:true}));tubeViews=[];const g=geometry(tubes.length);tubes.forEach((t,i)=>drawTube(t,i,g));app.renderer.render(app.stage)}
function renderHud(){els.level.textContent=`Дослід ${P.level}`;els.sub.textContent=`${currentSymbols.join(' · ')}`;els.moves.textContent=String(moves);els.gold.textContent=String(P.gold);els.nug.textContent=String(P.nug);const ranks=[{x:0,n:'Лаборант'},{x:180,n:'Лаборант'},{x:500,n:'Хімік'},{x:1200,n:'Дослідник'},{x:2500,n:'Майстер реакцій'}];let r=ranks[0],next=ranks[1];for(let i=0;i<ranks.length;i++)if(P.xp>=ranks[i].x){r=ranks[i];next=ranks[i+1]||ranks[i]}$('rankName').textContent=r.n;const pct=next.x===r.x?100:Math.min(100,(P.xp-r.x)/(next.x-r.x)*100);els.xpFill.style.width=`${pct}%`;els.xp.textContent=next.x===r.x?`${P.xp} XP`:`${P.xp} / ${next.x} XP`;els.goal.textContent='Збери 4 однакові елементи в одній пробірці';const d=document.getElementById('discoverTag');if(d)d.textContent=`${P.discovered.length}/118`}
function render(){renderHud();renderBoard()}
function tone(f:number,d=.07,v=.02){if(!soundOn)return;try{const C=window.AudioContext||(window as any).webkitAudioContext,ctx=(tone as any).c||((tone as any).c=new C()),o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=f;g.gain.value=v;o.connect(g);g.connect(ctx.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+d);o.stop(ctx.currentTime+d)}catch{}}
function haptic(ms=10){navigator.vibrate?.(ms)}
function tween(ms:number,fn:(p:number)=>void){return new Promise<void>(ok=>{const s=performance.now(),f=(n:number)=>{const p=Math.min(1,(n-s)/ms);fn(1-Math.pow(1-p,3));app.renderer.render(app.stage);p<1?requestAnimationFrame(f):ok()};requestAnimationFrame(f)})}
async function pour(a:number,b:number,color:number){const s=tubeViews[a],d=tubeViews[b];if(!s||!d)return;const sx=s.x,sy=s.y,dx=d.x,dy=d.y,dir=dx>=sx?1:-1,stream=new Graphics();root.addChild(stream);await tween(180,p=>{s.x=sx+(dx-sx)*.42*p;s.y=sy-34*p;s.rotation=dir*.30*p});for(let p=0;p<=1;p+=.2){stream.clear();const x1=s.x+(dir>0?s.width*.82:s.width*.18),y1=s.y+22,x2=dx+d.width/2,y2=dy+16;stream.moveTo(x1,y1).bezierCurveTo(x1+dir*16,y1+16,x2-dir*10,y2-16,x2,y2).stroke({color,width:Math.max(4,s.width*.075),alpha:.95});app.renderer.render(app.stage);await new Promise(r=>setTimeout(r,24))}stream.destroy();tone(560);haptic();await tween(150,p=>{s.x=sx+(dx-sx)*.42*(1-p);s.y=sy-34*(1-p);s.rotation=dir*.30*(1-p)})}
async function flash(i:number){const c=tubeViews[i];if(!c)return;const q=new Graphics().roundRect(-4,0,c.width+8,c.height+2,24).stroke({color:0x61ecff,width:3,alpha:.9});c.addChild(q);tone(820,.12,.03);await tween(300,p=>q.alpha=1-p);q.destroy()}
function start(l:number,s:number){P.level=Math.max(1,l);selected=-1;history=[];extraUsed=false;inputLocked=false;tubes=generate(P.level,s);moves=Math.max(9,solution.length+(P.level<5?6:P.level<10?4:3));els.win.classList.remove('show');els.lose.classList.remove('show');save();render();resize()}
async function tap(i:number){if(inputLocked)return;if(selected<0){if(tubes[i].length){selected=i;renderBoard();tone(310,.04,.01)}return}if(selected===i){selected=-1;renderBoard();return}const n=legal(selected,i);if(!n){if(tubes[i].length){selected=i;renderBoard()}else toast('Сюди зараз не можна перелити');return}history.push({tubes:clone(tubes),moves});const from=selected,color=COLORS[tubes[from].at(-1)!];selected=-1;inputLocked=true;await pour(from,i,color);for(let k=0;k<n;k++)tubes[i].push(tubes[from].pop()!);moves--;render();if(complete(i))await flash(i);inputLocked=false;if(solved())win();else if(moves<=0)lose()}
function win(){const reward=50+P.level*5+Math.min(30,moves*2),xp=25+P.level*2;P.gold+=reward;P.xp+=xp;P.streak=(P.streak||0)+1;P.bestStreak=Math.max(P.bestStreak||0,P.streak);save();els.winReward.textContent=`+${reward} кредитів · +${xp} XP`;tone(1040,.2,.04);haptic(25);els.win.classList.add('show')}
function lose(){P.streak=0;save();els.lose.classList.add('show')}
function hint(){for(let a=0;a<tubes.length;a++)for(let b=0;b<tubes.length;b++)if(legal(a,b)){toast(`Підказка: пробірка ${a+1} → ${b+1}`);return}}
els.undo.onclick=()=>{const h=history.pop();if(!h)return toast('Немає ходу для скасування');tubes=clone(h.tubes);moves=h.moves;selected=-1;render()};
els.shuffle.onclick=()=>start(P.level,(Date.now()%100000)||1);
els.addTube.onclick=()=>{if(extraUsed)return toast('Резервну пробірку вже використано');tubes.push([]);extraUsed=true;render();resize()};
els.hint.onclick=hint;
els.next.onclick=()=>start(P.level+1,(Date.now()%100000)||1);
els.retrySame.onclick=()=>start(P.level,seed);
els.retryNew.onclick=()=>start(P.level,(Date.now()%100000)||1);
els.synth.onclick=()=>toast('Ігровий синтез записано в журнал');
$('settings').onclick=()=>$('settingsPanel').classList.add('show');
$('closeSettings').onclick=()=>$('settingsPanel').classList.remove('show');
document.getElementById('sound')?.addEventListener('click',e=>{soundOn=!soundOn;localStorage.setItem('chemlab_sound',soundOn?'on':'off');(e.currentTarget as HTMLElement).textContent=soundOn?'🔊':'🔇'});
document.getElementById('hub')?.addEventListener('click',()=>toast(`Лабораторія · відкрито ${P.discovered.length}/118`));
await init();start(P.level,(Date.now()%100000)||1);
