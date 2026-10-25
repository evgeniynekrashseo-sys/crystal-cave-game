// Decorative foliage must not cover construction sites, houses or roads.
export function canPlaceDecorativeTree(x,y,objects,roads,clearance=1.5){
 if(!Number.isFinite(x)||!Number.isFinite(y))return false;
 if(objects.some(o=>o.type!=='tree'&&Math.abs(x-o.x)<clearance&&Math.abs(y-o.y)<clearance))return false;
 if(roads.some(r=>r.x===x&&r.y===y))return false;
 if(objects.some(o=>o.type==='tree'&&o.x===x&&o.y===y))return false;
 return true;
}
