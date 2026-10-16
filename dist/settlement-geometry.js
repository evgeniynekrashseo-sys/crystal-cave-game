// Authoritative world-space art contract. Camera ground axes are ±29.25°, not ±26.565°.
export const GROUND_SLOPE=.56;
export const ART_CONTRACT=Object.freeze({groundSlope:GROUND_SLOPE,groundAngleDegrees:Math.atan(GROUND_SLOPE)*180/Math.PI,doorHeight:.32,storeyHeight:.48,personHeight:.28,light:'upper-left',anchor:'foundation-front',scalePolicy:'world-units-not-upgrade-level'});
export function raisedPoint(project,u,x,y,z=0){const p=project(x,y);return {x:p.x,y:p.y-z*u};}
export function boxFaces(project,u,x,y,z,w,d,h){
 const p=(a,b,c)=>raisedPoint(project,u,a,b,c);
 return {right:[p(x+w,y,z),p(x+w,y+d,z),p(x+w,y+d,z+h),p(x+w,y,z+h)],front:[p(x,y+d,z),p(x+w,y+d,z),p(x+w,y+d,z+h),p(x,y+d,z+h)],top:[p(x,y,z+h),p(x+w,y,z+h),p(x+w,y+d,z+h),p(x,y+d,z+h)]};
}
export function fillFace(ctx,points,color){ctx.beginPath();points.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](p.x,p.y));ctx.closePath();ctx.fillStyle=color;ctx.fill();}
export function drawWorldBox(ctx,project,u,b,colors){const faces=boxFaces(project,u,...b);for(const [i,key]of ['right','front','top'].entries())fillFace(ctx,faces[key],colors[i]);}
export function drawEquipment(ctx,part,project,u,time,working,reduced){
 const x=part.x,y=part.y,level=part.b?.level||1;
 const p=(a,b,z=0)=>raisedPoint(project,u,x+a,y+b,z);
 const line=(a,b,color,width)=>{const q=p(...a),r=p(...b);ctx.strokeStyle=color;ctx.lineWidth=Math.max(.7,u*width);ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(r.x,r.y);ctx.stroke();};
 const box=(a,b,z,w,d,h,colors)=>drawWorldBox(ctx,project,u,[x+a,y+b,z,w,d,h],colors);
 ctx.save();ctx.lineCap='round';
 box(.18,.21,0,.59,.56,.015,['#716c60','#807968','#928976']);
 if(part.prop==='machine'){
  box(.24,.30,.035,.38,.31,.22,['#394942','#5b6a60','#889083']);
  box(.27,.33,.255,.29,.24,.025,['#2d3833','#4f5b54','#a3aaa0']);
  // Cooling slots, cover seams and fasteners follow the same facade planes.
  for(let i=0;i<6;i++)line([.28+i*.047,.612,.09],[.28+i*.047,.612,.20],'#293832',.009);
  for(const a of [.29,.51])for(const b of [.35,.53]){const q=p(a,b,.283);ctx.fillStyle='#d4d5bc';ctx.beginPath();ctx.arc(q.x,q.y,Math.max(.45,u*.007),0,Math.PI*2);ctx.fill();}
  line([.20,.31,.08],[.20,.31,.43],'#5d4634',.045);line([.20,.31,.43],[.60,.31,.43],'#a78259',.03);line([.60,.31,.43],[.60,.31,.27],'#a78259',.03);
  // Wheel lies in a real vertical world plane; its axle points into the housing.
  const angle=working&&!reduced?time*2:0,wheel=t=>p(.43+Math.cos(t)*.14,.64,.19+Math.sin(t)*.14);
  ctx.strokeStyle='#bec0ad';ctx.lineWidth=Math.max(1,u*.022);ctx.beginPath();for(let i=0;i<=32;i++){const q=wheel(i*Math.PI/16);ctx[i?'lineTo':'moveTo'](q.x,q.y);}ctx.stroke();
  const hub=p(.43,.64,.19);for(let i=0;i<6;i++){const q=wheel(angle+i*Math.PI/3);ctx.beginPath();ctx.moveTo(hub.x,hub.y);ctx.lineTo(q.x,q.y);ctx.stroke();}
  line([.43,.64,.19],[.43,.48,.19],'#424b45',.035);
  if(level>=3)box(.66,.31,.035,.1,.18,.28,['#455650','#718277','#a8b6a4']);
  if(working&&!reduced)for(let i=0;i<3;i++){const f=(time*.4+i/3)%1,q=p(.20+f*.08,.31,.45+f*.25);ctx.fillStyle=`rgba(218,224,207,${(1-f)*.18})`;ctx.beginPath();ctx.ellipse(q.x,q.y,u*(.02+f*.035),u*(.018+f*.025),0,0,Math.PI*2);ctx.fill();}
 }else if(part.prop==='cargo'){
  for(const [a,b,z]of [[.23,.3,.035],[.49,.3,.035],[.23,.55,.035],[.23,.3,.21]]){
   box(a,b,z,.21,.21,.17,['#70553a','#987650','#b99a6c']);
   line([a+.03,b+.215,z],[a+.03,b+.215,z+.17],'#57412c',.012);
   line([a+.18,b+.215,z],[a+.18,b+.215,z+.17],'#57412c',.012);
  }
 }else if(part.prop==='logs'){
  for(let i=0;i<6;i++){const z=.07+Math.floor(i/3)*.065,b=.30+(i%3)*.13;
   line([.22,b,z],[.73,b,z],'#67462c',.075);line([.24,b,z+.02],[.71,b,z+.02],'#977044',.018);
   const q=p(.73,b,z);ctx.fillStyle='#c1a173';ctx.beginPath();ctx.ellipse(q.x,q.y,u*.027,u*.035,-.5,0,Math.PI*2);ctx.fill();
  }
 }else{
  for(let i=0;i<7;i++){const q=p(.28+(i%3)*.16,.29+Math.floor(i/3)*.16,.07);ctx.fillStyle=i%2?'#597447':'#7d8951';ctx.beginPath();ctx.ellipse(q.x,q.y,u*.055,u*.065,0,0,Math.PI*2);ctx.fill();}
 }
 ctx.restore();
}
