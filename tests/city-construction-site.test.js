import test from 'node:test';
import assert from 'node:assert/strict';
import {drawConstructionSite} from '../dist/city-construction-site.js';

function capture() {
 const coords=[],operations=[];
 const ctx={save(){operations.push('save');},restore(){operations.push('restore');},
  beginPath(){},moveTo(x,y){coords.push(x,y);},lineTo(x,y){coords.push(x,y);},
  closePath(){},fill(){operations.push('fill');},stroke(){operations.push('stroke');}};
 return {ctx,coords,operations};
}
const project=(x,y)=>({x:(x-y)*36,y:(x+y)*19});
test('medieval construction scene has finite grounded geometry and no flat placeholder',()=>{
 const {ctx,coords,operations}=capture();
 drawConstructionSite(ctx,project,7,8,.8);
 assert.ok(coords.length>100);
 assert.ok(coords.every(Number.isFinite));
 assert.ok(operations.filter(x=>x==='fill').length>=9);
 assert.ok(operations.filter(x=>x==='stroke').length>=20);
 assert.equal(operations[0],'save');
 assert.equal(operations.at(-1),'restore');
});
test('invalid projection unit does not draw a broken site',()=>{
 const {ctx,operations}=capture();
 drawConstructionSite(ctx,()=>({x:0,y:0}),7,8,1);
 assert.deepEqual(operations,[]);
});
