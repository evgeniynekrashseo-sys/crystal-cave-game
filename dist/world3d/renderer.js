import * as T from '../vendor/three/three.module.js';
import {TILE,random,point,roadNetwork,roadDistance,groundHeight} from './world-space.js';
import {materials} from './materials.js';
import {buildingMesh} from './architecture.js';

export class WorldRenderer {
 constructor(canvas,save){
  this.canvas=canvas;this.save=structuredClone(save);this.scene=new T.Scene();this.scene.background=new T.Color(0xadb5aa);this.scene.fog=new T.Fog(0xadb5aa,160,360);
  this.renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.15;
  this.camera=new T.OrthographicCamera();this.target=new T.Vector3(36,0,36);this.span=62;this.azimuth=Math.PI/4;this.materials=materials();this.ownedGeometries=new Set();
  this.scene.add(new T.HemisphereLight(0xd5e1e6,0x5a4b34,2));const sun=new T.DirectionalLight(0xffe0ad,3.2);sun.position.set(-35,85,15);sun.target.position.set(40,0,40);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-95,right:95,top:95,bottom:-95,near:1,far:240});sun.shadow.normalBias=.035;this.scene.add(sun,sun.target);
  this.roads=roadNetwork(save);this.makeGround();this.makeBuildings();this.makeNature();this.resize();
 }
 makeGround(){
  const size=280,geometry=new T.PlaneGeometry(size,size,220,220);geometry.rotateX(-Math.PI/2);geometry.translate(110,0,110);const positions=geometry.attributes.position,colors=[];
  for(let i=0;i<positions.count;i++){const x=positions.getX(i),z=positions.getZ(i),h=groundHeight(x,z);positions.setY(i,h);const road=roadDistance(x,z,this.roads),noise=.025*Math.sin(x*12.7+z*41.3)+.035*Math.sin(x*.37)*Math.cos(z*.41),grass=new T.Color().setRGB(.24+noise,.27+noise,.15+noise),earth=new T.Color(road.level>1?0x827e70:0x968368);const t=1-T.MathUtils.smoothstep(road.distance,1.5,2.5);grass.lerp(earth,t);if(z<8)grass.lerp(new T.Color(0x8b8572),1-T.MathUtils.smoothstep(z,0,8));colors.push(grass.r,grass.g,grass.b);}
  geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();const ground=new T.Mesh(geometry,new T.MeshStandardMaterial({vertexColors:true,roughness:1}));ground.receiveShadow=true;this.scene.add(ground);this.ground=ground;
  const water=new T.Mesh(new T.PlaneGeometry(280,80,1,1),new T.MeshStandardMaterial({color:0x526f70,roughness:.31,metalness:.22,transparent:true,opacity:.93}));water.rotation.x=-Math.PI/2;water.position.set(110,-.5,-27);this.scene.add(water);this.water=water;
 }
 makeBuildings(){
  this.buildings=[];
  for(const b of this.save.buildings||[]){const p=point(b),duration=Math.max(1,(b.ready||0)-(b.started||0)),progress=b.ready>this.save.seconds?T.MathUtils.clamp((this.save.seconds-(b.started||0))/duration,0,1):1,mesh=buildingMesh(b.type,b.level||1,this.materials,progress);mesh.position.set(p.x,groundHeight(p.x,p.z),p.z);
   // Face the closest actual adjacent road, rotating geometry and the door together.
   const adjacent=(this.save.roads||[]).filter(r=>Math.abs(r.x-b.x)+Math.abs(r.y-b.y)===1).sort((a,c)=>a.y-c.y||a.x-c.x),r=adjacent[0];if(r)mesh.rotation.y=Math.atan2(r.x-b.x,r.y-b.y);
   mesh.userData.building=b;this.scene.add(mesh);this.buildings.push(mesh);
  }
 }
 makeNature(){
  const rng=random(4429),dummy=new T.Object3D(),m=this.materials,trees=[],grass=[],stones=[];
  const blocked=(x,z,padding=0)=>this.buildings.some(b=>Math.abs(x-b.position.x)<4+padding&&Math.abs(z-b.position.z)<4+padding)||roadDistance(x,z,this.roads).distance<2.8+padding;
  for(let i=0;i<1100;i++){const x=rng()*190-10,z=rng()*185+9;if(blocked(x,z,1))continue;const inVillage=x<75&&z<75;if(inVillage&&rng()<.92)continue;trees.push({x,z,h:5+rng()*5,angle:rng()*6.28});}
  const trunkGeo=new T.CylinderGeometry(.13,.28,1,7),trunks=new T.InstancedMesh(trunkGeo,m.timber,trees.length),foliageGeo=new T.ConeGeometry(1,1,9,1,true),foliage=new T.InstancedMesh(foliageGeo,m.leaf,trees.length*6);
  trees.forEach((p,i)=>{const y=groundHeight(p.x,p.z);dummy.position.set(p.x,y+p.h/2,p.z);dummy.scale.set(1,p.h,1);dummy.rotation.set(0,p.angle,0);dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);for(let j=0;j<6;j++){const f=j/6;dummy.position.set(p.x,y+p.h*(.32+f*.66),p.z);dummy.scale.set(p.h*(.24-f*.19),p.h*.36,p.h*(.24-f*.19));dummy.updateMatrix();foliage.setMatrixAt(i*6+j,dummy.matrix);foliage.setColorAt(i*6+j,new T.Color().setHSL(.23+rng()*.04,.19+rng()*.13,.15+rng()*.12));}});
  trunks.castShadow=foliage.castShadow=true;foliage.receiveShadow=true;this.scene.add(trunks,foliage);
  for(let i=0;i<36000;i++){const x=rng()*145-6,z=rng()*140+7;if(blocked(x,z,.1))continue;grass.push({x,z,h:.16+rng()*.48,a:rng()*6.28});}
  const blade=new T.PlaneGeometry(.075,1,1,2);blade.translate(0,.5,0);const blades=new T.InstancedMesh(blade,new T.MeshStandardMaterial({color:0x6a7044,roughness:1,side:T.DoubleSide}),grass.length);
  grass.forEach((p,i)=>{dummy.position.set(p.x,groundHeight(p.x,p.z),p.z);dummy.scale.set(1,p.h,1);dummy.rotation.set(.15,p.a,.1);dummy.updateMatrix();blades.setMatrixAt(i,dummy.matrix);blades.setColorAt(i,new T.Color().setHSL(.18+rng()*.08,.25,.24+rng()*.15));});blades.receiveShadow=true;this.scene.add(blades);
  for(let i=0;i<380;i++){const x=rng()*180,z=rng()<.7?rng()*9:rng()*160;if(blocked(x,z))continue;stones.push({x,z,s:.3+rng()*1.5});}
  const rocks=new T.InstancedMesh(new T.DodecahedronGeometry(1,0),m.stone,stones.length);stones.forEach((p,i)=>{dummy.position.set(p.x,groundHeight(p.x,p.z)+p.s*.2,p.z);dummy.scale.set(p.s,p.s*.65,p.s*.8);dummy.rotation.set(rng(),rng()*6,rng());dummy.updateMatrix();rocks.setMatrixAt(i,dummy.matrix);});rocks.castShadow=rocks.receiveShadow=true;this.scene.add(rocks);
 }
 resize(){const {width,height}=this.canvas.getBoundingClientRect();this.renderer.setSize(width,height,false);this.camera.left=-this.span*width/height/2;this.camera.right=-this.camera.left;this.camera.top=this.span/2;this.camera.bottom=-this.camera.top;this.camera.near=.1;this.camera.far=600;this.camera.updateProjectionMatrix();this.updateCamera();}
 updateCamera(){this.camera.position.copy(this.target).add(new T.Vector3(Math.sin(this.azimuth)*95,85,Math.cos(this.azimuth)*95));this.camera.lookAt(this.target);}
 orbit(delta){this.azimuth+=delta;this.updateCamera();}
 pan(dx,dy){const scale=this.span/this.canvas.clientHeight,right=new T.Vector3().setFromMatrixColumn(this.camera.matrixWorld,0),forward=new T.Vector3(right.z,0,-right.x);this.target.addScaledVector(right,-dx*scale).addScaledVector(forward,dy*scale*1.5);this.updateCamera();}
 zoom(factor){this.span=T.MathUtils.clamp(this.span*factor,24,160);this.resize();}
 render(time){this.water.material.roughness=.3+.025*Math.sin(time*.7);this.renderer.render(this.scene,this.camera);}
 dispose(){const geometries=new Set(),materials=new Set(),textures=new Set();this.scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m){materials.add(m);for(const v of Object.values(m))if(v?.isTexture)textures.add(v);}});for(const x of [...geometries,...materials,...textures])x.dispose();this.renderer.dispose();}
}
