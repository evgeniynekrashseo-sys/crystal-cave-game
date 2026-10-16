import {cropVisual} from './settlement-crops.js?v=43';
import {entrancePath,pathPosition} from './settlement-layout.js?v=42';
const indoor=new Set(['school','university','observatory','factory','smelter','clinic','granary','market']);
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export function actorPose(a,job,previous,alpha=1,reduced=false){
 const p=previous||a,t=Math.max(0,Math.min(1,alpha));
 let x=p.x+(a.x-p.x)*t,y=p.y+(a.y-p.y)*t,opacity=1,entryHeading;
 const entering=job&&indoor.has(job.type)&&a.state==='work'&&!a.truck;
 if(entering){
  const phase=Math.min(6,Math.max(0,6-a.timer));
  const amount=phase<1?smooth(phase):phase>5?1-smooth(phase-5):1;
  const path=entrancePath(job,{x:x+.5,y:y+.62}).reverse(),point=pathPosition(path,amount);
  const ahead=pathPosition(path,amount+(phase>5?-.01:.01));
  if(Math.hypot(ahead.x-point.x,ahead.y-point.y)>.0001)entryHeading={x:ahead.x-point.x,y:ahead.y-point.y};
  x=point.x-.5;y=point.y-.62;
  opacity=1-smooth((amount-.55)/.45);
 }
 let farming=null;
 if(job?.type==='farm'&&a.state==='work'&&!a.truck){
  const crop=cropVisual(job);
  if(['soil','sowing','harvesting'].includes(crop.id)){
   farming=crop.id;
   const progress=crop.progress,travel=smooth(Math.min(progress/.08,(1-progress)/.08));
   const q=Math.min(.999,Math.max(0,(progress-.08)/.84))*8,row=Math.floor(q),along=q-row;
   const px=job.x+.12+(row+.5)*.095,py=job.y+.12+(row%2?1-along:along)*.76;
   x+=(px-.5-x)*travel;y+=(py-.62-y)*travel;
   entryHeading={x:0,y:row%2?-1:1};
  }
 }
 const heading=entryHeading||a.heading||{x:1,y:0},right=heading.x-heading.y>=0,back=heading.x+heading.y<0;
 const moving=!!a.path.length||!!farming;
 const frame=reduced||!moving?0:Math.floor(farming?cropVisual(job).elapsed*4:(a.distance||0)*5)%4;
 const chopping=a.state==='рубання';
 return {x,y,opacity,right,back,frame,moving,chopping,farming,
  key:a.truck?'truck'+(back?1:0):chopping?'chop'+(reduced?0:Math.floor((60-a.timer)*3)%4):(back?'back':'walk')+frame,
  // The rear-view source faces up-left, unlike the down-right front source.
  flip:a.truck?(back?right:!right):chopping?(a.tree?(a.tree.x-a.x)-(a.tree.y-a.y)<0:!right):!right};
}
