import test from 'node:test';
import assert from 'node:assert/strict';
import {featherClippedSpriteEdges,TREE_ATLAS_BOUNDS} from '../dist/city-nature-sprites.js';
const make=(w,h)=>new Uint8ClampedArray(w*h*4);

test('tree atlas clipping: sustained hard right edge is softened without losing the trunk',()=>{
 const w=40,h=60,p=make(w,h);
 for(let y=5;y<55;y++)for(let x=12;x<w;x++)p[(y*w+x)*4+3]=255;
 assert.deepEqual(featherClippedSpriteEdges(p,w,h),{left:false,right:true});
 assert.equal(p[(30*w+w-1)*4+3],0);
 assert.equal(p[(30*w+20)*4+3],255);
});

test('tree atlas clipping: naturally transparent silhouettes are unchanged',()=>{
 const w=40,h=60,p=make(w,h);
 for(let y=10;y<50;y++)for(let x=10;x<30;x++)p[(y*w+x)*4+3]=255;
 const before=Array.from(p);
 assert.deepEqual(featherClippedSpriteEdges(p,w,h),{left:false,right:false});
 assert.deepEqual(Array.from(p),before);
});

test('tree atlas clipping: a few isolated needles at the edge are preserved',()=>{
 const w=40,h=60,p=make(w,h);
 for(let y=10;y<16;y++)p[(y*w+w-1)*4+3]=255;
 assert.deepEqual(featherClippedSpriteEdges(p,w,h),{left:false,right:false});
 for(let y=10;y<16;y++)assert.equal(p[(y*w+w-1)*4+3],255);
});

test('v34 oak crop is wider than one atlas quarter and does not enter the birch cell',()=>{
 const [oakLeft,oakRight]=TREE_ATLAS_BOUNDS[1];
 assert.ok(oakRight-oakLeft>.25);
 assert.ok(oakRight<=TREE_ATLAS_BOUNDS[2][0]);
 assert.ok(TREE_ATLAS_BOUNDS[0][1]<=oakLeft);
});
