(()=>{
'use strict';
const KEY='cl32_progression';
const now=new Date();
function weekKey(d=new Date()){const x=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()));const day=x.getUTCDay()||7;x.setUTCDate(x.getUTCDate()+4-day);const y=new Date(Date.UTC(x.getUTCFullYear(),0,1));const w=Math.ceil((((x-y)/86400000)+1)/7);return `${x.getUTCFullYear()}-W${String(w).padStart(2,'0')}`}
let saved={};try{saved=JSON.parse(localStorage.getItem(KEY)||'{}')}catch{}
const wk=weekKey();
const state={week:saved.week===wk?saved.week:wk,base:saved.week===wk?saved.base:null,prestige:+saved.prestige||0,claimed:Array.isArray(saved.claimed)&&saved.week===wk?saved.claimed:[]};
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
const css=document.createElement('style');css.textContent=`
.v32-launch{font-size:17px!important}.v32-overlay{position:fixed;inset:0;z-index:7600;display:none;place-items:center;padding:18px;background:rgba(0,5,10,.8);backdrop-filter:blur(16px)}.v32-overlay.show{display:grid}.v32-sheet{width:min(455px,94vw);max-height:84vh;overflow:auto;padding:20px;border-radius:26px;background:linear-gradient(180deg,#091925,#050d16);border:1px solid rgba(112,225,255,.18);box-shadow:0 32px 110px rgba(0,0,0,.6)}.v32-head{display:flex;justify-content:space-between;gap:12px}.v32-head h2{margin:0;font-size:22px}.v32-head p{margin:5px 0 0;font-size:11px;opacity:.58}.v32-close{width:34px;height:34px;border:0;border-radius:50%;background:rgba(255,255,255,.06);color:#fff;font-size:20px}.v32-prestige{display:flex;align-items:center;justify-content:space-between;margin:15px 0;padding:12px 13px;border-radius:15px;background:linear-gradient(135deg,rgba(255,205,90,.08),rgba(98,229,255,.07));border:1px solid rgba(255,220,120,.12)}.v32-prestige b{font-size:19px;color:#ffe08c}.v32-prestige span{font-size:10px;opacity:.6}.v32-missions{display:grid;gap:8px}.v32-mission{padding:12px;border-radius:15px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05)}.v32-mission-top{display:flex;justify-content:space-between;gap:10px}.v32-mission b{font-size:12px}.v32-mission em{font-style:normal;font-size:9px;color:#79e7ff}.v32-bar{height:6px;margin-top:8px;background:rgba(255,255,255,.07);border-radius:99px;overflow:hidden}.v32-bar i{display:block;height:100%;background:linear-gradient(90deg,#5ee6ff,#aa70ff);width:0}.v32-mission.done{border-color:rgba(120,235,190,.16)}.v32-mission.done em{color:#87f0bd}.v32-footer{margin-top:12px;font-size:10px;opacity:.5;line-height:1.4}.v32-chip{display:inline-flex;align-items:center;gap:5px;margin-top:8px;padding:6px 9px;border-radius:999px;background:rgba(126,233,255,.07);border:1px solid rgba(126,233,255,.09);font-size:9px;font-weight:800;color:#9eeeff}
`;document.head.appendChild(css);
const tools=document.querySelector('.tools');if(!tools)return;
const btn=document.createElement('button');btn.type='button';btn.className='icon-btn v32-launch';btn.title='Тижнева експедиція';btn.textContent='⌁';tools.prepend(btn);
const ov=document.createElement('div');ov.className='v32-overlay';ov.innerHTML='<div class="v32-sheet"><div class="v32-head"><div><h2>Тижнева експедиція</h2><p>Довгий прогрес поверх основної кампанії</p></div><button class="v32-close">×</button></div><div class="v32-prestige"></div><div class="v32-missions"></div><div class="v32-footer">Експедиція не змінює solver, ходи чи прохідність рівнів. Prestige — окремий мета-прогрес для майбутніх косметичних нагород.</div></div>';document.body.appendChild(ov);
let last={level:1,discovered:[],recipes:[],artifacts:[]};
const norm=s=>({level:+s?.level||1,discovered:Array.isArray(s?.discovered)?s.discovered:[],recipes:Array.isArray(s?.recipes)?s.recipes:[],artifacts:Array.isArray(s?.artifacts)?s.artifacts:[]});
function ensureBase(s){if(state.week!==weekKey()){state.week=weekKey();state.base=null;state.claimed=[]}if(!state.base)state.base={level:s.level,elements:s.discovered.length,recipes:s.recipes.length,artifacts:s.artifacts.length};save()}
function missions(s){ensureBase(s);const b=state.base;return[
 ['levels','Серія дослідів',Math.max(0,s.level-b.level),3],
 ['elements','Нові елементи',Math.max(0,s.discovered.length-b.elements),4],
 ['recipes','Каталог реакцій',Math.max(0,s.recipes.length-b.recipes),2],
 ['artifacts','Польові знахідки',Math.max(0,s.artifacts.length-b.artifacts),1]
]}
function evaluate(s){for(const [id,,value,target] of missions(s)){if(value>=target&&!state.claimed.includes(id)){state.claimed.push(id);state.prestige+=25;save()}}}
function paint(){const ms=missions(last);evaluate(last);ov.querySelector('.v32-prestige').innerHTML=`<div><span>LAB PRESTIGE</span><b>${state.prestige}</b></div><div class="v32-chip">${state.week}</div>`;const box=ov.querySelector('.v32-missions');box.innerHTML='';ms.forEach(([id,title,value,target])=>{const done=value>=target,p=Math.min(100,value/target*100),el=document.createElement('div');el.className='v32-mission '+(done?'done':'');el.innerHTML=`<div class="v32-mission-top"><b>${title}</b><em>${done?'ВИКОНАНО':`${Math.min(value,target)} / ${target}`}</em></div><div class="v32-bar"><i style="width:${p}%"></i></div>`;box.appendChild(el)})}
window.addEventListener('chemlab:state',e=>{last=norm(e.detail);ensureBase(last);evaluate(last);if(ov.classList.contains('show'))paint()});
try{last=norm(window.ChemLab27?.getState?.()||{});ensureBase(last);evaluate(last)}catch{}
btn.onclick=()=>{paint();ov.classList.add('show')};ov.querySelector('.v32-close').onclick=()=>ov.classList.remove('show');ov.onclick=e=>{if(e.target===ov)ov.classList.remove('show')};
})();