import test from 'node:test';
import assert from 'node:assert/strict';
import {nearestRoadFor, drawSettlementFootpaths} from '../dist/city-footpaths.js';

test('a house chooses the closest reachable road without changing road state', () => {
  const roads = [{x:8,y:8},{x:5,y:8},{x:12,y:8}];
  const snapshot = JSON.stringify(roads);
  assert.deepEqual(nearestRoadFor({x:5,y:5}, roads), {x:5,y:8});
  assert.equal(JSON.stringify(roads), snapshot);
  assert.equal(nearestRoadFor({x:0,y:0}, roads, 3), null);
});

test('footpaths render only houses and construction sites and restore canvas state', () => {
  const calls=[];
  const ctx={save(){calls.push('save')},restore(){calls.push('restore')},beginPath(){calls.push('begin')},moveTo(){},quadraticCurveTo(){calls.push('curve')},stroke(){calls.push('stroke')}};
  const objects=[{type:'house',x:5,y:5},{type:'site',x:13,y:10},{type:'tree',x:6,y:6}];
  const roads=[{x:5,y:8},{x:13,y:8}];
  const drawn=drawSettlementFootpaths(ctx,(x,y)=>({x:x*12,y:y*7}),objects,roads,.6);
  assert.equal(drawn,2);
  assert.equal(calls.filter(x=>x==='curve').length,8);
  assert.equal(calls[0],'save');
  assert.equal(calls.at(-1),'restore');
});
