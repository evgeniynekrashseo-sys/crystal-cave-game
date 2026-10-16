import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compoundParts,compoundEntrance} from '../dist/settlement-compounds.js';
import {plannedSize} from '../dist/settlement-footprints.js';
import {entrancePath} from '../dist/settlement-layout.js';
test('factory grows by adding fixed single-cell modules, never enlarging its original hall',()=>{
 let previous=[];
 for(let level=1;level<=5;level++){
  const b={type:'factory',level,x:2,y:3,footprint:plannedSize('factory',level)},parts=compoundParts(b);
  assert.equal(parts.length,b.footprint[0]*b.footprint[1]);
  for(const p of parts)assert.deepEqual(p.b.footprint,[1,1]);
  for(const p of previous){const same=parts.find(q=>q.x===p.x&&q.y===p.y);assert(same);assert.equal(same.type,p.type);}
  assert.deepEqual(compoundEntrance(b),{x:2.67,y:3.96});previous=parts;
 }
 assert(previous.some(p=>p.prop==='machine'&&!p.building));assert(previous.filter(p=>p.building).length>1);
});
test('upgrade only builds added modules and the deliberate main-hall renovation',()=>{
 const b={type:'factory',level:2,x:0,y:0,footprint:[2,2],started:0,ready:100,constructionFrom:{level:1,footprint:[2,1]}};
 const parts=compoundParts(b,50);assert(parts.filter(p=>p.y===0).every(p=>!p.constructing));assert(parts.filter(p=>p.y===1).every(p=>p.constructing));
 assert(compoundParts(b,101).every(p=>!p.constructing));
});
test('legacy compact complexes and ordinary houses remain compatible',()=>{
 assert.equal(compoundParts({type:'factory',x:0,y:0,level:5,footprint:[1,1]}).length,1);
 assert.equal(compoundParts({type:'house',x:0,y:0,level:5}),null);
});
test('worker entrance keeps the same main door while new buildings use the outer service path',()=>{
 const b={type:'factory',x:2,y:3,level:5,footprint:[4,3]},points=entrancePath(b,{x:4.5,y:6.5});
 assert.deepEqual(points[0],compoundEntrance(b));assert.equal(points[2].x,2.04);
 assert(points.some(p=>p.x===2.04&&p.y===5.96));assert.deepEqual(points.at(-1),{x:4.5,y:6.5});
});

