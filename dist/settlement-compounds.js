import {drawEquipment} from './settlement-geometry.js?v=47';
import {footprintSize,plannedSize} from './settlement-footprints.js?v=44';
const additions={
 factory:['granary','smelter','factory','energy'],smelter:['mine','granary','smelter','energy'],energy:['energy','granary','well','energy'],
 lumber:['lumber','granary','lumber','granary'],quarry:['quarry','granary','mine','quarry'],mine:['mine','granary','quarry','mine'],
 ranch:['ranch','granary','ranch','well'],granary:['granary','market','granary','granary'],
 school:['school','park','school','granary'],university:['school','observatory','university','park'],
 clinic:['clinic','park','clinic','well'],observatory:['observatory','school','park','granary'],
 greenhouse:['greenhouse','park','greenhouse','well'],park:['park','well','park','park'],
 market:['market','granary','market','park'],harbor:['granary','harbor','market','granary'],fishery:['fishery','granary','fishery','well']
};
export const isCompound=b=>!!additions[b.type];
export function compoundParts(b,seconds=Infinity){
 if(!isCompound(b))return null;
 const [w,h]=footprintSize(b),parts=[];
 // The original building never moves or grows with the site's area.
 const prior=b.constructionFrom?.level??(b.level>1?b.level-1:0);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const main=x===0&&y===0;
  let born=1;while(born<5){const size=plannedSize(b.type,born);if(x<size[0]&&y<size[1])break;born++;}
  const building=main||(x+y)%2===0;
  const type=main?b.type:additions[b.type][(x+2*y)%4];
  const stage=main?(b.level>=3?3:1):1;
  const renovating=main&&b.level===3;
  const constructing=b.ready>seconds&&(!prior||born>prior||renovating);
  const proxy={...b,x:b.x+x,y:b.y+y,type,level:stage,footprint:[1,1],ready:constructing?b.ready:0,constructionFrom:constructing&&main&&prior?{level:1,footprint:[1,1]}:undefined};
  parts.push({x:proxy.x,y:proxy.y,main,building,type,born,constructing,b:proxy,
   prop:b.type==='lumber'?'logs':['ranch','park','greenhouse'].includes(b.type)?'garden':['factory','smelter','energy'].includes(b.type)?'machine':'cargo'});
 }
 return parts;
}
export function compoundEntrance(b){return isCompound(b)?{x:b.x+.67,y:b.y+.96}:null;}

// Working equipment and supplies use constant world dimensions, independent of site level.
export function drawCompoundProp(ctx,part,project,u,time,working,reduced){
 return drawEquipment(ctx,part,project,u,time,working,reduced);
}

export function drawCompoundYard(ctx,b,project,u){
 if(!isCompound(b))return;
 const [w,h]=footprintSize(b),industrial=['factory','smelter','energy','lumber','mine','quarry','granary','harbor'].includes(b.type);
 const pts=[[.04,.04],[w-.04,.04],[w-.04,h-.04],[.04,h-.04]].map(([x,y])=>project(b.x+x,b.y+y));
 ctx.save();ctx.beginPath();pts.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](p.x,p.y));ctx.closePath();ctx.clip();
 ctx.fillStyle=industrial?'#91826995':'#8f917249';ctx.fill();
 let seed=b.id*7919;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<w*h*45;i++){const p=project(b.x+random()*w,b.y+random()*h);ctx.fillStyle=i%3?'#c6bca24d':'#534c3e39';ctx.fillRect(p.x,p.y,u*.014,u*.008);}
 // A continuous perimeter service lane joins the original entrance and new halls.
 const lane=[[.12,.99],[.12,h-.12],[w-.12,h-.12],[w-.12,.12],[.12,.12],[.12,.99]].map(([x,y])=>project(b.x+x,b.y+y));
 ctx.lineJoin='round';ctx.lineWidth=u*.075;ctx.strokeStyle=industrial?'#b4a58a88':'#beae8b88';ctx.beginPath();lane.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](p.x,p.y));ctx.stroke();
 ctx.restore();
}

