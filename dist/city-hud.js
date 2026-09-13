// Mount images once: changing a counter must not restart image decoding.
const RESOURCES=[
 {id:'wood',name:'Деревина',src:'resource-wood-v16.png'},
 {id:'food',name:'Їжа',src:'resource-food-v16.png'},
 {id:'gold',name:'Монети',src:'resource-coin-v16.png'}
];

export function mountCityHud(root,icon){
 const resources=root.querySelector('#city-resources');
 resources.innerHTML=RESOURCES.map(r=>`<span class="city-resource" data-city-resource="${r.id}"><img class="resource-art" src="${r.src}" alt="" aria-hidden="true"><b>0</b><small>${r.name}</small></span>`).join('');
 const nodes=RESOURCES.map(r=>({...r,node:resources.querySelector(`[data-city-resource="${r.id}"]`)}));
 const population=root.querySelector('#city-population');
 population.innerHTML=`${icon('people')}<b></b>`;
 const populationValue=population.querySelector('b');
 return {
  update(values,people,housing){
   for(const {id,name,node}of nodes){
    const value=Number.isFinite(values[id])?Math.max(0,Math.floor(values[id])):0;
    node.querySelector('b').textContent=String(value);
    node.setAttribute('aria-label',`${name}: ${value}`);
   }
   populationValue.textContent=`${people} / ${housing}`;
  }
 };
}
