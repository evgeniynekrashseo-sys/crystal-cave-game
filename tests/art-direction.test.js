import {test} from 'node:test';
import assert from 'node:assert/strict';
import {COHERENT_KEYS,coherentKey} from '../dist/settlement-art-direction.js';
test('functional building artwork remains distinct across every upgrade',()=>{
 for(let level=1;level<=5;level++){
  const keys=['house','lumber','factory','ranch','school','granary'].map(type=>coherentKey({type,level}));
  assert.equal(new Set(keys).size,keys.length);
  keys.forEach(key=>assert(COHERENT_KEYS.includes(key)));
 }
 assert.equal(coherentKey({type:'farm',level:5}),null);
});
test('homes retain four upgrade silhouettes and industry has a visibly upgraded tier',()=>{
 assert.deepEqual([1,2,3,4,5].map(level=>coherentKey({type:'house',level})),['home1','home2','home3','home3','home4']);
 for(const type of ['lumber','factory','ranch','school','granary'])assert.notEqual(coherentKey({type,level:1}),coherentKey({type,level:3}));
});
