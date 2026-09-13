import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mountCityHud} from '../dist/city-hud.js';

test('city counters update without remounting resource or population images',()=>{
 class Node{
  writes=0;html='';textContent='';attrs={};value={textContent:''};
  set innerHTML(v){this.html=v;this.writes++}
  get innerHTML(){return this.html}
  setAttribute(k,v){this.attrs[k]=v}
  querySelector(){return this.value}
 }
 const resources=new Node(),population=new Node();
 const nodes=Object.fromEntries(['wood','food','gold'].map(k=>[k,new Node()]));
 resources.querySelector=selector=>nodes[selector.match(/="(.*?)"/)[1]];
 const root={querySelector:selector=>selector==='#city-resources'?resources:population};
 const hud=mountCityHud(root,name=>`<img src="${name}.svg">`);
 const resourceMarkup=resources.innerHTML,populationMarkup=population.innerHTML;
 for(let i=0;i<30;i++)hud.update({wood:65+i+.4,food:55+i,gold:i},6,8);
 assert.equal(resources.writes,1);
 assert.equal(population.writes,1);
 assert.equal(resources.innerHTML,resourceMarkup);
 assert.equal(population.innerHTML,populationMarkup);
 assert.equal(nodes.wood.value.textContent,'94');
 assert.equal(nodes.food.attrs['aria-label'],'Їжа: 84');
 assert.equal(nodes.gold.value.textContent,'29');
 assert.equal(population.value.textContent,'6 / 8');
 assert.match(resourceMarkup,/resource-wood-v16\.png/);
 assert.match(resourceMarkup,/resource-food-v16\.png/);
 assert.match(resourceMarkup,/resource-coin-v16\.png/);
 hud.update({wood:NaN,food:-2,gold:7.9},7,12);
 assert.equal(nodes.wood.value.textContent,'0');
 assert.equal(nodes.food.value.textContent,'0');
 assert.equal(nodes.gold.value.textContent,'7');
 assert.equal(population.value.textContent,'7 / 12');
});
