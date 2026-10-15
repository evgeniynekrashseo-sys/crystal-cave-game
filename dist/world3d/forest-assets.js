import * as T from '../vendor/three/three.module.js';
import {groundHeight} from './world-space.js';

// Eight views baked from the complete 685k-triangle asset. This avoids destroying
// thin needles through decimation, and keeps mobile forest geometry bounded.
export async function loadForest(scene,sites,isDisposed,camera){
 const loader=new T.TextureLoader(),results=await Promise.allSettled(Array.from({length:8},(_,i)=>loader.loadAsync(new URL(`./assets/fir/view-${i}.webp`,import.meta.url).href)));
 const textures=results.filter(r=>r.status==='fulfilled').map(r=>r.value);
 if(textures.length!==8){textures.forEach(t=>t.dispose());throw new Error('Incomplete forest atlas');}
 textures.forEach(t=>{t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;});
 const group=new T.Group();group.name='detailed-fir-forest';
 if(isDisposed()){textures.forEach(t=>t.dispose());return null;}
 const buckets=new Map();sites.forEach((p,i)=>{const variant=i%8,key=`${Math.floor(p.x/24)},${Math.floor(p.z/24)},${variant}`;if(!buckets.has(key))buckets.set(key,{variant,sites:[]});buckets.get(key).sites.push(p);});
 const geometry=new T.PlaneGeometry(1,1),dummy=new T.Object3D();
 const materials=Array.from({length:8},(_,i)=>new T.MeshBasicMaterial({map:textures[i],alphaTest:.03,alphaToCoverage:true,side:T.DoubleSide,toneMapped:false}));
 const meshes=[];
 for(const bucket of buckets.values()){
  const mesh=new T.InstancedMesh(geometry,materials[bucket.variant],bucket.sites.length);
  mesh.castShadow=true;mesh.userData.sites=bucket.sites;mesh.userData.variant=bucket.variant;group.add(mesh);meshes.push(mesh);
 }
 group.userData.update=()=>{
  const direction=camera.getWorldDirection(new T.Vector3()),angle=Math.atan2(-direction.x,-direction.z),view=Math.round(angle/(Math.PI/4));
  materials.forEach((m,i)=>{m.map=textures[((view-i)%8+8)%8];});
  for(const mesh of meshes){mesh.userData.sites.forEach((p,i)=>{const scale=p.h/8.6;dummy.position.set(p.x,groundHeight(p.x,p.z)+4.2*scale,p.z);dummy.quaternion.copy(camera.quaternion);dummy.scale.setScalar(10.6*scale);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();}
 };
 group.userData.extraTextures=textures;
 scene.add(group);group.userData.update();return group;
}
