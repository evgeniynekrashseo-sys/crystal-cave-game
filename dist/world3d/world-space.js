// One tile is eight metres. Rendering coordinates never leak into the save.
export const TILE=8;
export function random(seed){let n=seed>>>0;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
export function point(p){return {x:(p.x+.5)*TILE,z:(p.y+.5)*TILE};}
export function segmentDistance(x,z,a,b){const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz||1)));return Math.hypot(x-a.x-dx*t,z-a.z-dz*t);}
export function roadNetwork(save){
 const roads=save.roads||[],keys=new Map(roads.map(r=>[`${r.x},${r.y}`,r])),segments=[];
 for(const r of roads){const a=point(r);segments.push({a,b:a,level:r.level||1});for(const [dx,dy]of [[1,0],[0,1]]){const other=keys.get(`${r.x+dx},${r.y+dy}`);if(other)segments.push({a,b:point(other),level:Math.min(r.level||1,other.level||1)});}}
 return segments;
}
export function roadDistance(x,z,segments){let distance=Infinity,level=1;for(const s of segments){const d=segmentDistance(x,z,s.a,s.b);if(d<distance){distance=d;level=s.level;}}return {distance,level};}
export function groundHeight(x,z){
 // Coast transitions below water; hills surround the buildable valley.
 const coast=Math.min(1,Math.max(0,(z+4)/13));
 const hill=Math.max(0,(x-110)/65)*Math.max(0,(z-90)/70);
 return -2.2*(1-coast)+coast*(.16*Math.sin(x*.11)*Math.cos(z*.09)+hill*(4+2*Math.sin(x*.035)));
}
export function sceneSnapshot(save){
 return {extent:save.extent||10,seconds:save.seconds||0,buildings:(save.buildings||[]).map(b=>({...b,...point(b)})),roads:roadNetwork(save),agents:(save.agents||[]).map(a=>({...a,...point(a)}))};
}
