import {test} from 'node:test';
import assert from 'node:assert/strict';
import {actorPose} from '../dist/settlement-motion.js';
test('heading selects front/back and left/right, trucks have distinct view selection',()=>{
 for(const [x,y,back,right]of [[1,0,false,true],[0,1,false,false],[-1,0,true,false],[0,-1,true,true]]){
  const p=actorPose({x:2,y:3,heading:{x,y},path:[{}],distance:1},null);
  assert.equal(p.back,back);assert.equal(p.right,right);
  const t=actorPose({x:2,y:3,heading:{x,y},truck:true,path:[]},null);
  assert.equal(t.key,back?'truck1':'truck0');assert.equal(t.flip,!right);
 }
});
test('indoor workers approach the entrance, disappear inside and leave; outdoor workers remain visible',()=>{
 const job={type:'school',x:3,y:4},a={x:3,y:5,path:[],state:'work',timer:6};
 assert.equal(actorPose(a,job).opacity,1);
 assert.equal(actorPose({...a,timer:3},job).opacity,0);
 assert.equal(actorPose({...a,timer:0},job).opacity,1);
 assert.equal(actorPose({...a,timer:3},{...job,type:'farm'}).opacity,1);
 assert.equal(actorPose({...a,timer:3,truck:true},job).opacity,1);
});
test('chopping uses action frames, reduced motion freezes poses and interpolation stays bounded',()=>{
 const a={x:2,y:3,path:[],state:'рубання',timer:59.5};
 assert.equal(actorPose(a,null).key,'chop1');
 assert.equal(actorPose(a,null,null,1,true).key,'chop0');
 assert.equal(actorPose(a,null,{x:1,y:1},.5).x,1.5);
});
