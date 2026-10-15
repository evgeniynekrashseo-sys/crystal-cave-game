import {test} from 'node:test';
import assert from 'node:assert/strict';
import {point,roadNetwork,roadDistance,groundHeight,sceneSnapshot} from '../dist/world3d/world-space.js';
test('3D adapter preserves saves and uses metres consistently',()=>{
 const save={extent:10,buildings:[{type:'house',x:2,y:3,level:1}],roads:[{x:2,y:4}],agents:[{x:2,y:4}],seconds:10},before=JSON.stringify(save),scene=sceneSnapshot(save);
 assert.deepEqual(point({x:2,y:3}),{x:20,z:28});assert.equal(scene.buildings[0].z,28);assert.equal(JSON.stringify(save),before);
});
test('road network joins adjacent cells without bridging gaps',()=>{
 const net=roadNetwork({roads:[{x:0,y:0},{x:1,y:0},{x:3,y:0}]});assert.equal(net.length,4);assert.equal(roadDistance(8,4,net).distance,0);assert.equal(roadDistance(20,4,net).distance,8);
});
test('coast has submerged ground and valley is buildable',()=>{assert.ok(groundHeight(20,-8)<-.5);assert.ok(groundHeight(20,20)>-.5);});
