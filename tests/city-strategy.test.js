import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freshCity,normalizeCity,step,build,dispatchExpedition,dispatchVoyage,advanceCitySystems,claimCityCoins,demolish,cityProductionMultiplier,stats,cityEventError,resolveCityEvent} from '../dist/settlement-model.js';
const setup=()=>{
 const c=freshCity();for(const k in c.resources)c.resources[k]=500;
 c.tech=['water','preserve','steel'];build(c,'harbor',5,0);
 for(let i=0;i<90;i++)step(c,.1);
 return c;
};
test('expedition progress and active crisis survive reload, rewards arrive once',()=>{
 let c=setup();const port=c.buildings.at(-1);
 assert.equal(dispatchExpedition(c,port.id,'quarry'),'');
 advanceCitySystems(c,15);c.activeEvent={id:'drought',elapsed:12};c.eventIndex=3;
 c=normalizeCity(JSON.parse(JSON.stringify(c)));
 assert.equal(c.expeditions[0].elapsed,15);assert.deepEqual(c.activeEvent,{id:'drought',elapsed:12});assert.equal(c.eventIndex,3);
 assert.match(demolish(c,port.x,port.y),/експедиції/);
 advanceCitySystems(c,24);assert.equal(c.completedExpeditions,1);assert.equal(claimCityCoins(c),12);
 c=normalizeCity(c);advanceCitySystems(c,100);
 assert.equal(c.completedExpeditions,1);assert.equal(claimCityCoins(c),0);
});
test('invalid strategy saves and inherited route names are rejected',()=>{
 const c=setup(),port=c.buildings.at(-1);
 const restored=normalizeCity({...c,tech:{},expeditions:[null,{kind:'__proto__',x:5,y:0}],activeEvent:{id:'unknown',elapsed:0}});
 assert.deepEqual(restored.expeditions,[]);assert.equal(restored.activeEvent,null);
 assert.match(dispatchExpedition(c,port.id,'__proto__'),/Невідомий/);
 assert.equal(dispatchVoyage(c,port.id,'market'),'');
 assert.match(dispatchExpedition(c,port.id,'quarry'),/корабля/);
});
test('crises change actual production and recover immediately after resolution',()=>{
 const c=setup(),farm=c.buildings.find(b=>b.type==='farm');
 c.activeEvent={id:'drought',elapsed:0};assert.equal(cityProductionMultiplier(c,farm),.5);
 assert.equal(cityEventError(c),'');assert(resolveCityEvent(c));
 assert.equal(cityProductionMultiplier(c,farm),1);assert.equal(claimCityCoins(c),10);assert(!resolveCityEvent(c));
 const health=stats(c).health;c.activeEvent={id:'illness',elapsed:0};
 assert.equal(stats(c).health,health-20);assert.equal(cityProductionMultiplier(c,farm),.75);
 c.activeEvent={id:'animal',elapsed:0};assert.equal(cityProductionMultiplier(c,{type:'ranch'}),.5);
 c.tech.push('veterinary');assert.equal(cityProductionMultiplier(c,{type:'ranch'}),1);
});
test('university education and a staffed market have real benefits',()=>{
 const c=setup(),baseline=stats(c);
 c.buildings.push({id:99,type:'university',level:1,ready:0},{id:100,type:'market',level:1,ready:0});
 c.agents.push({job:99},{job:100});
 assert.equal(stats(c).education,35);assert.equal(stats(c).happiness,Math.min(100,baseline.happiness+8));
});
