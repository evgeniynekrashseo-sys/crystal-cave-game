(()=>{
'use strict';
const KEY='cl31_economy';
let econ={theme:'neon',owned:['neon'],spent:0};try{econ={...econ,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{}
const ITEMS=[
{id:'amber',name:'Бурштинове скло',cost:120,desc:'Косметичний тон пробірок',cls:'theme-amber'},
{id:'violet',name:'Фіолетова плазма',cost:180,desc:'Косметичний тон лабораторії',cls:'theme-violet'},
{id:'ice',name:'Кріо-лабораторія',cost:260,desc:'Косметичний холодний режим',cls:'theme-ice'}
];
const save=()=>localStorage.setItem(KEY,JSON.stringify(econ));
function gold(){try{return +(JSON.parse(localStorage.getItem('cl27_state')||'{}').gold||0)}catch{return 0}}
function setGold(v){try{const s=JSON.parse(localStorage.getItem('cl27_state')||'{}');s.gold=Math.max(0,v|0);localStorage.setItem('cl27_state',JSON.stringify(s));const el=document.getElementById('gold');if(el)el.textContent=s.gold}catch{}}
function apply(){document.documentElement.classList.remove(...ITEMS.map(x=>x.cls));const it=ITEMS.find(x=>x.id===econ.theme);if(it)document.documentElement.classList.add(it.cls)}
function toast(t){const e=document.getElementById('toast');if(!e)return;e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),1800)}
function open(){let o=document.getElementById('economy31');if(o)o.remove();o=document.createElement('div');o.id='economy31';o.className='overlay show';const cards=ITEMS.map(it=>{const own=econ.owned.includes(it.id);return `<button class="econ-item" data-id="${it.id}"><b>${it.name}</b><small>${it.desc}</small><span>${own?(econ.theme===it.id?'АКТИВНО':'ОБРАТИ'):`◉ ${it.cost}`}</span></button>`}).join('');o.innerHTML=`<div class="modal econ-modal"><h2>Лабораторний магазин</h2><p>Тільки косметика. Жодних pay-to-win бонусів.</p><div class="econ-balance">Баланс: <b>◉ ${gold()}</b></div><div class="econ-grid">${cards}</div><button class="secondary econ-close">Закрити</button></div>`;document.body.appendChild(o);o.querySelector('.econ-close').onclick=()=>o.remove();o.querySelectorAll('.econ-item').forEach(b=>b.onclick=()=>{const it=ITEMS.find(x=>x.id===b.dataset.id);if(!it)return;if(econ.owned.includes(it.id)){econ.theme=it.id;save();apply();toast('Оформлення лабораторії змінено');open();return}const g=gold();if(g<it.cost){toast('Недостатньо лабораторних кредитів');return}setGold(g-it.cost);econ.owned.push(it.id);econ.theme=it.id;econ.spent+=it.cost;save();apply();toast('Нове оформлення відкрито');open()})}
function boot(){apply();const tools=document.querySelector('.tools');if(!tools||document.getElementById('shop31'))return;const b=document.createElement('button');b.id='shop31';b.className='icon-btn';b.textContent='◈';b.title='Лабораторний магазин';b.onclick=open;tools.insertBefore(b,document.getElementById('settings'));}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();