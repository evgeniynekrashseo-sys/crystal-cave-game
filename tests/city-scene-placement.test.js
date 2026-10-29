import test from 'node:test';
import assert from 'node:assert/strict';
import {canPlaceDecorativeTree,canPlaceSandboxItem} from '../dist/city-scene-placement.js';

const objects=[{type:'house',x:5,y:5},{type:'site',x:11,y:4},{type:'tree',x:1,y:1}];
const roads=[{x:8,y:8}];
test('decorative trees do not obscure construction scaffolds or houses',()=>{
 assert.equal(canPlaceDecorativeTree(11,4,objects,roads),false);
 assert.equal(canPlaceDecorativeTree(12,5,objects,roads),false);
 assert.equal(canPlaceDecorativeTree(6,5,objects,roads),false);
 assert.equal(canPlaceDecorativeTree(17,17,objects,roads),true);
});
test('decorative trees avoid road cells, duplicates and invalid positions',()=>{
 assert.equal(canPlaceDecorativeTree(8,8,objects,roads),false);
 assert.equal(canPlaceDecorativeTree(1,1,objects,roads),false);
 assert.equal(canPlaceDecorativeTree(NaN,4,objects,roads),false);
});

test('sandbox manual placement rejects occupied tiles and duplicate roads',()=>{
 assert.equal(canPlaceSandboxItem('road',8,8,objects,roads),false);
 assert.equal(canPlaceSandboxItem('house',8,8,objects,roads),false);
 assert.equal(canPlaceSandboxItem('site',5,5,objects,roads),false);
 assert.equal(canPlaceSandboxItem('road',1,1,objects,roads),false);
 assert.equal(canPlaceSandboxItem('tree',11,4,objects,roads),false);
 assert.equal(canPlaceSandboxItem('tree',8,8,objects,roads),false);
 assert.equal(canPlaceSandboxItem('road',16,16,objects,roads),true);
 assert.equal(canPlaceSandboxItem('house',16,16,objects,roads),true);
 assert.equal(canPlaceSandboxItem('tree',16,16,objects,roads),true);
 assert.equal(canPlaceSandboxItem('road',NaN,5,objects,roads),false);
 assert.equal(canPlaceSandboxItem('unknown',16,16,objects,roads),false);
});
