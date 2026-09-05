(()=>{
  const colorMap={Na:'#ff5359',Cl:'#37e887',Fe:'#ffb43f',O:'#27b9ff',C:'#9c56f5',H:'#56e2e7',Au:'#ffd64a'};
  const board=()=>document.getElementById('board');
  function decorate(root=document){
    root.querySelectorAll?.('.layer').forEach(layer=>{
      if(layer.dataset.bubbled)return;
      layer.dataset.bubbled='1';
      const count=3+Math.floor(Math.random()*3);
      for(let i=0;i<count;i++){
        const b=document.createElement('i');
        b.className='bubble';
        const size=2+Math.random()*3.5;
        b.style.width=b.style.height=size+'px';
        b.style.left=(10+Math.random()*78)+'%';
        b.style.setProperty('--dur',(1.8+Math.random()*2.8)+'s');
        b.style.setProperty('--delay',(-Math.random()*3.5)+'s');
        b.style.setProperty('--travel',(24+Math.random()*34)+'px');
        b.style.setProperty('--drift',(-4+Math.random()*8)+'px');
        layer.appendChild(b);
      }
    });
  }
  function stream(src,dst,color){
    const a=src.getBoundingClientRect(),b=dst.getBoundingClientRect();
    const x1=a.left+a.width/2,y1=a.top+9,x2=b.left+b.width/2,y2=b.top+12;
    const dx=x2-x1,dy=y2-y1,len=Math.max(24,Math.hypot(dx,dy));
    const angle=Math.atan2(-dx,dy)*180/Math.PI;
    const s=document.createElement('div');s.className='pour-stream';
    s.style.left=(x1-2.5)+'px';s.style.top=y1+'px';s.style.height=len+'px';
    s.style.setProperty('--angle',angle+'deg');s.style.setProperty('--pourColor',color);
    document.body.appendChild(s);
    for(let i=0;i<6;i++){
      const p=document.createElement('i');p.className='splash';
      p.style.left=(x2-3)+'px';p.style.top=(y2-2)+'px';p.style.setProperty('--pourColor',color);
      p.style.setProperty('--sx',(-13+Math.random()*26)+'px');p.style.setProperty('--sy',(-12+Math.random()*17)+'px');
      p.style.animationDelay=(.16+Math.random()*.12)+'s';document.body.appendChild(p);setTimeout(()=>p.remove(),700);
    }
    setTimeout(()=>s.remove(),650);
  }
  document.addEventListener('click',e=>{
    const dst=e.target.closest('.tube.valid'); if(!dst)return;
    const src=document.querySelector('.tube.sel'); if(!src)return;
    const top=src.querySelector('.layer:last-child'); const color=colorMap[top?.textContent?.trim()]||'#55dfff';
    const tubes=[...document.querySelectorAll('.tube')],si=tubes.indexOf(src),di=tubes.indexOf(dst);
    src.classList.add('pour-source'); stream(src,dst,color);
    setTimeout(()=>{
      const nt=[...document.querySelectorAll('.tube')];
      nt[si]?.classList.add('slosh');nt[di]?.classList.add('slosh');
      setTimeout(()=>nt.forEach(t=>t.classList.remove('slosh','pour-source')),560);
      decorate(document);
    },60);
  },true);
  const obs=new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1)decorate(n);});
  const start=()=>{decorate(document);const b=board();if(b)obs.observe(b,{childList:true,subtree:true});};
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start):start();
})();
