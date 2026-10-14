import {test} from 'node:test';
import assert from 'node:assert/strict';
import {architecturalStage,regionAt,elevation,constructionState} from '../dist/world-design.js';
import {projectPoint,worldPoint,tileAt} from '../dist/settlement-camera.js';
import {freshCity,normalizeCity,expand,SIZE,build,upgrade,step} from '../dist/settlement-model.js';
test('construction resumes at the same stage after save reload and legacy saves finish normally',()=>{
 const c=freshCity();c.seconds=100;c.resources.wood=900;c.resources.stone=900;
 assert.equal(build(c,'house',7,4),'');const b=c.buildings.at(-1);
 step(c,1);step(c,1);step(c,1);
 const restored=normalizeCity(JSON.parse(JSON.stringify(c))),saved=restored.buildings.at(-1);
 assert.equal(constructionState(saved,restored.seconds).progress,.5);
 assert.deepEqual(constructionState(saved,restored.seconds),constructionState(b,c.seconds));
 delete saved.started;assert.equal(constructionState(saved,restored.seconds).progress,.5);
 for(let i=0;i<3;i++)step(restored,1);
 assert.equal(constructionState(saved,restored.seconds).stage,'complete');
 assert.equal(upgrade(restored,saved.id),true);
 assert.equal(saved.started,restored.seconds);assert.equal(constructionState(saved,restored.seconds).upgrading,true);
 assert.equal(upgrade(restored,saved.id),false);
});
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
