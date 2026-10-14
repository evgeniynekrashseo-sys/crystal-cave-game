const indoor=new Set(['school','university','observatory','factory','smelter','clinic','granary','market']);
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export function actorPose(a,job,previous,alpha=1,reduced=false){
 const p=previous||a,t=Math.max(0,Math.min(1,alpha));
 let x=p.x+(a.x-p.x)*t,y=p.y+(a.y-p.y)*t,opacity=1;
 const entering=job&&indoor.has(job.type)&&a.state==='work'&&!a.truck;
 if(entering){
  const phase=Math.min(6,Math.max(0,6-a.timer));
  const amount=phase<1?smooth(phase):phase>5?1-smooth(phase-5):1;
  x+=(job.x+.35-x)*amount;y+=(job.y+.35-y)*amount;
  opacity=1-smooth((amount-.55)/.45);
 }
 const heading=a.heading||{x:1,y:0},right=heading.x-heading.y>=0,back=heading.x+heading.y<0;
 const moving=!!a.path.length;
 const frame=reduced||!moving?0:Math.floor((a.distance||0)*5)%4;
 const chopping=a.state==='рубання';
 return {x,y,opacity,right,back,frame,moving,chopping,
  key:a.truck?'truck'+(back?1:0):chopping?'chop'+(reduced?0:Math.floor((60-a.timer)*3)%4):(back?'back':'walk')+frame,
  flip:a.truck?!right:chopping?(a.tree?(a.tree.x-a.x)-(a.tree.y-a.y)<0:!right):!right};
}
