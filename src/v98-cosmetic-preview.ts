import './v99-economy-readiness';
import './v101-mobile-focus';
type Save={nug?:number};
const readSave=():Save=>{try{return JSON.parse(localStorage.getItem('chemlab_v50')||'{}')}catch{return {}}};
const tiers=[
  {target:3,code:'ION CHROME',label:'Холодне хромоване скло',rarity:'UNCOMMON'},
  {target:6,code:'VIOLET PHASE',label:'Фіолетовий лабораторний контур',rarity:'EPIC'},
  {target:10,code:'AURUM CORE',label:'Золотий реакторний акцент',rarity:'LEGENDARY'},
] as const;
const section=document.createElement('section');
section.className='v98-preview';section.setAttribute('aria-label','Cosmetic preview ladder');
section.innerHTML=`<div class="v98-preview__head"><div><span class="v98-preview__eyebrow">NEXT UNLOCK PREVIEW</span><h3>Майбутні лабораторні скіни</h3></div><span class="v98-preview__signal" data-preview-signal>SCANNING</span></div><div class="v98-preview__cards" data-preview-cards></div><p class="v98-preview__note">Лише косметика: жоден unlock не змінює складність, ходи або гарантію проходження</p>`;
(document.querySelector('.prestige-vault')||document.querySelector('.collection-lab'))?.insertAdjacentElement('afterend',section);
function render(){
  const save=readSave();const clean=Math.max(0,Number(save.nug??0)||0);
  const cards=section.querySelector<HTMLElement>('[data-preview-cards]');if(!cards)return;
  cards.innerHTML=tiers.map((tier,index)=>{const unlocked=clean>=tier.target;const remaining=Math.max(0,tier.target-clean);const active=!unlocked&&tiers.slice(0,index).every(t=>clean>=t.target);return `<article class="v98-preview__card${active?' is-next':''}${unlocked?' is-unlocked':''}" data-cosmetic-tier="${index}" data-cosmetic-target="${tier.target}"><div class="v98-preview__visual v98-preview__visual--${index+1}" aria-hidden="true"><i></i><b></b></div><div class="v98-preview__meta"><span>${tier.rarity}</span><strong>${tier.code}</strong><p>${tier.label}</p><small>${unlocked?'ВІДКРИТО':active?`ЩЕ ${remaining} ЧИСТИХ ПРОХОДЖЕНЬ`:`ВІДКРИЄТЬСЯ НА ${tier.target}`}</small></div></article>`}).join('');
  const next=tiers.find(t=>clean<t.target);const signal=section.querySelector<HTMLElement>('[data-preview-signal]');if(signal)signal.textContent=next?`${clean}/${next.target}`:'ALL UNLOCKED';
}
render();
void import('./v103-cosmetic-ownership');
window.addEventListener('storage',render);document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});
export {};
