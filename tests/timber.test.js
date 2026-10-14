import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freshCity,step,normalizeCity,timberAvailable} from '../dist/settlement-model.js';
import {constructionDuration,buildingFamily} from '../dist/world-design.js';

test('lumber workers harvest a finite forest plot before processing and delivering wood',()=>{
 const c=freshCity(),initial=c.resources.wood,states=new Set();
 for(let i=0;i<800;i++){
  step(c,.1);
  for(const a of c.agents)if(c.buildings.find(b=>b.id===a.job)?.type==='lumber')states.add(a.state);
 }
 for(const state of ['до лісу','рубання','обробка деревини','return'])assert(states.has(state),state);
 assert(c.resources.wood>initial);
 const [key,regrows]=Object.entries(c.felled)[0], [x,y]=key.split(',').map(Number);
 assert.equal(timberAvailable(c,x,y),false);
 const restored=normalizeCity(JSON.parse(JSON.stringify(c)));
 assert.equal(restored.felled[key],regrows);
 restored.seconds=regrows;assert.equal(timberAvailable(restored,x,y),true);
});

test('an exhausted forest cannot generate free lumber',()=>{
 const c=freshCity();c.felled={};
 for(let x=0;x<c.extent;x++)for(let y=0;y<c.extent;y++)c.felled[`${x},${y}`]=1000;
 const initial=c.resources.wood;
 for(let i=0;i<100;i++)step(c,1);
 assert.equal(c.resources.wood,initial);
 assert(c.agents.some(a=>a.state==='немає лісу'));
});

test('functional buildings no longer alias domestic artwork and construction scales with type and level',()=>{
 for(const type of ['farm','lumber','factory','park','ranch'])assert.equal(buildingFamily[type],undefined);
 assert(constructionDuration('factory')>constructionDuration('farm'));
 assert(constructionDuration('house',5)>constructionDuration('house',1));
 assert(constructionDuration('farm')>=14);
});
