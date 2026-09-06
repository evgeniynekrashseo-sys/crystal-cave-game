(()=>{
'use strict';
const KEY='cl28_meta';
const today=()=>new Date().toISOString().slice(0,10);
function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}}
function save(v){localStorage.setItem(KEY,JSON.stringify(v))}
const meta=load();
const now=today();
if(meta.lastDay!==now){
  const prev=meta.lastDay?new Date(meta.lastDay+'T00:00:00Z'):null;
  const cur=new Date(now+'T00:00:00Z');
  const days=prev?Math.round((cur-prev)/86400000):99;
  meta.streak=days===1?(+meta.streak||0)+1:1;
  meta.lastDay=now;
}
meta.sessions=(+meta.sessions||0)+1;save(meta);

function readGame(){try{return JSON.parse(localStorage.getItem('cl27_state')||'{}')}catch{return{}}}
function objectiveText(state){
  const type=state?.levelType||'';
  if(/BOSS/i.test(type))return 'BOSS: очищай пробірки без зайвих ходів';
  if(/Нестаб/i.test(type))return 'Уникай ризикових пар і очищай по 4 однакові';
  if(/Катал/i.test(type))return 'Збери чисті пробірки й перевір станцію синтезу';
  if(/Відкр/i.test(type))return 'Очисти зразки та відкрий нові елементи';
  return 'Збери 4 однакові елементи в одній пробірці';
}
function ensureHUD(state){
  let hud=document.getElementById('v28Objective');
  if(!hud){
    hud=document.createElement('section');hud.id='v28Objective';hud.className='v28-objective';
    const strip=document.getElementById('missionStrip');(strip?.parentNode||document.querySelector('.app'))?.insertBefore(hud,strip?.nextSibling||null);
  }
  const discovered=Array.isArray(state?.discovered)?state.discovered.length:(readGame().discovered||[]).length;
  hud.innerHTML=`<div><small>ЦІЛЬ ДОСЛІДУ</small><b>${objectiveText(state)}</b></div><div class="v28-meta"><span>▦ ${discovered}/118</span><span>🔥 ${meta.streak} дн.</span></div>`;
}
function onboarding(){
  if(meta.onboarded)return;
  const ov=document.createElement('div');ov.className='v28-onboarding';
  ov.innerHTML=`<div class="v28-onboard-card"><small>CHEMLAB · ШВИДКИЙ СТАРТ</small><h2>Збери всю таблицю</h2><div class="v28-steps"><p><b>1</b><span>Торкайся пробірок і переливай однакові верхні шари</span></p><p><b>2</b><span>4 однакові елементи очищають пробірку й рухають дослід вперед</span></p><p><b>3</b><span>Відкривай елементи, рецепти й артефакти, доки не збереш 118/118</span></p></div><button type="button">Почати дослід</button></div>`;
  document.body.appendChild(ov);requestAnimationFrame(()=>ov.classList.add('show'));
  ov.querySelector('button').onclick=()=>{meta.onboarded=true;save(meta);ov.classList.remove('show');setTimeout(()=>ov.remove(),260)};
}
function comeback(){
  if(meta.sessions<2||meta.welcomedDay===now)return;
  meta.welcomedDay=now;save(meta);
  const chip=document.createElement('div');chip.className='v28-comeback';chip.textContent=`🔥 Серія ${meta.streak} дн. · Продовжуй збирати 118/118`;
  document.body.appendChild(chip);requestAnimationFrame(()=>chip.classList.add('show'));setTimeout(()=>{chip.classList.remove('show');setTimeout(()=>chip.remove(),250)},2600);
}
let last={};
window.addEventListener('chemlab:state',e=>{last=e.detail||{};ensureHUD(last)});
window.addEventListener('DOMContentLoaded',()=>{setTimeout(()=>{ensureHUD(last);onboarding();comeback()},420)},{once:true});
})();
