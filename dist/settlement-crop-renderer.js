import {cropVisual} from './settlement-crops.js?v=43';
// Ground-space planting: every stalk stays rooted while its tip moves in wind.
export function drawCropPlot(ctx,b,project,u,time,reduced,art={}){
 const state=cropVisual(b),poly=[[.08,.08],[.92,.08],[.92,.92],[.08,.92]].map(([x,y])=>project(b.x+x,b.y+y));
 ctx.save();ctx.beginPath();poly.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](p.x,p.y));ctx.closePath();
 ctx.fillStyle='#584936';ctx.fill();
 for(let row=0;row<12;row++){
  const y=.12+row*.067,a=project(b.x+.10,b.y+y),z=project(b.x+.90,b.y+y);
  ctx.strokeStyle=row%2?'#877052':'#342d2480';ctx.lineWidth=Math.max(.6,u*.012);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(z.x,z.y);ctx.stroke();
 }
 const hasArt=art.field1&&art.field2&&art.field3&&art.field4;
 const growing=!hasArt&&['green','ripening','ripe','harvesting'].includes(state.id);
 for(let row=0;row<12;row++)for(let col=0;col<24;col++){
  const seed=Math.sin(row*73.13+col*17.91+b.id*3)*43758.5453,r=seed-Math.floor(seed);
  const p=project(b.x+.12+col*.032+r*.009,b.y+.12+row*.067);
  if(state.id==='sowing'&&row/12<state.progress){ctx.fillStyle='#c5aa70';ctx.fillRect(p.x,p.y,Math.max(1,u*.008),Math.max(1,u*.006));}
  if(!growing)continue;
  const cut=state.id==='harvesting'&&(row*24+col)/288<state.progress;
  const growth=state.id==='green'?.18+.55*state.progress:state.id==='ripening'?.73+.27*state.progress:1;
  const h=u*(cut?.018:.075*growth)*( .85+r*.3),wind=reduced||cut?0:Math.sin(time*1.8+row*.45+col*.2)*u*.006*growth;
  const gold=state.id==='ripe'||state.id==='harvesting'||(state.id==='ripening'&&r<state.progress);
  ctx.lineWidth=Math.max(.55,u*.006);ctx.strokeStyle=cut?'#9e8854':gold?'#b49a4b':'#4f713b';
  ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.quadraticCurveTo(p.x+wind*.3,p.y-h*.5,p.x+wind,p.y-h);ctx.stroke();
  if(!cut){ctx.strokeStyle=gold?'#dfc679':'#7c984b';ctx.beginPath();ctx.moveTo(p.x+wind-u*.009,p.y-h*.75);ctx.lineTo(p.x+wind,p.y-h);ctx.lineTo(p.x+wind+u*.008,p.y-h*.72);ctx.stroke();}
 }
 if(hasArt){
  const bottom=project(b.x+.92,b.y+.92),center=project(b.x+.5,b.y+.5),width=u*1.68;
  const paint=(image,alpha=1)=>{ctx.save();ctx.globalAlpha=alpha;const height=width*image.height/image.width;ctx.drawImage(image,center.x-width/2,bottom.y-height,width,height);ctx.restore();};
  if(state.id==='sowing')paint(art.field1,state.progress);
  if(state.id==='green'){paint(art.field1);paint(art.field2,state.progress);}
  if(state.id==='ripening'){paint(art.field2);paint(art.field3,state.progress);}
  if(state.id==='ripe')paint(art.field3);
  if(state.id==='harvesting'){
   paint(art.field4);
   const edge=.08+.84*state.progress;
   const region=[[edge,.08],[.92,.08],[.92,.92],[edge,.92]].map(([x,y])=>project(b.x+x,b.y+y));
   ctx.save();ctx.beginPath();region.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](p.x,p.y-u*.1));ctx.lineTo(region[2].x,region[2].y+u*.12);ctx.lineTo(region[3].x,region[3].y+u*.12);ctx.closePath();ctx.clip();paint(art.field3);ctx.restore();
  }
 }
 ctx.restore();
 const xs=poly.map(p=>p.x),ys=poly.map(p=>p.y);
 return {left:Math.min(...xs),top:Math.min(...ys)-u*.1,width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)+u*.1,x:b.x,y:b.y};
}
