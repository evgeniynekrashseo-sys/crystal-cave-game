(()=>{
'use strict';
// V29 hotfix: game builds/rebuilds tubes dynamically after the fluid module's
// initial DOMContentLoaded pass. Re-run the existing safe renderer only when
// populated tubes exist without an SVG liquid layer.
let queued=false;
function needsSync(){
  return Array.from(document.querySelectorAll('.tube-inner')).some(inner=>
    inner.querySelector(':scope > .layer') && !inner.querySelector(':scope > .fluid-svg')
  );
}
function sync(){
  queued=false;
  if(needsSync()) window.dispatchEvent(new CustomEvent('chemlab:render'));
}
function queue(){
  if(queued)return;
  queued=true;
  requestAnimationFrame(sync);
}
function start(){
  const root=document.getElementById('board')||document.body;
  new MutationObserver(queue).observe(root,{childList:true,subtree:true});
  queue();
  setTimeout(queue,80);
  setTimeout(queue,240);
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})();