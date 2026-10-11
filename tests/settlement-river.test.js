import {test} from 'node:test';
import assert from 'node:assert/strict';
import {riverBanks} from '../dist/settlement-river.js';
import {isRiverTile} from '../dist/settlement-model.js';

test('visible river stays in non-buildable terrain along the entire map',()=>{
 for(let y=0;y<36;y+=.01){
  const {left,right}=riverBanks(y);
  assert(right-left>.35);
  for(let x=left;x<=right;x+=.025)assert(isRiverTile(Math.floor(x),Math.floor(y)),`${x}, ${y}`);
 }
});
test('banks widen continuously without the former angular step',()=>{
 for(let y=.01;y<36;y+=.01){
  const a=riverBanks(y-.01),b=riverBanks(y);
  assert(Math.abs(a.left-b.left)<.01);
  assert(Math.abs(a.right-b.right)<.01);
 }
});
