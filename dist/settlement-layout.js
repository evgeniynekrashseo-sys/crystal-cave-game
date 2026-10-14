// World-space door positions shared by access paths and worker transitions.
// Front-left facades face +y; front-right facades face +x.
const doors={house:[.30,.88],school:[.34,.88],granary:[.36,.89],lumber:[.58,.88],factory:[.32,.88],clinic:[.35,.88],university:[.38,.88],observatory:[.40,.88],lab:[.38,.9],ranch:[.6,.88],farm:[.5,.9],park:[.5,.9]};
export function buildingDoor(b){const [x,y]=doors[b.type]||[.38,.88];return {x:b.x+x,y:b.y+y};}
export function entrancePath(b,target){
 const door=buildingDoor(b),left=b.x+.04,right=b.x+.96,top=b.y+.04,bottom=b.y+.96;
 const start={x:door.x,y:bottom};let points=[door,start];
 if(target.y>=b.y+1)points.push({x:target.x,y:bottom});
 else if(target.x>=b.x+1)points.push({x:right,y:bottom},{x:right,y:target.y});
 else if(target.x<b.x)points.push({x:left,y:bottom},{x:left,y:target.y});
 else {const side=target.x< b.x+.5?left:right;points.push({x:side,y:bottom},{x:side,y:top},{x:target.x,y:top});}
 points.push(target);return points.filter((p,i)=>!i||Math.hypot(p.x-points[i-1].x,p.y-points[i-1].y)>.001);
}
export function pathPosition(points,fraction){
 const lengths=points.slice(1).map((p,i)=>Math.hypot(p.x-points[i].x,p.y-points[i].y));
 let remaining=lengths.reduce((a,b)=>a+b,0)*Math.max(0,Math.min(1,fraction));
 for(let i=0;i<lengths.length;i++){if(remaining<=lengths[i]){const t=lengths[i]?remaining/lengths[i]:0;return {x:points[i].x+(points[i+1].x-points[i].x)*t,y:points[i].y+(points[i+1].y-points[i].y)*t};}remaining-=lengths[i];}
 return points.at(-1);
}
