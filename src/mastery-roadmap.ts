type Tier={name:string;at:number};
const TIERS:Tier[]=[{name:'Neon Glass',at:3},{name:'Violet Glass',at:6},{name:'Gold Glass',at:10}];

function readCrystals(){try{const raw=localStorage.getItem('chemlab_v50');const state=raw?JSON.parse(raw):null;return Math.max(0,Number(state?.nug)||0)}catch{return 0}}

function renderMasteryRoadmap(){
  const host=document.querySelector<HTMLElement>('[aria-label="Шлях майстерності"]');
  if(!host)return;
  const crystals=readCrystals();
  const next=TIERS.find(t=>crystals<t.at);
  const current=[...TIERS].reverse().find(t=>crystals>=t.at);
  const previousAt=current?.at||0;
  const targetAt=next?.at||TIERS[TIERS.length-1].at;
  const progress=next?Math.max(0,Math.min(100,((crystals-previousAt)/(targetAt-previousAt))*100)):100;
  const remaining=next?Math.max(0,next.at-crystals):0;
  const status=next?`Ще ${remaining} чист${remaining===1?'е проходження':remaining<5?'і проходження':'их проходжень'} до ${next.name}`:'Усі стилі скла відкрито';
  const tierText=TIERS.map(t=>`${crystals>=t.at?'✓':'◇'} ${t.name.replace(' Glass','')} ${t.at} ◆`).join(' · ');
  host.innerHTML=`<span>◆ <strong>МАЙСТЕРНІСТЬ</strong></span><div class="xp"><i style="width:${progress.toFixed(1)}%"></i></div><span class="xplabel">${status}</span><span class="xplabel" aria-label="Рівні майстерності">${tierText}</span>`;
}

const nugget=document.getElementById('nugget');
if(nugget)new MutationObserver(renderMasteryRoadmap).observe(nugget,{childList:true,characterData:true,subtree:true});
window.addEventListener('focus',renderMasteryRoadmap);
renderMasteryRoadmap();
