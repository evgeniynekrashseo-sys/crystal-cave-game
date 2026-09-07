const board=document.querySelector<HTMLElement>('.board-shell');
const canvas=document.getElementById('gameCanvas');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

if(board&&canvas){
  const setPointer=(x:number,y:number)=>{
    const r=board.getBoundingClientRect();
    board.style.setProperty('--pointer-x',`${Math.max(0,Math.min(r.width,x-r.left))}px`);
    board.style.setProperty('--pointer-y',`${Math.max(0,Math.min(r.height,y-r.top))}px`);
  };
  board.addEventListener('pointermove',e=>setPointer(e.clientX,e.clientY),{passive:true});
  board.addEventListener('pointerenter',()=>board.classList.add('is-engaged'));
  board.addEventListener('pointerleave',()=>board.classList.remove('is-engaged'));
  canvas.addEventListener('pointerdown',e=>{
    setPointer(e.clientX,e.clientY);
    board.classList.remove('tap-pulse');
    void board.offsetWidth;
    board.classList.add('tap-pulse');
    if(!reduced){
      const ripple=document.createElement('i');
      ripple.className='lab-ripple';
      const r=board.getBoundingClientRect();
      ripple.style.left=`${e.clientX-r.left}px`;
      ripple.style.top=`${e.clientY-r.top}px`;
      board.appendChild(ripple);
      ripple.addEventListener('animationend',()=>ripple.remove(),{once:true});
    }
  },{passive:true});
}

document.querySelectorAll<HTMLElement>('.control,.icon-btn,.modal button').forEach(el=>{
  el.addEventListener('pointerdown',()=>el.classList.add('is-pressed'),{passive:true});
  const clear=()=>el.classList.remove('is-pressed');
  el.addEventListener('pointerup',clear,{passive:true});
  el.addEventListener('pointercancel',clear,{passive:true});
  el.addEventListener('pointerleave',clear,{passive:true});
});

const win=document.getElementById('win');
if(win){
  new MutationObserver(()=>{
    if(win.classList.contains('show')){
      document.body.classList.remove('experiment-complete');
      void document.body.offsetWidth;
      document.body.classList.add('experiment-complete');
      setTimeout(()=>document.body.classList.remove('experiment-complete'),900);
    }
  }).observe(win,{attributes:true,attributeFilter:['class']});
}
