import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CAMPAIGN,DECISIONS,decide,decisionError,decisionProduction,normalizeDecisions,ending} from '../dist/city-campaign.js';
import {STORIES,ensureStory,currentStory,claimStory,normalizeStory,storyPanel} from '../dist/city-story.js';
import {freshCity} from '../dist/settlement-model.js';
test('campaign choices are gated, charged once and preserved through normalization',()=>{
 const c=freshCity();ensureStory(c);Object.assign(c.resources,{food:200,goods:50});
 assert.equal(decide(c,'signal','rescue','welcome'),false);assert.equal(c.resources.food,200);
 assert.equal(decide(c,'signal','rescue','signal'),true);assert.equal(c.resources.food,80);
 assert.equal(decide(c,'signal','archive','signal'),false);assert.equal(c.resources.goods,30);
 assert.deepEqual(normalizeStory(c.story).decisions,{signal:'rescue'});
 assert.equal(decisionProduction(c,{type:'clinic'}),1.1);assert.equal(decisionProduction(c,{type:'factory'}),1);
});
test('insufficient resources and malformed choices never change stock',()=>{
 const c=freshCity();ensureStory(c);c.resources.goods=0;const before=JSON.stringify(c.resources);
 assert(decisionError(c,'signal','rescue','signal'));assert.equal(decide(c,'signal','rescue','signal'),false);
 assert.equal(decide(c,'toString','x','signal'),false);assert.equal(JSON.stringify(c.resources),before);
 assert.deepEqual(normalizeDecisions({signal:'bad',industry:'renewal',legacy:'__proto__'}),{industry:'renewal'});
});
test('all new chapters are completable and do not auto-select player decisions',()=>{
 const c=freshCity();ensureStory(c);c.story.claimed=STORIES.filter(q=>!CAMPAIGN.some(n=>n.id===q.id)).map(q=>q.id);
 c.story.artifacts=['compass','seed','prism','map','heart','beacon'];c.completedVoyages=5;c.seconds=100;
 for(const k of Object.keys(c.resources))c.resources[k]=500;
 c.buildings=['factory','smelter','greenhouse','park','farm','harbor','observatory','university','energy'].map((type,id)=>({type,id,level:3,ready:0,crop:{cycles:3}}));
 assert.equal(currentStory(c).id,'signal');assert.equal(claimStory(c),false);
 for(const q of CAMPAIGN){assert.equal(currentStory(c).id,q.id);const entry=Object.entries(DECISIONS).find(([,d])=>d.quest===q.id);if(entry)assert(decide(c,entry[0],Object.keys(entry[1].options)[0],q.id));assert.equal(claimStory(c).id,q.id);}
 assert.equal(currentStory(c),undefined);const coins=c.pendingCoins;assert.equal(claimStory(c),false);assert.equal(c.pendingCoins,coins);
 assert.match(storyPanel(c),/Долина відкрила мережу знань/);assert.notEqual(ending(c),ending({story:{decisions:{legacy:'exchange'}}}));
});
test('construction must finish and real harvest cycles must occur before story milestones',()=>{
 const q=CAMPAIGN.find(q=>q.id==='living-system'),c={seconds:20,buildings:[{type:'greenhouse',level:2,ready:21},{type:'park',level:2,ready:0},{type:'farm',crop:{cycles:3}}]};
 assert.equal(q.test(c),false);c.seconds=21;assert.equal(q.test(c),true);c.buildings[2].crop.cycles=2;assert.equal(q.test(c),false);
});
