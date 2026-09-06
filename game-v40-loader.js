(()=>{
'use strict';
function swap(src,oldText,newText,label){
  if(!src.includes(oldText)) throw new Error('ChemLab V40 patch missing: '+label);
  return src.replace(oldText,newText);
}
try{
  const xhr=new XMLHttpRequest();
  xhr.open('GET','game-v27.js?v=40',false);
  xhr.send(null);
  if(xhr.status<200||xhr.status>=300)throw new Error('core load '+xhr.status);
  let src=xhr.responseText;

  src=swap(src,
`function pool(){const d=DISCOVERY.filter(s=>discovered.has(s)),need=Math.min(typeInfo()[1]==='boss'?5:(S.level<10?3:4),d.length);if(d.length<=need)return d.slice();const out=[],start=(S.level*7)%d.length,step=5;for(let k=0;out.length<need&&k<d.length*2;k++){const s=d[(start+k*step)%d.length];if(!out.includes(s))out.push(s)}for(const s of d)if(out.length<need&&!out.includes(s))out.push(s);return out.slice(0,need)}`,
`function pool(){const d=DISCOVERY.filter(s=>discovered.has(s));let need=3+Math.floor(Math.max(0,S.level-1)/2);if(typeInfo()[1]==='boss')need++;need=Math.min(8,d.length,need);if(d.length<=need)return d.slice();const out=[],start=(S.level*7)%d.length,step=5;for(let k=0;out.length<need&&k<d.length*3;k++){const s=d[(start+k*step)%d.length];if(!out.includes(s))out.push(s)}for(const s of d)if(out.length<need&&!out.includes(s))out.push(s);return out.slice(0,need)}`,
'pool');

  src=swap(src,
`function build(seedOffset=0){const colors=pool(),r=seeded(S.level*9973+seedOffset*131071+71),chunk=(S.level>=8&&typeInfo()[1]!=='discovery')?2:1;const sources=shuffleArr(colors.slice(),r).map(c=>Array(CAP-chunk).fill(c));const groups=shuffleArr(colors.map(c=>({c,n:chunk})),r);const bufferCount=Math.max(1,Math.ceil(colors.length*chunk/CAP)),buffers=Array.from({length:bufferCount},()=>[]),placements=[];let bi=0;for(const g of groups){let guard=0;while(buffers[bi].length+g.n>CAP&&guard++<bufferCount+2)bi=(bi+1)%bufferCount;const idx=bi;for(let n=0;n<g.n;n++)buffers[idx].push(g.c);placements.push({buffer:idx,color:g.c,n:g.n});bi=(bi+1)%bufferCount}const T=[...sources,...buffers,[]],sourceIndex=new Map();sources.forEach((t,i)=>sourceIndex.set(t[0],i));const solution=[];for(let b=0;b<buffers.length;b++){const stack=placements.filter(p=>p.buffer===b);for(let k=stack.length-1;k>=0;k--){const p=stack[k];solution.push([sources.length+b,sourceIndex.get(p.color),p.n])}}S.solution=solution;S.par=solution.length;return T}`,
`function build(seedOffset=0){const colors=pool(),r=seeded(S.level*9973+seedOffset*131071+71),chunk=1;const sources=shuffleArr(colors.slice(),r).map(c=>Array(CAP-chunk).fill(c));const groups=shuffleArr(colors.map(c=>({c,n:chunk})),r);const bufferCount=Math.max(1,Math.ceil(colors.length*chunk/CAP)),buffers=Array.from({length:bufferCount},()=>[]),placements=[];let bi=0;for(const g of groups){let guard=0;while(buffers[bi].length+g.n>CAP&&guard++<bufferCount+2)bi=(bi+1)%bufferCount;const idx=bi;for(let n=0;n<g.n;n++)buffers[idx].push(g.c);placements.push({buffer:idx,color:g.c,n:g.n});bi=(bi+1)%bufferCount}const freeCount=S.level<=2?2:(S.level<=7?1:0),T=[...sources,...buffers,...Array.from({length:freeCount},()=>[])],sourceIndex=new Map();sources.forEach((t,i)=>sourceIndex.set(t[0],i));const solution=[];for(let b=0;b<buffers.length;b++){const stack=placements.filter(p=>p.buffer===b);for(let k=stack.length-1;k>=0;k--){const p=stack[k];solution.push([sources.length+b,sourceIndex.get(p.color),p.n])}}S.solution=solution;S.par=solution.length;return T}`,
'build');

  src=swap(src,
`function start(level,seed=0){S.level=Math.max(1,Math.min(999,level));unlockForLevel();const p=passiveBonuses();S.tubes=build(seed);S.sel=-1;S.hist=[];S.undo=3+p.undo;S.shuffle=3;S.hints=3+p.hints;S.extra=false;S.busy=false;S.contam={};S.usedEvents=new Set();const type=typeInfo()[1],pressure=type==='boss'?2:type==='volatile'?1:0;S.moves=Math.max(S.par+6+p.moves-pressure,14);render()}`,
`function start(level,seed=0){S._seed=seed;S.level=Math.max(1,Math.min(999,level));unlockForLevel();const p=passiveBonuses();S.tubes=build(seed);S.sel=-1;S.hist=[];S.undo=3+p.undo;S.shuffle=3;S.hints=3+p.hints;S.extra=false;S.busy=false;S.contam={};S.usedEvents=new Set();const type=typeInfo()[1],pressure=type==='boss'?2:type==='volatile'?1:0,margin=S.level<5?7:(S.level<10?5:4);S.moves=Math.max(S.par+margin+p.moves-pressure,10);render()}`,
'start');

  src=swap(src,
`function checkEnd(){if(cleared()){const p=passiveBonuses(),boss=typeInfo()[1]==='boss',reward=Math.round((45+S.level*3)*(1+p.reward)+(boss?35:0)),xp=24+Math.min(S.level,118)*2+(boss?20:0);S.gold+=reward;S.nug+=p.nug;S.xp+=xp;S.score+=reward*10;$('winReward').textContent=\`+\${reward} ◉\${p.nug?' · +'+p.nug+' ◇':''}\`;$('winXp').textContent=\`+\${xp} XP · SCORE \${S.score}\`;$('win').classList.add('show');persist();return}if(S.moves<=0)$('lose').classList.add('show')}`,
`function checkEnd(){if(cleared()){const p=passiveBonuses(),boss=typeInfo()[1]==='boss',reward=Math.round((45+S.level*3)*(1+p.reward)+(boss?35:0)),xp=24+Math.min(S.level,118)*2+(boss?20:0);S.gold+=reward;S.nug+=p.nug;S.xp+=xp;S.score+=reward*10;$('winReward').textContent=\`+\${reward} ◉\${p.nug?' · +'+p.nug+' ◇':''}\`;$('winXp').textContent=\`+\${xp} XP · SCORE \${S.score}\`;$('win').classList.add('show');persist();return}if(S.moves<=0){const lose=$('lose');lose.querySelector('h2').textContent='Ви програли';lose.querySelector('p').textContent='Ходи закінчились. Спробуй цей етап ще раз і знайди інший шлях.';lose.classList.add('show')}}`,
'checkEnd');

  src=swap(src,
`$('hintBtn').onclick=hint;$('more').onclick=()=>{S.moves+=3;$('lose').classList.remove('show');render()};$('retry').onclick=()=>{$('lose').classList.remove('show');start(S.level,Date.now()%10000)};`,
`$('hintBtn').onclick=hint;$('more').textContent='Повторити цю комбінацію';$('retry').textContent='Інша комбінація';$('more').onclick=()=>{$('lose').classList.remove('show');start(S.level,S._seed||0)};$('retry').onclick=()=>{$('lose').classList.remove('show');start(S.level,(Date.now()%10000)||1)};`,
'loss-actions');

  (0,eval)(src+'\n//# sourceURL=game-v40-core.js');
}catch(err){
  console.error('[ChemLab V40]',err);
  const t=document.getElementById('toast');if(t){t.textContent='Помилка завантаження V40';t.classList.add('show')}
}
})();