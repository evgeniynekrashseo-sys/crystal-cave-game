import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceCrop,cropVisual,CROP_STAGES} from '../dist/settlement-crops.js';
import {freshCity,step,normalizeCity} from '../dist/settlement-model.js';
test('one harvest per complete cycle, never at sowing or growth',()=>{
 const b={};let rewards=0;
 for(const phase of CROP_STAGES){assert.equal(cropVisual(b).id,phase.id);for(let i=0;i<phase.seconds;i++)rewards+=Number(advanceCrop(b,1,true));}
 assert.equal(rewards,1);assert.equal(b.crop.cycles,1);assert.equal(cropVisual(b).id,'soil');
});
test('work waits for farmer, growth can proceed without one',()=>{
 const b={};advanceCrop(b,1,false);assert.equal(b.crop.elapsed,0);
 b.crop={stage:2,elapsed:0,cycles:0};advanceCrop(b,1,false);assert.equal(b.crop.elapsed,1);
});
test('crop progress survives save reload and rejects invalid stage',()=>{
 const b={crop:{stage:5,elapsed:23,cycles:2}};const restored=JSON.parse(JSON.stringify(b));
 assert.equal(advanceCrop(restored,1,true),true);assert.equal(restored.crop.cycles,3);
 assert.equal(cropVisual({crop:{stage:99}}).id,'soil');
});
test('city awards food only after harvest and preserves the phase on reload',()=>{
 const c=freshCity();for(let i=0;i<400;i++)step(c,.1);
 const field=c.buildings.find(b=>b.type==='farm');
 assert.equal(field.crop.cycles,0);assert(c.resources.food<=55);
 const loaded=normalizeCity(JSON.parse(JSON.stringify(c)));
 assert.deepEqual(loaded.buildings.find(b=>b.type==='farm').crop,field.crop);
 for(let i=0;i<2200;i++)step(loaded,.1);
 assert.equal(loaded.buildings.find(b=>b.type==='farm').crop.cycles,1);
 assert(loaded.resources.food>55);
});
