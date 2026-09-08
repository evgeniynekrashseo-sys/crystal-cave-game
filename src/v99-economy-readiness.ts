import './v99-economy-readiness.css';
type Save={gold?:number;nugget?:number;wins?:number;cleanWins?:number};
const readSave=():Save=>{try{return JSON.parse(localStorage.getItem('chemlab_v50')||'{}')}catch{return {}}};
const offers=[
  {name:'ION CHROME',price:180,currency:'gold',tag:'UNCOMMON'},
  {name:'VIOLET PHASE',price:420,currency:'gold',tag:'EPIC'},
  {name:'AURUM CORE',price:12,currency:'nugget',tag:'LEGENDARY'},
] as const;
const section=document.createElement('section');
section.className='v99-economy';section.setAttribute('aria-label','Cosmetic economy readiness');
section.innerHTML=`<div class="v99-economy__head"><div><span class="v99-economy__eyebrow">COSMETIC ECONOMY</span><h3>Лабораторний каталог</h3></div><span class="v99-economy__wallet" data-economy-wallet>0 Au · 0 Pt</span></div><div class="v99-economy__grid" data-economy-grid></div><p class="v99-economy__note">Preview економіки: без реальних платежів і без списання валюти. Косметика не впливає на складність або гарантовану прохідність.</p>`;
(document.querySelector('.v98-preview')||document.querySelector('.prestige-vault')||document.querySelector('.collection-lab'))?.insertAdjacentElement('afterend',section);
const settingsTitle=document.querySelector<HTMLElement>('#settingsPanel h2');if(settingsTitle)settingsTitle.textContent='ChemLab V100';
const settingsCopy=document.querySelector<HTMLElement>('#settingsPanel p');if(settingsCopy)settingsCopy.textContent='Approved full asset lock · physical reagent motion cues · first-session coach · reward anticipation loop · prestige cosmetic vault · cosmetic unlock previews · read-only economy readiness · premium victory payoff · certified anti-repeat puzzles · guaranteed solution paths · release integrity preflight';
function render(){
  const save=readSave();const gold=Math.max(0,Number(save.gold)||0);const nugget=Math.max(0,Number(save.nugget)||0);
  const wallet=section.querySelector<HTMLElement>('[data-economy-wallet]');if(wallet)wallet.textContent=`${gold} Au · ${nugget} Pt`;
  const grid=section.querySelector<HTMLElement>('[data-economy-grid]');if(!grid)return;
  grid.innerHTML=offers.map((o,i)=>{const balance=o.currency==='gold'?gold:nugget;const affordable=balance>=o.price;const missing=Math.max(0,o.price-balance);const symbol=o.currency==='gold'?'Au':'Pt';return `<article class="v99-economy__card${affordable?' is-ready':''}"><div class="v99-economy__swatch v99-economy__swatch--${i+1}" aria-hidden="true"></div><div><span>${o.tag}</span><strong>${o.name}</strong><small>${o.price} ${symbol}</small><em>${affordable?'ДОСТУПНО ДЛЯ UNLOCK':`ЩЕ ${missing} ${symbol}`}</em></div></article>`}).join('');
}
render();window.addEventListener('storage',render);document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});
export {};
