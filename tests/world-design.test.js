import {test} from 'node:test';
import assert from 'node:assert/strict';
import {architecturalStage,regionAt,elevation} from '../dist/world-design.js';
import {projectPoint,worldPoint,tileAt} from '../dist/settlement-camera.js';
import {freshCity,normalizeCity,expand,SIZE} from '../dist/settlement-model.js';
test('architecture has four coherent stages and retains highest upgrade',()=>{
 assert.deepEqual([1,2,3,4,5].map(architecturalStage),[1,2,3,3,4]);
});
test('expanded map restores all 1024 cells without dropping legacy buildings',()=>{
 const c=freshCity();c.resources={...c.resources,wood:9999,stone:9999,research:999};
 while(expand(c)){}assert.equal(c.extent,32);assert.equal(SIZE,32);
 const restored=normalizeCity(c);assert.equal(restored.extent,32);assert.deepEqual(restored.buildings.map(b=>[b.type,b.x,b.y,b.level]),c.buildings.map(b=>[b.type,b.x,b.y,b.level]));
});
test('relief is zero in all legacy plots and highland picking inverts the actual projection',()=>{
 for(let x=0;x<=20;x++)for(let y=0;y<=20;y++)assert.equal(elevation(x,y),0);
 for(const zoom of [.22,.7,1.5,2.4])for(let x=20.2;x<32;x+=.8)for(let y=14.2;y<32;y+=.8){
  const view={width:430,height:900},camera={zoom,pan:{x:23,y:-500}},p=projectPoint(view,camera,x,y),q=worldPoint(view,camera,p);
  assert(Math.abs(q.x-x)<1e-8&&Math.abs(q.y-y)<1e-8);assert.deepEqual(tileAt(view,camera,p),{x:Math.floor(x),y:Math.floor(y)});
 }
 assert.equal(regionAt(26,24),'highlands');
});
