import {plannedSize,footprintSize,buildingAt} from './settlement-footprints.js?v=44';
import {TYPES,TECH,loggingPlotAllowed,terrain,canPlace,upgradeCost,affordable,upgradeError,placementError,relocationError} from './settlement-model.js?v=44';

// One building, one description. Keep optional construction out of the way.
export function renderBuildingPanel(c,{selected,tool,movingId},costText){
 const b=movingId?c.buildings.find(b=>b.id===movingId):buildingAt(c,selected.x,selected.y);
 if(movingId&&b){const error=relocationError(c,b,selected.x,selected.y);return `<div class="city-action"><b>Перенесення: ${TYPES[b.type].name}</b><p>Обери нову ділянку. Рівень і врожай збережуться. Перенесення безкоштовне, але потребує часу на будівництво.</p><p>Площа: ${plannedSize(b.type,b.level).join(' × ')} клітинок</p><small>${error||'Ділянка доступна'}</small><button id="city-move-confirm" ${error?'disabled':''}>Перенести сюди</button><button id="city-move-cancel">Скасувати</button></div>`;}
 const road=c.roads.find(r=>r.x===selected.x&&r.y===selected.y);
 const logging=!tool&&loggingPlotAllowed(c,selected.x,selected.y);
 const marked=c.loggingPlots?.some(p=>p.x===selected.x&&p.y===selected.y);
 const catalog=`<div class="city-catalog">${Object.entries(TYPES).map(([id,t])=>{
  const locked=t.tech&&!c.tech.includes(t.tech);
  return `<button data-tool="${id}" class="${tool===id?'chosen':''}" ${locked?'disabled':''}><b>${t.name}</b><small>${locked?'Дослідження: '+TECH.find(x=>x.id===t.tech).name:costText(t.cost)}</small></button>`;
 }).join('')}</div>`;
 const picker=b&&!tool?`<details class="city-build-picker"><summary>Додати будівлю</summary>${catalog}</details>`:catalog;
 const placeError=tool?canPlace(c,tool,selected.x,selected.y):'';
 const workers=b?c.agents.filter(a=>a.job===b.id).length:0;
 const busy=b&&b.ready>c.seconds,max=b&&b.level>=5;
 const actions=tool?`<button id="city-place" ${placeError?'disabled':''}>Побудувати тут</button><small>${placeError||costText(TYPES[tool].cost)}</small>`:b?
  `${max?'<p class="city-level-max">Максимальний рівень</p>':`<button id="city-upgrade" ${upgradeError(c,b)?'disabled':''}>Покращити · ${costText(upgradeCost(b))}</button>`}
  <small data-city-expansion-error>${!max?upgradeError(c,b):''}</small><button id="city-move" ${busy?'disabled':''}>Перенести будівлю</button><small data-city-building-status>${busy?'Будівництво триває':`Працівники: ${workers}/${TYPES[b.type].workers}`}</small>`:'';
 const title=tool?TYPES[tool].name:b?TYPES[b.type].name:({forest:'Ліс',ore:'Руда',rock:'Камінь',water:'Річка',grass:'Лука'}[terrain(selected.x,selected.y)]);
 return `${picker}<div class="city-action">
  <div class="city-building-heading"><b>${title}</b>${b&&!tool?`<span class="city-building-level">Рівень ${b.level}/5</span>`:''}</div>
  <small class="city-building-location">Ділянка ${selected.x+1}:${selected.y+1}</small>
  ${b||tool?`<p>${TYPES[tool||b.type].desc}</p>`:''}
  ${tool?`<small class="city-placement-hint">${TYPES[tool].name}: обери ділянку на карті, потім підтвердь будівництво.</small>`:''}
  ${b||tool?`<p>Площа: ${(tool?plannedSize(tool):footprintSize(b)).join(' × ')} · Максимум: ${plannedSize(tool||b.type,5).join(' × ')}</p>${b&&!tool&&b.level<5?`<small>Наступний рівень: ${plannedSize(b.type,b.level+1).join(' × ')}</small>`:''}` :''}
  ${tool?`<small>Суцільна межа — поточна площа. Пунктир — розвиток до рівня 5. Майбутня територія не резервується.</small>${placementError(c,tool,selected.x,selected.y,5)?'<p>Майбутнє розширення має перешкоди. Початкове будівництво можливе, якщо поточна площа вільна.</p>':''}`:''}
  ${actions}
  ${!tool&&road?`<p>Дорога: ${['','Ґрунтова','Бруківка','Кам’яна'][road.level||1]}</p>${(road.level||1)<3?`<button id="city-road-upgrade">Покращити дорогу · ${(road.level||1)===1?12:24} каменю</button>`:'<small>Максимальний рівень дороги</small>'}`:''}
  ${logging?`<p>Вирубка лише на позначених ділянках. Одне дерево — 60 секунд роботи плюс дорога й обробка.</p><button id="city-logging">${marked?'Зупинити вирубку тут':'Позначити для лісорубів'}</button>`:''}
 </div>`;
}
