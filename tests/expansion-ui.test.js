import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import * as progression from '../dist/progression.js';
import * as learning from '../dist/element-learning.js';
import {defaults} from '../dist/engine.js';

test('periodic-table click and back handlers never treat PointerEvent as a newly unlocked element',()=>{
 const nodes=new Map();
 const get=id=>{
  if(!nodes.has(id))nodes.set(id,{dataset:{},classList:{add(){},toggle(){}}});
  return nodes.get(id);
 };
 const sodium={dataset:{element:'Na'}};
 const core=defaults();let html='',scrolls=0;
 const sandbox={
  __deps:{...progression,...learning},
  document:{getElementById:get,querySelectorAll:s=>s==='[data-element]'?[sodium]:[],querySelector:()=>({scrollIntoView(){scrolls++}}),body:{dataset:{}}},
  localStorage:{getItem:()=>null,setItem(){}},
  requestAnimationFrame:fn=>fn(),
  __api:{core:()=>core,persist(){},modal:v=>html=v,say(){},render(){}},
 };
 const source=readFileSync(new URL('../dist/expansion.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'').replace('export function initExpansion','function initExpansion');
 vm.runInNewContext('const {'+Object.keys(sandbox.__deps).join(',')+'}=__deps;\n'+source+'\nvar world=initExpansion(__api);',sandbox);
 const pointer={toString:()=>'[object PointerEvent]'};
 get('atlas').onclick(pointer);
 assert.match(html,/Проведи вбік/);
 assert.doesNotMatch(html,/PointerEvent|Новий елемент/);
 sodium.onclick(pointer);
 assert.match(html,/Натрій/);
 get('back-map').onclick(pointer);
 assert.match(html,/Проведи вбік/);
 assert.doesNotMatch(html,/PointerEvent|Новий елемент/);
 sandbox.world.atlas('Na');
 assert.match(html,/Новий елемент Na додано/);
 assert.equal(scrolls,1,'only a genuine unlock should scroll to its element');
});
