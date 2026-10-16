// Width/depth in real map cells. Growth is always anchored at the north corner.
const plans={
 market:[[2,1],[2,2],[2,3],[3,3],[3,4]],
 house:[[1,1],[1,1],[1,1],[1,1],[1,1]],
 farm:[[2,2],[2,3],[2,4],[2,5],[2,6]],
 factory:[[2,1],[2,2],[3,2],[3,3],[4,3]],
 ranch:[[2,2],[2,3],[3,3],[3,4],[4,4]],
 lumber:[[1,2],[2,2],[2,3],[3,3],[3,4]],
 granary:[[2,1],[2,2],[2,3],[3,3],[3,4]],
 greenhouse:[[2,2],[2,3],[2,4],[3,4],[4,4]],
 park:[[2,2],[2,3],[3,3],[3,4],[4,4]],
 school:[[2,1],[2,2],[2,3],[3,3],[3,4]],
 university:[[2,2],[3,2],[3,3],[4,3],[4,4]],
 clinic:[[1,1],[2,1],[2,2],[3,2],[3,3]],
 smelter:[[2,1],[2,2],[3,2],[3,3],[4,3]],
 energy:[[2,1],[2,2],[3,2],[3,3],[4,3]],
 quarry:[[2,2],[2,3],[3,3],[3,4],[4,4]],
 mine:[[2,1],[2,2],[3,2],[3,3],[4,3]],
 harbor:[[2,1],[3,1],[3,2],[4,2],[4,3]],
 fishery:[[1,1],[2,1],[2,2],[3,2],[3,3]],
 observatory:[[1,1],[2,1],[2,2],[3,2],[3,3]],
 well:[[1,1],[1,1],[1,1],[1,1],[1,1]],
 lighthouse:[[1,1],[1,1],[1,1],[1,1],[1,1]]
};
export function plannedSize(type,level=1){return [...(plans[type]?.[Math.max(0,Math.min(4,Math.floor(level||1)-1))]||[1,1])];}
export function footprintSize(b){
 const f=b.footprint;
 return Array.isArray(f)&&f.length===2&&f.every(n=>Number.isInteger(n)&&n>=1&&n<=6)?[...f]:plannedSize(b.type,b.level);
}
export function footprintCells(b,size=footprintSize(b)){
 const result=[];for(let dy=0;dy<size[1];dy++)for(let dx=0;dx<size[0];dx++)result.push({x:b.x+dx,y:b.y+dy});return result;
}
export function covers(b,x,y){const [w,h]=footprintSize(b);return x>=b.x&&y>=b.y&&x<b.x+w&&y<b.y+h;}
export function buildingAt(c,x,y){return c.buildings.find(b=>covers(b,x,y));}
export function perimeter(b){const [w,h]=footprintSize(b),out=[];
 for(let dx=0;dx<w;dx++)out.push({x:b.x+dx,y:b.y+h},{x:b.x+dx,y:b.y-1});
 for(let dy=0;dy<h;dy++)out.push({x:b.x+w,y:b.y+dy},{x:b.x-1,y:b.y+dy});return out;
}
export function footprintCenter(b){const [w,h]=footprintSize(b);return {x:b.x+w/2,y:b.y+h/2};}
export function footprintFront(b){const [w,h]=footprintSize(b);return {x:b.x+w-.02,y:b.y+h-.02};}

export function bodyPoint(b,x=.98,y=.98){const [w,h]=footprintSize(b),s=Math.min(w,h);return {x:b.x+(w-s)/2+x*s,y:b.y+(h-s)/2+y*s};}
