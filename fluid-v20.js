(()=>{
  const NS='http://www.w3.org/2000/svg';
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const hexes=s=>(s.match(/#[0-9a-fA-F]{6}/g)||[]);
  const wave=(y,amp,phase=0)=>`M 8 ${y} C 24 ${y-amp+phase}, 37 ${y+amp}, 50 ${y} C 63 ${y-amp}, 78 ${y+amp-phase}, 92 ${y}`;
  function pathFor(top,amp,phase=0){return `${wave(top,amp,phase)} L 92 398 L 8 398 Z`}
  function labelOf(layer){return (layer.querySelector('.fluid-symbol')?.textContent||layer.textContent||'').trim()}
  function colorsOf(layer){const h=hexes(layer.style.background||'');return {c1:h[0]||'#64d4ff',c2:h[1]||h[0]||'#20b9ff'} }
  function mk(tag,attrs={}){const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));return e}
  function render(inner){
    const layers=[...inner.querySelectorAll(':scope > .layer')];
    inner.querySelector(':scope > .fluid-svg')?.remove();
    if(!layers.length)return;
    const svg=mk('svg',{class:'fluid-svg',viewBox:'0 0 100 400',preserveAspectRatio:'none'});
    const defs=mk('defs');
    const clip=mk('clipPath',{id:`tubeClip-${Math.random().toString(36).slice(2)}`});
    const clipId=clip.id;
    clip.appendChild(mk('path',{d:'M 8 4 H 92 V 330 Q 92 392 50 398 Q 8 392 8 330 Z'}));
    defs.appendChild(clip);
    layers.forEach((layer,i)=>{
      const {c1,c2}=colorsOf(layer),g=mk('linearGradient',{id:`g-${Math.random().toString(36).slice(2)}`,x1:'0',x2:'1'});
      g.append(mk('stop',{offset:'0%', 'stop-color':c1}),mk('stop',{offset:'38%','stop-color':c2}),mk('stop',{offset:'100%','stop-color':c1}));
      defs.appendChild(g);
      layer.dataset.gid=g.id;
    });
    svg.appendChild(defs);
    const stack=mk('g',{class:'fluid-stack','clip-path':`url(#${clipId})`});
    const segH=94,base=395;
    for(let i=layers.length-1;i>=0;i--){
      const layer=layers[i],top=base-(i+1)*segH,amp=i===layers.length-1?5.2:2.2,phase=(i%2?1.2:-1.2),grp=mk('g',{class:'fluid-segment','data-layer':i});
      const p=mk('path',{d:pathFor(top,amp,phase),fill:`url(#${layer.dataset.gid})`});
      grp.appendChild(p);
      const hi=mk('path',{d:wave(top,amp*.7,phase*.4),class:i===layers.length-1?'surface-highlight':'interface-highlight'});grp.appendChild(hi);
      for(let b=0;b<3;b++){
        const cx=20+Math.random()*58,cy=Math.min(385,top+18+Math.random()*55),r=1.6+Math.random()*2.2,q=mk('circle',{cx,cy,r,class:'fluid-bubble'});
        q.style.setProperty('--dur',`${2.7+Math.random()*2.4}s`);q.style.setProperty('--delay',`${-Math.random()*2.2}s`);q.style.setProperty('--drift',`${-4+Math.random()*8}px`);grp.appendChild(q)
      }
      stack.appendChild(grp)
    }
    svg.appendChild(stack);
    layers.forEach((layer,i)=>{
      const top=base-(i+1)*segH,txt=mk('text',{x:'50',y:String(top+segH*.55),'text-anchor':'middle',class:'fluid-label','data-label':i});txt.textContent=labelOf(layer);svg.appendChild(txt)
    });
    inner.appendChild(svg)
  }
  let queued=false;
  function refresh(){queued=false;document.querySelectorAll('.tube-inner').forEach(render)}
  function queue(){if(queued)return;queued=true;requestAnimationFrame(refresh)}
  function angle(el){const t=getComputedStyle(el).transform;if(!t||t==='none')return 0;try{const m=new DOMMatrixReadOnly(t);return Math.atan2(m.b,m.a)*180/Math.PI}catch{return 0}}
  function sync(){
    document.querySelectorAll('.tube-inner').forEach(inner=>{
      const layers=[...inner.querySelectorAll(':scope > .layer')],svg=inner.querySelector(':scope > .fluid-svg');if(!svg)return;
      layers.forEach((l,i)=>{const g=svg.querySelector(`.fluid-segment[data-layer="${i}"]`),label=svg.querySelector(`.fluid-label[data-label="${i}"]`);if(!g)return;const o=parseFloat(l.style.opacity||'1');g.style.opacity=String(Number.isFinite(o)?o:1);if(label)label.style.opacity=g.style.opacity});
    });
    const ghost=document.querySelector('.pour-ghost');
    if(ghost){const a=angle(ghost),g=ghost.querySelector('.fluid-stack');if(g){const c=clamp(-a*.9,-64,64);g.setAttribute('transform',`rotate(${c} 50 210) translate(0 ${Math.abs(a)*.10})`)}}
    requestAnimationFrame(sync)
  }
  const start=()=>{const board=document.getElementById('board');if(board)new MutationObserver(queue).observe(board,{childList:true,subtree:true});queue();requestAnimationFrame(sync)};
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start):start();
})();
