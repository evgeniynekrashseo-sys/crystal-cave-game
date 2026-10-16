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
 const p=project(part.x+.5,part.y+.52);ctx.save();
 ctx.fillStyle='#292b2330';ctx.beginPath();ctx.ellipse(p.x,p.y,u*.29,u*.10,0,0,Math.PI*2);ctx.fill();
 if(part.prop==='machine'){
  // Low iron housing, copper pipe and a flywheel mounted on the same foundation.
  ctx.fillStyle='#68716c';ctx.fillRect(p.x-u*.19,p.y-u*.20,u*.32,u*.18);
  ctx.fillStyle='#343e3b';ctx.fillRect(p.x+u*.13,p.y-u*.16,u*.09,u*.14);
  ctx.strokeStyle='#a27a53';ctx.lineWidth=Math.max(1.5,u*.035);ctx.beginPath();ctx.moveTo(p.x-u*.2,p.y-u*.18);ctx.lineTo(p.x-u*.2,p.y-u*.4);ctx.lineTo(p.x+u*.1,p.y-u*.4);ctx.stroke();
  const angle=working&&!reduced?time*2:0,cx=p.x-u*.08,cy=p.y-u*.12,r=u*.12;
  ctx.strokeStyle='#b3b2a1';ctx.lineWidth=Math.max(1,u*.018);ctx.beginPath();ctx.ellipse(cx,cy,r,r*.78,0,0,Math.PI*2);ctx.stroke();
  for(let i=0;i<6;i++){const a=angle+i*Math.PI/3;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r*.78);ctx.stroke();}
  if(working&&!reduced)for(let i=0;i<3;i++){const f=(time*.4+i/3)%1;ctx.fillStyle=`rgba(218,224,207,${(1-f)*.22})`;ctx.beginPath();ctx.ellipse(p.x+u*.1+f*u*.05,p.y-u*.42-f*u*.24,u*(.025+f*.035),u*(.02+f*.035),0,0,Math.PI*2);ctx.fill();}
 }else if(part.prop==='logs'){
  for(let i=0;i<5;i++){const y=p.y-i*u*.04;ctx.strokeStyle='#725132';ctx.lineWidth=u*.055;ctx.beginPath();ctx.moveTo(p.x-u*.23,y);ctx.lineTo(p.x+u*.2,y-u*.08);ctx.stroke();ctx.fillStyle='#bd9966';ctx.beginPath();ctx.ellipse(p.x-u*.23,y,u*.028,u*.022,0,0,Math.PI*2);ctx.fill();}
 }else if(part.prop==='garden'){
  for(let i=0;i<7;i++){const x=p.x+Math.sin(i*2.4)*u*.24,y=p.y+Math.cos(i*2.4)*u*.09;ctx.fillStyle=i%2?'#597447':'#7d8951';ctx.beginPath();ctx.ellipse(x,y-u*.055,u*.055,u*.065,0,0,Math.PI*2);ctx.fill();}
 }else{
  for(let i=0;i<3;i++){const x=p.x+(i-1)*u*.14,y=p.y-(i%2)*u*.08;ctx.fillStyle='#9a8058';ctx.fillRect(x-u*.06,y-u*.14,u*.12,u*.13);ctx.strokeStyle='#5e4b36';ctx.lineWidth=1;ctx.strokeRect(x-u*.06,y-u*.14,u*.12,u*.13);}
 }
 ctx.restore();
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

