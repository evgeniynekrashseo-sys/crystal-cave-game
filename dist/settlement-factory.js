import {footprintSize} from './settlement-footprints.js?v=44';
import {GROUND_SLOPE,drawWorldBox,raisedPoint} from './settlement-geometry.js?v=47';
// Crops are explicit: the approved artwork is not an evenly spaced sprite grid.
// Ground-front anchors and measured facade slopes calibrate it to the actual map.
export const FACTORY_STAGES=[
 {crop:[0,0,768,481],front:[375,480],slope:.39,size:1,door:[463,421],vent:[305,38]},
 {crop:[778,0,758,532],front:[1214,524],slope:.37,size:1.65,door:[1121,456],vent:[908,44]},
 {crop:[0,481,786,543],front:[355,1013],slope:.365,size:1.9,door:[367,925],vent:[291,787]},
 {crop:[787,532,749,492],front:[1160,1007],slope:.35,size:2.85,door:[1128,916],vent:null}
];
export const factoryStage=level=>level>=5?3:level>=3?2:level===2?1:0;
export function factoryMetrics(b){
 const index=factoryStage(b.level),spec=FACTORY_STAGES[index],[w,h]=footprintSize(b);
 // Prevent late-stage industrial artwork from dominating neighboring
 // medieval-scale structures. Footprint/collision data stay unchanged.
 const visualLimit=index>=2?2.05:1.55;
 const size=Math.min(spec.size,visualLimit,w-.08,h-.08),scale=size*1.9/(2*Math.max(spec.front[0]-spec.crop[0],spec.crop[0]+spec.crop[2]-spec.front[0]));
 return {index,spec,size,scale,anchor:{x:b.x+(w-size)/2+size,y:b.y+size+.01}};
}
export function factoryWorldPoint(b,source){
 const m=factoryMetrics(b),dx=(source[0]-m.spec.front[0])*m.scale,dy=(source[1]-m.spec.front[1])*m.scale*GROUND_SLOPE/m.spec.slope;
 return {x:m.anchor.x+(dx+dy/GROUND_SLOPE)/2,y:m.anchor.y+(dy/GROUND_SLOPE-dx)/2};
}
export const factoryDoor=b=>factoryWorldPoint(b,FACTORY_STAGES[factoryStage(b.level)].door);
export function prepareFactorySprites(image,document){
 if(!image.complete||image.naturalWidth<1000)return [];
 return FACTORY_STAGES.map(spec=>{
  const [x,y,w,h]=spec.crop,half=Math.max(spec.front[0]-x,x+w-spec.front[0]),k=GROUND_SLOPE/spec.slope;
  const canvas=document.createElement('canvas');canvas.width=half*2;canvas.height=Math.ceil((spec.front[1]-y)*k);
  const g=canvas.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  g.drawImage(image,x,y,w,h,half-(spec.front[0]-x),0,w,h*k);
  return canvas;
 });
}
export function factoryWidth(b){return factoryMetrics(b).size*1.9;}
export function hasFactoryLogistics(b){const [w,h]=footprintSize(b);return b.level===4&&w>=3&&h>=3;}
export function drawFactoryLogistics(ctx,b,project,u,time,reduced,working){
 const [w,h]=footprintSize(b),y=b.y+h-.42,x=b.x+.40,end=b.x+w-.40;
 const box=(a,d,z,ww,dd,hh,colors)=>drawWorldBox(ctx,project,u,[a,d,z,ww,dd,hh],colors);
 const steel=['#374a4e','#64777a','#9ca7a1'];ctx.save();
 for(const at of [x,end]){box(at-.10,y-.09,0,.2,.18,.04,['#6c6b5c','#898572','#aca68e']);box(at-.025,y-.025,.04,.05,.05,.69,steel);}
 box(x-.08,y-.045,.71,end-x+.16,.09,.07,steel);
 const travel=reduced||!working?.45:.2+(.5+.5*Math.sin(time*.35))*.6,tx=x+(end-x)*travel;
 box(tx-.05,y-.065,.67,.1,.13,.08,['#61512b','#99813b','#c8ae56']);
 const top=raisedPoint(project,u,tx,y,.67),bottom=raisedPoint(project,u,tx,y,.20);
 ctx.strokeStyle='#4b4e45';ctx.lineWidth=Math.max(.7,u*.009);ctx.beginPath();ctx.moveTo(top.x,top.y);ctx.lineTo(bottom.x,bottom.y);ctx.stroke();
 ctx.strokeStyle='#c2bda2';ctx.beginPath();ctx.arc(bottom.x,bottom.y,u*.025,0,Math.PI);ctx.stroke();
 for(let i=0;i<3;i++){const a=x+.22+i*.29,d=y+.12;box(a,d,.01,.22,.17,.04,['#61523a','#89704b','#b39968']);box(a+.02,d+.015,.05,.18,.14,.16,['#725735','#987849','#c6a674']);}
 ctx.restore();
}
export function drawFactoryActivity(ctx,b,project,u,time,reduced,working){
 if(b.ready>time)return;
 const m=factoryMetrics(b),vent=m.spec.vent;
 if(m.index===0){
  const c=factoryWorldPoint(b,[588,325]),p=project(c.x,c.y),rx=31*m.scale*u,ry=53*m.scale*u*GROUND_SLOPE/m.spec.slope,angle=working&&!reduced?time*1.8:0;
  ctx.save();ctx.fillStyle='#39372d';ctx.beginPath();ctx.ellipse(p.x,p.y,rx,ry,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#8e8a70';ctx.lineWidth=Math.max(.45,u*.008);
  for(let i=0;i<6;i++){const a=angle+i*Math.PI/3;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+Math.cos(a)*rx,p.y+Math.sin(a)*ry);ctx.stroke();}ctx.restore();
 }
 if(reduced||!working)return;
 if(vent){
  const origin=factoryWorldPoint(b,vent),p=project(origin.x,origin.y);
  for(let i=0;i<5;i++){const f=(time*.16+i/5)%1;ctx.fillStyle=`rgba(209,211,199,${(1-f)*.24})`;ctx.beginPath();ctx.ellipse(p.x+f*u*.17,p.y-f*u*.40,u*(.018+f*.07),u*(.025+f*.065),-.3,0,Math.PI*2);ctx.fill();}
 }else{
  // Modern plant: restrained operating indicators, no coal smoke.
  const q=factoryDoor(b),p=project(q.x,q.y);ctx.fillStyle=`rgba(190,218,159,${.4+.2*Math.sin(time*2)})`;ctx.beginPath();ctx.arc(p.x,p.y-u*.13,Math.max(.7,u*.014),0,Math.PI*2);ctx.fill();
 }
}
