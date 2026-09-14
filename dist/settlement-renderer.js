// Layered isometric scene. Buildings, residents and resources remain simulation objects.
import {unitFor,originFor,projectPoint,tileAt} from './settlement-camera.js?v=24';
import {createMeadow,fillMeadow} from './settlement-ground.js?v=24';
import {drawSea,drawRoadNetwork,animalPose,boatPose,drawSelection} from './settlement-life.js?v=24';
import {VOYAGES} from './settlement-model.js?v=24';
const atlas=new Image();atlas.src=new URL('./settlement-sprites-alpha.png',import.meta.url).href;
const detailAtlas=new Image();detailAtlas.src=new URL('./settlement-details-alpha.png',import.meta.url).href;
const meadowArt=new Image();meadowArt.src=new URL('./settlement-meadow-v18.png',import.meta.url).href;

const SPRITE_NAMES=['house','lab','farm','well','tree','rock','lumber','ranch','clinic','granary','mine','factory','energy','person','worker','truck'];
const DETAIL_NAMES=['river','bridge','water','river-bend','path-straight','path-curve','path-t','path-cross','flowers','reeds','grass','berries','fence','scaffold','cargo','lantern'];
const lifeAtlas=new Image();lifeAtlas.src=new URL('./settlement-life-v21.png',import.meta.url).href;
const LIFE_NAMES=['school','harbor','fishery','ship','cow','pig','sheep','chicken','pen','willow','wildflowers','orchard','woman','pupil','fisherman','gull'];
const sprites={},details={},life={};let preparedLife=false;
let grass,preparedMeadow=false,preparedSprites=false,preparedDetails=false;

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
 if(!preparedMeadow&&meadowArt.complete&&meadowArt.naturalWidth>=1024){grass=createMeadow(document,meadowArt);preparedMeadow=true;}
 if(!preparedSprites&&atlas.complete&&atlas.naturalWidth){sliceAtlas(atlas,SPRITE_NAMES,sprites);preparedSprites=true;}
 if(!preparedDetails&&detailAtlas.complete&&detailAtlas.naturalWidth){sliceAtlas(detailAtlas,DETAIL_NAMES,details);preparedDetails=true;}
 if(!preparedLife&&lifeAtlas.complete&&lifeAtlas.naturalWidth){sliceAtlas(lifeAtlas,LIFE_NAMES,life);preparedLife=true;}
}

function paintImage(ctx,image,x,y,width,{alpha=1,angle=0,flip=false}={}){
 if(!image)return;const height=width*image.height/image.width;
 ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(angle);if(flip)ctx.scale(-1,1);
 ctx.drawImage(image,-width/2,-height,width,height);ctx.restore();return height;
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
 // Feather the damp ground into the meadow in world space. Only water highlights animate.
 for(const side of [-1,1]){
  const edge=centerX+side*width*.43,outer=edge+side*unit*.38;
  const tone=ctx.createLinearGradient(Math.min(edge,outer),0,Math.max(edge,outer),0);
  tone.addColorStop(side<0?0:1,'#83945b00');tone.addColorStop(side<0?1:0,'#6878446b');
  ctx.fillStyle=tone;ctx.fillRect(Math.min(edge,outer),top,Math.abs(outer-edge),bottom-top);
 }
 for(let i=Math.floor((top-height)/overlap);i*overlap<bottom;i++)paintImage(ctx,details.river,centerX,i*overlap+height,width,{flip:Math.abs(i)%2!==0});
 if(details['river-bend'])paintImage(ctx,details['river-bend'],centerX-4,-unit*4.5,width*1.04,{alpha:.9});
 if(details.bridge)paintImage(ctx,details.bridge,centerX-4,unit*4*.56,width*1.28);
 // Sparse reeds break the straight bank silhouette; their positions never depend on time or pan.
 const spacing=unit*1.22;
 for(let i=Math.floor(top/spacing)-1;i*spacing<bottom+spacing;i++){
  const hash=((i*37)%97+97)%97,side=hash%2?-1:1,y=i*spacing;
  if(Math.abs(y-unit*4*.56)<unit*.65)continue;
  paintImage(ctx,details[hash%3===0?'reeds':'grass'],centerX+side*width*(.42+(hash%5)*.012),y,unit*(.26+(hash%4)*.025),{alpha:.87,flip:side<0});
 }
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

export function drawSettlement(ctx,canvas,c,{zoom,pan,selected,tool,time,reduced}){
 prepare();
 const W=canvas.clientWidth,H=canvas.clientHeight,u=unitFor(W)*zoom;
 const view={width:W,height:H},camera={zoom,pan};
 const project=(x,y)=>projectPoint(view,camera,x,y);
 ctx.clearRect(0,0,W,H);ctx.fillStyle='#aeca78';ctx.fillRect(0,0,W,H);
 if(grass)fillMeadow(ctx,grass,view,camera,originFor(view));
 drawSea(ctx,project,u,time,reduced,view);
 ctx.save();ctx.beginPath();[project(-40,0),project(60,0),project(60,60),project(-40,60)].forEach((p,i)=>ctx[i?'lineTo':'moveTo'](p.x,p.y));ctx.closePath();ctx.clip();
 drawRiver(ctx,W,H,pan,zoom,time,reduced);ctx.restore();

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
  // Fixed tiny gravel/earth marks make each plot a material surface, not a flat overlay.
  let seed=((x+1)*73856093^(y+1)*19349663)>>>0;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<34;i++){
   const p=project(x+.08+random()*.84,y+.08+random()*.84);
   ctx.fillStyle=i%3?'#e3d8ab8c':'#747d555c';
   ctx.beginPath();ctx.ellipse(p.x,p.y,(.45+random()*.7)*zoom,(.25+random()*.4)*zoom,0,0,Math.PI*2);ctx.fill();
  }
  // Contact shadow sits within the plot, directly under the sprite's floor.
  ctx.fillStyle='#38552b3b';ctx.beginPath();ctx.ellipse(center.x,center.y+u*.13,u*.72,u*.29,0,0,Math.PI*2);ctx.fill();
  ctx.restore();
 };
 for(const b of c.buildings)foundation(b.x,b.y);
 foundation(4,2);

 drawRoadNetwork(ctx,c,project,u);
 if(tool)for(let x=0;x<c.extent;x++)for(let y=0;y<c.extent;y++)diamond(x,y,'#ffffff04','#e8ffff2e');

 const objects=[],hits=[];
 const occupied=(x,y)=>c.buildings.some(b=>b.x===x&&b.y===y)||(x===4&&y===2)||c.roads.some(r=>r.x===x&&r.y===y);
 for(let x=0;x<c.extent;x++)for(let y=0;y<c.extent;y++){
  if(occupied(x,y))continue;
  const hash=(x*37+y*53)%97;
  if((x<2||y<2||x>7||y>8)&&hash%7===0)objects.push({x,y,kind:hash%3===0?'willow':hash%3===1?'orchard':'tree',width:78+hash%28,sway:true});
  else if((x*11+y*3)%19===0)objects.push({x,y,kind:'rock',width:64});
  else if(hash%13===0)objects.push({x:x+.12,y:y+.15,kind:'wildflowers',width:34+hash%18,sway:true});
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
 const kind={house:'house',lumber:'lumber',farm:'farm',well:'well',quarry:'rock',ranch:'ranch',clinic:'clinic',granary:'granary',mine:'mine',smelter:'factory',factory:'factory',energy:'energy',school:'school',university:'school',market:'house',harbor:'harbor',fishery:'fishery'};
 for(const b of c.buildings)objects.push({x:b.x,y:b.y,kind:kind[b.type],width:unitFor(W)*(b.type==='farm'?1.92:b.type==='well'?1.25:1.84),b});
 for(const a of c.agents){const job=c.buildings.find(b=>b.id===a.job);const kind=a.truck?'truck':job?.type==='fishery'?'fisherman':!a.job&&a.id%3===0&&c.buildings.some(b=>b.type==='school')?'pupil':a.id%3===1?'woman':'person';objects.push({x:a.x,y:a.y,kind,width:a.truck?62:kind==='pupil'?23:29,a});}
 for(const b of c.buildings.filter(b=>['harbor','fishery'].includes(b.type))){
  const v=(c.voyages||[]).find(v=>v.x===b.x&&v.y===b.y);
  const point=v?boatPose(v,VOYAGES[v.kind].duration):{x:b.x+.65,y:-.7};
  if(b.type==='harbor'||c.agents.some(a=>a.job===b.id&&a.state==='work'))objects.push({...point,kind:'ship',width:b.type==='harbor'?57:31,boat:true,returning:point.returning});
 }
 for(let i=0;i<4;i++){const t=reduced?i:time*.08+i*1.7;objects.push({x:3+i+Math.sin(t)*2,y:-1.4-i*.65+Math.cos(t)*.4,kind:'gull',width:20,bird:true});}


 const drawObject=obj=>{
  // Buildings use the front corner of their floor; people/plants use their foot point.
  const onPlot=!!(obj.b||obj.lab);
  const p=project(obj.x+(onPlot ? .98 : .5),obj.y+(onPlot ? .98 : .62));
  if(obj.detail){paintImage(ctx,details[obj.detail],p.x,p.y,obj.width*zoom,{alpha:.96});return;}
  const moving=obj.a?.path.length;
  const frame=moving&&!reduced?Math.floor(time*5+obj.a.id)%2:0;
  const image=life[obj.kind]||sprites[obj.kind==='person'&&frame?'worker':obj.kind];
  if(!image)return;
  const width=obj.width*zoom,height=width*image.height/image.width;
  if(p.x+width/2<0||p.x-width/2>W||p.y+u*.5<0||p.y-height>H)return;
  let bob=0,angle=0;
  if(!reduced){
   if(obj.sway)angle=Math.sin(time*.9+obj.x)*.012;
   if(obj.boat){bob=Math.sin(time*1.8+obj.x)*zoom;angle=Math.sin(time*.9)*.025;}
   if(obj.bird){bob=Math.sin(time*4+obj.x)*zoom*1.7;angle=Math.sin(time*4)*.045;}
   if(obj.a?.path.length)bob=Math.abs(Math.sin(time*10+obj.a.id))*.6*zoom;
   else if(obj.a?.state==='work')angle=Math.sin(time*3)*.024;
  }
  if(obj.b||obj.lab)hits.push({left:p.x-width/2,top:p.y-height,width,height,x:obj.x,y:obj.y,lab:obj.lab});
  if(!obj.b&&!obj.lab){ctx.save();ctx.fillStyle='#294c2838';ctx.beginPath();ctx.ellipse(p.x,p.y-zoom,width*.27,width*.065,0,0,Math.PI*2);ctx.fill();ctx.restore();}
  if(selected&&onPlot&&Math.round(obj.x)===selected.x&&Math.round(obj.y)===selected.y){
   diamond(obj.x,obj.y,'#50eff509','#83f9ff');
   if(onPlot)drawSelection(ctx,p,width,u,time,reduced);
  }
  ctx.save();ctx.translate(p.x,p.y-bob);ctx.rotate(angle);
  let alpha=1;
  if(obj.b?.ready>c.seconds)alpha=.48+.42*Math.max(0,1-(obj.b.ready-c.seconds)/8);
  ctx.globalAlpha=alpha;
  if(obj.boat&&obj.returning)ctx.scale(-1,1);
  if(obj.a){
   const dest=obj.a.path[0],direction=dest?(dest.x-obj.a.x)-(dest.y-obj.a.y):1;
   if(life[obj.kind]?direction<0:(direction<0)!==!!frame)ctx.scale(-1,1);
  }
  if(obj.b?.type==='ranch'){ctx.drawImage(image,-width*.29,-height*.78-u*.26,width*.65,height*.65);}else ctx.drawImage(image,-width/2,-height,width,height);ctx.restore();
  if(obj.b&&['ranch','farm'].includes(obj.b.type)){
   const b=obj.b;if(b.type==='ranch')paintImage(ctx,life.pen,p.x,p.y,u*1.8);
   const count=b.type==='ranch'?Math.min(8,2+b.level+(c.tech.includes('veterinary')?1:0)):Math.min(4,b.level+1);
   const animals=Array.from({length:count},(_,i)=>({...animalPose(b,i,time,reduced),index:i})).sort((a,b)=>a.x+a.y-b.x-b.y);
   for(const a of animals){const q=project(a.x,a.y),kind=b.type==='farm'?'chicken':a.kind;paintImage(ctx,life[kind],q.x,q.y-a.bob*zoom,u*(kind==='cow'?.35:kind==='chicken'?.16:.28),{flip:a.flip,alpha:b.ready>c.seconds?.5:1});}
  }
  if(obj.b&&obj.b.level>=2){
   const b=obj.b;
   paintImage(ctx,details.lantern,p.x-width*.34,p.y-u*.025,u*.22);
   if(b.level>=3){const extra=b.type==='farm'||b.type==='ranch'?'granary':b.type==='harbor'?'lumber':b.type==='school'?'school':'house';paintImage(ctx,life[extra]||sprites[extra],p.x+width*.29,p.y-u*.04,u*.61);}
   if(b.level>=4){paintImage(ctx,details.cargo,p.x-width*.32,p.y+u*.025,u*.38);ctx.save();ctx.strokeStyle='#8fdbd7';ctx.lineWidth=u*.028;ctx.beginPath();ctx.moveTo(p.x-width*.4,p.y-u*.03);ctx.lineTo(p.x+width*.36,p.y+u*.06);ctx.stroke();ctx.restore();}
   if(b.level>=5)paintImage(ctx,c.tech.includes('battery')?sprites.energy:details['fence'],p.x-width*.29,p.y-u*.04,u*.44);
   ctx.save();ctx.font=`800 ${Math.max(9,10*zoom)}px system-ui`;ctx.textAlign='center';ctx.fillStyle='#063e55';ctx.strokeStyle='#f5fff0';ctx.lineWidth=3;const label=['','I','II','III','IV','V'][b.level];ctx.strokeText(label,p.x,p.y-u*.06);ctx.fillText(label,p.x,p.y-u*.06);ctx.restore();
  }

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
