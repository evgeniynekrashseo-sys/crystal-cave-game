(()=>{
'use strict';
try{
  const xhr=new XMLHttpRequest();
  xhr.open('GET','game-v40-loader.js?v=42',false);
  xhr.send(null);
  if(xhr.status<200||xhr.status>=300)throw new Error('v40 loader '+xhr.status);
  let src=xhr.responseText;

  const oldCurve="function pool(){const d=DISCOVERY.filter(s=>discovered.has(s));let need=3+Math.floor(Math.max(0,S.level-1)/2);if(typeInfo()[1]==='boss')need++;need=Math.min(8,d.length,need);";
  const newCurve="function pool(){const d=DISCOVERY.filter(s=>discovered.has(s));let need=S.level<=3?3:(S.level<=7?4:(S.level<=14?5:6));if(typeInfo()[1]==='boss'&&S.level>=15)need=Math.min(6,need+1);need=Math.min(6,d.length,need);";
  if(!src.includes(oldCurve))throw new Error('V42 curve patch target missing');
  src=src.replace(oldCurve,newCurve);

  const oldBuild="function build(seedOffset=0){const colors=pool(),r=seeded(S.level*9973+seedOffset*131071+71),chunk=1;const sources=shuffleArr(colors.slice(),r).map(c=>Array(CAP-chunk).fill(c));const groups=shuffleArr(colors.map(c=>({c,n:chunk})),r);const bufferCount=Math.max(1,Math.ceil(colors.length*chunk/CAP)),buffers=Array.from({length:bufferCount},()=>[]),placements=[];let bi=0;for(const g of groups){let guard=0;while(buffers[bi].length+g.n>CAP&&guard++<bufferCount+2)bi=(bi+1)%bufferCount;const idx=bi;for(let n=0;n<g.n;n++)buffers[idx].push(g.c);placements.push({buffer:idx,color:g.c,n:g.n});bi=(bi+1)%bufferCount}const freeCount=S.level<=2?2:(S.level<=7?1:0),T=[...sources,...buffers,...Array.from({length:freeCount},()=>[])],sourceIndex=new Map();sources.forEach((t,i)=>sourceIndex.set(t[0],i));const solution=[];for(let b=0;b<buffers.length;b++){const stack=placements.filter(p=>p.buffer===b);for(let k=stack.length-1;k>=0;k--){const p=stack[k];solution.push([sources.length+b,sourceIndex.get(p.color),p.n])}}S.solution=solution;S.par=solution.length;return T}";
  const newBuild="function build(seedOffset=0){const colors=shuffleArr(pool().slice(),seeded(S.level*9973+seedOffset*131071+71)),chunk=S.level>=8?2:1,T=colors.map(c=>Array(CAP).fill(c));T.push([]);const buffer=T.length-1,solution=[];let hole=buffer;for(let i=0;i<colors.length;i++){const src=i,n=Math.min(chunk,T[src].length,CAP-T[hole].length);if(n<=0)continue;const moved=T[src].splice(T[src].length-n,n);T[hole].push(...moved);solution.unshift([hole,src,n]);hole=src}S.solution=solution;S.par=solution.length;return T}";
  if(!src.includes(oldBuild))throw new Error('V42 build patch target missing');
  src=src.replace(oldBuild,newBuild);

  src=src.replaceAll('?v=40','?v=42').replace('game-v40-core.js','game-v42-core.js');
  (0,eval)(src+'\n//# sourceURL=game-v42-loader-core.js');
}catch(err){
  console.error('[ChemLab V42]',err);
  const t=document.getElementById('toast');if(t){t.textContent='Помилка завантаження V42';t.classList.add('show')}
}
})();