// Layered isometric scene. Buildings, residents and resources remain simulation objects.
import {unitFor,originFor,projectPoint,tileAt} from './settlement-camera.js?v=17';
import {createMeadow,fillMeadow} from './settlement-ground.js?v=17';
const atlas=new Image();atlas.src=new URL('./settlement-sprites-alpha.png',import.meta.url).href;
const detailAtlas=new Image();detailAtlas.src=new URL('./settlement-details-alpha.png',import.meta.url).href;

const SPRITE_NAMES=['house','lab','farm','well','tree','rock','lumber','ranch','clinic','granary','mine','factory','energy','person','worker','truck'];
const DETAIL_NAMES=['river','bridge','water','river-bend','path-straight','path-curve','path-t','path-cross','flowers','reeds','grass','berries','fence','scaffold','cargo','lantern'];
const sprites={},details={};
let grass,preparedSprites=false,preparedDetails=false;

function sliceAtlas(image,names,target){
 for(let i=0;i<names.length;i++){
  const col=i%4,row=Math.floor(i/4);
  const x=Math.round(col*image.width/4),y=Math.round(row*image.height/4);
  const width=Math.round((col+1)*image.width/4)-x,height=Math.round((row+1)*image.height/4)-y;
  const cell=document.createElement('canvas');cell.width=width;cell.height=height;
  const cellCtx=cell.getContext('2d',{willReadFrequently:true});
  cellCtx.drawImage(image,x,y,width,height,0,0,width,height);
  const pixels=cellCtx.getImageData(0,0,width,height).data;
  let left=width,top=height,right=-1,bottom=-1;
  for(let p=0;p<pixels.length;p+=4){
   if(pixels[p+3]<18)continue;
   const px=p/4%width,py=Math.floor(p/4/width);
   left=Math.min(left,px);right=Math.max(right,px);top=Math.min(top,py);bottom=Math.max(bottom,py);
  }
  if(right<left||bottom<top)continue;
  const sprite=document.createElement('canvas');
  sprite.width=right-left+1;sprite.height=bottom-top+1;
  sprite.getContext('2d').drawImage(cell,left,top,sprite.width,sprite.height,0,0,sprite.width,sprite.height);
  target[names[i]]=sprite;
 }
}

function prepare(){
 if(!grass)grass=createMeadow(document);
 if(!preparedSprites&&atlas.complete&&atlas.naturalWidth){sliceAtlas(atlas,SPRITE_NAMES,sprites);preparedSprites=true;}
 if(!preparedDetails&&detailAtlas.complete&&detailAtlas.naturalWidth){sliceAtlas(detailAtlas,DETAIL_NAMES,details);preparedDetails=true;}
}

function paintImage(ctx,image,x,y,width,{alpha=1,angle=0,flip=false}={}){
 if(!image)return;
 const height=width*image.height/image.width;
 ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(angle);if(flip)ctx.scale(-1,1);
 ctx.drawImage(image,-width/2,-height,width,height);ctx.restore();
 return height;
}

function drawRiver(ctx,W,H,pan,zoom,time,reduced){
 if(!details.river)return;
 // A world-space stream, not a viewport decoration with a separate parallax speed.
 const unit=unitFor(W),origin=originFor({width:W,height:H});
 const width=unit*2.12;
 const height=width*details.river.height/details.river.width;
 const centerX=unit*3;
 const overlap=height*.76;
 const top=-(origin.y+pan.y)/zoom,bottom=(H-origin.y-pan.y)/zoom;
 ctx.save();ctx.translate(origin.x+pan.x,origin.y+pan.y);ctx.scale(zoom,zoom);
 for(let i=Math.floor((top-height)/overlap);i*overlap<bottom;i++)paintImage(ctx,details.river,centerX,i*overlap+height,width,{flip:Math.abs(i)%2!==0});
 if(details['river-bend'])paintImage(ctx,details['river-bend'],centerX-4,-unit*4.5,width*1.04,{alpha:.9});
 if(details.bridge)paintImage(ctx,details.bridge,centerX-4,unit*4*.56,width*1.28);
 if(!reduced){
  ctx.save();ctx.strokeStyle='#e9ffffb0';ctx.lineWidth=1.2;ctx.lineCap='round';
  for(let i=0;i<7;i++){
   const y=(time*26+i*137)%1400-700;
   ctx.beginPath();ctx.moveTo(centerX-24+(i%3)*9,y);ctx.lineTo(centerX-7+(i%2)*7,y-3);ctx.stroke();
  }
  ctx.restore();
 }
 ctx.restore();
}

function roadSprite(c,road){
 const has=(dx,dy)=>c.roads.some(r=>r.x===road.x+dx&&r.y===road.y+dy);
 const count=[[1,0],[-1,0],[0,1],[0,-1]].filter(([x,y])=>has(x,y)).length;
 if(count>=4)return details['path-cross'];
 if(count===3)return details['path-t'];
 if(count===2&&((has(1,0)&&has(-1,0))||(has(0,1)&&has(0,-1))))return details['path-straight'];
 if(count===2)return details['path-curve'];
 return details['path-straight'];
}

export function drawSettlement(ctx,canvas,c,{zoom,pan,selected,tool,time,reduced}){
 prepare();
 const W=canvas.clientWidth,H=canvas.clientHeight,u=unitFor(W)*zoom;
 const view={width:W,height:H},camera={zoom,pan};
 const project=(x,y)=>projectPoint(view,camera,x,y);
 ctx.clearRect(0,0,W,H);ctx.fillStyle='#aeca78';ctx.fillRect(0,0,W,H);
 if(grass)fillMeadow(ctx,grass,view,camera,originFor(view));
 drawRiver(ctx,W,H,pan,zoom,time,reduced);

 const diamond=(x,y,color,stroke)=>{
  const pts=[project(x,y),project(x+1,y),project(x+1,y+1),project(x,y+1)];
  ctx.beginPath();pts.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](p.x,p.y));ctx.closePath();
  ctx.fillStyle=color;ctx.fill();
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.5;ctx.shadowColor=stroke;ctx.shadowBlur=8;ctx.stroke();ctx.shadowBlur=0;}
 };

 const foundation=(x,y)=>{
  const points=[project(x+.035,y+.035),project(x+.965,y+.035),project(x+.965,y+.965),project(x+.035,y+.965)];
  const center=project(x+.5,y+.5);
  ctx.save();ctx.beginPath();points.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](p.x,p.y));ctx.closePath();
  const color=ctx.createLinearGradient(center.x,center.y-u*.5,center.x,center.y+u*.5);
  color.addColorStop(0,'#b1b580d9');color.addColorStop(1,'#c4b786e0');ctx.fillStyle=color;ctx.fill();
  ctx.strokeStyle='#7a825455';ctx.lineWidth=Math.max(.7,zoom);ctx.stroke();
  // Contact shadow sits within the plot, directly under the sprite's floor.
  ctx.fillStyle='#38552b3b';ctx.beginPath();ctx.ellipse(center.x,center.y+u*.13,u*.72,u*.29,0,0,Math.PI*2);ctx.fill();
  ctx.restore();
 };
 for(const b of c.buildings)foundation(b.x,b.y);
 foundation(4,2);

 // Starter footpaths create a readable village composition; built roads use the same detailed art.
 const starterPaths=[{x:4,y:3,img:'path-straight'},{x:4,y:4,img:'path-t'},{x:4,y:5,img:'path-cross'},{x:4,y:6,img:'path-t'},{x:3,y:5,img:'path-curve'},{x:5,y:5,img:'path-curve'}];
 for(const path of starterPaths){
  const p=project(path.x+.98,path.y+.98);
  paintImage(ctx,details[path.img],p.x,p.y,u*1.82,{alpha:.78});
 }
 for(const road of c.roads){
  const p=project(road.x+.98,road.y+.98);
  paintImage(ctx,roadSprite(c,road),p.x,p.y,u*1.9,{alpha:c.tech.includes('motor')?.93:.82});
 }
 if(tool)for(let x=0;x<c.extent;x++)for(let y=0;y<c.extent;y++)diamond(x,y,'#ffffff04','#e8ffff2e');

 const objects=[],hits=[];
 const occupied=(x,y)=>c.buildings.some(b=>b.x===x&&b.y===y)||(x===4&&y===2)||c.roads.some(r=>r.x===x&&r.y===y);
 for(let x=0;x<c.extent;x++)for(let y=0;y<c.extent;y++){
  if(occupied(x,y))continue;
  const hash=(x*37+y*53)%97;
  if((x<2||y<2||x>7||y>8)&&hash%11===0)objects.push({x,y,kind:'tree',width:96,sway:true});
  else if((x*11+y*3)%19===0)objects.push({x,y,kind:'rock',width:64});
  else if(hash%17===0)objects.push({x:x+.12,y:y+.15,detail:'flowers',width:42});
  else if(hash%23===0)objects.push({x:x+.2,y:y+.15,detail:'grass',width:38});
  else if(hash%31===0)objects.push({x:x+.1,y:y+.1,detail:'berries',width:46});
 }
 // Hand-placed accents around the starting settlement keep the first screen richly detailed.
 objects.push(
  {x:2.2,y:2.4,detail:'flowers',width:48},{x:6.2,y:2.1,detail:'grass',width:42},
  {x:2.3,y:7.5,detail:'flowers',width:44},{x:6.8,y:6.9,detail:'berries',width:48},
  {x:4.25,y:3.65,detail:'lantern',width:28},{x:4.25,y:5.7,detail:'cargo',width:38}
 );
 if(!occupied(6,9))objects.push({x:6.45,y:9.1,kind:'tree',width:104,sway:true});
 if(!occupied(9,7))objects.push({x:9.1,y:7.35,kind:'tree',width:96,sway:true});
 if(!occupied(7,8))objects.push({x:7.6,y:8.45,detail:'flowers',width:46});
 if(!occupied(8,8))objects.push({x:8.45,y:8.15,detail:'grass',width:42});
 if(!c.buildings.some(b=>b.x===4&&b.y===2))objects.push({x:4,y:2,kind:'lab',width:unitFor(W)*2.2,lab:true});
 const kind={house:'house',lumber:'lumber',farm:'farm',well:'well',quarry:'rock',ranch:'ranch',clinic:'clinic',granary:'granary',mine:'mine',smelter:'factory',factory:'factory',energy:'energy'};
 for(const b of c.buildings)objects.push({x:b.x,y:b.y,kind:kind[b.type],width:unitFor(W)*(b.type==='farm'?1.92:b.type==='well'?1.25:1.84),b});
 for(const a of c.agents)objects.push({x:a.x,y:a.y,kind:a.truck?'truck':'person',width:a.truck?62:30,a});

 const drawObject=obj=>{
  // Buildings use the front corner of their floor; people/plants use their foot point.
  const onPlot=!!(obj.b||obj.lab);
  const p=project(obj.x+(onPlot ? .98 : .5),obj.y+(onPlot ? .98 : .62));
  if(obj.detail){paintImage(ctx,details[obj.detail],p.x,p.y,obj.width*zoom,{alpha:.96});return;}
  const moving=obj.a?.path.length;
  const frame=moving&&!reduced?Math.floor(time*5+obj.a.id)%2:0;
  const image=sprites[obj.kind==='person'&&frame?'worker':obj.kind];
  if(!image)return;
  const width=obj.width*zoom,height=width*image.height/image.width;
  let bob=0,angle=0;
  if(!reduced){
   if(obj.sway)angle=Math.sin(time*.9+obj.x)*.012;
   if(obj.a?.path.length)bob=Math.abs(Math.sin(time*10+obj.a.id))*.6*zoom;
   else if(obj.a?.state==='work')angle=Math.sin(time*3)*.024;
  }
  if(obj.b||obj.lab)hits.push({left:p.x-width/2,top:p.y-height,width,height,x:obj.x,y:obj.y,lab:obj.lab});
  if(!obj.b&&!obj.lab){ctx.save();ctx.fillStyle='#294c2838';ctx.beginPath();ctx.ellipse(p.x,p.y-zoom,width*.27,width*.065,0,0,Math.PI*2);ctx.fill();ctx.restore();}
  if(selected&&Math.round(obj.x)===selected.x&&Math.round(obj.y)===selected.y){
   diamond(obj.x,obj.y,'#50eff509','#83f9ff');
  }
  ctx.save();ctx.translate(p.x,p.y-bob);ctx.rotate(angle);
  let alpha=1;
  if(obj.b?.ready>c.seconds)alpha=.48+.42*Math.max(0,1-(obj.b.ready-c.seconds)/8);
  ctx.globalAlpha=alpha;
  if(obj.a){
   const dest=obj.a.path[0],direction=dest?(dest.x-obj.a.x)-(dest.y-obj.a.y):1;
   if((direction<0)!==!!frame)ctx.scale(-1,1);
  }
  ctx.drawImage(image,-width/2,-height,width,height);ctx.restore();
  if(obj.b?.ready>c.seconds&&details.scaffold){
   paintImage(ctx,details.scaffold,p.x,p.y,width*.9,{alpha:.82});
   ctx.save();ctx.font=`700 ${10*zoom}px -apple-system,system-ui`;ctx.textAlign='center';
   ctx.fillStyle='#103b4a';ctx.strokeStyle='#f4ffef';ctx.lineWidth=3;
   const label=`${Math.max(1,Math.ceil(obj.b.ready-c.seconds))} с`;
   ctx.strokeText(label,p.x,p.y+13*zoom);ctx.fillText(label,p.x,p.y+13*zoom);ctx.restore();
  }
  if(obj.b&&['factory','smelter'].includes(obj.b.type)&&!reduced&&c.agents.some(a=>a.job===obj.b.id&&a.state==='work')){
   for(let i=0;i<4;i++){const f=(time*.2+i*.25)%1;ctx.fillStyle=`rgba(248,245,225,${(1-f)*.4})`;ctx.beginPath();ctx.arc(p.x+width*.2+f*12*zoom,p.y-height*.9-f*28*zoom,(3+f*7)*zoom,0,Math.PI*2);ctx.fill();}
  }
  if(obj.kind==='lab'&&!reduced){
   ctx.fillStyle='#d7ffffd0';
   for(let i=0;i<5;i++){const v=(time*.28+i*.19)%1;ctx.beginPath();ctx.arc(p.x+width*.08+Math.sin(time+i)*2,p.y-height*.25-v*height*.42,1.4*zoom,0,Math.PI*2);ctx.fill();}
  }
 };

 if(selected&&!objects.some(o=>o.b&&o.x===selected.x&&o.y===selected.y))diamond(selected.x,selected.y,'#50eff518','#83f9ff');
 objects.sort((a,b)=>a.x+a.y-b.x-b.y).forEach(drawObject);
 return hits;
}

export function mapTile(canvas,zoom,pan,x,y){
 return tileAt({width:canvas.clientWidth,height:canvas.clientHeight},{zoom,pan},{x,y});
}
