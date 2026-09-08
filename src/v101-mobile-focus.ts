import './v101-mobile-focus.css';

const MOBILE='(max-width: 760px)';
const PREF='chemlab_ui_v101_meta_expanded';
const status=document.querySelector('.status');
const button=document.createElement('button');
button.type='button';
button.className='v101-focus-toggle';
button.setAttribute('aria-controls','dailyProtocol weeklyProtocol collectionLab');

const readExpanded=()=>{try{return localStorage.getItem(PREF)==='1'}catch{return false}};
const writeExpanded=(value:boolean)=>{try{localStorage.setItem(PREF,value?'1':'0')}catch{}};

function apply(expanded=readExpanded()){
  const mobile=window.matchMedia(MOBILE).matches;
  document.body.classList.toggle('v101-focus--compact',mobile&&!expanded);
  button.setAttribute('aria-expanded',String(!mobile||expanded));
  button.innerHTML=mobile&&expanded?'<span>Ігровий фокус</span><span>Сховати meta-прогрес ↑</span>':'<span>Ігровий фокус</span><span>Meta-прогрес ↓</span>';
}

button.addEventListener('click',()=>{const next=!button.matches('[aria-expanded="true"]');writeExpanded(next);apply(next)});
status?.insertAdjacentElement('afterend',button);
const mq=window.matchMedia(MOBILE);mq.addEventListener?.('change',()=>apply());
apply();

const settingsTitle=document.querySelector<HTMLElement>('#settingsPanel h2');if(settingsTitle)settingsTitle.textContent='ChemLab V101';
const settingsCopy=document.querySelector<HTMLElement>('#settingsPanel p');if(settingsCopy)settingsCopy.textContent='Approved full asset lock · certified anti-repeat puzzles · guaranteed solution paths · mobile game-focus hierarchy · cosmetic progression previews · read-only economy readiness · release integrity preflight';

export {};
