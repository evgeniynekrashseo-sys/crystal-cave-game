import * as T from '../vendor/three/three.module.js';
// Provisional mesh kit. No photographed ground, PNG walls, or baked shadows.
// The model's front door is always local +Z; the whole group faces its access road.
const box=new T.BoxGeometry(1,1,1),cylinder=new T.CylinderGeometry(1,1,1,12);
export function buildingMesh(type,level,m,progress=1){
 const g=new T.Group();g.userData={type,level,door:new T.Vector3(0,0,2.6)};
 function part(mat,x,y,z,w,h,d){const mesh=new T.Mesh(box,mat);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.castShadow=mesh.receiveShadow=true;g.add(mesh);return mesh;}
 function beam(a,b,width=.16){const v=new T.Vector3(...b).sub(new T.Vector3(...a)),p=part(m.timber,...new T.Vector3(...a).addScaledVector(v,.5).toArray(),width,v.length(),width);p.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return p;}
 function roof(w,d,y,mat){const rise=w*.46,slope=Math.atan2(rise,w/2),length=Math.hypot(rise,w/2);for(const sign of [-1,1]){const r=part(mat,sign*w/4,y+rise/2,0,length,.14,d);r.rotation.z=-sign*slope;for(let z=-d/2+.17;z<d/2;z+=.32){const plank=part(mat,sign*w/4,y+rise/2+.09,z,length,.07,.29);plank.rotation.z=-sign*slope;}}beam([0,y+rise,-d/2],[0,y+rise,d/2],.22);}
 function fence(x,z,w,d){for(let k=0;k<=4;k++)for(const side of [-1,1])part(m.wood,x-w/2+k*w/4,.65,z+side*d/2,.13,1.3,.13);for(const side of [-1,1])for(const y of [.35,.85])part(m.wood,x,y,z+side*d/2,w,.1,.1);}
 if(type==='farm'){
  part(m.earth,0,.015,0,6,.03,6);for(let row=-2.7;row<3;row+=.48)for(let z=-2.7;z<3;z+=.24){const stalk=part(m.thatch,row,.35,z,.035,.7,.035);stalk.rotation.z=Math.sin(z*18+row)*.1;}return g;
 }
 if(type==='park'){for(const x of [-2,2])for(const z of [-2,2]){part(m.wood,x,.55,z,1.2,.12,.4);for(const dx of [-.4,.4])part(m.timber,x+dx,.25,z,.1,.5,.3);}const basin=new T.Mesh(new T.CylinderGeometry(1.2,1.3,.45,24),m.stone);basin.position.y=.23;g.add(basin);return g;}
 if(type==='well'){const ring=new T.Mesh(new T.CylinderGeometry(.75,.8,1,16,1,true),m.stone);ring.position.y=.5;ring.castShadow=true;g.add(ring);for(const x of [-1,1])part(m.wood,x,1.3,0,.16,2.6,.16);roof(2.7,2,2.5,m.roof);return g;}
 const open=type==='lumber',industrial=['factory','smelter','energy'].includes(type),barn=['ranch','granary'].includes(type),civic=['lab','school','university','clinic','observatory'].includes(type);
 const w=open?5.7:industrial?5.5:barn?4.5:civic?5:4,d=open?4.3:barn?5.3:4.5,h=level>=3?4.2:2.8;
 part(m.stone,0,.22,0,w+.3,.44,d+.3);
 if(progress<.25)return g;
 for(const x of [-w/2,w/2])for(const z of [-d/2,0,d/2]){part(m.timber,x,h/2+.4,z,.2,h,.2);beam([x,.6,z],[x,h+.3,Math.min(d/2,z+1.6)],.12);}
 if(progress<.55)return g;
 if(!open){part(level>=3?m.plaster:m.wood,0,h/2+.4,0,w,h,d);for(const x of [-w/2,w/2])part(m.timber,x,h/2+.4,d/2+.025,.18,h,.15);
  part(m.timber,0,.4+1.05,d/2+.08,.85,2.1,.12);
  for(const x of [-w*.3,w*.3]){part(m.timber,x,1.9,d/2+.09,.86,1.08,.1);part(m.glass,x,1.9,d/2+.16,.66,.88,.08);part(m.wood,x,1.9,d/2+.22,.07,.9,.06);}
  for(const y of [.5,h+.3])part(m.timber,0,y,d/2+.12,w,.15,.15);
  part(m.stone,0,.15,d/2+.4,1.3,.3,.8);
 }
 if(progress>=.8)roof(w+.7,d+.8,h+.4,level<3?m.thatch:m.roof);
 if(industrial){for(const x of [-1.7,1.7])part(m.stone,x,3.9,-1.1,.7,7.8,.7);}
 else if(!open&&!barn){part(m.stone,-w*.29,h+1.2,-d*.28,.5,2.8,.55);}
 if(open){for(let i=0;i<9;i++){const log=new T.Mesh(cylinder,m.wood);log.scale.set(.19,3.7,.19);log.rotation.x=Math.PI/2;log.position.set(-1.5+(i%3)*.38,.55+Math.floor(i/3)*.32,.2);log.castShadow=true;g.add(log);}part(m.metal,1.1,1.1,0,.12,1.4,1.4);}
 if(type==='ranch')fence(0,d/2+1.2,w,2.4);
 if(civic){part(m.stone,0,.25,d/2+.8,2.4,.5,1.2);}
 return g;
}
