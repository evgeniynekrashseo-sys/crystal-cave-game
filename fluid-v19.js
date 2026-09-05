(()=>{
  let scheduled=false;
  function fluidize(){
    scheduled=false;
    document.querySelectorAll('.tube-inner').forEach(inner=>{
      const layers=[...inner.querySelectorAll(':scope > .layer')];
      layers.forEach((layer,i)=>{
        layer.classList.remove('fluid-bottom','fluid-middle','fluid-top','fluid-single');
        if(layers.length===1)layer.classList.add('fluid-bottom','fluid-top','fluid-single');
        else if(i===0)layer.classList.add('fluid-bottom');
        else if(i===layers.length-1)layer.classList.add('fluid-top');
        else layer.classList.add('fluid-middle');
        if(!layer.querySelector('.fluid-symbol')){
          const raw=[...layer.childNodes].find(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim());
          const symbol=(raw?.textContent||'').trim();
          if(raw)raw.textContent='';
          if(symbol){const s=document.createElement('span');s.className='fluid-symbol';s.textContent=symbol;layer.appendChild(s)}
        }
      });
    });
  }
  function queue(){if(scheduled)return;scheduled=true;requestAnimationFrame(fluidize)}
  const start=()=>{
    const board=document.getElementById('board');
    if(!board)return;
    new MutationObserver(queue).observe(board,{childList:true,subtree:true});
    queue();
  };
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start):start();
})();
