import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three/three.module.js';
import {batchStatic,triangleGeometry} from '../dist/world3d/geometry.js';
import {buildingMesh} from '../dist/world3d/architecture.js';
import {buildingFrontage,point} from '../dist/world3d/world-space.js';

test('static batching preserves transforms, finite UVs and one draw per material',()=>{
 const group=new T.Group(),mat=new T.MeshStandardMaterial();mat.userData.surfaceScale=.65;
 for(let i=0;i<10;i++){const mesh=new T.Mesh(new T.BoxGeometry(),mat);mesh.position.set(i,2,0);group.add(mesh);}
 const result=batchStatic(group);assert.equal(result.children.length,1);const geometry=result.children[0].geometry;geometry.computeBoundingBox();assert.equal(geometry.boundingBox.max.x,9.5);assert.equal(geometry.boundingBox.min.y,1.5);assert.ok([...geometry.attributes.uv.array].every(Number.isFinite));
});
test('frontage approaches actual doors for all four adjacent road directions',()=>{
 const b={type:'house',x:4,y:4},center=point(b);
 for(const [dx,dy]of [[0,1],[1,0],[0,-1],[-1,0]]){
  const frontage=buildingFrontage(b,[{x:b.x+dx,y:b.y+dy,level:2}]);
  assert.ok(Math.abs(frontage.a.x-center.x-dx*2.9)<1e-10);assert.ok(Math.abs(frontage.a.z-center.z-dy*2.9)<1e-10);assert.equal(frontage.width,.65);assert.equal(frontage.level,2);
 }
 assert.equal(buildingFrontage(b,[{x:8,y:8}]),null);
});
test('building detail is batched and all construction stages have finite geometry',()=>{
 const keys=['wood','timber','stone','plaster','roof','thatch','earth','leaf','glass','metal'],m=Object.fromEntries(keys.map(k=>[k,new T.MeshStandardMaterial()]));
 for(const type of ['house','farm','lumber','ranch','factory','lab','park','well'])for(const progress of [.1,.4,.7,1]){
  const group=batchStatic(buildingMesh(type,3,m,progress));assert.ok(group.children.length<=keys.length);
  for(const mesh of group.children){assert.ok([...mesh.geometry.attributes.position.array].every(Number.isFinite));assert.equal(mesh.geometry.attributes.position.count,mesh.geometry.attributes.uv.count);}
 }
});
test('triangle geometry provides complete normals and UVs',()=>{
 const g=triangleGeometry([0,0,0,1,0,0,0,1,0]);assert.equal(g.attributes.normal.count,3);assert.equal(g.attributes.uv.count,3);
});
