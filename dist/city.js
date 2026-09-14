import {CITY_RESEARCH} from './city-research.js?v=23';
import {mountCityHud} from './city-hud.js?v=23';
import {drawSettlement,mapTile} from './settlement-renderer.js?v=23';
import {bindMapControls,boundCamera,projectPoint,MIN_ZOOM,MAX_ZOOM} from './settlement-camera.js?v=23';
import {SIZE,TYPES,TECH,LABELS,deliverDiscovery,terrain,normalizeCity,onChemistryWin,stats,step,build,canPlace,upgrade,upgradeCost,expand,research,affordable,demolish,demolitionRefund,VOYAGES,voyageError,dispatchVoyage,claimCityCoins,cityGoal,claimCityGoal,ensureCitySystems,cityEra,DISTRICTS,EXPEDITIONS,CITY_EVENTS,advanceCitySystems,resolveCityEvent,cityEventError,dispatchExpedition,expeditionError,districtSummary} from './settlement-model.js?v=23';
const KEY='chemlab_settlement_v2';
export function initCity(api){
 let raw;try{raw=JSON.parse(localStorage.getItem(KEY))}catch{}
 const c=ensureCitySystems(normalizeCity(raw,api.core().level));onChemistryWin(c,api.core().level);
 let root,canvas,ctx,raf,hudView,active=false,tab=null,tool=null,selected={x:4,y:5},zoom=1,pan={x:0,y:0},last=0,saveTime=0,uiTime=0,simTime=0,noticeTimer=0,pendingDemolition=false;
 const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(c))}catch{notice('Браузер не дозволяє збереження. Залиш цю вкладку відкритою.')}};
 const icon=name=>`<img src="icons/${name}.svg" alt="" aria-hidden="true">`;
 const notice=msg=>{if(!root)return;const node=root.querySelector('#city-notice');node.textContent=msg;node.classList.add('show');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>node.classList.remove('show'),3400)};
 const costText=v=>Object.entries(v).map(([k,n])=>`${n} ${LABELS[k]}`).join(' · ');
 const building=()=>c.buildings.find(b=>b.x===selected.x&&b.y===selected.y);
 let hits=[],mapControls,renderedTab=null;const panelScroll=new Map(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const view=()=>({width:canvas.clientWidth,height:canvas.clientHeight});
 const camera=()=>({zoom,pan});
 function changeCamera(next){
  zoom=next.zoom;pan=next.pan;
  root.querySelector('#city-zoom-value').textContent=`${Math.round(zoom*100)}%`;
  root.querySelector('#city-zoom-in').disabled=zoom>=MAX_ZOOM-1e-8;
  root.querySelector('#city-zoom-out').disabled=zoom<=MIN_ZOOM+1e-8;
 }
 function selectMap({x,y}){
  // Refresh hit bounds after zoom/resize, rather than using the previous animation frame.
  draw(performance.now()/1000);
  const h=[...hits].reverse().find(h=>x>=h.left&&x<=h.left+h.width&&y>=h.top&&y<=h.top+h.height);
  if(h?.lab&&!tool){close();return;}
  const p=!tool&&h?{x:h.x,y:h.y}:unproject(x,y);
  if(p.x>=0&&p.y>=0&&p.x<c.extent&&p.y<c.extent){selected=p;pendingDemolition=false;if(!tool)togglePanel('build');else panel();}
 }
 function unproject(x,y){return mapTile(canvas,zoom,pan,x,y)}
 function draw(time){hits=drawSettlement(ctx,canvas,c,{zoom,pan,selected,tool,time,reduced:reduced.matches})}
 function rememberPanelScroll(){
  if(!root||!renderedTab)return;
  const target=root.querySelector('#city-panel');
  panelScroll.set(renderedTab,{top:target.scrollTop,left:target.querySelector('.city-catalog')?.scrollLeft||0});
 }
 function togglePanel(next){rememberPanelScroll();renderedTab=null;tab=next;root.classList.toggle('panel-open',!!next);root.querySelectorAll('[data-city-tab]').forEach(b=>{b.classList.toggle('chosen',b.dataset.cityTab===next);b.classList.toggle('current',!next&&b.dataset.cityTab==='life');b.setAttribute('aria-expanded',String(b.dataset.cityTab===next));});if(next)panel();resize();}
 function hud(){
  const s=stats(c);
  for(const node of root.querySelectorAll('[data-resident-status]')){const a=c.agents[Number(node.dataset.residentStatus)];if(a)node.textContent=`Мешканець ${a.id+1} · ${TYPES[c.buildings.find(b=>b.id===a.job)?.type]?.name||'Дім'} · ${{work:'працює',out:'прямує на роботу',return:'доставляє продукцію',idle:'готується до рейсу'}[a.state]||a.state}`;}
  hudView.update({wood:c.resources.wood,stone:c.resources.stone,food:c.resources.food,gold:api.core().gold},c.population,s.housing);
  root.querySelector('#city-population').setAttribute('aria-label',`Мешканці ${c.population} з ${s.housing}. Здоров’я ${s.health} відсотків, задоволення ${s.happiness} відсотків`);
  root.querySelector('#city-vitals').textContent=`${cityEra(c).name} · ${c.population}/${s.housing} мешканців · ${s.workers} працюють · здоров’я ${s.health}% · задоволення ${s.happiness}%`;
  const mission=root.querySelector('.city-mission');
  const goal=cityGoal(c);mission.querySelector('b').textContent=goal?.name||'Місто майбутнього';
  mission.querySelector('span').textContent=c.activeEvent?`Криза: ${CITY_EVENTS.find(e=>e.id===c.activeEvent.id)?.name||'подія'} · натисни, щоб вирішити`:goal?(goal.test(c)?`Готово: +${goal.coins} монет`:goal.hint):'Освіта, торгівля та нові відкриття';
  mission.querySelector('button').textContent=goal?.test(c)?'Забрати':'Завдання';
  for(const node of root.querySelectorAll('[data-city-stock]'))node.textContent=String(Math.floor(c.resources[node.dataset.cityStock]||0));
  for(const node of root.querySelectorAll('[data-voyage-time]')){const v=c.voyages.find(v=>v.x===selected.x&&v.y===selected.y);node.textContent=v?`${VOYAGES[v.kind].name} · повернення за ${Math.max(1,Math.ceil(VOYAGES[v.kind].duration-v.elapsed))} с`:'Корабель готовий до рейсу';}
  for(const node of root.querySelectorAll('[data-voyage]'))node.disabled=!!voyageError(c,building(),node.dataset.voyage);
  const claim=root.querySelector('#city-goal-claim');if(claim)claim.disabled=!goal?.test(c);
  const selectedBuilding=building(),status=root.querySelector('[data-city-building-status]');
  if(status&&selectedBuilding)status.textContent=selectedBuilding.ready>c.seconds?'Будівництво триває':`Працівники: ${c.agents.filter(a=>a.job===selectedBuilding.id).length}/${TYPES[selectedBuilding.type].workers}`;
  root.querySelector('#city-time').textContent=`День ${1+Math.floor(c.seconds/120)} · Дослідження ${Math.floor(c.resources.research)}`;
 }
 function decorateShell(){hudView=mountCityHud(root,icon);root.querySelector('#city-time').classList.add('sr-only');const mission=root.querySelector('.city-mission');mission.insertAdjacentHTML('afterbegin',icon('water'));const controls=[['#city-exit','chemistry','Хімія'],['[data-city-tab="build"]','build','Будувати'],['[data-city-tab="tech"]','discoveries','Відкриття'],['[data-city-tab="life"]','city','Місто']];for(const [selector,image,label]of controls){const button=root.querySelector(selector);button.innerHTML=`${icon(image)}<span>${label}</span>`;}root.querySelector('[data-city-tab="life"]').classList.add('current');root.querySelector('#city-zoom-in').innerHTML=`${icon('zoom-in')}<span class="sr-only">Наблизити</span>`;root.querySelector('#city-zoom-out').innerHTML=`${icon('zoom-out')}<span class="sr-only">Віддалити</span>`;root.querySelector('#city-center').innerHTML=`${icon('center')}<span class="sr-only">Повернути камеру до центру</span>`;}
 function panel(){rememberPanelScroll();const b=building();const target=root.querySelector('#city-panel');if(!tab){target.innerHTML='';renderedTab=null;return;}if(tab==='build')target.innerHTML=renderBuildingPanel(c,{selected,tool},costText);
 else if(tab==='tech')target.innerHTML=`<p class="city-hint">Відкривай елементи в лабораторії та витрачай дослідження на потреби мешканців. Перемога дає 2 дослідження; відкриття лабораторного скла — ще 1.</p>${TECH.map(t=>`<article class="city-research-card"><b>${CITY_RESEARCH[t.id].title}</b><p>${CITY_RESEARCH[t.id].story}</p><div class="research-benefit"><strong>Що зміниться у грі</strong><p>${CITY_RESEARCH[t.id].effect}</p></div><details><summary>Хімія та історія відкриття</summary><p>${CITY_RESEARCH[t.id].science}</p><p>${CITY_RESEARCH[t.id].history}</p><small>Числові бонуси й порядок відкриттів — правила гри.</small></details><small>Потрібні елементи: ${t.elements.join(', ')} · ${t.cost} досліджень${t.after.length?' · спочатку: '+t.after.map(id=>TECH.find(x=>x.id===id).name).join(', '):''}</small><button data-tech="${t.id}" ${c.tech.includes(t.id)||!t.elements.every(x=>api.core().discovered.includes(x))||!t.after.every(x=>c.tech.includes(x))||c.resources.research<t.cost?'disabled':''}>${c.tech.includes(t.id)?'Впроваджено':'Дослідити'}</button></article>`).join('')}`;
 else target.innerHTML=`<article><b>Розвідка території ${c.extent} × ${c.extent}</b><p>Відкриває землю та поклади для нових шахт і каменярень.</p><button id="city-expand" ${c.extent>=SIZE?'disabled':''}>Розвідати · ${c.extent*3} деревини · ${c.extent*2} каменю · 1 дослідження</button></article><article><b>Торгівля з лабораторією</b><p>10 товарів із заводу → 35 монет для основної гри.</p><button id="city-trade" ${c.resources.goods<10?'disabled':''}>Відправити товари</button></article><article><b>Речовини з лабораторії</b><p>${c.discoveries.length?c.discoveries.map(id=>({salt:'NaCl · збереження їжі',water:'H₂O · водопостачання',greenhouse:'CO₂ · теплиці',ammonia:'NH₃ · добрива',glass:'SiO₂ · лабораторне скло'}[id])).join('<br>'):'Проходь місії на формули від рівня 5, щоб отримувати постійні покращення.'}</p></article><article><b>Життя поселення</b><p>Народилося: ${c.births}. Приїхало: ${c.arrivals}. Мешканців із симптомами: ${stats(c).sick} (ігровий показник).</p><p>Нове житло приймає поселенців після перемог. Водогін, медична допомога та їжа підтримують здоров’я. За їх наявності родини зростають кожні два активні ігрові хвилини. Поза грою місто на паузі.</p></article><article><b>Мешканці та робота</b>${c.agents.map(a=>`<p data-resident-status="${a.id}">Мешканець ${a.id+1} · ${TYPES[c.buildings.find(b=>b.id===a.job)?.type]?.name||'Дім'} · ${{work:'працює',out:'прямує на роботу',return:'доставляє продукцію',idle:'готується до рейсу'}[a.state]||a.state}</p>`).join('')}</article><article><b>Події</b>${c.events.slice().reverse().map(x=>`<p>${x}</p>`).join('')}</article>`;
 if(tab==='life'){
  const goal=cityGoal(c),types={stone:'quarry',school:'school',ranch:'ranch',fishery:'fishery',voyage:'harbor'};
 target.insertAdjacentHTML('afterbegin',`${goal?`<article class="city-goal"><b>${goal.name}</b><p>${goal.hint}</p><small>Нагорода: ${goal.coins} монет · ${costText(goal.reward)}</small><button id="city-goal-claim" ${goal.test(c)?'':'disabled'}>Забрати нагороду</button>${types[goal.id]?`<button data-goal-build="${types[goal.id]}">Обрати: ${TYPES[types[goal.id]].name}</button>`:''}</article>`:''}<article><b>Запаси міста</b><div class="city-stocks">${Object.entries(LABELS).map(([id,name])=>`<span>${name}<b data-city-stock="${id}">${Math.floor(c.resources[id])}</b></span>`).join('')}</div><p>Освіта: ${stats(c).education}% · учнів: ${stats(c).students}. Продуктивність: +${Math.round(stats(c).education/2.5)}%.</p><p>Завершених морських рейсів: ${c.completedVoyages}</p><button id="city-show-coast">До моря</button></article>`);
  const districts=districtSummary(c);
  target.insertAdjacentHTML('beforeend',`<article class="city-era"><b>Епоха: ${cityEra(c).name}</b><p>${cityEra(c).text}</p><div class="city-districts">${Object.entries(DISTRICTS).map(([id,d])=>`<span><b>${districts[id]}</b> ${d.name}</span>`).join('')}</div></article>${c.activeEvent?`<article class="city-event"><b>Подія: ${CITY_EVENTS.find(e=>e.id===c.activeEvent.id)?.name||'Криза'}</b><p>${CITY_EVENTS.find(e=>e.id===c.activeEvent.id)?.text||''}</p><small>Залишилось: ${Math.max(0,Math.ceil(CITY_EVENTS.find(e=>e.id===c.activeEvent.id).duration-c.activeEvent.elapsed))} с · Витрати: ${costText(CITY_EVENTS.find(e=>e.id===c.activeEvent.id).cost)}</small><p>${cityEventError(c)||'Готово до допомоги. Нагорода: 10 монет та ресурси.'}</p><button id="city-event-resolve" ${cityEventError(c)?'disabled':''}>Допомогти місту</button></article>`:''}<article><b>Експедиції</b><p>${c.expeditions.length?c.expeditions.map(e=>`${EXPEDITIONS[e.kind].name} · ${Math.max(1,Math.ceil(EXPEDITIONS[e.kind].duration-e.elapsed))} с`).join('<br>'):'Вільні команди вирушають із пристані або рибальні.'}</p></article>`);
 }
 if(tab==='build'&&b&&!tool){
  target.insertAdjacentHTML('beforeend',`${b.type==='harbor'?`<article><b>Морські контракти</b><p data-voyage-time></p>${Object.entries(VOYAGES).map(([id,v])=>`<div class="city-contract"><b>${v.name}</b><small>Вантаж: ${costText(v.cost)} · ${v.duration} с</small><small>Повернення: ${v.coins*b.level} монет · ${costText(Object.fromEntries(Object.entries(v.reward).map(([k,n])=>[k,n*b.level])))}</small><button data-voyage="${id}" ${voyageError(c,b,id)?'disabled':''}>Відправити корабель</button></div>`).join('')}</article>`:''}${['harbor','fishery'].includes(b.type)?`<article><b>Експедиції</b><p>Ризикована подорож відкриває ресурси та артефакти.</p>${Object.entries(EXPEDITIONS).map(([id,e])=>`<div class="city-contract"><b>${e.name}</b><small>${e.duration} с · ${costText(e.cost)} → ${costText(e.reward)} · ${e.coins} монет</small><button data-expedition="${id}" ${expeditionError(c,b,id)?'disabled':''}>Відправити команду</button></div>`).join('')}</article>`:''}`);
 }
 if(tab==='build'&&!tool&&(b||c.roads.some(r=>r.x===selected.x&&r.y===selected.y))){
  target.insertAdjacentHTML('beforeend',`<div class="city-demolition">${pendingDemolition?`<b>Знести ${b?TYPES[b.type].name:'дорогу'}?</b><p>${b?'Повернення матеріалів: '+costText(demolitionRefund(b)): 'Дорожню ділянку буде прибрано. Перевезення отримають новий маршрут.'} Мешканці залишаться у місті.</p><button id="city-demolish-confirm">Підтвердити знесення</button><button id="city-demolish-cancel">Скасувати</button>`:'<button id="city-demolish">Знести будівлю / дорогу</button>'}</div>`);
 }
 if(tab==='tech')target.insertAdjacentHTML('afterbegin',`<div class="city-research-balance"><span>Доступні дослідження</span><b>${Math.floor(c.resources.research)}</b></div>`);
 target.querySelectorAll('[data-tool]').forEach(el=>el.onclick=()=>{tool=tool===el.dataset.tool?null:el.dataset.tool;pendingDemolition=false;if(TYPES[tool]?.coastal){selected={x:5,y:0};focusCoast();}panel()});target.querySelectorAll('[data-tech]').forEach(el=>el.onclick=()=>{if(research(c,el.dataset.tech,api.core().discovered)){persist();hud();panel();notice('Технологію впроваджено. Нові будівлі та ефекти доступні.')}});
 const bind=(id,fn)=>{const e=target.querySelector('#'+id);if(e)e.onclick=fn};bind('city-place',()=>{const error=build(c,tool,selected.x,selected.y);notice(error||'Будівництво розпочато.');if(!error){tool=null;togglePanel(null);}persist();hud();panel()});bind('city-upgrade',()=>{if(upgrade(c,b.id)){notice('Модернізація розпочата.');togglePanel(null);}persist();hud();panel()});bind('city-expand',()=>{notice(expand(c)?'Нові території розвідані. Віддали карту кнопкою −.':'Недостатньо ресурсів');persist();hud();panel()});bind('city-trade',()=>{if(c.resources.goods>=10){c.resources.goods-=10;api.trade(35);persist();notice('Доставлено 10 товарів. Лабораторія отримала 35 монет.');hud();panel()}});
 bind('city-demolish',()=>{pendingDemolition=true;panel()});bind('city-demolish-cancel',()=>{pendingDemolition=false;panel()});
 bind('city-demolish-confirm',()=>{if(!pendingDemolition)return;const error=demolish(c,selected.x,selected.y);pendingDemolition=false;notice(error||'Ділянку звільнено. Матеріали повернуто.');persist();hud();panel()});
 bind('city-goal-claim',()=>{if(claimCityGoal(c)){payCityCoins();persist();hud();panel();notice('Нагороду за місію отримано!')}});
 bind('city-event-resolve',()=>{if(cityEventError(c)){notice(cityEventError(c));return;}if(resolveCityEvent(c)){persist();hud();panel();notice('Хімічне рішення спрацювало.')}});
 bind('city-show-coast',()=>{togglePanel(null);focusCoast()});
 target.querySelectorAll('[data-goal-build]').forEach(el=>el.onclick=()=>{tool=el.dataset.goalBuild;pendingDemolition=false;if(TYPES[tool].coastal){selected={x:5,y:0};focusCoast()}togglePanel('build')});
 target.querySelectorAll('[data-voyage]').forEach(el=>el.onclick=()=>{notice(dispatchVoyage(c,b?.id,el.dataset.voyage)||'Вантаж завантажено. Корабель вирушив!');persist();hud();panel();hud()});
 target.querySelectorAll('[data-expedition]').forEach(el=>el.onclick=()=>{notice(dispatchExpedition(c,b?.id,el.dataset.expedition)||'Команда вирушила в експедицію!');persist();hud();panel()});

 const scroll=panelScroll.get(tab);target.scrollTop=scroll?.top||0;
 const catalog=target.querySelector('.city-catalog');if(catalog)catalog.scrollLeft=scroll?.left||0;
 renderedTab=tab;
 }
 function payCityCoins(){const coins=claimCityCoins(c);if(coins){api.trade(coins);persist();}}
 function focusCoast(){mapControls?.cancel();const v=view(),next={zoom:Math.max(.85,zoom),pan:{x:0,y:0}},p=projectPoint(v,next,5.5,.5);next.pan={x:v.width*.48-p.x,y:v.height*.42-p.y};changeCamera(boundCamera(v,next,c.extent));}
 function resize(){mapControls?.cancel();const d=Math.min(2,devicePixelRatio||1);canvas.width=Math.round(canvas.clientWidth*d);canvas.height=Math.round(canvas.clientHeight*d);ctx.setTransform(d,0,0,d,0,0);if(mapControls)changeCamera(boundCamera(view(),camera(),c.extent));}
 function frame(now){if(!active)return;const dt=Math.min(.1,(now-last)/1000||0);last=now;if(!document.hidden){simTime+=dt;if(simTime>=.1){step(c,simTime);advanceCitySystems(c,simTime);payCityCoins();simTime=0}draw(now/1000);uiTime+=dt;saveTime+=dt;if(uiTime>=1){hud();if(tab==='build'){const e=root.querySelector('#city-place');if(e)e.disabled=!!canPlace(c,tool,selected.x,selected.y);const b=building(),up=root.querySelector('#city-upgrade');if(up&&b)up.disabled=b.ready>c.seconds||b.level>=5||!affordable(c,upgradeCost(b))}if(tab==='life')panel();uiTime=0}if(saveTime>=5){persist();saveTime=0}}raf=requestAnimationFrame(frame)}
 function close(){rememberPanelScroll();renderedTab=null;active=false;cancelAnimationFrame(raf);mapControls?.destroy();mapControls=null;clearTimeout(noticeTimer);persist();root?.remove();root=null;document.getElementById('game').hidden=false;document.body.classList.remove('in-settlement');window.removeEventListener('resize',resize);api.render();document.getElementById('city-button')?.focus()}
 function open(){
  if(active||!api.canOpen())return;tab=null;
  document.getElementById('modal').close();document.getElementById('game').hidden=true;
  document.body.classList.add('in-settlement');root=document.createElement('section');root.id='settlement';
  root.setAttribute('aria-label','Стратегія: долина ChemLab');
  root.innerHTML=`<header><div><strong>Chem<span>Lab</span></strong><small>Нове поселення</small></div><button id="city-population" aria-label="Мешканці та розвиток"></button><small id="city-time"></small></header><div id="city-resources"></div><div id="city-vitals"></div><div id="city-viewport"><canvas tabindex="0" aria-label="Карта поселення. Перетягуй одним пальцем; змінюй масштаб двома пальцями. Натискай на ділянки. Клавіатура: стрілки для вибору ділянки."></canvas><div class="city-map-tools"><button id="city-zoom-in" aria-label="Наблизити">+</button><span id="city-zoom-value" aria-label="Масштаб карти">100%</span><button id="city-zoom-out" aria-label="Віддалити">−</button><button id="city-center" aria-label="Повернути камеру до центру">Центр</button></div><button id="city-coast" aria-label="Показати морське узбережжя">Море</button><span class="city-map-label">ДОЛИНА ВІДКРИТТІВ</span></div><div class="city-mission"><b>Чиста вода</b><span>Менше хвороб · Більше життя</span><button id="city-research">Дослідити</button></div><div id="city-notice" role="status" aria-live="polite"></div><nav aria-label="Режими міста"><button id="city-exit">Хімія</button><button data-city-tab="build">Будувати</button><button data-city-tab="tech">Відкриття</button><button data-city-tab="life">Місто</button></nav><section id="city-sheet"><button id="city-panel-close" aria-label="Згорнути панель">Згорнути</button><div id="city-panel"></div></section>`;
  document.body.append(root);decorateShell();canvas=root.querySelector('canvas');ctx=canvas.getContext('2d');
  active=true;step(c,0);payCityCoins();hud();panel();resize();last=0;
  mapControls=bindMapControls(canvas,{view,camera,change:changeCamera,tap:selectMap,extent:()=>c.extent});
  changeCamera(boundCamera(view(),camera(),c.extent));
  root.querySelector('#city-exit').onclick=close;
  root.querySelector('#city-zoom-in').onclick=()=>mapControls.zoom(.2);
  root.querySelector('#city-zoom-out').onclick=()=>mapControls.zoom(-.2);
  root.querySelector('#city-center').onclick=()=>mapControls.center();root.querySelector('#city-coast').onclick=()=>{togglePanel(null);focusCoast()};
  root.querySelectorAll('[data-city-tab]').forEach(b=>b.onclick=()=>togglePanel(tab===b.dataset.cityTab?null:b.dataset.cityTab));
  root.querySelector('#city-panel-close').onclick=()=>togglePanel(null);
  root.querySelector('#city-research').onclick=()=>{const goal=cityGoal(c);if(c.activeEvent)togglePanel('life');else if(goal?.test(c)){claimCityGoal(c);payCityCoins();persist();hud();notice('Нагороду за місію отримано!')}else togglePanel('life')};root.querySelector('#city-population').onclick=()=>togglePanel('life');
  canvas.onkeydown=e=>{
   const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];
   if(d){e.preventDefault();selected={x:Math.max(0,Math.min(c.extent-1,selected.x+d[0])),y:Math.max(0,Math.min(c.extent-1,selected.y+d[1]))};panel();}
   if(['+','=','-','0','Home'].includes(e.key)){e.preventDefault();if(e.key==='0'||e.key==='Home')mapControls.center();else mapControls.zoom(e.key==='-'?-.2:.2);}
   if(e.key==='Escape')close();
  };
  window.addEventListener('resize',resize);raf=requestAnimationFrame(frame);root.querySelector('#city-exit').focus();persist();
 }
 window.addEventListener('pagehide',persist);return {open,discover(id){if(deliverDiscovery(c,id))persist();},won(level){onChemistryWin(c,level);persist()}};
}
import {renderBuildingPanel} from './city-building-panel.js?v=23';
