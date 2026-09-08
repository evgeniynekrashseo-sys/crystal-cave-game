type ProgressState={level?:number;nug?:number;streak?:number;bestStreak?:number;discovered?:string[]};

const SAVE_KEY='chemlab_v50';

function readProgress():ProgressState{
  try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'{}') as ProgressState}catch{return {}}
}

function nextMastery(nug:number){
  if(nug<3)return{target:3,name:'Neon Glass',rarity:'UNCOMMON'};
  if(nug<6)return{target:6,name:'Violet Glass',rarity:'EPIC'};
  if(nug<10)return{target:10,name:'Gold Glass',rarity:'LEGENDARY'};
  return null;
}

function pluralRuns(value:number){
  const mod10=value%10,mod100=value%100;
  if(mod10===1&&mod100!==11)return'чисте проходження';
  if(mod10>=2&&mod10<=4&&(mod100<12||mod100>14))return'чисті проходження';
  return'чистих проходжень';
}

function renderProtocol(){
  const box=document.getElementById('nextProtocol');
  if(!box)return;
  const p=readProgress(),nug=Math.max(0,p.nug||0),streak=Math.max(0,p.streak||0),best=Math.max(streak,p.bestStreak||0),level=Math.max(1,p.level||1),mastery=nextMastery(nug);
  const title=box.querySelector<HTMLElement>('[data-protocol-title]');
  const detail=box.querySelector<HTMLElement>('[data-protocol-detail]');
  const meter=box.querySelector<HTMLElement>('[data-protocol-meter]');
  const meta=box.querySelector<HTMLElement>('[data-protocol-meta]');
  if(!title||!detail||!meter||!meta)return;

  if(mastery){
    const remaining=Math.max(1,mastery.target-nug);
    title.textContent=`Наступна нагорода · ${mastery.name}`;
    detail.textContent=`${mastery.rarity} specimen · ще ${remaining} ${pluralRuns(remaining)} без допомоги`;
    const floor=mastery.target===3?0:mastery.target===6?3:6;
    meter.style.width=`${Math.max(0,Math.min(100,((nug-floor)/(mastery.target-floor))*100))}%`;
    meta.textContent=`Дослід ${level+1} · серія ${streak} · рекорд ${best} · прогрес не витрачається`;
  }else{
    const target=Math.max(5,Math.ceil((streak+1)/5)*5);
    const remaining=Math.max(1,target-streak);
    title.textContent=`Наступний milestone · серія ${target}`;
    detail.textContent=`Ще ${remaining} ${pluralRuns(remaining)} до нового рекорду серії`;
    meter.style.width=`${Math.max(0,Math.min(100,(streak/target)*100))}%`;
    meta.textContent=`Дослід ${level+1} · рекорд ${best} · без paywall · без втрати прогресу`;
  }
}

const win=document.getElementById('win');
if(win){
  new MutationObserver(()=>{if(win.classList.contains('show'))requestAnimationFrame(renderProtocol)}).observe(win,{attributes:true,attributeFilter:['class']});
}
window.addEventListener('storage',renderProtocol);
renderProtocol();

export {};
