import {TYPES,TECH,terrain,canPlace,upgradeCost,affordable} from './settlement-model.js?v=24';

// One building, one description. Keep optional construction out of the way.
export function renderBuildingPanel(c,{selected,tool},costText){
 const b=c.buildings.find(b=>b.x===selected.x&&b.y===selected.y);
 const catalog=`<div class="city-catalog">${Object.entries(TYPES).map(([id,t])=>{
  const locked=t.tech&&!c.tech.includes(t.tech);
  return `<button data-tool="${id}" class="${tool===id?'chosen':''}" ${locked?'disabled':''}><b>${t.name}</b><small>${locked?'Дослідження: '+TECH.find(x=>x.id===t.tech).name:costText(t.cost)}</small></button>`;
 }).join('')}</div>`;
 const picker=b&&!tool?`<details class="city-build-picker"><summary>Додати будівлю</summary>${catalog}</details>`:catalog;
 const placeError=tool?canPlace(c,tool,selected.x,selected.y):'';
 const workers=b?c.agents.filter(a=>a.job===b.id).length:0;
 const busy=b&&b.ready>c.seconds,max=b&&b.level>=5;
 const actions=tool?`<button id="city-place" ${placeError?'disabled':''}>Побудувати тут</button><small>${placeError||costText(TYPES[tool].cost)}</small>`:b?
  `${max?'<p class="city-level-max">Максимальний рівень</p>':`<button id="city-upgrade" ${busy||!affordable(c,upgradeCost(b))?'disabled':''}>Покращити · ${costText(upgradeCost(b))}</button>`}
  <small data-city-building-status>${busy?'Будівництво триває':`Працівники: ${workers}/${TYPES[b.type].workers}`}</small>`:'';
 const title=tool?TYPES[tool].name:b?TYPES[b.type].name:({forest:'Ліс',ore:'Руда',rock:'Камінь',water:'Річка',grass:'Лука'}[terrain(selected.x,selected.y)]);
 return `${picker}<div class="city-action">
  <div class="city-building-heading"><b>${title}</b>${b&&!tool?`<span class="city-building-level">Рівень ${b.level}/5</span>`:''}</div>
  <small class="city-building-location">Ділянка ${selected.x+1}:${selected.y+1}</small>
  ${b||tool?`<p>${TYPES[tool||b.type].desc}</p>`:''}
  ${tool?`<small class="city-placement-hint">${TYPES[tool].name}: обери ділянку на карті, потім підтвердь будівництво.</small>`:''}
  ${actions}
 </div>`;
}
