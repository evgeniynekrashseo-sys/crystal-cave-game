// Decorative foliage must not cover construction sites, houses or roads.
export function canPlaceDecorativeTree(x,y,objects,roads,clearance=1.5){
 if(!Number.isFinite(x)||!Number.isFinite(y))return false;
 if(objects.some(o=>o.type!=='tree'&&Math.abs(x-o.x)<clearance&&Math.abs(y-o.y)<clearance))return false;
 if(roads.some(r=>r.x===x&&r.y===y))return false;
 if(objects.some(o=>o.type==='tree'&&o.x===x&&o.y===y))return false;
 return true;
}

// The sandbox editor must obey the same occupied-tile rules as its initial
// procedural layout. This is visual-only and never mutates production saves.
export function canPlaceSandboxItem(type,x,y,objects,roads){
 if(!Number.isInteger(x)||!Number.isInteger(y)||!Array.isArray(objects)||!Array.isArray(roads))return false;
 if(type==='tree')return canPlaceDecorativeTree(x,y,objects,roads);
 if(!['road','house','site'].includes(type))return false;
 if(roads.some(r=>r.x===x&&r.y===y))return false;
 if(objects.some(o=>o.x===x&&o.y===y))return false;
 return true;
}
