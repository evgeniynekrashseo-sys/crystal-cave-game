(()=>{
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  let raf=0,lastGhost=null,lastRipple=0;
  function angleFromTransform(el){
    const t=getComputedStyle(el).transform;
    if(!t||t==='none')return 0;
    try{const m=new DOMMatrixReadOnly(t);return Math.atan2(m.b,m.a)*180/Math.PI}catch{return 0}
  }
  function tick(){
    const g=document.querySelector('.pour-ghost');
    if(g){
      if(g!==lastGhost){g.classList.add('liquid-physics');lastGhost=g}
      const a=angleFromTransform(g),counter=clamp(-a*.88,-62,62);
      const layers=[...g.querySelectorAll('.layer')];
      layers.forEach((l,i)=>{
        const depth=(layers.length-i)/Math.max(1,layers.length);
        l.style.transform=`rotate(${counter}deg) translateY(${Math.abs(a)*.018*depth}px) scaleX(${1+Math.abs(a)*.0015})`;
        const s=l.querySelector?.(':scope:before');
      });
    }else lastGhost=null;
    raf=requestAnimationFrame(tick);
  }
  function impactFx(tube){
    const r=tube.getBoundingClientRect(),color=getComputedStyle(tube.querySelector('.layer:last-child')||tube).getPropertyValue('--glow').trim()||'#59dcff';
    const x=r.left+r.width/2,y=r.top+12;
    const ring=document.createElement('i');ring.className='liquid-ripple';ring.style.left=x+'px';ring.style.top=y+'px';ring.style.setProperty('--pourColor',color);document.body.appendChild(ring);setTimeout(()=>ring.remove(),760);
    for(let i=0;i<5;i++){
      const d=document.createElement('i');d.className='stream-drop';d.style.left=(x+(-4+Math.random()*8))+'px';d.style.top=(y+2)+'px';d.style.setProperty('--pourColor',color);d.style.setProperty('--dx',(-12+Math.random()*24)+'px');d.style.setProperty('--dy',(-14+Math.random()*22)+'px');document.body.appendChild(d);setTimeout(()=>d.remove(),600)
    }
  }
  const obs=new MutationObserver(()=>{
    const t=document.querySelector('.tube.receiving');
    if(t&&performance.now()-lastRipple>180){lastRipple=performance.now();impactFx(t)}
  });
  const start=()=>{const b=document.getElementById('board');if(b)obs.observe(b,{subtree:true,attributes:true,attributeFilter:['class']});if(!raf)raf=requestAnimationFrame(tick)};
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start):start();
})();
