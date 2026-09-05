(()=>{
  let queued=false;
  const gidFromFill=src=>{const m=String(src||'').match(/url\(#([^\)]+)\)/);return m?m[1]:null};
  function build(inner){
    const svg=inner.querySelector('.fluid-v21');
    if(!svg)return;
    const labels=[...svg.querySelectorAll('.fluid-label')];
    const fills=[...svg.querySelectorAll('.fluid-fill')];
    if(!labels.length||labels.length!==fills.length){inner.classList.remove('layers-ready');return}
    let stack=inner.querySelector('.layer-stack-v22');
    let glass=inner.querySelector('.layer-glass-v22');
    if(!stack){stack=document.createElement('div');stack.className='layer-stack-v22';inner.appendChild(stack)}
    if(!glass){glass=document.createElement('i');glass.className='layer-glass-v22';inner.appendChild(glass)}
    if(stack.children.length!==labels.length){
      stack.innerHTML='';
      labels.forEach((label,i)=>{
        const l=document.createElement('div');
        l.className='layer-v22';
        l.dataset.layer=i;
        l.style.setProperty('--layer-bottom',`${i*23.45}%`);
        let c1='#64d4ff',c2='#20b9ff';
        const gradId=gidFromFill(fills[i]?.getAttribute('fill'));
        const grad=gradId?[...svg.querySelectorAll('linearGradient')].find(g=>g.id===gradId):null;
        const stops=grad?[...grad.querySelectorAll('stop')]:[];
        if(stops.length){
          c2=stops[0].getAttribute('stop-color')||c2;
          c1=stops[Math.min(1,stops.length-1)].getAttribute('stop-color')||c1;
        }
        l.style.setProperty('--c1',c1);l.style.setProperty('--c2',c2);
        const t=document.createElement('span');t.className='layer-label-v22';t.textContent=label.textContent.trim();l.appendChild(t);
        for(let b=0;b<3;b++){
          const q=document.createElement('i');q.className='bubble-v22';const z=2+Math.random()*3;
          q.style.width=q.style.height=`${z}px`;q.style.left=`${15+Math.random()*68}%`;q.style.top=`${28+Math.random()*55}%`;
          q.style.setProperty('--dur',`${2.5+Math.random()*2.3}s`);q.style.setProperty('--delay',`${-Math.random()*2}s`);l.appendChild(q)
        }
        stack.appendChild(l)
      })
    }
    inner.classList.toggle('layers-ready',stack.children.length===labels.length&&labels.length>0)
  }
  function refresh(){queued=false;document.querySelectorAll('.tube-inner.v21').forEach(build)}
  function queue(){if(queued)return;queued=true;requestAnimationFrame(refresh)}
  function sync(){
    document.querySelectorAll('.tube-inner.v21.layers-ready').forEach(inner=>{
      const segs=[...inner.querySelectorAll('.fluid-segment')],layers=[...inner.querySelectorAll('.layer-v22')];
      layers.forEach((l,i)=>{const s=segs[i];if(!s)return;const op=getComputedStyle(s).opacity;l.style.opacity=op;const tr=s.style.transform||'';l.style.transform=tr.replace(/translateY\(([-\d.]+)px\)/,(m,v)=>`translateY(${Number(v)*.62}px)`)})
    });
    const ghost=document.querySelector('.pour-ghost.v21-ghost');
    if(ghost){const svg=ghost.querySelector('.fluid-v21'),stack=ghost.querySelector('.layer-stack-v22');if(svg&&stack){const fs=svg.querySelector('.fluid-stack')?.getAttribute('transform')||'';const rot=fs.match(/rotate\(([-\d.]+)/)?.[1];stack.style.transform=rot?`rotate(${rot}deg)`:''}}
    requestAnimationFrame(sync)
  }
  const start=()=>{
    const board=document.getElementById('board');
    if(board)new MutationObserver(queue).observe(board,{childList:true,subtree:true});
    queue();setTimeout(queue,50);setTimeout(queue,250);requestAnimationFrame(sync)
  };
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start):start();
})();
