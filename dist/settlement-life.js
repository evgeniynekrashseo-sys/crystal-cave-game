// World-space life and infrastructure. Animation never changes map or shore coordinates.
export function drawSea(ctx,project,u,time,reduced,view){
 const corners=[project(-40,-40),project(60,-40),project(60,0),project(-40,0)];
 const shallow=project(5,-1),deep=project(5,-14),water=ctx.createLinearGradient(shallow.x,shallow.y,deep.x,deep.y);
 water.addColorStop(0,'#43b5c7');water.addColorStop(.32,'#168cab');water.addColorStop(1,'#0c527a');
 ctx.save();ctx.beginPath();corners.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](p.x,p.y));ctx.closePath();ctx.fillStyle=water;ctx.fill();
 for(let x=-15;x<40;x++)for(let y=-15;y<0;y++){
  const p=project(x+.4,y+.5);if(p.x<-u||p.x>view.width+u||p.y<-u||p.y>view.height+u)continue;
  const phase=reduced?0:time*.7+x*.9+y*.5;
  ctx.strokeStyle=`rgba(206,250,255,${.12+.09*(1+Math.sin(phase))})`;ctx.lineWidth=Math.max(.7,u*.012);
  ctx.beginPath();ctx.moveTo(p.x-u*.19,p.y);ctx.quadraticCurveTo(p.x,p.y+Math.sin(phase)*u*.025,p.x+u*.2,p.y-u*.035);ctx.stroke();
 }
 const a=project(-40,0),b=project(60,0);ctx.lineCap='round';ctx.lineWidth=u*.25;ctx.strokeStyle='#dcc89b';ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
 ctx.lineWidth=u*.045;ctx.strokeStyle=reduced?'#dbffffa0':`rgba(230,255,255,${.5+.22*Math.sin(time*.6)})`;ctx.stroke();
 ctx.restore();
}

export function drawRoadNetwork(ctx,c,project,u){
 const roads=new Set(c.roads.map(r=>`${r.x},${r.y}`));ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
 // Every connection ends at the SAME projected midpoint as its neighbouring tile.
 for(const r of c.roads){
  const p=project(r.x+.5,r.y+.5),links=[[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy])=>roads.has(`${r.x+dx},${r.y+dy}`));
  const segments=links.length?links:[[0,0]];
  for(const [dx,dy]of segments){const q=project(r.x+.5+dx*.5,r.y+.5+dy*.5);
   for(const [width,color]of [[.38,'#66744b62'],[.32,c.tech.includes('motor')?'#afb8b4':'#d6c49b'],[.23,c.tech.includes('motor')?'#cdd1c5':'#e0d2ad']]){
    ctx.lineWidth=u*width;ctx.strokeStyle=color;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();
   }
   for(let n=0;n<4;n++){const f=n/4;ctx.fillStyle=n%2?'#f4ead18c':'#7a806342';ctx.beginPath();ctx.ellipse(p.x+(q.x-p.x)*f,p.y+(q.y-p.y)*f,u*.025,u*.014,0,0,Math.PI*2);ctx.fill();}
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
