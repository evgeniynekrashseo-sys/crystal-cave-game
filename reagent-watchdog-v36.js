(()=>{
'use strict';
// V36 production self-heal for reagent visibility.
// Presentation-only: never mutates puzzle state, moves, saves, level generation or solver data.
let queued=false;
const FALLBACK_COLORS={Na:['#ff8c94','#ff535d'],Cl:['#79f2b1','#35e68b'],Fe:['#ffd071','#ffb43f'],O:['#64d4ff','#20b9ff'],C:['#c18cff','#9c57f6'],H:['#92f0f3','#4fe0e7'],Au:['#fff08e','#ffd84d']};
function visible(layer){
  const cs=getComputedStyle(layer),r=layer.getBoundingClientRect();
  return cs.display!=='none'&&cs.visibility!=='hidden'&&Number(cs.opacity)>0.02&&r.width>2&&r.height>2;
}
function repair(inner){
  const layers=Array.from(inner.children).filter(x=>x.classList?.contains('layer'));
  if(!layers.length)return false;
  const broken=layers.some(l=>!visible(l));
  if(!broken)return false;
  inner.classList.remove('fluid-ready');
  const svg=Array.from(inner.children).find(x=>x.classList?.contains('fluid-svg'));
  if(svg){svg.style.display='none';svg.style.opacity='0';svg.style.visibility='hidden'}
  layers.forEach((l,i)=>{
    const sym=l.dataset.symbol||l.querySelector('.fluid-symbol')?.textContent?.trim()||'';
    l.style.setProperty('display','flex','important');
    l.style.setProperty('visibility','visible','important');
    l.style.setProperty('opacity','1','important');
    l.style.setProperty('position','absolute','important');
    l.style.setProperty('left','1px','important');
    l.style.setProperty('right','1px','important');
    l.style.setProperty('height','calc((100% - 12px)/4)','important');
    l.style.setProperty('min-height','30px','important');
    l.style.setProperty('bottom',`calc(5px + ${i} * ((100% - 12px)/4))`,'important');
    l.style.setProperty('z-index','4','important');
    l.style.setProperty('transform','none','important');
    if(!l.style.background&&FALLBACK_COLORS[sym]){
      const [a,b]=FALLBACK_COLORS[sym];l.style.background=`linear-gradient(180deg,${a},${b})`;
    }
    let label=l.querySelector('.fluid-symbol');
    if(!label&&sym){label=document.createElement('span');label.className='fluid-symbol';label.textContent=sym;l.appendChild(label)}
    if(label){label.style.setProperty('display','block','important');label.style.setProperty('visibility','visible','important');label.style.setProperty('opacity','1','important');label.style.setProperty('z-index','6','important')}
  });
  return true;
}
function audit(){
  queued=false;
  let repaired=0,populated=0;
  document.querySelectorAll('.tube-inner').forEach(inner=>{
    const has=Array.from(inner.children).some(x=>x.classList?.contains('layer'));
    if(has){populated++;if(repair(inner))repaired++}
  });
  try{localStorage.setItem('cl36_render_health',JSON.stringify({ts:Date.now(),populated,repaired,ok:populated===0||repaired===0}))}catch{}
  if(repaired) window.dispatchEvent(new CustomEvent('chemlab:render-recovered',{detail:{repaired,populated}}));
}
function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>requestAnimationFrame(audit))}
function start(){
  const board=document.getElementById('board');
  if(board)new MutationObserver(queue).observe(board,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
  window.addEventListener('chemlab:render',queue);
  queue();setTimeout(queue,120);setTimeout(queue,500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
