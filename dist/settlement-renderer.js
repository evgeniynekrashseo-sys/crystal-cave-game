// Layered isometric scene. Buildings, residents and resources remain simulation objects.
const art=new Image();art.src=new URL('./settlement-ground-v16.png',import.meta.url).href;
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
 if(!grass&&art.complete&&art.naturalWidth){
  const tile=document.createElement('canvas');tile.width=384;tile.height=192;
  const g=tile.getContext('2d');
  for(let x=0;x<2;x++)for(let y=0;y<2;y++){
   g.save();g.translate(x?384:0,y?192:0);g.scale(x?-1:1,y?-1:1);
   g.drawImage(art,40,25,210,105,0,0,192,96);g.restore();
  }
  grass=tile;
 }
 if(!preparedSprites&&atlas.complete&&atlas.naturalWidth){sliceAtlas(atlas,SPRITE_NAMES,sprites);preparedSprites=true;}
 if(!preparedDetails&&detailAtlas.complete&&detailAtlas.naturalWidth){sliceAtlas(detailAtlas,DETAIL_NAMES,details);preparedDetails=true;}
}

function unitFor(width){return Math.max(49,Math.min(58,width*.135));}

function paintImage(ctx,image,x,y,width,{alpha=1,angle=0,flip=false}={}){
 if(!image)return;
 const height=width*image.height/image.width;
 ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(angle);if(flip)ctx.scale(-1,1);
 ctx.drawImage(image,-width/2,-height,width,height);ctx.restore();
 return height;
}

function drawRiver(ctx,W,H,pan,zoom,time,reduced){
 if(!details.river)return;
 const width=Math.max(112,W*.29)*Math.max(.88,Math.min(1.12,zoom));
 const height=width*details.river.height/details.river.width;
 const centerX=W-42+pan.x*.16;
 const overlap=height*.76;
 const offset=((pan.y*.22)%overlap+overlap)%overlap-overlap;
 for(let y=offset;y<H+height;y+=overlap)paintImage(ctx,details.river,centerX,y+height,width,{flip:Math.floor(y/overlap)%2!==0});
 if(details['river-bend'])paintImage(ctx,details['river-bend'],centerX-4,H*.18+pan.y*.18,width*1.04,{alpha:.9});
 if(details.bridge)paintImage(ctx,details.bridge,centerX-4,H*.62+pan.y*.2,width*1.28);
 if(!reduced){
  ctx.save();ctx.strokeStyle='#e9ffffb0';ctx.lineWidth=1.2;ctx.lineCap='round';
  for(let i=0;i<7;i++){
   const y=(time*26+i*137+pan.y*.2)%(H+40)-20;
   ctx.beginPath();ctx.moveTo(centerX-24+(i%3)*9,y);ctx.lineTo(centerX-7+(i%2)*7,y-3);ctx.stroke();
  }
  ctx.restore();
 }
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
 const project=(x,y)=>({x:W/2+(x-y)*u+pan.x,y:H*.49+(x+y-10)*u*.56+pan.y});
 ctx.clearRect(0,0,W,H);ctx.fillStyle='#aeca78';ctx.fillRect(0,0,W,H);
 if(grass){
  ctx.save();ctx.translate(pan.x%384,pan.y%192);ctx.fillStyle=ctx.createPattern(grass,'repeat');
  ctx.globalAlpha=.88;ctx.fillRect(-384,-192,W+768,H+384);ctx.restore();
 }
 drawRiver(ctx,W,H,pan,zoom,time,reduced);

 const diamond=(x,y,color,stroke)=>{
  const pts=[project(x,y),project(x+1,y),project(x+1,y+1),project(x,y+1)];
  ctx.beginPath();pts.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](p.x,p.y));ctx.closePath();
  ctx.fillStyle=color;ctx.fill();
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.5;ctx.shadowColor=stroke;ctx.shadowBlur=8;ctx.stroke();ctx.shadowBlur=0;}
 };

 // Starter footpaths create a readable village composition; built roads use the same detailed art.
 const starterPaths=[{x:4,y:3,img:'path-straight'},{x:4,y:4,img:'path-t'},{x:4,y:5,img:'path-cross'},{x:4,y:6,img:'path-t'},{x:3,y:5,img:'path-curve'},{x:5,y:5,img:'path-curve'}];
 for(const path of starterPaths){
  const p=project(path.x+.5,path.y+.55);
  paintImage(ctx,details[path.img],p.x,p.y,u*1.82,{alpha:.78});
 }
 for(const road of c.roads){
  const p=project(road.x+.5,road.y+.55);
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
 if(!c.buildings.some(b=>b.x===4&&b.y===2))objects.push({x:4,y:2,kind:'lab',width:148,lab:true});
 const kind={house:'house',lumber:'lumber',farm:'farm',well:'well',quarry:'rock',ranch:'ranch',clinic:'clinic',granary:'granary',mine:'mine',smelter:'factory',factory:'factory',energy:'energy'};
 for(const b of c.buildings)objects.push({x:b.x,y:b.y,kind:kind[b.type],width:b.type==='farm'?118:b.type==='well'?78:114,b});
 for(const a of c.agents)objects.push({x:a.x,y:a.y,kind:a.truck?'truck':'person',width:a.truck?62:30,a});

 const drawObject=obj=>{
  const p=project(obj.x+.5,obj.y+.62);
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
  ctx.save();ctx.fillStyle='#294c282f';ctx.filter='blur(3px)';ctx.beginPath();ctx.ellipse(p.x+4*zoom,p.y-2*zoom,width*.34,width*.1,0,0,Math.PI*2);ctx.fill();ctx.restore();
  if(selected&&Math.round(obj.x)===selected.x&&Math.round(obj.y)===selected.y){
   ctx.save();ctx.strokeStyle='#55f5ff';ctx.lineWidth=3;ctx.shadowColor='#00eaff';ctx.shadowBlur=14;
   ctx.beginPath();ctx.ellipse(p.x,p.y-2*zoom,width*.45,width*.15,0,0,Math.PI*2);ctx.stroke();ctx.restore();
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
 const u=unitFor(canvas.clientWidth)*zoom;
 const a=(x-canvas.clientWidth/2-pan.x)/u;
 const b=(y-canvas.clientHeight*.49-pan.y)/(u*.56)+10;
 return{x:Math.floor((a+b)/2),y:Math.floor((b-a)/2)};
}
