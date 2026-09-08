import './v102-cosmetic-equip-preview.css';
import './v103-cosmetic-ownership.css';

const EQUIP_KEY='chemlab_ui_v103_equipped_cosmetic';
const CORE_KEY='chemlab_v50';
const themes=['ion','violet','aurum'] as const;
const targets=[3,6,10] as const;
type Theme=typeof themes[number];
type Save={nug?:number};

const readMastery=()=>{try{const save=JSON.parse(localStorage.getItem(CORE_KEY)||'{}') as Save;return Math.max(0,Number(save.nug??0)||0)}catch{return 0}};
const cards=()=>[...document.querySelectorAll<HTMLElement>('.v98-preview__card')];
const section=document.querySelector<HTMLElement>('.v98-preview');
const settingsTitle=document.querySelector<HTMLElement>('#settingsPanel h2');
if(settingsTitle)settingsTitle.textContent='ChemLab V104';
const settingsCopy=document.querySelector<HTMLElement>('#settingsPanel p');
if(settingsCopy)settingsCopy.textContent='Approved full asset lock · mastery-backed cosmetic ownership · unlock celebration · persistent safe equip · physical reagent motion cues · mobile game focus · prestige cosmetic vault · premium victory payoff · certified anti-repeat puzzles · guaranteed solution paths';

if(section){
  const head=section.querySelector('.v98-preview__head');
  const control=document.createElement('div');
  control.className='v102-equip v103-ownership';
  control.innerHTML='<span class="v102-equip__label" data-v103-status>LAB STYLE · ORIGINAL</span><button type="button" class="v102-equip__reset" data-v103-reset>ORIGINAL</button>';
  head?.insertAdjacentElement('afterend',control);

  const status=control.querySelector<HTMLElement>('[data-v103-status]');
  const unlocked=(index:number)=>readMastery()>=targets[index];
  const label=(theme:Theme|null,preview=false)=>theme?`${preview?'PREVIEW':'EQUIPPED'} · ${theme.toUpperCase()}`:'LAB STYLE · ORIGINAL';
  const apply=(theme:Theme|null,preview=false)=>{
    if(theme)document.body.dataset.cosmeticPreview=theme;else delete document.body.dataset.cosmeticPreview;
    cards().forEach((card,index)=>{
      const active=theme===themes[index];
      card.classList.toggle('is-previewing',active);
      card.classList.toggle('is-equipped',active&&!preview&&unlocked(index));
      card.setAttribute('aria-pressed',String(active));
    });
    if(status)status.textContent=label(theme,preview);
  };
  const persistEquip=(theme:Theme|null)=>{try{theme?localStorage.setItem(EQUIP_KEY,theme):localStorage.removeItem(EQUIP_KEY)}catch{}};
  const restore=()=>{
    let saved:Theme|null=null;
    try{const raw=localStorage.getItem(EQUIP_KEY);if(themes.includes(raw as Theme))saved=raw as Theme}catch{}
    if(saved){const index=themes.indexOf(saved);if(index>=0&&unlocked(index)){apply(saved,false);return}persistEquip(null)}
    apply(null,false);
  };
  const bind=()=>cards().forEach((card,index)=>{
    card.setAttribute('role','button');card.setAttribute('tabindex','0');
    const name=card.querySelector('strong')?.textContent||'косметичний стиль';
    const activate=()=>{const theme=themes[index];if(unlocked(index)){persistEquip(theme);apply(theme,false)}else{apply(theme,true)}};
    card.setAttribute('aria-label',unlocked(index)?`Екіпірувати ${name}`:`Переглянути заблокований стиль ${name}`);
    card.onclick=activate;card.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();activate()}};
  });
  bind();restore();
  control.querySelector<HTMLButtonElement>('[data-v103-reset]')?.addEventListener('click',()=>{persistEquip(null);apply(null,false)});
  window.addEventListener('storage',()=>{bind();restore()});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){bind();restore()}});
}
void import('./v104-unlock-celebration');
export {};
