import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three/three.module.js';
import {loadForest} from '../dist/world3d/forest-assets.js';
import {readFileSync,statSync} from 'node:fs';

test('forest atlas is local, complete, transparent WebP and under 1.5 MB',()=>{
 let bytes=0;for(let i=0;i<8;i++){const url=new URL(`../dist/world3d/assets/fir/view-${i}.webp`,import.meta.url),data=readFileSync(url);assert.equal(data.toString('ascii',8,12),'WEBP');assert.equal(data.toString('ascii',12,16),'VP8X');assert.ok(data[20]&16,'alpha channel required');bytes+=statSync(url).size;}assert.ok(bytes<1500000);
});
test('forest batches preserve sites, change views with camera and respect disposal',async()=>{
 const original=T.TextureLoader.prototype.loadAsync;let disposed=0;
 T.TextureLoader.prototype.loadAsync=async()=>{const t=new T.Texture();t.addEventListener('dispose',()=>disposed++);return t;};
 try{
  const scene=new T.Scene(),camera=new T.PerspectiveCamera();camera.position.set(30,30,30);camera.lookAt(0,0,0);
  const sites=[{x:10,z:20,h:8,a:0},{x:12,z:20,h:9,a:1}],snapshot=JSON.stringify(sites);
  const group=await loadForest(scene,sites,()=>false,camera);assert.equal(group.children.reduce((n,m)=>n+m.count,0),2);assert.equal(JSON.stringify(sites),snapshot);
  const first=group.children[0].material.map;camera.position.set(-30,30,30);camera.lookAt(0,0,0);group.userData.update();assert.notEqual(group.children[0].material.map,first);
  for(const mesh of group.children)assert.ok([...mesh.instanceMatrix.array].every(Number.isFinite));
  assert.equal(await loadForest(scene,sites,()=>true,camera),null);assert.equal(disposed,8);
 }finally{T.TextureLoader.prototype.loadAsync=original;}
});
test('partial asset failures release successful textures',async()=>{
 const original=T.TextureLoader.prototype.loadAsync;let n=0,disposed=0;
 T.TextureLoader.prototype.loadAsync=async()=>{if(++n===3)throw new Error('offline');const t=new T.Texture();t.addEventListener('dispose',()=>disposed++);return t;};
 try{await assert.rejects(loadForest(new T.Scene(),[],()=>false,new T.PerspectiveCamera()),/Incomplete/);assert.equal(disposed,7);}finally{T.TextureLoader.prototype.loadAsync=original;}
});
