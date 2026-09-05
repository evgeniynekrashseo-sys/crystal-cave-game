(()=>{
  const colorMap={Na:'#ff5359',Cl:'#37e887',Fe:'#ffb43f',O:'#27b9ff',C:'#9c56f5',H:'#56e2e7',Au:'#ffd64a'};
  const board=()=>document.getElementById('board');

  function reorderLayout(){
    const station=document.getElementById('station');
    const controls=document.querySelector('.controls');
    if(station&&controls&&station.nextElementSibling!==controls){
      controls.parentNode.insertBefore(station,controls);
    }
  }

  function decorate(root=document){
    root.querySelectorAll?.('.layer').forEach(layer=>{
      if(layer.dataset.bubbled)return;
      layer.dataset.bubbled='1';
      const count=4+Math.floor(Math.random()*4);
      for(let i=0;i<count;i++){
        const b=document.createElement('i');
        b.className='bubble';
        const size=2+Math.random()*4.2;
        b.style.width=b.style.height=size+'px';
        b.style.left=(8+Math.random()*82)+'%';
        b.style.setProperty('--dur',(1.55+Math.random()*2.5)+'s');
        b.style.setProperty('--delay',(-Math.random()*3.5)+'s');
        b.style.setProperty('--travel',(26+Math.random()*40)+'px');
        b.style.setProperty('--drift',(-5+Math.random()*10)+'px');
        layer.appendChild(b);
      }
    });
  }

  function splashAt(x,y,color){
    for(let i=0;i<10;i++){
      const p=document.createElement('i');
      p.className='splash';
      p.style.left=(x-3)+'px';p.style.top=(y-2)+'px';p.style.setProperty('--pourColor',color);
      p.style.setProperty('--sx',(-18+Math.random()*36)+'px');
      p.style.setProperty('--sy',(-15+Math.random()*18)+'px');
      p.style.animationDelay=(Math.random()*.08)+'s';
      document.body.appendChild(p);setTimeout(()=>p.remove(),760);
    }
  }

  function verticalStream(x,top,height,color,tilt=0){
    const s=document.createElement('div');
    s.className='pour-stream pour-stream-live';
    s.style.left=(x-3)+'px';s.style.top=top+'px';s.style.height=Math.max(30,height)+'px';
    s.style.setProperty('--pourColor',color);
    s.style.setProperty('--streamTilt',tilt+'deg');
    document.body.appendChild(s);
    setTimeout(()=>s.remove(),760);
  }

  function animatePour(src,dst,color){
    const a=src.getBoundingClientRect(),b=dst.getBoundingClientRect();
    const dir=(b.left+b.width/2)>=(a.left+a.width/2)?1:-1;
    const ghost=src.cloneNode(true);
    ghost.classList.remove('sel','valid','dim','shake','slosh','pour-source');
    ghost.classList.add('pour-ghost');
    ghost.style.left=a.left+'px';ghost.style.top=a.top+'px';ghost.style.width=a.width+'px';ghost.style.height=a.height+'px';
    document.body.appendChild(ghost);

    const targetX=(b.left+b.width/2)-(a.left+a.width/2)-dir*(a.width*.30);
    const targetY=(b.top-a.top)-a.height*.43;
    const tilt=dir*68;
    const anim=ghost.animate([
      {transform:'translate3d(0,0,0) rotate(0deg)',offset:0},
      {transform:`translate3d(${targetX*.82}px,${targetY*.68}px,0) rotate(${tilt*.35}deg)`,offset:.38},
      {transform:`translate3d(${targetX}px,${targetY}px,0) rotate(${tilt}deg)`,offset:.58},
      {transform:`translate3d(${targetX}px,${targetY+2}px,0) rotate(${tilt*1.03}deg)`,offset:.74},
      {transform:`translate3d(${targetX*.84}px,${targetY*.66}px,0) rotate(${tilt*.36}deg)`,offset:.88},
      {transform:'translate3d(0,0,0) rotate(0deg)',offset:1}
    ],{duration:980,easing:'cubic-bezier(.2,.78,.2,1)',fill:'forwards'});

    setTimeout(()=>{
      const x=b.left+b.width/2;
      const y=b.top+8;
      verticalStream(x,y-70,74,color,dir*1.8);
      splashAt(x,y+5,color);
      dst.classList.add('receive-pulse');
      setTimeout(()=>dst.classList.remove('receive-pulse'),620);
    },485);

    setTimeout(()=>{
      const current=[...document.querySelectorAll('.tube')];
      const nearest=current.find(t=>Math.abs((t.getBoundingClientRect().left+t.getBoundingClientRect().width/2)-(b.left+b.width/2))<12);
      if(nearest){nearest.classList.add('slosh','receive-pulse');setTimeout(()=>nearest.classList.remove('slosh','receive-pulse'),650)}
      decorate(document);
    },560);

    anim.finished.catch(()=>{}).finally(()=>ghost.remove());
    setTimeout(()=>ghost.remove(),1150);
  }

  document.addEventListener('click',e=>{
    const dst=e.target.closest('.tube.valid'); if(!dst)return;
    const src=document.querySelector('.tube.sel'); if(!src)return;
    const top=[...src.querySelectorAll('.layer')].at(-1);
    const color=colorMap[top?.textContent?.trim()]||'#55dfff';
    animatePour(src,dst,color);
  },true);

  const obs=new MutationObserver(ms=>{
    for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1)decorate(n);
    reorderLayout();
  });
  const start=()=>{
    reorderLayout();decorate(document);
    const b=board();if(b)obs.observe(b,{childList:true,subtree:true});
  };
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start):start();
})();
