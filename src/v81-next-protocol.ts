type ProgressState={level?:number;nug?:number;streak?:number;bestStreak?:number;discovered?:string[]};

const SAVE_KEY='chemlab_v50';

function readProgress():ProgressState{
  try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'{}') as ProgressState}catch{return {}}
}

function nextMastery(nug:number){
  if(nug<3)return{target:3,name:'Neon Glass'};
  if(nug<6)return{target:6,name:'Violet Glass'};
  if(nug<10)return{target:10,name:'Gold Glass'};
  return null;
}

function renderProtocol(){
  const box=document.getElementById('nextProtocol');
  if(!box)return;
  const p=readProgress(),nug=Math.max(0,p.nug||0),streak=Math.max(0,p.streak||0),level=Math.max(1,p.level||1),mastery=nextMastery(nug);
  const title=box.querySelector<HTMLElement>('[data-protocol-title]');
  const detail=box.querySelector<HTMLElement>('[data-protocol-detail]');
  const meter=box.querySelector<HTMLElement>('[data-protocol-meter]');
  const meta=box.querySelector<HTMLElement>('[data-protocol-meta]');
  if(!title||!detail||!meter||!meta)return;

  if(mastery){
    const remaining=mastery.target-nug;
    title.textContent=`Наступний протокол · ${mastery.name}`;
    detail.textContent=remaining===1?'Ще 1 чисте проходження без допомоги':`Ще ${remaining} чистих проходження без допомоги`;
    const floor=mastery.target===3?0:mastery.target===6?3:6;
    meter.style.width=`${Math.max(0,Math.min(100,((nug-floor)/(mastery.target-floor))*100))}%`;
  }else{
    const target=Math.ceil((streak+1)/5)*5;
    title.textContent=`Наступний протокол · серія ${target}`;
    detail.textContent=`Продовж серію: ${streak}/${target} чистих дослідів`;
    meter.style.width=`${Math.max(0,Math.min(100,(streak/target)*100))}%`;
  }
  meta.textContent=`Дослід ${level+1} · прогрес не витрачається · без paywall`;
}

const win=document.getElementById('win');
if(win){
  new MutationObserver(()=>{if(win.classList.contains('show'))requestAnimationFrame(renderProtocol)}).observe(win,{attributes:true,attributeFilter:['class']});
}
window.addEventListener('storage',renderProtocol);
renderProtocol();

export {};
