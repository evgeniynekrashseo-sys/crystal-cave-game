import {test} from 'node:test';
import assert from 'node:assert/strict';
import {FACTORY_STAGES,factoryStage,factoryMetrics,factoryDoor,factoryWidth,hasFactoryLogistics,factoryWorldPoint} from '../dist/settlement-factory.js';
import {plannedSize} from '../dist/settlement-footprints.js';
test('factory upgrades select distinct technology eras instead of enlarging one old sprite',()=>{
 assert.deepEqual([1,2,3,4,5].map(factoryStage),[0,1,2,2,3]);assert.equal(FACTORY_STAGES.length,4);
 const b=level=>({x:3,y:4,type:'factory',level,footprint:plannedSize('factory',level)});
 assert.equal(factoryWidth(b(3)),factoryWidth(b(4)));assert.deepEqual(factoryDoor(b(3)),factoryDoor(b(4)));
 assert(hasFactoryLogistics(b(4)));assert(!hasFactoryLogistics(b(3)));assert(!hasFactoryLogistics(b(5)));
});
test('optional industrial artwork door metadata remains inside every footprint',()=>{
 for(let level=1;level<=5;level++)for(const size of [plannedSize('factory',level),[1,1]]){
  const b={x:3,y:4,type:'factory',level,footprint:size},door=factoryDoor(b),m=factoryMetrics(b);
  assert(door.x>=b.x&&door.x<b.x+size[0]);assert(door.y>=b.y&&door.y<b.y+size[1]);
  assert.deepEqual(factoryWorldPoint(b,m.spec.front),m.anchor);
 }
});
test('sprite crops and anchor metadata fit the approved source atlas',()=>{
 for(const spec of FACTORY_STAGES){const [x,y,w,h]=spec.crop;assert(x>=0&&y>=0&&x+w<=1536&&y+h<=1024);assert(spec.front[0]>=x&&spec.front[0]<=x+w);assert(spec.front[1]>=y&&spec.front[1]<=y+h);}
});
