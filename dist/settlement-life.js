import {footprintCells,perimeter} from './settlement-footprints.js?v=44';
import {entrancePath} from './settlement-layout.js?v=47';
// Shore relief is deterministic and stays outside the buildable y >= 0 cells.
const shoreY=x=>-.10-.12*(1+Math.sin(x*.73))-.055*(1+Math.sin(x*2.31));
export function drawSea(ctx,project,u,time,reduced,view){
 const coast=Array.from({length:301},(_,i)=>{const x=-40+i/3;return{x,y:shoreY(x)}});
 const trace=(offset=0)=>{ctx.beginPath();coast.forEach((s,i)=>{const p=project(s.x,s.y-offset);ctx[i?'lineTo':'moveTo'](p.x,p.y)});};
 const shallow=project(5,-.5),deep=project(5,-12),water=ctx.createLinearGradient(shallow.x,shallow.y,deep.x,deep.y);
 water.addColorStop(0,'#718885');water.addColorStop(.18,'#526c70');water.addColorStop(1,'#2d4858');
 ctx.save();trace();for(const p of [project(60,-40),project(-40,-40)])ctx.lineTo(p.x,p.y);ctx.closePath();ctx.fillStyle=water;ctx.fill();
 // Continuous eroded bank, with rock facets and wet stone at its foot.
 trace(-.04);ctx.lineJoin='round';ctx.lineWidth=u*.27;ctx.strokeStyle='#777363';ctx.stroke();
 trace(.09);ctx.lineWidth=u*.13;ctx.strokeStyle='#4d5650';ctx.stroke();
// Fine wet gravel follows the continuous shore without regular polygon wedges.
 const t=reduced?0:time*.32;
 trace(.25+Math.sin(t)*.025);ctx.lineWidth=u*.045;ctx.strokeStyle='rgba(219,233,219,.35)';ctx.stroke();
 for(let i=0;i<170;i++){
  const x=-14+(i*2.731)%50,y=-.6-(i*1.379)%16,p=project(x,y);
  if(p.x<-u||p.x>view.width+u||p.y<-u||p.y>view.height+u)continue;
  const phase=t+i*1.83;
  ctx.strokeStyle=`rgba(207,222,217,${.035+.045*(1+Math.sin(phase))})`;ctx.lineWidth=Math.max(.6,u*.012);
  ctx.beginPath();ctx.ellipse(p.x,p.y,u*(.2+(i%5)*.05),u*.055,-.08,0,Math.PI);ctx.stroke();
 }
 ctx.restore();
}

export function drawRoadNetwork(ctx,c,project,u){
 const roads=new Set(c.roads.map(r=>`${r.x},${r.y}`));ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
 // Existing saves may contain buildings without a road directly in front.
 // Draw short pedestrian access paths toward the nearest adjacent road
 // without mutating simulation state or placing roads through structures.
 const occupied=new Set(c.buildings.flatMap(b=>footprintCells(b).map(p=>`${p.x},${p.y}`)));
 for(const b of c.buildings){
  const neighbors=perimeter(b)
   .filter(n=>roads.has(`${n.x},${n.y}`));
  if(!neighbors.length)continue;
  const choices=neighbors.map(n=>entrancePath(b,{x:n.x+.5,y:n.y+.5}));
  const length=ps=>ps.slice(1).reduce((n,p,i)=>n+Math.hypot(p.x-ps[i].x,p.y-ps[i].y),0);
  choices.sort((a,b)=>length(a)-length(b));const points=choices[0].map(p=>project(p.x,p.y));
  ctx.strokeStyle='#66533e50';ctx.lineWidth=u*.14;ctx.beginPath();points.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](p.x,p.y));ctx.stroke();
  ctx.strokeStyle='#a79372aa';ctx.lineWidth=u*.08;ctx.stroke();
 }

 // A continuous world-space street surface, including intersections. Every layer
 // is completed across the whole network before the next; no per-tile end caps.
 const paved=false;
 for(const [radius,color]of [[.33,'#94876835'],[.29,'#97866a88'],[.25,paved?'#a09d8d':'#b1a080'],[.20,paved?'#aaa799':'#bcaa89']]){
  ctx.fillStyle=color;
  for(const r of c.roads){
   const level=r.level||1;
   ctx.fillStyle=radius===.25?(level===1?'#a38c68':level===2?'#817c70':'#8d8d87'):radius===.20?(level===1?'#b39b76':level===2?'#979083':'#aaa99f'):color;
   const links=[[1,0],[-1,0],[0,1],[0,-1]].filter(([x,y])=>roads.has(`${r.x+x},${r.y+y}`));
   if(links.length===2&&links[0][0]*links[1][0]+links[0][1]*links[1][1]===0){
    const [a,b]=links,edges=[[],[]];
    for(let i=0;i<=20;i++){
     const t=i/20,s=1-t,x=.5+.5*(s*s*a[0]+t*t*b[0]),y=.5+.5*(s*s*a[1]+t*t*b[1]);
     const dx=-s*a[0]+t*b[0],dy=-s*a[1]+t*b[1],len=Math.hypot(dx,dy);
     edges[0].push(project(r.x+x-dy/len*radius,r.y+y+dx/len*radius));
     edges[1].push(project(r.x+x+dy/len*radius,r.y+y-dx/len*radius));
    }
    const points=[...edges[0],...edges[1].reverse()];ctx.beginPath();points.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](p.x,p.y));ctx.closePath();ctx.fill();continue;
   }
   let l=.5-radius,t=.5-radius,rr=.5+radius,bb=.5+radius;
   if(roads.has(`${r.x-1},${r.y}`))l=0;if(roads.has(`${r.x+1},${r.y}`))rr=1;
   if(roads.has(`${r.x},${r.y-1}`))t=0;if(roads.has(`${r.x},${r.y+1}`))bb=1;
   const rect=(x1,y1,x2,y2)=>{const points=[[x1,y1],[x2,y1],[x2,y2],[x1,y2]].map(([x,y])=>project(r.x+x,r.y+y));ctx.beginPath();points.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](p.x,p.y));ctx.closePath();ctx.fill();};
   // Bevel exposed ends and corners in world space; only real neighboring road
   // cells get full-width connectors. Shared boundaries remain identical.
   const q=radius*.48,points=[[-q,-radius],[q,-radius],[radius,-q],[radius,q],[q,radius],[-q,radius],[-radius,q],[-radius,-q]].map(([x,y])=>project(r.x+.5+x,r.y+.5+y));
   ctx.beginPath();points.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](p.x,p.y));ctx.closePath();ctx.fill();
   if(l===0)rect(0,.5-radius,.5,.5+radius);
   if(rr===1)rect(.5,.5-radius,1,.5+radius);
   if(t===0)rect(.5-radius,0,.5+radius,.5);
   if(bb===1)rect(.5-radius,.5,.5+radius,1);
  }
 }
 // Wheel tracks follow connected streets, never crossing buildings or lawns.
 // Their separation is in world coordinates, so it stays correct at every zoom.
 if(!paved)for(const r of c.roads.filter(r=>(r.level||1)===1))for(const [dx,dy]of [[1,0],[0,1]]){
  const links=[[1,0],[-1,0],[0,1],[0,-1]].filter(([x,y])=>roads.has(`${r.x+x},${r.y+y}`));
  if(links.length===2&&links[0][0]*links[1][0]+links[0][1]*links[1][1]===0)continue;
  if(!roads.has(`${r.x+dx},${r.y+dy}`))continue;
  for(const offset of [-.115,.115]){
   const a=project(r.x+.5+dy*offset,r.y+.5+dx*offset);
   const b=project(r.x+.5+dx+dy*offset,r.y+.5+dy+dx*offset);
   ctx.strokeStyle='#6f614b38';ctx.lineWidth=Math.max(.65,u*.025);
   ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
  }
 }
 for(const r of c.roads){
  if((r.level||1)>1){
   // Individual stone joints, inset in the centre so they never leak onto grass.
   for(let row=0;row<5;row++)for(let col=0;col<5;col++){
    const x=.34+col*.065+(row%2)*.02,y=.34+row*.065;
    const ps=[[x,y],[x+.052,y],[x+.052,y+.05],[x,y+.05]].map(([x,y])=>project(r.x+x,r.y+y));
    ctx.fillStyle=(row+col)%3?'#b6b0a277':'#5e5b5266';ctx.beginPath();ps.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](p.x,p.y));ctx.closePath();ctx.fill();
   }
  }
  for(let i=0;i<27;i++){
   const x=.15+((i*37+r.x*13)%71)/100,y=.15+((i*23+r.y*17)%71)/100;
   if(Math.abs(x-.5)>.22&&Math.abs(y-.5)>.22)continue;
   const p=project(r.x+x,r.y+y);ctx.fillStyle=i%3?'#e6d9ba55':'#756f5944';
   ctx.beginPath();ctx.ellipse(p.x,p.y,u*.012,u*.006,0,0,Math.PI*2);ctx.fill();
  }
 }
 ctx.restore();
}

const species=['cow','pig','sheep','chicken'];
export function animalPose(b,index,time,reduced){
 const t=reduced?0:time/7+index*.83+b.id*.11,phase=Math.floor(t),fraction=t-phase,smooth=fraction*fraction*(3-2*fraction);
 const point=n=>({x:.24+((b.id*29+index*37+n*17)%53)/100,y:.32+((b.id*13+index*23+n*31)%48)/100});
 const a=point(phase),z=point(phase+1);return {kind:species[index%4],x:b.x+a.x+(z.x-a.x)*smooth,y:b.y+a.y+(z.y-a.y)*smooth,flip:(z.x-a.x)-(z.y-a.y)<0,bob:reduced?0:Math.abs(Math.sin(time*5+index))*.35};
}
export function boatPose(v,duration){
 const progress=Math.min(1,Math.max(0,v.elapsed/duration)),distance=Math.sin(progress*Math.PI);
 return {x:v.x+.5+distance*3,y:-.8-distance*4,progress,returning:progress>=.5};
}

export function drawSelection(ctx,p,width,u,time,reduced){
 ctx.save();const pulse=reduced?1:.8+.2*Math.sin(time*4);
 ctx.globalAlpha=pulse;ctx.strokeStyle='#c5ffff';ctx.lineWidth=Math.max(1.3,u*.026);ctx.shadowColor='#3ae6fa';ctx.shadowBlur=reduced?0:12;
 ctx.beginPath();ctx.ellipse(p.x,p.y-u*.2,width*.53,u*.32,0,0,Math.PI*2);ctx.stroke();
 ctx.shadowBlur=0;ctx.fillStyle='#063e56';ctx.strokeStyle='#a9faff';
 ctx.beginPath();ctx.moveTo(p.x,p.y-u*1.9);ctx.lineTo(p.x-u*.07,p.y-u*2.02);ctx.lineTo(p.x+u*.07,p.y-u*2.02);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
}

export function lightCycle(seconds,reduced=false){const phase=((seconds%480)+480)%480/480;return reduced?{night:0,warm:0,label:'День'}:{night:Math.max(0,Math.sin((phase-.4)*Math.PI*2))*.2,warm:Math.max(0,Math.sin(phase*Math.PI*2))*.07,label:phase<.38?'День':phase<.55?'Вечір':phase<.86?'Ніч':'Світанок'};}
export function drawAtmosphere(ctx,view,project,u,c,time,reduced){
 const {night,warm}=lightCycle(c.seconds||0,reduced);ctx.save();
 if(night){ctx.fillStyle=`rgba(18,31,74,${night})`;ctx.fillRect(0,0,view.width,view.height);}
 if(warm){ctx.fillStyle=`rgba(255,181,88,${warm})`;ctx.fillRect(0,0,view.width,view.height);}
 // Soft light pools remain fixed to real world locations during pan and zoom.
 for(const b of c.buildings){if(b.ready>c.seconds)continue;const p=project(b.x+.7,b.y+.8);if(p.x<-u||p.x>view.width+u||p.y<-u||p.y>view.height+u)continue;
  if(night>.02||['energy','lighthouse','observatory'].includes(b.type)){const r=u*.65,g=ctx.createRadialGradient(p.x,p.y-u*.2,0,p.x,p.y-u*.2,r);g.addColorStop(0,`rgba(255,208,116,${.08+night})`);g.addColorStop(1,'rgba(255,208,116,0)');ctx.fillStyle=g;ctx.fillRect(p.x-r,p.y-u*.2-r,r*2,r*2);}
  if(b.type==='lighthouse'&&!reduced){const angle=time*.2,origin=project(b.x+.8,b.y+.8);ctx.fillStyle='#fff5ba24';ctx.beginPath();ctx.moveTo(origin.x,origin.y-u*1.8);ctx.lineTo(origin.x+Math.cos(angle-.1)*u*5,origin.y-u*1.8+Math.sin(angle-.1)*u*2);ctx.lineTo(origin.x+Math.cos(angle+.1)*u*5,origin.y-u*1.8+Math.sin(angle+.1)*u*2);ctx.closePath();ctx.fill();}
 }
 if(!reduced){
  // Drifting pollen/fireflies; bounded particle count, independent of population.
  for(let i=0;i<18;i++){const p=project(1+(i*3.71)%c.extent,1+(i*2.39)%c.extent);const x=p.x+Math.sin(time*.3+i)*u*.2,y=p.y-u*.4+Math.cos(time*.5+i)*u*.2;ctx.fillStyle=night>.08?`rgba(244,249,174,${.25+.3*Math.sin(time+i)**2})`:'#fffbd559';ctx.beginPath();ctx.arc(x,y,Math.max(.7,u*.016),0,Math.PI*2);ctx.fill();}
  if(Math.floor((c.seconds||0)/160)%3===2){ctx.strokeStyle='#dbf5fa38';ctx.lineWidth=.8;for(let i=0;i<42;i++){const x=(i*137+time*28)%view.width,y=(i*91+time*150)%view.height;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-3,y+10);ctx.stroke();}}
 }
 ctx.restore();
}

