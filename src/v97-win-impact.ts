const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const win=document.getElementById('win');
const board=document.querySelector<HTMLElement>('.board-shell');

function burst(){
  if(reduced||!board)return;
  const layer=document.createElement('div');
  layer.className='v97-burst';
  layer.setAttribute('aria-hidden','true');
  for(let i=0;i<18;i++){
    const p=document.createElement('i');
    p.style.setProperty('--i',String(i));
    p.style.setProperty('--x',`${Math.round(Math.cos((Math.PI*2*i)/18)*120)}px`);
    p.style.setProperty('--y',`${Math.round(Math.sin((Math.PI*2*i)/18)*90)}px`);
    layer.appendChild(p);
  }
  board.appendChild(layer);
  layer.addEventListener('animationend',()=>layer.remove(),{once:true});
}

if(win){
  new MutationObserver(()=>{
    if(!win.classList.contains('show'))return;
    const modal=win.querySelector<HTMLElement>('.modal');
    if(modal){
      modal.classList.remove('v97-win-hit');
      void modal.offsetWidth;
      modal.classList.add('v97-win-hit');
    }
    burst();
  }).observe(win,{attributes:true,attributeFilter:['class']});
}

export {};
