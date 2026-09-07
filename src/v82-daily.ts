type DailyState={date:string;claimed:boolean};
const key='chemlab_daily_v82';
const today=new Date().toISOString().slice(0,10);
let state:DailyState={date:today,claimed:false};
try{const parsed=JSON.parse(localStorage.getItem(key)||'null');if(parsed?.date===today)state=parsed}catch{}
const host=document.getElementById('dailyProtocol');
if(host){
  const title=host.querySelector<HTMLElement>('[data-daily-title]');
  const meta=host.querySelector<HTMLElement>('[data-daily-meta]');
  const badge=host.querySelector<HTMLElement>('[data-daily-state]');
  const render=()=>{if(title)title.textContent='Щоденний експеримент';if(meta)meta.textContent=state.claimed?'Сьогоднішній протокол уже зараховано · повернись завтра':'Заверши будь-який дослід без підказок · +1 до щоденної серії';if(badge)badge.textContent=state.claimed?'ВИКОНАНО':'АКТИВНО'};
  render();
  const win=document.getElementById('win');
  if(win){new MutationObserver(()=>{if(!win.classList.contains('show')||state.claimed)return;const reward=document.getElementById('winReward')?.textContent||'';if(reward.includes('кристал майстерності')){state={date:today,claimed:true};localStorage.setItem(key,JSON.stringify(state));render()}}).observe(win,{attributes:true,attributeFilter:['class']})}
}
export {};