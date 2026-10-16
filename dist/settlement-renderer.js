import {compoundParts,drawCompoundProp,drawCompoundYard} from './settlement-compounds.js?v=46';
import {footprintCells,footprintSize,plannedSize,buildingAt,bodyPoint,covers} from './settlement-footprints.js?v=44';
import {drawCropPlot} from './settlement-crop-renderer.js?v=45';
import {cropVisual} from './settlement-crops.js?v=43';
import {COHERENT_KEYS,coherentKey} from './settlement-art-direction.js?v=42';
import {actorPose} from './settlement-motion.js?v=46';
import {drawConstruction,constructionCrew} from './settlement-construction.js?v=45';
import {drawNaturalRiver} from './settlement-river.js?v=34';
import {architecturalStage,buildingFamily,regionAt,landscapeSeed,elevation,forestCover,sceneDepth} from './world-design.js?v=42';
import {ARTIFACTS,artifactError} from './city-story.js?v=27';
// Layered isometric scene. Buildings, residents and resources remain simulation objects.
import {unitFor,originFor,projectPoint,tileAt} from './settlement-camera.js?v=42';
import {createMeadow,fillMeadow} from './settlement-ground.js?v=36';
import {drawSea,drawRoadNetwork,animalPose,boatPose,drawSelection,drawAtmosphere} from './settlement-life.js?v=46';
import {VOYAGES,placementError,terrain,isRiverTile,RIVER_BRIDGE,timberAvailable} from './settlement-model.js?v=45';
const atlas=new Image();atlas.src=new URL('./settlement-sprites-alpha.png',import.meta.url).href;
const detailAtlas=new Image();detailAtlas.src=new URL('./settlement-details-alpha.png',import.meta.url).href;
const meadowArt=new Image();meadowArt.src=new URL('./terrain-meadow-v36.webp',import.meta.url).href;

const SPRITE_NAMES=['house','lab','farm','well','tree','rock','lumber','ranch','clinic','granary','mine','factory','energy','person','worker','truck'];
const DETAIL_NAMES=['river','bridge','water','river-bend','path-straight','path-curve','path-t','path-cross','flowers','reeds','grass','berries','fence','scaffold','cargo','lantern'];
const lifeAtlas=new Image();lifeAtlas.src=new URL('./settlement-life-v21.png',import.meta.url).href;
const LIFE_NAMES=['school','harbor','fishery','ship','cow','pig','sheep','chicken','pen','willow','wildflowers','orchard','woman','pupil','fisherman','gull'];
const chronicleAtlas=new Image();chronicleAtlas.src=new URL('./settlement-chronicles-v25.png',import.meta.url).href;
const CHRONICLE_NAMES=['scientist','engineer','botanist','captain','observatory','greenhouse','lighthouse','market','compass','seed','prism','map','heart','beacon','park','streetlamp'];
const coastalAtlas=new Image();coastalAtlas.src=new URL('./coastal-settlement-v27.png',import.meta.url).href;
const infrastructureAtlas=new Image();infrastructureAtlas.src=new URL('./coastal-infrastructure-v27.png',import.meta.url).href;
const COAST_NAMES=['house','longhouse','lumber','farm','quarry','school','market','workshop','spruce','spruce-group','granite','shrubs','cliff','pier','scaffold','fishery'];
const INFRA_NAMES=['lab','well','granary','clinic','smelter','energy','ranch','university','harbor','lighthouse','observatory','greenhouse','park','mine','produce','building-site'];
const coastal={},infrastructure={};let preparedCoastal=false,preparedInfrastructure=false;
const sprites={},details={},life={},chronicle={};let preparedChronicle=false;let preparedLife=false;
let grass,preparedMeadow=false,preparedSprites=false,preparedDetails=false;
const shadowMasks=new WeakMap();
const worldBuildings=new Image();worldBuildings.src=new URL('./world-buildings-v34.webp',import.meta.url).href;
const worldNature=new Image();worldNature.src=new URL('./world-nature-v34.webp',import.meta.url).href;
const worldPeople=new Image();worldPeople.src=new URL('./world-people-v34.webp',import.meta.url).href;
const architecture={},nature={},people={};let preparedWorld=false,preparedNature=false,preparedPeople=false;
const functionAtlas=new Image();functionAtlas.src=new URL('./city-functions-v38.webp',import.meta.url).href;
const functionsArt={};let preparedFunctions=false;
const motionAtlas=new Image();motionAtlas.src=new URL('./city-motion-v40.webp',import.meta.url).href;
const motionArt={};let preparedMotion=false;
const coherentAtlas=new Image();coherentAtlas.src=new URL('./city-architecture-v42.webp',import.meta.url).href;
const coherentArt={};let preparedCoherent=false;
const fieldAtlas=new Image();fieldAtlas.src=new URL('./city-fields-v42.webp',import.meta.url).href;
const fieldArt={};let preparedFields=false;
function objectArt(obj,time=0,reduced=true){
 if(obj.b?.type==='farm'&&fieldArt['field'+architecturalStage(obj.b.level)])return fieldArt['field'+architecturalStage(obj.b.level)];
 if(obj.lab&&coherentArt.lab1)return coherentArt.lab1;
 const coherent=coherentKey(obj.b);if(coherent&&coherentArt[coherent])return coherentArt[coherent];
 if(obj.pose&&(!['woman','pupil','scientist','engineer','botanist','captain'].includes(obj.kind)||obj.pose.chopping)&&motionArt[obj.pose.key])return motionArt[obj.pose.key];
 if(obj.animal&&motionArt[obj.kind+obj.animal.frame])return motionArt[obj.kind+obj.animal.frame];
 if(obj.lab&&functionsArt.lab)return functionsArt.lab;
 if(obj.b){const type=obj.b.type,stage=architecturalStage(obj.b.level),key=['farm','park','ranch'].includes(type)?type+stage:type;if(functionsArt[key])return functionsArt[key];}
 const family=buildingFamily(obj.b?.type);
 if(family&&architecture[family+'1'])return architecture[family+architecturalStage(obj.b.level)];
 if(obj.lab&&architecture.civic3)return architecture.civic3;
 if(obj.a&&!obj.a.truck){
  const role=['woman','pupil'].includes(obj.kind)?'woman':['scientist','engineer','botanist','captain'].includes(obj.kind)?'scholar':obj.a.job?'worker':'farmer';
  return people[role+(reduced||!obj.a.path.length?0:Math.floor((obj.a.distance||0)*5)%4)]||sprites.person;
 }
 return nature[obj.kind]||coastal[obj.kind]||infrastructure[obj.kind]||chronicle[obj.kind]||life[obj.kind]||sprites[obj.kind];
}
function castShadow(ctx,image,p,width){
 if(!image)return;
 let mask=shadowMasks.get(image);
 if(!mask){mask=document.createElement('canvas');mask.width=image.width;mask.height=image.height;const g=mask.getContext('2d');g.drawImage(image,0,0);g.globalCompositeOperation='source-in';g.fillStyle='#202a23';g.fillRect(0,0,mask.width,mask.height);shadowMasks.set(image,mask);}
 const height=width*image.height/image.width;
 ctx.save();ctx.globalAlpha=.23;ctx.transform(1,0,-.64,-.32,p.x,p.y);ctx.drawImage(mask,-width/2,-height,width,height);ctx.restore();
}

function sliceAtlas(image,names,target,rows=null){
 for(let i=0;i<names.length;i++){
  const col=i%4,row=Math.floor(i/4);
  const x=Math.round(col*image.width/4),y=Math.round((rows?rows[row][0]:row/4)*image.height);
  const width=Math.round((col+1)*image.width/4)-x,height=Math.round((rows?rows[row][1]:(row+1)/4)*image.height)-y;
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
 if(!preparedFields&&fieldAtlas.complete&&fieldAtlas.naturalWidth){
  const raw={};sliceAtlas(fieldAtlas,['field1','field2','field3','field4'],raw,[[0,1]]);
  for(const [key,img]of Object.entries(raw)){const cell=document.createElement('canvas');cell.width=img.width;cell.height=Math.round(img.width*.64);cell.getContext('2d').drawImage(img,0,0,cell.width,cell.height);fieldArt[key]=cell;}
  preparedFields=true;
 }
 if(!preparedCoherent&&coherentAtlas.complete&&coherentAtlas.naturalWidth){sliceAtlas(coherentAtlas,COHERENT_KEYS,coherentArt,[[0,.25],[.25,.48],[.48,.735],[.735,1]]);preparedCoherent=true;}
 if(!preparedMotion&&motionAtlas.complete&&motionAtlas.naturalWidth){
  const cropped={};sliceAtlas(motionAtlas,['walk','back','chop','truck','horse','sheep'].flatMap(k=>[0,1,2,3].map(n=>k+n)),cropped,[[0,.17],[.17,.337],[.337,.535],[.535,.68],[.68,.845],[.845,1]]);
  for(const group of ['walk','back','chop','truck','horse','sheep']){
   const frames=[0,1,2,3].map(i=>cropped[group+i]);if(frames.some(f=>!f))continue;
   const w=Math.max(...frames.map(f=>f.width)),h=Math.max(...frames.map(f=>f.height));
   frames.forEach((f,i)=>{const cell=document.createElement('canvas');cell.width=w;cell.height=h;cell.getContext('2d').drawImage(f,(w-f.width)/2,h-f.height);motionArt[group+i]=cell;});
  }preparedMotion=true;
 }
 if(!preparedFunctions&&functionAtlas.complete&&functionAtlas.naturalWidth){sliceAtlas(functionAtlas,['farm1','farm2','farm3','farm4','lumber','factory','lab','lab2','park1','park2','park3','park4','ranch1','ranch2','ranch3','ranch4'],functionsArt,[[0,.225],[.225,.495],[.495,.74],[.74,1]]);preparedFunctions=true;}
 if(!preparedWorld&&worldBuildings.complete&&worldBuildings.naturalWidth){sliceAtlas(worldBuildings,['home','craft','civic','barn'].flatMap(k=>[1,2,3,4].map(n=>k+n)),architecture);preparedWorld=true;}
 if(!preparedNature&&worldNature.complete&&worldNature.naturalWidth){sliceAtlas(worldNature,['spruce','oak','birch','shrubs','granite','bank','cliff','stump','grass','flowers','reeds','berries','deer','cow','sheep','horse'],nature,[[0,.31],[.31,.525],[.525,.73],[.73,1]]);preparedNature=true;}
 if(!preparedPeople&&worldPeople.complete&&worldPeople.naturalWidth){sliceAtlas(worldPeople,['worker','woman','scholar','farmer'].flatMap(k=>[0,1,2,3].map(n=>k+n)),people);preparedPeople=true;}
 if(!grass)grass=createMeadow(document);
 if(!preparedMeadow&&meadowArt.complete&&meadowArt.naturalWidth>=1024){grass=createMeadow(document,meadowArt,{natural:true});preparedMeadow=true;}
 if(!preparedSprites&&atlas.complete&&atlas.naturalWidth){sliceAtlas(atlas,SPRITE_NAMES,sprites);preparedSprites=true;}
 if(!preparedDetails&&detailAtlas.complete&&detailAtlas.naturalWidth){sliceAtlas(detailAtlas,DETAIL_NAMES,details);preparedDetails=true;}
 if(!preparedLife&&lifeAtlas.complete&&lifeAtlas.naturalWidth){sliceAtlas(lifeAtlas,LIFE_NAMES,life);preparedLife=true;}
 if(!preparedChronicle&&chronicleAtlas.complete&&chronicleAtlas.naturalWidth){sliceAtlas(chronicleAtlas,CHRONICLE_NAMES,chronicle,[[0,.3],[.292,.541],[.54,.76],[.757,1]]);preparedChronicle=true;}
 if(!preparedCoastal&&coastalAtlas.complete&&coastalAtlas.naturalWidth){sliceAtlas(coastalAtlas,COAST_NAMES,coastal);preparedCoastal=true;}
 if(!preparedInfrastructure&&infrastructureAtlas.complete&&infrastructureAtlas.naturalWidth){sliceAtlas(infrastructureAtlas,INFRA_NAMES,infrastructure);preparedInfrastructure=true;}
}

function paintImage(ctx,image,x,y,width,{alpha=1,angle=0,flip=false}={}){
 if(!image)return;const height=width*image.height/image.width;
 ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(angle);if(flip)ctx.scale(-1,1);
 ctx.drawImage(image,-width/2,-height,width,height);ctx.restore();return height;
}

function drawRiver(ctx,W,H,pan,zoom,time,reduced){
 const view={width:W,height:H},camera={zoom,pan};
 drawNaturalRiver(ctx,(x,y)=>projectPoint(view,camera,x,y),unitFor(W)*zoom,time,reduced,details.water);
}
export function drawSettlement(ctx,canvas,c,{zoom,pan,selected,tool,movingId,time,reduced,previousAgents,alpha=1}){
 prepare();
 const W=canvas.clientWidth,H=canvas.clientHeight,u=unitFor(W)*zoom;
 const view={width:W,height:H},camera={zoom,pan};
 const project=(x,y)=>projectPoint(view,camera,x,y);
 ctx.clearRect(0,0,W,H);ctx.fillStyle='#69734a';ctx.fillRect(0,0,W,H);
 if(grass)fillMeadow(ctx,grass,view,camera,originFor(view),{natural:preparedMeadow});
 drawSea(ctx,project,u,time,reduced,view);
 ctx.save();ctx.beginPath();[project(-40,0),project(60,0),project(60,60),project(-40,60)].forEach((p,i)=>ctx[i?'lineTo':'moveTo'](p.x,p.y));ctx.closePath();ctx.clip();
 drawRiver(ctx,W,H,pan,zoom,time,reduced);ctx.restore();

 // Layered terrain color variation is tied to world cells, not screen pixels.
 // Keep it underneath buildings and roads and clear of the sea/river.
 const blocked=new Set([...c.buildings.flatMap(b=>footprintCells(b)),...c.roads].map(o=>o.x+','+o.y));
 ctx.save();
 // The new highland uses the same elevation field as buildings, roads and picking.
 // Shaded mesh faces give actual relief rather than a hill sticker over flat ground.
 for(let x=20;x<c.extent;x+=.5)for(let y=14;y<c.extent;y+=.5){
  const p=project(x,y),h=elevation(x,y);if(!h||p.x<-u*2||p.x>W+u*2||p.y<-u*2||p.y>H+u*2)continue;
  const slope=(elevation(x+.5,y)-h)-(elevation(x,y+.5)-h);
  const fade=Math.min(1,h*2);
  ctx.fillStyle=slope>0?`rgba(223,208,155,${Math.min(.22,slope*2+.035)*fade})`:`rgba(37,52,33,${Math.min(.20,-slope*2+.025)*fade})`;
  ctx.beginPath();[[x,y],[x+.5,y],[x+.5,y+.5],[x,y+.5]].map(([a,b])=>project(a,b)).forEach((q,i)=>ctx[i?'lineTo':'moveTo'](q.x,q.y));ctx.closePath();ctx.fill();
 }
 for(let x=0;x<c.extent;x++)for(let y=0;y<c.extent;y++){
  if(blocked.has(x+','+y)||isRiverTile(x,y))continue;
  const hash=((Math.imul(x+31,73856093)^Math.imul(y+47,19349663))>>>0);
  const wooded=forestCover(x,y);
  if(!wooded&&hash%5>1)continue;
  const p=project(x+.5,y+.5);
  if(p.x<-u*2||p.x>W+u*2||p.y<-u*2||p.y>H+u*2)continue;
  const radius=u*(wooded?.93:.26+(hash%7)*.055);
  const tint=wooded?'rgba(61,49,33,0.48)':hash%3===0?'rgba(69,83,42,0.15)':hash%3===1?'rgba(187,159,92,0.11)':'rgba(91,112,67,0.11)';
  ctx.save();ctx.translate(p.x,p.y);ctx.scale(1,.56);
  const gradient=ctx.createRadialGradient(0,0,0,0,0,radius);
  gradient.addColorStop(0,tint);gradient.addColorStop(1,'rgba(80,95,55,0)');
  ctx.fillStyle=gradient;ctx.beginPath();ctx.ellipse(0,0,radius,radius,0,0,Math.PI*2);ctx.fill();ctx.restore();
 }
 ctx.restore();

 const diamond=(x,y,color,stroke)=>{
  const pts=[project(x,y),project(x+1,y),project(x+1,y+1),project(x,y+1)];
  ctx.beginPath();pts.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](p.x,p.y));ctx.closePath();
  ctx.fillStyle=color;ctx.fill();
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.5;ctx.shadowColor=stroke;ctx.shadowBlur=8;ctx.stroke();ctx.shadowBlur=0;}
 };

 const foundation=(x,y,type)=>{
  const points=[project(x+.035,y+.035),project(x+.965,y+.035),project(x+.965,y+.965),project(x+.035,y+.965)];
  const center=project(x+.5,y+.5);
  ctx.save();ctx.beginPath();points.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](p.x,p.y));ctx.closePath();
  // Worn earth blends into the meadow; no rectangular plot carpet.
  ctx.save();ctx.translate(center.x,center.y);ctx.scale(1,.56);
  const color=ctx.createRadialGradient(0,0,u*.1,0,0,u*.76);
  color.addColorStop(0,type==='farm'?'#776348ef':'#968265d9');color.addColorStop(.45,type==='farm'?'#88704da0':'#98846899');color.addColorStop(1,'#98846800');
  ctx.fillStyle=color;ctx.fillRect(-u,-u,u*2,u*2);ctx.restore();
  // Fixed tiny gravel/earth marks make each plot a material surface, not a flat overlay.
  let seed=((x+1)*73856093^(y+1)*19349663)>>>0;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<34;i++){
   const p=project(x+.08+random()*.84,y+.08+random()*.84);
   ctx.fillStyle=i%3?'#d1c3a151':'#5a554940';
   ctx.beginPath();ctx.ellipse(p.x,p.y,(.45+random()*.7)*zoom,(.25+random()*.4)*zoom,0,0,Math.PI*2);ctx.fill();
  }
  // Soft, directional contact shadow follows the same sun direction for every
  // building, while remaining inside its plot (no floating foundations).
  const shadow=ctx.createRadialGradient(center.x+u*.10,center.y+u*.12,u*.05,center.x+u*.10,center.y+u*.12,u*.70);
  shadow.addColorStop(0,'rgba(25,39,24,.34)');
  shadow.addColorStop(.55,'rgba(32,49,27,.18)');
  shadow.addColorStop(1,'rgba(32,49,27,0)');
  ctx.fillStyle=shadow;ctx.beginPath();ctx.ellipse(center.x+u*.10,center.y+u*.12,u*.70,u*.31,0,0,Math.PI*2);ctx.fill();
  ctx.restore();
 };
 const compoundFence=b=>{
  const [w,h]=footprintSize(b);if(w*h===1)return;
  ctx.save();ctx.lineCap='round';
  const rail=(a,z)=>{
   const length=Math.hypot(z[0]-a[0],z[1]-a[1]),steps=Math.ceil(length*3);
   const p=project(b.x+a[0],b.y+a[1]),q=project(b.x+z[0],b.y+z[1]);
   for(const height of [.04,.09]){ctx.strokeStyle='#8c7453';ctx.lineWidth=Math.max(1,u*.016);ctx.beginPath();ctx.moveTo(p.x,p.y-u*height);ctx.lineTo(q.x,q.y-u*height);ctx.stroke();}
   for(let i=0;i<=steps;i++){const t=i/steps,r=project(b.x+a[0]+(z[0]-a[0])*t,b.y+a[1]+(z[1]-a[1])*t);ctx.strokeStyle='#67513a';ctx.lineWidth=Math.max(1.2,u*.025);ctx.beginPath();ctx.moveTo(r.x,r.y);ctx.lineTo(r.x,r.y-u*.12);ctx.stroke();}
  };
  rail([.06,.06],[w-.06,.06]);rail([.06,.06],[.06,h-.06]);rail([w-.06,.06],[w-.06,h-.06]);
  rail([.06,h-.06],[w*.38,h-.06]);rail([w*.65,h-.06],[w-.06,h-.06]);ctx.restore();
 };
 for(const b of c.buildings)for(const p of footprintCells(b))foundation(p.x,p.y,b.type);
 for(const b of c.buildings)drawCompoundYard(ctx,b,project,u);
 foundation(4,2);
 for(const b of c.buildings)if(compoundParts(b,c.seconds)||b.type==='farm')compoundFence(b);

 drawRoadNetwork(ctx,c,project,u);
 if(tool)for(let x=0;x<c.extent;x++)for(let y=0;y<c.extent;y++)diamond(x,y,'#ffffff04','#e8ffff2e');

 for(const p of c.loggingPlots||[])diamond(p.x,p.y,'#d5ae4620','#d5ae46');
 const objects=[],hits=[];
 const occupied=(x,y)=>buildingAt(c,x,y)||(x===4&&y===2)||c.roads.some(r=>r.x===x&&r.y===y);
 for(let x=0;x<c.extent;x++)for(let y=0;y<c.extent;y++){
  if(occupied(x,y)||isRiverTile(x,y))continue;
  const hash=(x*37+y*53)%97;
  const region=regionAt(x,y);
  if(timberAvailable(c,x,y))objects.push({x:x+(landscapeSeed(x+19,y)-.5)*.45,y:y+(landscapeSeed(x,y+41)-.5)*.4,kind:hash%5===0?'oak':hash%5===1?'birch':'spruce',width:unitFor(W)*(hash%5<2?1.1:.77)*(.85+landscapeSeed(x+3,y+9)*.3),sway:true});
  else if(c.felled?.[`${x},${y}`]>c.seconds)objects.push({x,y,kind:'stump',width:unitFor(W)*.26});
  else if((x*11+y*3)%19===0||region==='highlands'&&landscapeSeed(x+71,y)<.18)objects.push({x,y,kind:region==='highlands'&&hash%3===0?'cliff':'granite',width:unitFor(W)*1.1});
  else if(hash%13===0)objects.push({x:x+.12,y:y+.15,detail:'flowers',width:unitFor(W)*(.36+hash%4*.045),sway:true});
  else if(hash%23===0)objects.push({x:x+.2,y:y+.15,detail:'grass',width:unitFor(W)*.42});
  else if(hash%31===0)objects.push({x:x+.1,y:y+.1,detail:'berries',width:unitFor(W)*.46});
  // Forests contain multiple ages and undergrowth instead of isolated specimen trees.
  // Clearing the occupied plot removes the whole grove consistently.
  if(timberAvailable(c,x,y)){
   if(landscapeSeed(x+83,y+17)<.55)objects.push({x:x-.23,y:y+.25,kind:'spruce',width:unitFor(W)*(.36+landscapeSeed(x+52,y)*.2),sway:true});
   if(landscapeSeed(x+91,y+27)<.65)objects.push({x:x+.28,y:y+.22,kind:'shrubs',width:unitFor(W)*.36,sway:true});
  }
  // World-anchored low vegetation: varied ground cover with stable positions.
  // Keep the central settlement readable and avoid paved or flooded cells.
  if(hash%7===0)objects.push({x:x+.12+(hash%3)*.13,y:y+.19,detail:'grass',width:unitFor(W)*(.22+(hash%4)*.035)});
  if(hash%17===0)objects.push({x:x+.35,y:y+.36,detail:'flowers',width:unitFor(W)*.27});
 }
 // Cliff pieces sit on the actual ocean edge. Do not cover developed shore plots.
 // Overlapping, varied rock clusters form a continuous coastal edge.
 for(let x=-2;x<c.extent+3;x+=.52){
  const y=-.10-.12*(1+Math.sin(x*.73))-.055*(1+Math.sin(x*2.31));
  objects.push({x:x-.5,y:y-.62,kind:Math.floor(x*3)%4===0?'cliff':'bank',width:unitFor(W)*(.85+.18*Math.sin(x*4.7)),shore:true});
 }
 // Hand-placed accents around the starting settlement keep the first screen richly detailed.
 objects.push(
  {x:2.2,y:2.4,detail:'flowers',width:48},{x:6.2,y:2.1,detail:'grass',width:42},
  {x:2.3,y:7.5,detail:'flowers',width:44},{x:6.8,y:6.9,detail:'berries',width:48},
  ...(!occupied(4,3)?[{x:4.05,y:3.35,detail:'lantern',width:unitFor(W)*.18}]:[]),
  ...(!occupied(4,6)?[{x:4.05,y:6.05,detail:'cargo',width:unitFor(W)*.28}]:[])
 );
 if(!occupied(6,9))objects.push({x:6.45,y:9.1,kind:'spruce',width:unitFor(W)*1.45,sway:true});
 if(!occupied(9,7))objects.push({x:9.1,y:7.35,kind:'spruce',width:unitFor(W)*1.4,sway:true});
 if(!occupied(7,8))objects.push({x:7.6,y:8.45,detail:'flowers',width:46});
 if(!occupied(8,8))objects.push({x:8.45,y:8.15,detail:'grass',width:42});
 if(!c.buildings.some(b=>b.x===4&&b.y===2))objects.push({x:4,y:2,kind:'lab',width:unitFor(W)*1.6,lab:true});
 const kind={house:'house',lumber:'lumber',farm:'farm',well:'well',quarry:'quarry',ranch:'ranch',clinic:'clinic',granary:'granary',mine:'mine',smelter:'smelter',factory:'workshop',energy:'energy',school:'school',university:'university',market:'market',observatory:'observatory',greenhouse:'greenhouse',lighthouse:'lighthouse',park:'park',harbor:'harbor',fishery:'fishery'};
 // Keep all structures on a common one-tile footprint scale. Oversized
 // mixed-atlas sprites previously overlapped roads and neighboring roofs.
 const buildingScale={house:1.34,lumber:1.44,farm:1.82,well:.94,quarry:1.38,ranch:1.60,clinic:1.46,granary:1.43,mine:1.42,smelter:1.46,factory:1.48,energy:1.42,school:1.5,university:1.53,market:1.48,observatory:1.45,greenhouse:1.48,lighthouse:1.5,park:1.25,harbor:1.5,fishery:1.42};
 for(const b of c.buildings){
  const parts=compoundParts(b,c.seconds);
  if(parts)for(const part of parts)objects.push({x:part.x,y:part.y,kind:kind[part.type],width:unitFor(W)*(buildingScale[part.type]??1.45),b:part.b,parent:b,part,prop:part.building?null:part.prop});
  else objects.push({x:b.x,y:b.y,kind:kind[b.type],width:unitFor(W)*(buildingScale[b.type]??1.45),b});
 }
 for(let x=1;x<c.extent;x++)for(let y=9;y<c.extent;y++){
  if(occupied(x,y)||isRiverTile(x,y)||landscapeSeed(x+17,y+19)>.012)continue;
  const phase=reduced?0:time*.18+x,offset=Math.sin(phase)*.2,walking=!reduced&&Math.abs(Math.cos(phase))>.2;
  const animal={frame:walking?Math.floor(time*4)%4:0,flip:Math.cos(phase)<0};
  objects.push({x:x+offset,y:y+.12,kind:regionAt(x,y)==='meadows'?'horse':'sheep',width:unitFor(W)*.4,animal});
 }
 for(const a of c.agents){const job=c.buildings.find(b=>b.id===a.job);const kind=a.truck&&!(job?.type==='farm'&&a.state==='work')?'truck':['school','university','observatory'].includes(job?.type)?'scientist':job?.type==='greenhouse'?'botanist':['factory','smelter','energy'].includes(job?.type)?'engineer':job?.type==='harbor'?'captain':job?.type==='fishery'?'fisherman':!a.job&&a.id%3===0&&c.buildings.some(b=>b.type==='school')?'pupil':a.id%3===1?'woman':'person';const actor=job?.type==='farm'&&a.state==='work'?{...a,truck:false}:a;const prev=previousAgents?.get(a.id)||actor,pose=actorPose(actor,job,prev,alpha,reduced);if(pose.opacity<=.01)continue;objects.push({x:pose.x,y:pose.y,kind,width:unitFor(W)*(actor.truck?.46:pose.chopping?.26:kind==='pupil'?.14:.18),a:actor,pose});}
 for(const b of c.buildings.filter(b=>['harbor','fishery'].includes(b.type))){
  const v=(c.voyages||[]).find(v=>v.x===b.x&&v.y===b.y);
  const point=v?boatPose(v,VOYAGES[v.kind].duration):{x:b.x+.65,y:-.7};
  if(b.type==='harbor'||c.agents.some(a=>a.job===b.id&&a.state==='work'))objects.push({...point,kind:'ship',width:b.type==='harbor'?57:31,boat:true,returning:point.returning});
 }
 for(const site of objects.filter(o=>o.b&&o.b.ready>time))for(const worker of constructionCrew(site.b,time,reduced)){
  const b=site.b;
  objects.push({x:worker.x,y:worker.y,kind:'person',width:unitFor(W)*.18,pose:worker.pose,builder:worker,depth:bodyPoint(b).x+bodyPoint(b).y+.03});
 }
 for(let i=0;i<4;i++){const t=reduced?i:time*.08+i*1.7;objects.push({x:3+i+Math.sin(t)*2,y:-1.4-i*.65+Math.cos(t)*.4,kind:'gull',width:20,bird:true});}


 // Story relics are permanent world points and can be found with mouse or touch.
 if(c.story)for(const a of ARTIFACTS){if(a.x>=c.extent||a.y>=c.extent||c.story.artifacts.includes(a.id)||occupied(a.x,a.y))continue;objects.push({x:a.x,y:a.y,kind:a.id,width:33,artifact:a.id,available:!artifactError(c,a.id)});}
 if(!occupied(3,3))objects.push({x:3,y:3,kind:'park',width:40});
 if(!occupied(4,4))objects.push({x:4.05,y:4.1,kind:'streetlamp',width:unitFor(W)*.13});
 const drawObject=obj=>{
  // Buildings use the front corner of their floor; people/plants use their foot point.
  const onPlot=!!(obj.b||obj.lab);
  const anchor=obj.b?bodyPoint(obj.b):{x:obj.x+(onPlot?.98:.5),y:obj.y+(onPlot?.98:.62)};const p=project(anchor.x,anchor.y);
  if(obj.detail){paintImage(ctx,nature[obj.detail]||details[obj.detail],p.x,p.y,obj.width*zoom,{alpha:.96});return;}
  const moving=obj.a?.path.length;
  const frame=0;
  obj.constructing=obj.b?.ready>c.seconds;
  if(obj.prop){
   if(obj.constructing)drawConstruction(ctx,{...obj.b,type:'park'},time,project,u,null,null,u*.8,reduced);
   else drawCompoundProp(ctx,{...obj.part,prop:obj.prop},project,u,time,c.agents.some(a=>a.job===obj.parent.id&&a.state==='work'),reduced);
   const q=project(obj.x+.5,obj.y+.5);hits.push({left:q.x-u*.4,top:q.y-u*.5,width:u*.8,height:u*.65,x:obj.parent.x,y:obj.parent.y});return;
  }
  if(obj.b?.type==='farm'&&!obj.constructing){
   // Crop ground was painted before all people and structures.
   if(selected?.x===obj.x&&selected?.y===obj.y){
    diamond(obj.x,obj.y,'#ffffff06','#cbb881');
    const q=project(obj.x+.5,obj.y+.5),crop=cropVisual(obj.b);
    ctx.save();ctx.font='600 '+Math.max(10,11*zoom)+'px system-ui';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#26352b';ctx.fillStyle='#f3e6be';ctx.strokeText(crop.label,q.x,q.y-u*.28);ctx.fillText(crop.label,q.x,q.y-u*.28);ctx.restore();
   }
   return;
  }
  const image=objectArt(obj,time,reduced);
  if(!image)return;
  const width=obj.width*zoom,height=width*image.height/image.width;
  if(p.x+width/2<0||p.x-width/2>W||p.y+u*.5<0||p.y-height>H)return;
  if(obj.constructing){
   if(selected?.x===obj.x&&selected?.y===obj.y)diamond(obj.x,obj.y,'#c9bf8610','#d5c795');
   const previous=objectArt({...obj,b:{...obj.b,level:Math.max(1,obj.b.level-1)}},time,reduced);
   const hit=drawConstruction(ctx,obj.b,time,project,u,image,previous,width,reduced);hits.push({...hit,x:obj.parent?.x??hit.x,y:obj.parent?.y??hit.y});
   return;
  }
  let bob=0,angle=0;
  if(!reduced){
   if(obj.sway)angle=Math.sin(time*.9+obj.x)*.012;
   if(obj.boat){bob=Math.sin(time*1.8+obj.x)*zoom;angle=Math.sin(time*.9)*.025;}
   if(obj.bird){bob=Math.sin(time*4+obj.x)*zoom*1.7;angle=Math.sin(time*4)*.045;}
   if(obj.a?.path.length&&!obj.a.truck)bob=Math.abs(Math.sin((obj.a.distance||0)*Math.PI*10))*.15*zoom;
   else if(obj.a?.state==='work')angle=0;
  }
  if(obj.artifact){hits.push({left:p.x-Math.max(22,width/2),top:p.y-Math.max(44,height),width:Math.max(44,width),height:Math.max(44,height),artifact:obj.artifact,x:obj.x,y:obj.y});ctx.save();ctx.strokeStyle=obj.available?'#fff3b5':'#d4eff066';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(p.x,p.y,width*.7,width*.24,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
  if(obj.b||obj.lab)hits.push({left:p.x-width/2,top:p.y-height,width,height,x:obj.parent?.x??obj.x,y:obj.parent?.y??obj.y,lab:obj.lab});
  if(!obj.b&&!obj.lab){ctx.save();ctx.fillStyle='#294c2838';ctx.beginPath();ctx.ellipse(p.x,p.y-zoom,width*.27,width*.065,0,0,Math.PI*2);ctx.fill();ctx.restore();}
  if(selected&&onPlot&&Math.round(obj.x)===selected.x&&Math.round(obj.y)===selected.y){
   diamond(obj.x,obj.y,'#50eff509','#83f9ff');
   if(onPlot)drawSelection(ctx,p,width,u,time,reduced);
  }
  ctx.save();ctx.translate(p.x,p.y-bob);ctx.rotate(angle);
  let alpha=obj.pose?.opacity??1;
  ctx.globalAlpha=alpha;
  if(obj.boat&&obj.returning)ctx.scale(-1,1);
  if(obj.pose){if(obj.pose.flip)ctx.scale(-1,1);}
  else if(obj.animal){if(obj.animal.flip)ctx.scale(-1,1);}
  else if(obj.a){
   const direction=obj.a.facing||1;
   if((life[obj.kind]||chronicle[obj.kind])?direction<0:(direction<0)!==!!frame)ctx.scale(-1,1);
  }
  ctx.drawImage(image,-width/2,-height,width,height);ctx.restore();
  if(obj.builder){
   const worker=obj.builder,swing=reduced?0:Math.sin(time*9);
   ctx.save();ctx.translate(p.x,p.y-height*.5);ctx.scale(worker.pose.flip?-1:1,1);
   if(worker.carrying){ctx.fillStyle='#a38d6d';ctx.fillRect(width*.02,0,width*.4,height*.14);}
   if(worker.working){ctx.rotate(-.4+swing*.65);ctx.strokeStyle='#9c7850';ctx.lineWidth=Math.max(1,zoom);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(width*.5,-height*.18);ctx.stroke();ctx.fillStyle='#777c78';ctx.fillRect(width*.4,-height*.22,width*.25,height*.08);}
   ctx.restore();
  }
  if(obj.pose?.farming){
   const swing=reduced?0:Math.sin(time*5)*.35;
   ctx.save();ctx.translate(p.x,p.y-height*.45);ctx.scale(obj.pose.flip?-1:1,1);ctx.rotate(swing);
   if(obj.pose.farming==='harvesting'){
    ctx.strokeStyle='#836343';ctx.lineWidth=Math.max(1,zoom);ctx.beginPath();ctx.moveTo(-width*.15,height*.2);ctx.lineTo(width*.65,height*.12);ctx.stroke();
    ctx.strokeStyle='#c1c6be';ctx.beginPath();ctx.moveTo(width*.65,height*.12);ctx.quadraticCurveTo(width*.9,-height*.08,width*.35,-height*.15);ctx.stroke();
   }else if(obj.pose.farming==='sowing'){
    ctx.fillStyle='#d5b56a';for(let k=0;k<3;k++){const f=reduced?.3:(time*1.5+k*.3)%1;ctx.fillRect(width*(.2+f*.55),height*f*.35,Math.max(1,zoom),Math.max(1,zoom));}
   }
   ctx.restore();
  }
  // New ranch compound has an empty paddock; add only two small animated sheep.
  if(obj.b?.type==='ranch'&&preparedCoherent){
   const b=obj.b;
   for(let i=0;i<2;i++){
    const t=reduced?0:time*.35+i*2,walk=!reduced&&Math.abs(Math.cos(t))>.3;
    const q=(()=>{const q=bodyPoint(b,.70+Math.sin(t)*.06,.78+i*.12);return project(q.x,q.y);})();
    paintImage(ctx,motionArt['sheep'+(walk?Math.floor(time*4+i)%4:0)]||nature.sheep,q.x,q.y,u*.14,{flip:Math.cos(t)<0});
   }
  }
  if(obj.b?.type==='farm'){
   const b=obj.b;
   const count=Math.min(3,b.level+1);
   const animals=Array.from({length:count},(_,i)=>({...animalPose(b,i,time,reduced),index:i})).sort((a,b)=>a.x+a.y-b.x-b.y);
   for(const a of animals){const q=project(a.x,a.y),kind=b.type==='farm'?'chicken':a.kind;paintImage(ctx,nature[kind]||life[kind],q.x,q.y-a.bob*zoom,u*(kind==='cow'?.35:kind==='chicken'?.16:.28),{flip:a.flip,alpha:b.ready>c.seconds?.5:1});}
  }
  if(obj.b&&(!obj.part||obj.part.main)&&obj.b.level>=2&&selected?.x===obj.x&&selected?.y===obj.y){
   const b=obj.b;
   // Upgrade level is state, not an extra miniature building on the same plot.
   ctx.save();ctx.font=`800 ${Math.max(9,10*zoom)}px system-ui`;ctx.textAlign='center';ctx.fillStyle='#063e55';ctx.strokeStyle='#f5fff0';ctx.lineWidth=3;const label=['','I','II','III','IV','V'][b.level];ctx.strokeText(label,p.x,p.y-u*.06);ctx.fillText(label,p.x,p.y-u*.06);ctx.restore();
  }

  if(obj.b?.ready>c.seconds){
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
 for(const b of c.buildings)if(b.type==='farm'&&!(b.ready>c.seconds))hits.push(drawCropPlot(ctx,b,project,u,time,reduced,fieldArt));
 for(const obj of objects){
  if(!(obj.b||obj.lab||['spruce','spruce-group','oak','birch'].includes(obj.kind)))continue;
  const onPlot=!!(obj.b||obj.lab),anchor=obj.b?bodyPoint(obj.b):{x:obj.x+(onPlot?.98:.5),y:obj.y+(onPlot?.98:.62)},p=project(anchor.x,anchor.y);
  obj.constructing=obj.b?.ready>c.seconds;
  if(obj.constructing&&obj.b.level===1)continue;
  const image=objectArt(obj,time,reduced);
  if(p.x<-u*3||p.x>W+u*3||p.y<-u*3||p.y>H+u*3)continue;
  if(!obj.prop&&obj.b?.type!=='farm')castShadow(ctx,image,p,obj.width*zoom);
 }
 for(let i=objects.length-1;i>=0;i--){const o=objects[i];if(o.detail&&buildingAt(c,Math.floor(o.x),Math.floor(o.y)))objects.splice(i,1);}
 objects.sort((a,b)=>(a.depth??(a.b?bodyPoint(a.b).x+bodyPoint(a.b).y:sceneDepth(a)))-(b.depth??(b.b?bodyPoint(b.b).x+bodyPoint(b.b).y:sceneDepth(b)))).forEach(drawObject);
 const moving=c.buildings.find(b=>b.id===movingId),focus=selected&&buildingAt(c,selected.x,selected.y);
 const previewType=moving?.type||tool,previewLevel=moving?.level||1;
 const outline=(b,size,color,dashed=false)=>{
  const [w,h]=size,pts=[[0,0],[w,0],[w,h],[0,h]].map(([x,y])=>project(b.x+x,b.y+y));
  ctx.save();ctx.setLineDash(dashed?[7,5]:[]);ctx.lineWidth=2;ctx.strokeStyle=color;ctx.beginPath();pts.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](p.x,p.y));ctx.closePath();ctx.stroke();ctx.restore();
 };
 if(selected&&previewType){
  const b={...selected,type:previewType,level:previewLevel},size=plannedSize(previewType,previewLevel),max=plannedSize(previewType,5);
  outline(b,max,'#d8bd78',true);
  for(const p of footprintCells(b,max)){
   const blocked=placementError(c,previewType,p.x,p.y,1,movingId,[1,1]);
   if(blocked)diamond(p.x,p.y,'#d4494930');
  }
  outline(b,size,placementError(c,previewType,b.x,b.y,previewLevel,movingId)?'#eb7770':'#aad9a4');
 }else if(focus){outline(focus,plannedSize(focus.type,5),'#d8bd78',true);outline(focus,footprintSize(focus),'#b8d8cb');}
 drawAtmosphere(ctx,view,project,u,c,time,reduced);
 return hits;
}

export function mapTile(canvas,zoom,pan,x,y){
 return tileAt({width:canvas.clientWidth,height:canvas.clientHeight},{zoom,pan},{x,y});
}

