import * as T from '../vendor/three/three.module.js';
import {random,groundHeight} from './world-space.js';
import {triangleGeometry} from './geometry.js';

// Spatial batches allow frustum culling on mobile instead of drawing the entire forest.
function chunks(items){const buckets=new Map();for(const p of items){const key=`${Math.floor(p.x/24)},${Math.floor(p.z/24)}`;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(p);}return [...buckets.values()];}

// Branch silhouettes, layered drooping sprays and visible trunks replace cone trees.
function firGeometry(seed){
 const rng=random(seed),vertices=[];
 function triangle(a,b,c){vertices.push(...a,...b,...c);}
 for(let tier=0;tier<11;tier++){
  const y=.18+tier*.073,length=(1-y)*.4;
  for(let arm=0;arm<7;arm++){
   const a=arm*Math.PI*2/7+tier*2.4+rng()*.35,dx=Math.cos(a),dz=Math.sin(a),scale=.75+rng()*.45;
   for(let twig=0;twig<7;twig++){
    const t=(twig+.4)/7,reach=length*t*scale,width=length*(1-t)*(.18+rng()*.12)+.006;
    const base=[dx*reach,y-.12*t*t,dz*reach],tip=[dx*(reach+length*.23),base[1]-.055,dz*(reach+length*.23)];
    triangle([base[0]-dz*width,base[1]+.009,base[2]+dx*width],tip,[base[0]+dz*width,base[1]+.009,base[2]-dx*width]);
    triangle([base[0],base[1]+width*.5,base[2]],tip,[base[0],base[1]-width*.5,base[2]]);
   }
  }
 }
 return triangleGeometry(vertices);
}
function grassGeometry(){
 const rng=random(755),v=[];
 for(let i=0;i<9;i++){const a=rng()*6.28,x=(rng()-.5)*.35,z=(rng()-.5)*.35,h=.25+rng()*.45,w=.018,dx=Math.cos(a),dz=Math.sin(a);v.push(x-dx*w,0,z-dz*w,x+dx*w,0,z+dz*w,x+.09*dx,h,z+.09*dz);}
 return triangleGeometry(v);
}
export function vegetation(scene,materials,blocked){
 const rng=random(4429),dummy=new T.Object3D(),trees=[],grass=[],rocks=[],fallback=new T.Group();scene.add(fallback);
 for(let i=0;i<600;i++){const x=rng()*160-6,z=rng()*160+8;if(blocked(x,z,1.2))continue;const near=x<77&&z<98;if(near&&rng()<.7)continue;trees.push({x,z,h:6+rng()*5,a:rng()*6.28});}
 const leaf=new T.MeshStandardMaterial({color:0xffffff,roughness:1,side:T.DoubleSide});
 for(let variant=0;variant<3;variant++){
  const foliageGeometry=firGeometry(170+variant),trunkGeometry=new T.CylinderGeometry(.1,.25,1,6);
  for(const list of chunks(trees.filter((_,i)=>i%3===variant))){const mesh=new T.InstancedMesh(foliageGeometry,leaf,list.length),trunks=new T.InstancedMesh(trunkGeometry,materials.timber,list.length);
  list.forEach((p,i)=>{dummy.position.set(p.x,groundHeight(p.x,p.z),p.z);dummy.scale.setScalar(p.h);dummy.rotation.set(0,p.a,0);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,new T.Color().setHSL(.23+rng()*.035,.22+rng()*.1,.23+rng()*.08));dummy.position.y+=p.h/2;dummy.scale.set(1,p.h,1);dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);});mesh.castShadow=mesh.receiveShadow=trunks.castShadow=true;mesh.computeBoundingSphere();trunks.computeBoundingSphere();fallback.add(mesh,trunks);}
 }
 for(let i=0;i<23000;i++){const x=rng()*124-3,z=rng()*124+7;if(blocked(x,z,.05)||Math.sin(x*.21)*Math.cos(z*.27)<-.5)continue;grass.push({x,z,s:.55+rng()*.9,a:rng()*6.28});}
 const grassGeo=grassGeometry(),grassMaterial=new T.MeshStandardMaterial({color:0xffffff,roughness:1,side:T.DoubleSide});
 for(const list of chunks(grass)){const grassMesh=new T.InstancedMesh(grassGeo,grassMaterial,list.length);
 list.forEach((p,i)=>{dummy.position.set(p.x,groundHeight(p.x,p.z),p.z);dummy.rotation.set(0,p.a,0);dummy.scale.setScalar(p.s);dummy.updateMatrix();grassMesh.setMatrixAt(i,dummy.matrix);grassMesh.setColorAt(i,new T.Color().setHSL(.18+rng()*.055,.22+rng()*.12,.29+rng()*.11));});grassMesh.receiveShadow=true;grassMesh.computeBoundingSphere();scene.add(grassMesh);}
 for(let i=0;i<480;i++){const x=rng()*150,z=rng()<.65?rng()*11:rng()*140;if(blocked(x,z,0))continue;rocks.push({x,z,s:.22+rng()*1.4});}
 const rockMesh=new T.InstancedMesh(new T.IcosahedronGeometry(1,1),materials.stone,rocks.length);rocks.forEach((p,i)=>{dummy.position.set(p.x,groundHeight(p.x,p.z)+p.s*.2,p.z);dummy.scale.set(p.s,p.s*.55,p.s*.8);dummy.rotation.set(rng(),rng()*6,rng());dummy.updateMatrix();rockMesh.setMatrixAt(i,dummy.matrix);rockMesh.setColorAt(i,new T.Color().setScalar(.72+rng()*.28));});rockMesh.castShadow=rockMesh.receiveShadow=true;scene.add(rockMesh);
 return {trees:trees.length,grass:grass.length,sites:trees,fallback};
}
