type WeeklyState={week:string;days:string[]};
const key='chemlab_weekly_v83';
const pad=(n:number)=>String(n).padStart(2,'0');
const localDate=(d=new Date())=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const mondayOfWeek=(d=new Date())=>{const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());const day=(x.getDay()+6)%7;x.setDate(x.getDate()-day);return x};
const weekStart=mondayOfWeek();
const weekKey=localDate(weekStart);
const weekDates=Array.from({length:7},(_,i)=>{const d=new Date(weekStart);d.setDate(d.getDate()+i);return localDate(d)});
let state:WeeklyState={week:weekKey,days:[]};
try{const parsed=JSON.parse(localStorage.getItem(key)||'null');if(parsed?.week===weekKey&&Array.isArray(parsed.days))state={week:weekKey,days:parsed.days.filter((d:string)=>weekDates.includes(d))}}catch{}
const save=()=>localStorage.setItem(key,JSON.stringify(state));
const host=document.getElementById('weeklyProtocol');
const render=()=>{if(!host)return;const count=state.days.length;const meter=host.querySelector<HTMLElement>('[data-weekly-meter]');const meta=host.querySelector<HTMLElement>('[data-weekly-meta]');const reward=host.querySelector<HTMLElement>('[data-weekly-reward]');const nodes=host.querySelectorAll<HTMLElement>('[data-weekday]');nodes.forEach((node,i)=>{const date=weekDates[i];node.classList.toggle('done',state.days.includes(date));node.classList.toggle('today',date===localDate());node.textContent=state.days.includes(date)?'✓':String(i+1)});if(meter)meter.style.width=`${Math.round(count/7*100)}%`;if(meta)meta.textContent=`${count}/7 чистих днів цього тижня`;if(reward)reward.textContent=count>=7?'ТИЖНЕВИЙ ПРОТОКОЛ ЗАВЕРШЕНО':'ЦІЛЬ: 7 ЧИСТИХ ДНІВ'};
render();
const win=document.getElementById('win');
if(win){new MutationObserver(()=>{if(!win.classList.contains('show'))return;const reward=document.getElementById('winReward')?.textContent||'';if(!reward.includes('кристал майстерності'))return;const today=localDate();if(!weekDates.includes(today)||state.days.includes(today))return;state={...state,days:[...state.days,today]};save();render()}).observe(win,{attributes:true,attributeFilter:['class']})}
export {};
