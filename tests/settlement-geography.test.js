import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freshCity,terrain,isRiverTile,RIVER_BRIDGE,canPlace,route,normalizeCity} from '../dist/settlement-model.js';
test('river terrain blocks construction and movement except the reserved bridge',()=>{
 const c=freshCity();c.extent=20;c.resources.stone=999;c.resources.wood=999;
 for(let x=0;x<20;x++)for(let y=0;y<20;y++)if(isRiverTile(x,y)){
  assert(['water','bridge'].includes(terrain(x,y)));
  assert(canPlace(c,'house',x,y));assert(canPlace(c,'road',x,y));
 }
 const path=route(c,{x:13,y:5},{x:16,y:5});assert(path);
 assert(path.some(p=>p.x===RIVER_BRIDGE.x&&p.y===RIVER_BRIDGE.y));
 assert(path.every(p=>terrain(p.x,p.y)!=='water'));
 assert.equal(route(c,{x:4,y:5},{x:4,y:2}),null,'laboratory is not walk-through');
});
test('geography correction preserves existing valid buildings and upgrade levels',()=>{
 const c=freshCity();c.buildings.forEach(b=>b.level=5);c.tech=['water'];c.buildings.push({id:5,type:'well',x:7,y:4,level:5});
 const restored=normalizeCity(JSON.parse(JSON.stringify(c)));
 assert.deepEqual(restored.buildings.map(b=>[b.type,b.x,b.y,b.level]),c.buildings.map(b=>[b.type,b.x,b.y,b.level]));
});
