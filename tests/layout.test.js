import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildingDoor,entrancePath,pathPosition} from '../dist/settlement-layout.js';
test('paths from all four road sides reach the same authored entrance without crossing the building core',()=>{
 const b={x:4,y:4,type:'house'};
 for(const target of [{x:4.5,y:5.5},{x:5.5,y:4.5},{x:3.5,y:4.5},{x:4.5,y:3.5}]){
  const path=entrancePath(b,target);assert.deepEqual(path[0],buildingDoor(b));assert.deepEqual(path.at(-1),target);
  for(let i=0;i<=100;i++){const p=pathPosition(path,i/100);assert(!(p.x>4.1&&p.x<4.9&&p.y>4.1&&p.y<4.85));}
 }
});
test('entrances vary by function and stay fixed when the road is on another side',()=>{
 const b={x:2,y:3,type:'house'},l={...b,type:'lumber'};
 assert.notDeepEqual(buildingDoor(b),buildingDoor(l));
 assert.deepEqual(pathPosition(entrancePath(b,{x:1.5,y:3.5}),0),buildingDoor(b));
});
