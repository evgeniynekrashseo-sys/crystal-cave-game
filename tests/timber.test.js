import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freshCity,step,normalizeCity,timberAvailable,loggingPlotAllowed,toggleLoggingPlot,upgradeRoad} from '../dist/settlement-model.js';
import {constructionDuration,buildingFamily} from '../dist/world-design.js';

test('lumber workers harvest a finite forest plot before processing and delivering wood',()=>{
 const c=freshCity(),initial=c.resources.wood,states=new Set();
 for(let x=0;x<c.extent;x++)for(let y=0;y<c.extent;y++)if(loggingPlotAllowed(c,x,y))toggleLoggingPlot(c,x,y);
 for(let i=0;i<1200;i++){
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

test('unmarked forest is protected; marking, cancellation and road upgrades survive reload',()=>{
 const c=freshCity();for(let i=0;i<120;i++)step(c,1);
 assert.equal(Object.keys(c.felled||{}).length,0);
 let p;for(let x=0;x<c.extent&&!p;x++)for(let y=0;y<c.extent;y++)if(loggingPlotAllowed(c,x,y)){p={x,y};break;}
 assert(p);assert(toggleLoggingPlot(c,p.x,p.y));
 for(let i=0;i<50;i++)step(c,1);
 assert.equal(Object.keys(c.felled||{}).length,0,'cannot cut a tree in under 60 work seconds');
 assert.deepEqual(normalizeCity(c).loggingPlots,[p]);
 assert(toggleLoggingPlot(c,p.x,p.y));for(let i=0;i<100;i++)step(c,1);
 assert.equal(Object.keys(c.felled||{}).length,0,'cancelling stops a pending cut');
 c.resources.stone=100;const r=c.roads[0];
 assert(upgradeRoad(c,r.x,r.y));assert.equal(c.resources.stone,88);assert.equal(r.level,2);
 assert(upgradeRoad(c,r.x,r.y));assert.equal(c.resources.stone,64);assert.equal(r.level,3);
 assert.equal(upgradeRoad(c,r.x,r.y),false);assert.equal(c.resources.stone,64);
 assert.equal(normalizeCity(c).roads[0].level,3);
});

test('functional buildings no longer alias domestic artwork and construction scales with type and level',()=>{
 for(const type of ['farm','lumber','factory','park','ranch'])assert.equal(buildingFamily[type],undefined);
 assert(constructionDuration('factory')>constructionDuration('farm'));
 assert(constructionDuration('house',5)>constructionDuration('house',1));
 assert(constructionDuration('farm')>=14);
});
