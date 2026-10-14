import {constructionState} from './world-design.js?v=36';

// Geometry uses the same camera and world footprint as the finished building.
// No substitute miniature building and no screen-space animation of structural parts.
export function drawConstruction(ctx,b,seconds,project,u,image,previousImage,width){
 const state=constructionState(b,seconds),{progress,upgrading}=state;
 const front=project(b.x+.98,b.y+.98);
 const point=(x,y,z=0)=>{const p=project(b.x+x,b.y+y);return {x:p.x,y:p.y-z*u};};
 const polygon=(points,color)=>{ctx.beginPath();points.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](p.x,p.y));ctx.closePath();ctx.fillStyle=color;ctx.fill();};
 const box=(x,y,z,w,d,h)=>{
  const p=(a,c,v)=>point(a,c,v);
  polygon([p(x,y+d,z),p(x+w,y+d,z),p(x+w,y+d,z+h),p(x,y+d,z+h)],'#756b56');
  polygon([p(x+w,y,z),p(x+w,y+d,z),p(x+w,y+d,z+h),p(x+w,y,z+h)],'#504d43');
  polygon([p(x,y,z+h),p(x+w,y,z+h),p(x+w,y+d,z+h),p(x,y+d,z+h)],'#b5aa8e');
 };
 const beam=(a,b,size=.038)=>{
  const p=point(...a),q=point(...b);ctx.lineCap='butt';ctx.strokeStyle='#4a3425';ctx.lineWidth=u*size;
  ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();
  ctx.strokeStyle='#96754e';ctx.lineWidth=u*size*.62;ctx.stroke();
  ctx.strokeStyle='#c7a16a';ctx.lineWidth=Math.max(.5,u*size*.15);ctx.stroke();
 };
 const paint=(sprite,portion=1)=>{
  if(!sprite)return;const h=width*sprite.height/sprite.width;
  ctx.save();ctx.beginPath();ctx.rect(front.x-width/2,front.y-h*portion,width,h*portion);ctx.clip();
  ctx.drawImage(sprite,front.x-width/2,front.y-h,width,h);ctx.restore();
 };
 ctx.save();
 if(upgrading)paint(previousImage||image);
 else{
  // Separate stone courses, with a real entrance gap facing the road/front.
  for(let row=0;row<2;row++)for(let i=0;i<6;i++){
   const t=.16+i*.112,offset=row*.015;
   box(t,.16+offset,row*.045,.106,.085,.044);
   box(.16+offset,t,row*.045,.085,.106,.044);
   if(i!==2&&i!==3)box(t,.76-offset,row*.045,.106,.085,.044);
   box(.76-offset,t,row*.045,.085,.106,.044);
  }
 }
 const height=Math.min(.86,Math.max(.55,image?width*image.height/image.width/u*.58:.7));
 const raised=upgrading?1:Math.max(0,Math.min(1,(progress-.2)/.35));
 if(raised>0){
  const posts=[[.12,.12],[.47,.12],[.87,.12],[.12,.5],[.87,.5],[.12,.89],[.5,.89],[.87,.89]];
  // Posts appear individually once installed, rather than stretching out of the soil.
  posts.slice(0,Math.ceil(raised*posts.length)).forEach(([x,y])=>beam([x,y,.04],[x,y,height],.055));
  if(raised>.45){beam([.12,.12,height],[.87,.12,height]);beam([.12,.12,height],[.12,.89,height]);}
 }
 if(progress>=.55)paint(image,Math.min(1,(progress-.55)/.4));
 if(raised>.6){
  // External scaffolding stays visible in front of assembled walls.
  for(const z of [height*.45,height]){
   beam([.12,.89,z],[.87,.89,z],.03);
   beam([.87,.12,z],[.87,.89,z],.03);
  }
  beam([.12,.89,.07],[.5,.89,height*.45],.02);
  beam([.87,.12,.07],[.87,.5,height*.45],.02);
  for(let i=0;i<4;i++)beam([.13,.85+i*.018,height*.45],[.87,.85+i*.018,height*.45],.018);
 }
 // Supplies remain within the plot, clear of neighboring streets.
 for(let i=0;i<3;i++)beam([.14,.94-i*.033,.025],[.42,.94-i*.033,.025],.032);
 const bar=point(.5,.5,height+.25),bw=u*.65;
 ctx.fillStyle='#242a22e0';ctx.fillRect(bar.x-bw/2,bar.y,bw,u*.055);
 ctx.fillStyle='#b2bd7a';ctx.fillRect(bar.x-bw/2+1,bar.y+1,(bw-2)*progress,Math.max(1,u*.055-2));
 ctx.restore();
 return {left:front.x-width/2,top:Math.min(front.y-width*(image?image.height/image.width:1),bar.y),width,height:front.y-Math.min(front.y-width*(image?image.height/image.width:1),bar.y),x:b.x,y:b.y};
}
