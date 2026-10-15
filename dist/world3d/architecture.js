import * as T from '../vendor/three/three.module.js';
import {triangleGeometry} from './geometry.js';
import {random} from './world-space.js';
// Provisional mesh kit. No photographed ground, PNG walls, or baked shadows.
// The model's front door is always local +Z; the whole group faces its access road.
const box=new T.BoxGeometry(1,1,1),cylinder=new T.CylinderGeometry(1,1,1,12);
export function buildingMesh(type,level,m,progress=1){
 const g=new T.Group(),rng=random(180+level+type.length);g.userData={type,level,door:new T.Vector3(0,0,2.6)};
 function part(mat,x,y,z,w,h,d){const mesh=new T.Mesh(box,mat);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.castShadow=mesh.receiveShadow=true;g.add(mesh);return mesh;}
 function beam(a,b,width=.16){const v=new T.Vector3(...b).sub(new T.Vector3(...a)),p=part(m.timber,...new T.Vector3(...a).addScaledVector(v,.5).toArray(),width,v.length(),width);p.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return p;}
 function roof(w,d,y,mat){const rise=w*.46,slope=Math.atan2(rise,w/2),length=Math.hypot(rise,w/2);for(const sign of [-1,1]){const r=part(mat,sign*w/4,y+rise/2,0,length,.14,d);r.rotation.z=-sign*slope;for(let row=0;row<7;row++){const f=(row+.5)/7;for(let z=-d/2+.16;z<d/2;z+=.34){const plank=part(mat,sign*w*.5*f,y+rise*(1-f)+.10,z+(row%2)*.035,length/7+.08,.065,.32);plank.rotation.z=-sign*slope+(rng()-.5)*.025;}}for(const z of [-d/2,d/2])beam([0,y+rise+.08,z],[sign*w/2,y,z],.15);}beam([0,y+rise,-d/2],[0,y+rise,d/2],.22);}
 function fence(x,z,w,d){for(let k=0;k<=4;k++)for(const side of [-1,1])part(m.wood,x-w/2+k*w/4,.65,z+side*d/2,.13,1.3,.13);for(const side of [-1,1])for(const y of [.35,.85])part(m.wood,x,y,z+side*d/2,w,.1,.1);}
 if(type==='farm'){
  part(m.earth,0,.015,0,6,.03,6);for(let row=-2.7;row<3;row+=.48)for(let z=-2.7;z<3;z+=.24){const stalk=part(m.thatch,row,.35,z,.035,.7,.035);stalk.rotation.z=Math.sin(z*18+row)*.1;}return g;
 }
 if(type==='park'){for(const x of [-2,2])for(const z of [-2,2]){part(m.wood,x,.55,z,1.2,.12,.4);for(const dx of [-.4,.4])part(m.timber,x+dx,.25,z,.1,.5,.3);}const basin=new T.Mesh(new T.CylinderGeometry(1.2,1.3,.45,24),m.stone);basin.position.y=.23;g.add(basin);return g;}
 if(type==='well'){const ring=new T.Mesh(new T.CylinderGeometry(.75,.8,1,16,1,true),m.stone);ring.position.y=.5;ring.castShadow=true;g.add(ring);for(const x of [-1,1])part(m.wood,x,1.3,0,.16,2.6,.16);roof(2.7,2,2.5,m.roof);return g;}
 const open=type==='lumber',industrial=['factory','smelter','energy'].includes(type),barn=['ranch','granary'].includes(type),civic=['lab','school','university','clinic','observatory'].includes(type);
 const w=open?5.7:industrial?5.5:barn?4.5:civic?5:4,d=open?4.3:barn?5.3:4.5,h=level>=3?4.2:2.8;
 part(m.stone,0,.18,0,w+.3,.36,d+.3);
 for(let row=0;row<2;row++)for(const sign of [-1,1]){
  for(let x=-w/2;x<w/2;x+=.64)part(m.stone,x+.27,row*.24+.13,sign*(d/2+.07),.59,.23,.25);
  for(let z=-d/2;z<d/2;z+=.64)part(m.stone,sign*(w/2+.06),row*.24+.13,z+.27,.24,.23,.58);
 }
 if(progress<.25)return g;
 for(const x of [-w/2,w/2])for(const z of [-d/2,0,d/2]){part(m.timber,x,h/2+.4,z,.2,h,.2);beam([x,.6,z],[x,h+.3,Math.min(d/2,z+1.6)],.12);}
 if(progress<.55)return g;
 if(!open){part(level>=3?m.plaster:m.wood,0,h/2+.4,0,w,h,d);for(const x of [-w/2,w/2])part(m.timber,x,h/2+.4,d/2+.025,.18,h,.15);
  part(m.timber,0,.4+1.05,d/2+.08,.85,2.1,.12);
  for(const x of [-w*.3,w*.3]){part(m.timber,x,1.9,d/2+.09,.86,1.08,.1);part(m.glass,x,1.9,d/2+.16,.66,.88,.08);part(m.wood,x,1.9,d/2+.22,.07,.9,.06);}
  for(const y of [.5,h+.3])part(m.timber,0,y,d/2+.12,w,.15,.15);
  for(const sign of [-1,1]){
   for(const z of [-d/2,0,d/2])part(m.timber,sign*(w/2+.025),h/2+.4,z,.14,h,.16);
   for(const y of [.55,h+.25])part(m.timber,sign*(w/2+.04),y,0,.14,.16,d);
   beam([sign*(w/2+.09),.6,-d/2+.1],[sign*(w/2+.09),h+.3,0],.12);
   for(const z of [-d*.25,d*.25]){part(m.wood,sign*(w/2+.09),1.85,z,.12,1.15,.82);part(m.glass,sign*(w/2+.16),1.85,z,.08,.92,.61);part(m.wood,sign*(w/2+.21),1.85,z,.05,.94,.06);}
  }
  for(let step=0;step<3;step++)part(m.stone,0,.075+step*.075,d/2+.85-step*.25,1.4,.15+step*.15,.36);
  const gy=h+.4,rise=(w+.7)*.46;
  for(const sign of [-1,1]){const z=sign*d/2,vertices=sign>0?[-w/2,gy,z,w/2,gy,z,0,gy+rise,z]:[w/2,gy,z,-w/2,gy,z,0,gy+rise,z];const gable=new T.Mesh(triangleGeometry(vertices),level>=3?m.plaster:m.wood);gable.castShadow=gable.receiveShadow=true;g.add(gable);beam([0,gy,z+sign*.05],[0,gy+rise,z+sign*.05],.14);beam([-w/2,gy,z+sign*.05],[0,gy+rise,z+sign*.05],.14);beam([w/2,gy,z+sign*.05],[0,gy+rise,z+sign*.05],.14);}
 }
 if(progress>=.8)roof(w+.7,d+.8,h+.4,level<3?m.thatch:m.roof);
 if(industrial){for(const x of [-1.7,1.7])part(m.stone,x,3.9,-1.1,.7,7.8,.7);}
 else if(!open&&!barn){part(m.stone,-w*.29,h+1.2,-d*.28,.5,2.8,.55);}
 if(open){for(let i=0;i<9;i++){const log=new T.Mesh(cylinder,m.wood);log.scale.set(.19,3.7,.19);log.rotation.x=Math.PI/2;log.position.set(-1.5+(i%3)*.38,.55+Math.floor(i/3)*.32,.2);log.castShadow=true;g.add(log);}part(m.metal,1.1,1.1,0,.12,1.4,1.4);}
 if(type==='ranch')fence(0,d/2+1.2,w,2.4);
 if(civic){part(m.stone,0,.25,d/2+.8,2.4,.5,1.2);}
 if(type==='house'&&level>=2){
  const awning=part(m.roof,0,2.5,d/2+.7,2.2,.16,1.6);awning.rotation.x=.12;for(const x of [-1,1])part(m.timber,x,1.3,d/2+1.3,.12,2.6,.12);
 }
 if(type==='lab'||type==='observatory'){
  const tower=new T.Mesh(new T.CylinderGeometry(1.05,1.25,5.5,8),m.stone);tower.position.set(-1.4,3.1,-.8);tower.castShadow=true;g.add(tower);
  const cap=new T.Mesh(new T.ConeGeometry(1.6,3,8),m.roof);cap.position.set(-1.4,7.2,-.8);cap.castShadow=true;g.add(cap);
  beam([-1.4,8.7,-.8],[-1.4,10,-.8],.08);
 }
 for(let i=0;i<(open?3:2);i++){const barrel=new T.Mesh(new T.CylinderGeometry(.27,.25,.65,10),m.wood);barrel.position.set(w/2+.5,.34,-d/2+.6+i*.65);barrel.castShadow=true;g.add(barrel);for(const y of [.12,.54]){const band=new T.Mesh(new T.TorusGeometry(.269,.026,4,10),m.metal);band.rotation.x=Math.PI/2;band.position.set(barrel.position.x,y,barrel.position.z);g.add(band);}}
 return g;
}
