import {constructionState} from './world-design.js?v=42';
import {footprintSize,bodyPoint} from './settlement-footprints.js?v=44';

// Discrete fixed-position assembly; completed masonry never slides or scales.
export function assemblySections(progress){
 const count=Math.floor(Math.max(0,Math.min(1,(progress-.35)/.6))*12);
 return Array.from({length:count},(_,i)=>({col:i%3,row:3-Math.floor(i/3)}));
}
export function constructionCrew(b,seconds,reduced=false){
 if(!(b.ready>seconds))return [];
 const [w,h]=footprintSize(b),time=reduced?2:seconds-(b.started||0);
 return [0,1].map(i=>{
  const phase=((time+i*4)%10+10)%10,walking=phase<3||phase>7;
  const travel=phase<3?phase/3:phase>7?(10-phase)/3:1;
  const start={x:b.x+.14+i*.25,y:b.y+h-.09},end={x:b.x+w*(i?.78:.38),y:b.y+h-.12};
  const x=start.x+(end.x-start.x)*travel,y=start.y+(end.y-start.y)*travel;
  return {x:x-.5,y:y-.62,working:!walking,carrying:phase<3,phase,pose:{opacity:1,key:'walk'+(reduced||!walking?0:Math.floor(time*5)%4),flip:phase>7,moving:walking}};
 });
}
export function drawConstruction(ctx,b,seconds,project,u,image,previousImage,width,reduced=false,placement=null){
 const {progress,upgrading}=constructionState(b,seconds),[w,h]=footprintSize(b);
 const ground=(x,y,z=0)=>{const p=project(b.x+x,b.y+y);return{x:p.x,y:p.y-z*u};};
 const point=(x,y,z=0)=>{const q=bodyPoint(b,x,y),p=project(q.x,q.y);return{x:p.x,y:p.y-z*u};};
 const poly=(pts,color)=>{ctx.beginPath();pts.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](p.x,p.y));ctx.closePath();ctx.fillStyle=color;ctx.fill();};
 const beam=(a,z,size=.035)=>{
  const p=point(...a),q=point(...z);ctx.lineCap='butt';
  for(const [color,m]of [['#4c3828',1],['#b18a59',.6]]){ctx.strokeStyle=color;ctx.lineWidth=Math.max(.7,u*size*m);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}
 };
 const front=point(.98,.98),height=image?width*image.height/image.width:width;
 const sprite=(img,bounds,clip=null)=>{
  if(!img)return;const p=placement?placement.anchor(bounds):bodyPoint(bounds),q=project(p.x,p.y),ratio=Math.min(...footprintSize(bounds))/Math.min(w,h),ww=placement?placement.width(bounds):width*ratio,hh=ww*img.height/img.width;
  ctx.save();if(clip){ctx.beginPath();for(const {col,row}of clip)ctx.rect(q.x-ww/2+col*ww/3,q.y-hh+row*hh/4,ww/3+.5,hh/4+.5);ctx.clip();}
  ctx.drawImage(img,q.x-ww/2,q.y-hh,ww,hh);ctx.restore();
 };
 ctx.save();
 poly([ground(.05,.05),ground(w-.05,.05),ground(w-.05,h-.05),ground(.05,h-.05)],'#84725366');
 const field=['farm','park'].includes(b.type);
 if(field){
  // Prepare actual new ground, with furrows along the same Y axis as mature crops.
  for(let x=.12;x<w-.08;x+=.067)if(x/w<progress){
   const p=ground(x,.10),q=ground(x,h-.10);ctx.strokeStyle='#51432f';ctx.lineWidth=Math.max(.6,u*.012);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();
  }
 }else{
  if(upgrading&&previousImage)sprite(previousImage,{...b,level:b.constructionFrom?.level||Math.max(1,b.level-1),footprint:b.constructionFrom?.footprint||footprintSize(b)});
  // Foundation courses appear block by block, followed by supporting timber.
  const blocks=Math.floor(Math.min(1,progress/.25)*24);
  for(let i=0;i<blocks;i++){
   const side=Math.floor(i/6),t=.14+(i%6)*.12;
   if(side===2&&(i%6===2||i%6===3))continue;
   const x=side===1?.14:side===3?.82:t,y=side===0?.14:side===2?.82:t;
   poly([point(x,y,.04),point(x+.1,y,.04),point(x+.1,y+.07,.04),point(x,y+.07,.04)],i%2?'#aaa18b':'#817a69');
   beam([x,y+.07,0],[x+.1,y+.07,0],.045);
  }
  const roof=Math.max(.35,Math.min(1.1,height/u-.95*Math.min(w,h)));
  if(progress>.2){
   const posts=[[.12,.12],[.47,.12],[.88,.12],[.12,.5],[.88,.5],[.12,.89],[.5,.89],[.88,.89]];
   posts.slice(0,Math.ceil(Math.min(1,(progress-.2)/.2)*posts.length)).forEach(([x,y])=>beam([x,y,.04],[x,y,roof],.055));
   if(progress>.32){beam([.12,.12,roof],[.88,.12,roof]);beam([.12,.12,roof],[.12,.89,roof]);}
  }
  const sections=assemblySections(progress);if(sections.length)sprite(image,b,sections);
  // Scaffold uprights, cross-bracing, platform planks and a ladder remain outside walls.
  if(progress>.16&&progress<.98){
   for(const x of [.08,.5,.94])beam([x,.96,0],[x,.96,roof+.12],.04);
   for(const z of [roof*.45,roof*.85]){
    beam([.08,.96,z],[.94,.96,z],.03);beam([.94,.08,z],[.94,.96,z],.03);
    for(let i=0;i<4;i++)beam([.08,.89+i*.022,z],[.94,.89+i*.022,z],.02);
   }
   beam([.08,.96,.04],[.5,.96,roof*.45],.025);beam([.5,.96,roof*.45],[.94,.96,.04],.025);
   beam([.96,.28,0],[.96,.5,roof*.85],.025);beam([.96,.39,0],[.96,.61,roof*.85],.025);
   for(let i=0;i<7;i++){const t=i/7;beam([.96,.28+.22*t,roof*.85*t],[.96,.39+.22*t,roof*.85*t],.018);}
  }
 }
 // Timber and stacked materials sit inside the site, not on nearby roads.
 for(let i=0;i<4;i++)beam([.13,.92-i*.035,.03],[.40,.92-i*.035,.03],.035);
 if(!reduced)for(const worker of constructionCrew(b,seconds)){
  if(!worker.working)continue;
  for(let i=0;i<5;i++){const f=(seconds*.7+i*.2)%1,p=project(worker.x+.5,worker.y+.62);
   ctx.fillStyle=`rgba(188,170,135,${(1-f)*.19})`;ctx.beginPath();ctx.ellipse(p.x+Math.sin(i*2.1+seconds)*u*.035,p.y-f*u*.18,u*(.018+f*.045),u*(.012+f*.025),0,0,Math.PI*2);ctx.fill();
  }
 }
 const bar=ground(w/2,h/2,field?.2:height/u+.15),bw=u*.8;
 ctx.fillStyle='#242a22e0';ctx.fillRect(bar.x-bw/2,bar.y,bw,u*.06);ctx.fillStyle='#b2bd7a';ctx.fillRect(bar.x-bw/2+1,bar.y+1,(bw-2)*progress,Math.max(1,u*.06-2));
 ctx.restore();return{left:front.x-width/2,top:Math.min(front.y-height,bar.y),width,height:front.y-Math.min(front.y-height,bar.y),x:b.x,y:b.y};
}
