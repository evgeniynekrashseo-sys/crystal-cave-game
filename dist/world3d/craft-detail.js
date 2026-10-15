import * as T from '../vendor/three/three.module.js';
import {random} from './world-space.js';

// Detail is modelled in metres, shares scene lighting and is batched with the building.
const box=new T.BoxGeometry(1,1,1);
const section=new T.Shape();section.moveTo(-.42,-.42);section.lineTo(.42,-.42);section.lineTo(.42,.42);section.lineTo(-.42,.42);section.closePath();
const stone=new T.ExtrudeGeometry(section,{depth:.84,bevelEnabled:true,bevelThickness:.08,bevelSize:.08,bevelSegments:1,steps:1});stone.translate(0,0,-.42);

export function addCraftDetail(group,m,{width:w,depth:d,height:h,progress,type,seed=1}){
 const rng=random(seed);
 function mesh(geometry,mat,x,y,z,sx,sy,sz){const p=new T.Mesh(geometry,mat);p.position.set(x,y,z);p.scale.set(sx,sy,sz);group.add(p);return p;}
 const plank=(x,y,z,sx,sy,sz,mat=m.wood)=>mesh(box,mat,x,y,z,sx,sy,sz);
 function beam(a,b,r=.12){const delta=new T.Vector3(...b).sub(new T.Vector3(...a)),center=new T.Vector3(...a).addScaledVector(delta,.5),p=plank(...center.toArray(),r,delta.length(),r,m.timber);p.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());}
 function block(x,y,z,sx,sy,sz){const b=mesh(stone,m.stone,x,y,z,sx,sy,sz);b.rotation.set((rng()-.5)*.035,(rng()-.5)*.06,(rng()-.5)*.025);}
 // Individually chamfered corner stones catch the common sunlight.
 for(let row=0;row<3;row++)for(const sx of [-1,1])for(const sz of [-1,1])block(sx*w/2,.13+row*.22,sz*d/2,.42,.21,.43);
 if(progress<1){
  // Real building yard: raised scaffold decks, diagonal bracing and timber stacks.
  const z=-d/2-.7;
  for(const x of [-w/2,w/2]){beam([x,0,z],[x,Math.min(h,3)+.6,z],.12);beam([x,0,z],[x+.5,Math.min(h,3),z],.08);}
  if(progress>.25){for(let n=0;n<4;n++)plank(0,1.6,z-.22+n*.15,w+.8,.08,.14);beam([-w/2,1.65,z-.4],[w/2,1.65,z-.4],.12);beam([-w/2,0,z],[w/2,2.6,z],.09);}
  for(let i=0;i<9;i++){const p=plank(w/2+.8,.09+Math.floor(i/3)*.10,-.8+(i%3)*.18,.15,.09,2.4);p.rotation.y=.08;}
  for(let i=0;i<8;i++)block(-w/2-.6+(i%2)*.25,.12+Math.floor(i/4)*.2,-d/2+.3+Math.floor(i%4/2)*.35,.3,.22,.3);
  const ladderX=w/2+.5;for(const dx of [-.22,.22])beam([ladderX+dx,0,z+1.2],[ladderX+dx,2.9,z],.07);for(let i=1;i<9;i++)beam([ladderX-.22,i*.3,z+1.2-i*.124],[ladderX+.22,i*.3,z+1.2-i*.124],.055);
  return;
 }
 if(!['lumber','factory','smelter','energy'].includes(type)){
  // Recessed door frame with planks, hinges and a metal pull.
  const front=d/2+.18;
  for(const x of [-.49,.49])plank(x,1.4,front,.13,2.15,.16,m.timber);
  plank(0,2.48,front,1.12,.16,.19,m.timber);
  for(let i=0;i<6;i++)plank(-.36+i*.145,1.44,front+.05,.13,1.94,.05);
  for(const y of [.75,2.05])plank(-.21,y,front+.1,.32,.065,.035,m.metal);
  const pull=new T.Mesh(new T.TorusGeometry(.07,.014,5,12),m.metal);pull.position.set(.23,1.35,front+.14);group.add(pull);
  // Shutters, sills and lintels carry depth even at an oblique camera angle.
  for(const x of [-w*.3,w*.3]){
   for(const side of [-1,1]){const shutter=plank(x+side*.56,1.9,d/2+.24,.3,1.06,.07);shutter.rotation.y=side*.27;for(const y of [1.55,2.23])plank(x+side*.56,y,d/2+.29,.3,.07,.035,m.timber);}
   plank(x,1.3,d/2+.24,1.02,.12,.28,m.stone);plank(x,2.48,d/2+.15,.94,.12,.18,m.timber);
  }
 }
 // Pegs in frame joints and supports under the eaves.
 for(const side of [-1,1])for(const z of [-d/2,0,d/2]){
  beam([side*(w/2-.35),h-.12,z],[side*(w/2+.18),h+.34,z],.095);
  const peg=new T.Mesh(new T.CylinderGeometry(.027,.027,.22,6),m.wood);peg.rotation.z=Math.PI/2;peg.position.set(side*(w/2+.12),h+.17,z);group.add(peg);
 }
 if(type==='lumber'){
  // Workbench with split planks, a toothed blade and trestle supports.
  plank(1.1,1.03,.2,1.5,.14,2.1);for(const x of [.55,1.65])for(const z of [-.55,.95])plank(x,.5,z,.14,1,.14,m.timber);
  for(let i=0;i<4;i++)plank(.7+i*.18,1.15,.2,.14,.1,2.5);
  const blade=new T.Mesh(new T.CylinderGeometry(.48,.48,.05,32),m.metal);blade.rotation.z=Math.PI/2;blade.position.set(1.35,1.32,.2);group.add(blade);
 }
 // A low stone edging stops short of the door, preserving a traversable entrance.
 for(const side of [-1,1])for(let i=0;i<4;i++)block(side*(1.1+i*.46),.12,d/2+.9,.44,.24,.32);
}
