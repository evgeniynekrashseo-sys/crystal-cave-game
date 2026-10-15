// Deterministic mobile-friendly surface detail pass for existing 2D isometric city.
// Pure Canvas: no textures, downloads, WebGL or save-data changes.
function hash(x,y,n){let v=Math.imul((x*977+y*131+n*791)|0,0x45d9f3b);v=Math.imul(v^(v>>>16),0x45d9f3b);return ((v^(v>>>16))>>>0)/4294967296;}
export function drawRoadMicroDetail(ctx,roads,project,u,zoom,reduced=false){
 if(!roads?.length||u<8)return;
 ctx.save();
 for(const road of roads){
  const x=road.x,y=road.y;
  const center=project(x+.5,y+.5);
  const right=project(x+1,y+.5),bottom=project(x+.5,y+1);
  const rx=Math.max(2,Math.abs(right.x-center.x)*.68),ry=Math.max(1.5,Math.abs(bottom.y-center.y)*.72);
  // Confine stones, gravel and wheel wear to the road's projected diamond.
  ctx.save();ctx.beginPath();
  for(const [i,p] of [[0,project(x+.5,y+.08)],[1,project(x+.92,y+.5)],[2,project(x+.5,y+.92)],[3,project(x+.08,y+.5)]])i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y);
  ctx.closePath();ctx.clip();
  const amount=reduced?5:13;
  for(let i=0;i<amount;i++){
   const dx=(hash(x,y,i*4)-.5)*rx*1.7,dy=(hash(x,y,i*4+1)-.5)*ry*1.7;
   const size=(.4+hash(x,y,i*4+2)*1.15)*Math.min(2,zoom);
   ctx.fillStyle=i%3===0?'rgba(37,36,27,.16)':i%3===1?'rgba(231,218,175,.22)':'rgba(110,91,68,.18)';
   ctx.beginPath();ctx.ellipse(center.x+dx,center.y+dy,size*1.8,size*.7,hash(x,y,i*4+3)*3.14,0,Math.PI*2);ctx.fill();
  }
  if(!reduced&&zoom>=.85){
   ctx.strokeStyle='rgba(68,54,37,.13)';ctx.lineWidth=Math.max(.5,zoom*.7);
   for(const offset of [-.23,.23]){
    ctx.beginPath();ctx.moveTo(center.x-rx*.65,center.y+offset*ry);ctx.quadraticCurveTo(center.x,center.y+offset*ry+ry*.09,center.x+rx*.65,center.y+offset*ry);ctx.stroke();
   }
  }
  ctx.restore();
 }
 ctx.restore();
}
