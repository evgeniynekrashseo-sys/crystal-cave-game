import './v102-cosmetic-equip-preview.css';
const PREVIEW_KEY='chemlab_ui_v102_cosmetic_preview';
const themes=['ion','violet','aurum'] as const;
type Theme=typeof themes[number];
const settingsTitle=document.querySelector<HTMLElement>('#settingsPanel h2');
if(settingsTitle)settingsTitle.textContent='ChemLab V102';
const settingsCopy=document.querySelector<HTMLElement>('#settingsPanel p');
if(settingsCopy)settingsCopy.textContent='Approved full asset lock · live cosmetic equip preview · physical reagent motion cues · mobile game focus · prestige cosmetic vault · premium victory payoff · certified anti-repeat puzzles · guaranteed solution paths';
const cards=[...document.querySelectorAll<HTMLElement>('.v98-preview__card')];
const section=document.querySelector<HTMLElement>('.v98-preview');
if(section&&cards.length){
  const head=section.querySelector('.v98-preview__head');
  const control=document.createElement('div');
  control.className='v102-equip';
  control.innerHTML='<span class="v102-equip__label">LIVE LAB PREVIEW</span><button type="button" class="v102-equip__reset" data-v102-reset>ORIGINAL</button>';
  head?.insertAdjacentElement('afterend',control);
  const setTheme=(theme:Theme|null,persist=true)=>{
    if(theme) document.body.dataset.cosmeticPreview=theme; else delete document.body.dataset.cosmeticPreview;
    cards.forEach((card,index)=>{
      const active=theme===themes[index];
      card.classList.toggle('is-previewing',active);
      card.setAttribute('aria-pressed',String(active));
    });
    if(persist){try{theme?localStorage.setItem(PREVIEW_KEY,theme):localStorage.removeItem(PREVIEW_KEY)}catch{}}
  };
  cards.forEach((card,index)=>{
    card.setAttribute('role','button');card.setAttribute('tabindex','0');card.setAttribute('aria-label',`Переглянути ${card.querySelector('strong')?.textContent||'косметичний стиль'} на лабораторії`);
    const activate=()=>setTheme(themes[index]);
    card.addEventListener('click',activate);
    card.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();activate()}});
  });
  control.querySelector<HTMLButtonElement>('[data-v102-reset]')?.addEventListener('click',()=>setTheme(null));
  let saved:Theme|null=null;try{const raw=localStorage.getItem(PREVIEW_KEY);if(themes.includes(raw as Theme))saved=raw as Theme}catch{}
  setTheme(saved,false);
}
export {};
