import * as T from '../vendor/three/three.module.js';
import {TILE,random,point,roadNetwork,roadDistance,groundHeight,buildingFrontage} from './world-space.js';
import {materials} from './materials.js';
import {buildingMesh} from './architecture.js';
import {batchStatic} from './geometry.js';
import {vegetation} from './vegetation.js';
import {makeTerrain} from './terrain.js';
import {loadForest} from './forest-assets.js';

export class WorldRenderer {
 constructor(canvas,save){
  this.canvas=canvas;this.save=structuredClone(save);this.scene=new T.Scene();this.scene.background=new T.Color(0xadb5aa);this.scene.fog=new T.Fog(0xadb5aa,160,360);
  this.renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.0;
  this.camera=new T.OrthographicCamera();this.target=new T.Vector3(40,0,47);this.span=62;this.azimuth=Math.PI/4;this.materials=materials(()=>{this.dirty=true;});this.dirty=true;
  this.scene.add(new T.HemisphereLight(0xd5e1e6,0x5a4b34,1.5));const sun=new T.DirectionalLight(0xffe0ad,2.6);sun.position.set(-35,85,15);sun.target.position.set(40,0,40);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-95,right:95,top:95,bottom:-95,near:1,far:240});sun.shadow.normalBias=.035;this.scene.add(sun,sun.target);
  this.sun=sun;this.roads=roadNetwork(save);for(const b of save.buildings||[]){const approach=buildingFrontage(b,save.roads||[]);if(approach)this.roads.push(approach);}this.makeGround();this.makeBuildings();this.makeNature();this.resize();
 }
 makeGround(){
  this.ground=makeTerrain(this.roads,this.save.buildings||[],()=>{this.dirty=true;});this.scene.add(this.ground);
  const water=new T.Mesh(new T.PlaneGeometry(280,80,1,1),new T.MeshStandardMaterial({color:0x526f70,roughness:.31,metalness:.22,transparent:true,opacity:.93}));water.rotation.x=-Math.PI/2;water.position.set(110,-.5,-27);this.scene.add(water);this.water=water;
 }
 makeBuildings(){
  this.buildings=[];
  for(const b of this.save.buildings||[]){const p=point(b),duration=Math.max(1,(b.ready||0)-(b.started||0)),progress=b.ready>this.save.seconds?T.MathUtils.clamp((this.save.seconds-(b.started||0))/duration,0,1):1,mesh=batchStatic(buildingMesh(b.type,b.level||1,this.materials,progress));mesh.position.set(p.x,groundHeight(p.x,p.z),p.z);
   // Face the closest actual adjacent road, rotating geometry and the door together.
   const frontage=buildingFrontage(b,this.save.roads||[]);if(frontage)mesh.rotation.y=frontage.rotation;
   mesh.userData.building=b;this.scene.add(mesh);this.buildings.push(mesh);
  }
 }
 makeNature(){
  const blocked=(x,z,padding=0)=>this.buildings.some(b=>Math.abs(x-b.position.x)<3.3+padding&&Math.abs(z-b.position.z)<3.3+padding)||roadDistance(x,z,this.roads).distance<2.3+padding;
  this.natureStats=vegetation(this.scene,this.materials,blocked);
  this.assetsReady=loadForest(this.scene,this.natureStats.sites,()=>this.disposed,this.camera).then(group=>{if(group){this.forest=group;this.natureStats.fallback.visible=false;this.natureStats.detailed=true;this.dirty=true;}}).catch(error=>{this.natureStats.assetError=error.message;console.warn('Detailed forest unavailable; retaining fallback',error);});
 }
 resize(){const {width,height}=this.canvas.getBoundingClientRect();this.renderer.setSize(width,height,false);this.camera.left=-this.span*width/height/2;this.camera.right=-this.camera.left;this.camera.top=this.span/2;this.camera.bottom=-this.camera.top;this.camera.near=.1;this.camera.far=600;this.camera.updateProjectionMatrix();this.updateCamera();}
 updateCamera(){this.camera.position.copy(this.target).add(new T.Vector3(Math.sin(this.azimuth)*95,85,Math.cos(this.azimuth)*95));this.camera.lookAt(this.target);this.camera.updateMatrixWorld();if(this.sun){const radius=Math.max(18,this.span);this.sun.target.position.copy(this.target);this.sun.position.copy(this.target).add(new T.Vector3(-75,85,-25));Object.assign(this.sun.shadow.camera,{left:-radius,right:radius,top:radius,bottom:-radius});this.sun.shadow.camera.updateProjectionMatrix();}}
 orbit(delta){this.azimuth+=delta;this.updateCamera();}
 pan(dx,dy){const scale=this.span/this.canvas.clientHeight,right=new T.Vector3().setFromMatrixColumn(this.camera.matrixWorld,0),forward=new T.Vector3(right.z,0,-right.x);this.target.addScaledVector(right,-dx*scale).addScaledVector(forward,dy*scale*1.5);this.updateCamera();}
 zoom(factor){this.span=T.MathUtils.clamp(this.span*factor,14,160);this.resize();}
 render(time){this.forest?.userData.update();this.water.material.roughness=.3+.025*Math.sin(time*.7);this.renderer.render(this.scene,this.camera);}
 dispose(){this.disposed=true;const geometries=new Set(),materials=new Set(),textures=new Set();this.scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const t of o.userData.extraTextures||[])textures.add(t);for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m){materials.add(m);for(const v of Object.values(m))if(v?.isTexture)textures.add(v);}});for(const x of [...geometries,...materials,...textures])x.dispose();this.renderer.dispose();}
}
