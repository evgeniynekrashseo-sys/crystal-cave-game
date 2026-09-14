import {test} from 'node:test';
import assert from 'node:assert/strict';
import {experimentChallenge,experimentResult} from '../dist/engine.js';
test('optional experiment goals alternate and reward only completed conditions',()=>{
 assert.equal(experimentChallenge(1).precision,false);
 assert.equal(experimentChallenge(2).precision,true);
 assert.equal(experimentResult(1,{assisted:true,used:8,par:10}).bonus,0);
 assert(experimentResult(1,{assisted:false,used:30,par:10}).bonus>0);
 assert(experimentResult(2,{assisted:true,used:12,par:10}).bonus>0);
 assert.equal(experimentResult(2,{assisted:false,used:13,par:10}).bonus,0);
});
test('stars describe mastery without blocking progression and bonus has a cap',()=>{
 assert.equal(experimentResult(2,{assisted:false,used:10,par:10}).stars,3);
 assert.equal(experimentResult(2,{assisted:true,used:20,par:10}).stars,1);
 assert.equal(experimentResult(2,{assisted:false,used:NaN,par:10}).bonus,0);
 assert.equal(experimentChallenge(10000).bonus,100);
});
