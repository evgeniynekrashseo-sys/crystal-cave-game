// Natural banks stay inside the reserved river corridor, preserving old saves.
export function riverBanks(y){
 const t=Math.max(0,Math.min(1,(y-8)/4)),wide=t*t*(3-2*t);
 const bend=.10*Math.sin(y*.83)+.045*Math.sin(y*2.7);
 return {left:14.19+bend+.025*Math.sin(y*5.1),right:14.80+wide*.94+bend+.035*Math.sin(y*3.3+.7)};
}
// Conservative world-space bounds for the river, banks, reeds, bridge and
// animated ripples. The corridor is x≈13–17, y≈0–37; generous padding keeps
// every sprite visible near screen edges, at any camera zoom.
// This is a cheap early-out only: it never changes simulation or map data.
export function riverMayBeVisible(project,u,view){
 const corners=[[10,-5],[20,-5],[20,41],[10,41]].map(([x,y])=>project(x,y));
 const left=Math.min(...corners.map(p=>p.x))-3*u;
 const right=Math.max(...corners.map(p=>p.x))+3*u;
 const top=Math.min(...corners.map(p=>p.y))-3*u;
 const bottom=Math.max(...corners.map(p=>p.y))+3*u;
 return right>=0&&left<=view.width&&bottom>=0&&top<=view.height;
}
const art=typeof Image==='undefined'?null:new Image();if(art)art.src=new URL('./river-materials-v26.png',import.meta.url).href;
let sprites;
function prepare(){
 if(sprites||!art?.complete||!art.naturalWidth)return;
 sprites={};
 const cells={bridge:[0,0,.57,.49],rocks:[.58,.15,1,.49],soil:[0,.52,.55,1],reeds:[.56,.5,1,1]};
 for(const [name,[l,t,r,b]]of Object.entries(cells)){
  const canvas=document.createElement('canvas');canvas.width=Math.round((r-l)*art.width);canvas.height=Math.round((b-t)*art.height);
  canvas.getContext('2d').drawImage(art,l*art.width,t*art.height,canvas.width,canvas.height,0,0,canvas.width,canvas.height);sprites[name]=canvas;
 }
}
function paint(ctx,name,p,width,alpha=1){const image=sprites?.[name];if(!image)return;const h=width*image.height/image.width;ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(image,p.x-width/2,p.y-h,width,h);ctx.restore();}
export function drawNaturalRiver(ctx,project,u,time,reduced,water){
 prepare();const samples=[];for(let y=0;y<=36;y+=.1)samples.push({y,...riverBanks(y)});
 function ribbon(inset,color){ctx.beginPath();for(let i=0;i<samples.length;i++){const s=samples[i],p=project(s.left+inset,s.y);ctx[i?'lineTo':'moveTo'](p.x,p.y);}for(let i=samples.length-1;i>=0;i--){const s=samples[i],p=project(s.right-inset,s.y);ctx.lineTo(p.x,p.y);}ctx.closePath();ctx.fillStyle=color;ctx.fill();}
 // Soil shelves, wet edges and a deep central channel are separate surfaces.
 ribbon(-.08,'#63754c55');ribbon(-.04,'#93866a');ribbon(0,'#719c8b');
 // Many translucent depth layers avoid the former hard parallel colour bands.
 for(let layer=0;layer<18;layer++)ribbon(layer*.014,'#245f6b0c');
 ctx.save();ribbon(0,'#49858222');ctx.clip();
 if(water){
  ctx.globalAlpha=.10;
  // World-anchored ripples move downstream; camera movement never slides the texture.
  const drift=reduced?0:(time*.04)%1;
  for(let y=-1;y<37;y+=.7)for(let x=13;x<17;x+=.7){const p=project(x,y+drift);ctx.drawImage(water,p.x-u,p.y-u*.56,u*2,u*1.12);}
  ctx.globalAlpha=1;
 }
 for(let i=0;i<460;i++){
  const y=(i*.713)%36,{left,right}=riverBanks(y),f=((i*37)%101)/101,x=left+(right-left)*f,p=project(x,y);
  const near=Math.abs(f-.5)*2;ctx.fillStyle=near>.65?'#d2c9a33b':'#99b9a617';ctx.beginPath();ctx.ellipse(p.x,p.y,u*(.008+(i%4)*.005),u*.008,0,0,Math.PI*2);ctx.fill();
 }
 for(let i=0;i<640;i++){
  const y=(i*.237+(reduced?0:time*.12))%36,{left,right}=riverBanks(y),f=.16+((i*29)%71)/100;
  const x=left+(right-left)*f,p=project(x,y),q=project(x+.02*Math.sin(i),y+.09+(i%4)*.025);
  ctx.strokeStyle=i%5?'#b8d6ca25':'#e6ead75c';ctx.lineWidth=Math.max(.5,u*.012);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();
 }
 ctx.restore();
 // Irregular, individually grounded materials replace continuous hard edging.
 for(let i=0;i<360;i++){
  const y=.1+i*.10;if(Math.abs(y-5.5)<.45)continue;const b=riverBanks(y),side=i%2,x=side?b.right+.065:b.left-.065,p=project(x,y);
  paint(ctx,'soil',p,u*(.52+.12*Math.sin(i*2.1)),.92);
  if(i%11===0)paint(ctx,'rocks',p,u*(.28+.08*Math.sin(i)),.98);
  if(i%17===0)paint(ctx,'reeds',p,u*.43,.98);
 }
 const p=project(14.5,5.55);paint(ctx,'bridge',{x:p.x,y:p.y+u*.38},u*1.95);
}
