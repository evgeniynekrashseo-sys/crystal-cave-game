import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {freshCity,TYPES} from '../dist/settlement-model.js';
import {renderBuildingPanel} from '../dist/city-building-panel.js';
const render=(c,selected,tool=null)=>renderBuildingPanel(c,{selected,tool},v=>Object.entries(v).map(([k,n])=>`${n} ${k}`).join(' · '));
test('selected building has one description, no generic instructions or directional buttons',()=>{
 const c=freshCity(),html=render(c,{x:3,y:6});
 assert.equal(html.split(TYPES.lumber.desc).length-1,1);
 assert(!html.includes('Перетягуй карту'));assert(!html.includes('tile-left'));assert(!html.includes('city-coordinates'));
 assert(html.includes('<details class="city-build-picker">'));assert(html.includes('city-upgrade'));
 const city=readFileSync(new URL('../dist/city.js',import.meta.url),'utf8');
 assert(!city.includes('city-selected-summary'));assert(!city.includes("bind('tile-'"));
});
test('maximum level replaces the impossible upgrade and its price with an explicit status',()=>{
 const c=freshCity();c.buildings.push({id:99,type:'fishery',x:6,y:0,level:5,ready:0});
 const html=render(c,{x:6,y:0});
 assert(html.includes('Рівень 5/5'));assert(html.includes('Максимальний рівень'));
 assert(!html.includes('id="city-upgrade"'));assert(html.includes('Працівники: 0/1'));
});
test('placement retains its action and selected-tool explanation',()=>{
 const c=freshCity(),html=render(c,{x:6,y:5},'house');
 assert(html.includes('id="city-place"'));assert(html.includes('Будинок: обери ділянку'));
 assert(!html.includes('city-level-max'));
});
