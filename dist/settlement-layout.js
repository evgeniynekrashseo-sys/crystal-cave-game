import {factoryDoor} from './settlement-factory.js?v=48';
import {compoundEntrance} from './settlement-compounds.js?v=48';
import {footprintSize,bodyPoint} from './settlement-footprints.js?v=44';
// World-space door positions shared by access paths and worker transitions.
// Front-left facades face +y; front-right facades face +x.
const doors={house:[.66,.96],school:[.61,.96],granary:[.63,.96],lumber:[.56,.96],factory:[.67,.96],clinic:[.35,.88],university:[.38,.88],observatory:[.40,.88],lab:[.64,.96],ranch:[.63,.96],farm:[.5,.9],park:[.5,.9]};
export function buildingDoor(b){if(b.type==='factory')return factoryDoor(b);const entrance=compoundEntrance(b);if(entrance)return entrance;const [x,y]=doors[b.type]||[.38,.88];return bodyPoint(b,x,y);}
export function entrancePath(b,target){
 const [w,h]=footprintSize(b);const door=buildingDoor(b),left=b.x+.04,right=b.x+w-.04,top=b.y+.04,bottom=b.y+h-.04;
 if(b.type!=='factory'&&compoundEntrance(b)){
  const edge=b.y+.99,points=[door,{x:door.x,y:edge},{x:left,y:edge}];
  if(target.y>=b.y+h)points.push({x:left,y:bottom},{x:target.x,y:bottom});
  else if(target.x<b.x)points.push({x:left,y:target.y});
  else {points.push({x:left,y:top});if(target.x>=b.x+w)points.push({x:right,y:top},{x:right,y:target.y});else points.push({x:target.x,y:top});}
  points.push(target);return points;
 }
 const start={x:door.x,y:bottom};let points=[door,start];
 if(target.y>=b.y+h)points.push({x:target.x,y:bottom});
 else if(target.x>=b.x+w)points.push({x:right,y:bottom},{x:right,y:target.y});
 else if(target.x<b.x)points.push({x:left,y:bottom},{x:left,y:target.y});
 else {const side=target.x< b.x+w/2?left:right;points.push({x:side,y:bottom},{x:side,y:top},{x:target.x,y:top});}
 points.push(target);return points.filter((p,i)=>!i||Math.hypot(p.x-points[i-1].x,p.y-points[i-1].y)>.001);
}
export function pathPosition(points,fraction){
 const lengths=points.slice(1).map((p,i)=>Math.hypot(p.x-points[i].x,p.y-points[i].y));
 let remaining=lengths.reduce((a,b)=>a+b,0)*Math.max(0,Math.min(1,fraction));
 for(let i=0;i<lengths.length;i++){if(remaining<=lengths[i]){const t=lengths[i]?remaining/lengths[i]:0;return {x:points[i].x+(points[i+1].x-points[i].x)*t,y:points[i].y+(points[i+1].y-points[i].y)*t};}remaining-=lengths[i];}
 return points.at(-1);
}
