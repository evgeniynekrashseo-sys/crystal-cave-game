(()=>{
'use strict';
function boot(){
  const tools=document.querySelector('.tools');if(!tools||document.querySelector('.lab-hub-v37'))return;
  const host=document.createElement('div');host.className='lab-hub-v37';
  const btn=document.createElement('button');btn.type='button';btn.className='lab-hub-v37-btn';btn.title='Lab Hub';btn.setAttribute('aria-label','Відкрити Lab Hub');btn.textContent='⌘';
  const menu=document.createElement('div');menu.className='lab-hub-v37-menu';menu.innerHTML=`<div class="lab-hub-v37-title">LAB HUB</div><div class="lab-hub-v37-grid">
    <button class="lab-hub-v37-item" data-target=".journal-launch"><i>◇</i><b>Колекція</b><span>Елементи, рецепти та артефакти</span></button>
    <button class="lab-hub-v37-item" data-target=".v30-launch"><i>◎</i><b>Щоденна лабораторія</b><span>Daily challenge та досягнення</span></button>
    <button class="lab-hub-v37-item" data-target=".v32-launch"><i>⌁</i><b>Тижнева експедиція</b><span>Weekly missions та prestige</span></button>
    <button class="lab-hub-v37-item" data-target="#shop31"><i>◈</i><b>Магазин</b><span>Косметичні теми лабораторії</span></button>
  </div>`;
  host.appendChild(btn);document.body.appendChild(menu);
  const settings=document.getElementById('settings');tools.insertBefore(host,settings||null);
  const close=()=>menu.classList.remove('show');
  btn.onclick=e=>{e.stopPropagation();menu.classList.toggle('show')};
  menu.addEventListener('click',e=>{const item=e.target.closest('.lab-hub-v37-item');if(!item)return;const target=document.querySelector(item.dataset.target);close();if(target)target.click()});
  document.addEventListener('click',e=>{if(!menu.contains(e.target)&&!host.contains(e.target))close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  const h=document.querySelector('#settingsPanel h2');if(h)h.textContent='Лабораторія V37';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
