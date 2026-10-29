// Decorative kitchen gardens add lived-in detail to the art sandbox only.
// All positions are derived from existing houses; no gameplay state is changed.
const OFFSETS = [[2,0],[0,2],[-2,0],[0,-2],[2,1],[-2,1]];
const NEAR = (a,b,r) => Math.abs(a.x-b.x)<r && Math.abs(a.y-b.y)<r;

export function planHomesteadGardens(objects, roads, extent=20) {
  if (!Array.isArray(objects) || !Array.isArray(roads) || !Number.isFinite(extent) || extent<4) return [];
  const houses = objects.filter(o=>o?.type==='house' && Number.isFinite(o.x) && Number.isFinite(o.y));
  const occupied = objects.filter(o=>o && Number.isFinite(o.x) && Number.isFinite(o.y));
  const validRoads = roads.filter(r=>r && Number.isFinite(r.x) && Number.isFinite(r.y));
  const plots=[];
  for (const house of houses) {
    const plot=OFFSETS.map(([dx,dy])=>({x:house.x+dx,y:house.y+dy}))
      .find(p=>p.x>=1 && p.y>=1 && p.x<extent-1 && p.y<extent-1 &&
        !occupied.some(o=>NEAR(p,o,o.type==='tree'?0.9:1.45)) &&
        !validRoads.some(r=>NEAR(p,r,1.05)) &&
        !plots.some(other=>NEAR(p,other,1.6)));
    if (plot) plots.push(plot);
  }
  return plots;
}

function fillQuad(ctx, point, corners, color) {
  ctx.fillStyle=color;
  ctx.beginPath();
  corners.forEach(([x,y],i)=>{const p=point(x,y); if(i) ctx.lineTo(p.x,p.y); else ctx.moveTo(p.x,p.y)});
  ctx.closePath();ctx.fill();
}

export function drawHomesteadGardens(ctx,point,objects,roads,zoom) {
  if (!ctx || typeof point!=='function' || !Number.isFinite(zoom) || zoom<=0) return 0;
  const plots=planHomesteadGardens(objects,roads);
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  for (const {x,y} of plots) {
    const corners=[[x-.08,y-.08],[x+1.08,y-.08],[x+1.08,y+1.08],[x-.08,y+1.08]];
    fillQuad(ctx,point,corners,'rgba(49,43,26,.20)');
    fillQuad(ctx,point,[[x,y],[x+1,y],[x+1,y+1],[x,y+1]],'rgba(103,77,46,.56)');
    // Short vegetable rows follow the same world projection as buildings and roads.
    for(let row=0;row<3;row++) {
      const yy=y+.2+row*.28, a=point(x+.12,yy),b=point(x+.88,yy);
      ctx.strokeStyle='rgba(44,36,23,.34)';ctx.lineWidth=Math.max(.6,2.3*zoom);
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
      for(let plant=0;plant<5;plant++) {
        const p=point(x+.17+plant*.16,yy);
        ctx.fillStyle=(plant+row)%3?'#587342':'#6f8450';
        ctx.beginPath();ctx.ellipse(p.x-1.3*zoom,p.y-1.8*zoom,2.8*zoom,1.6*zoom,-.55,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.ellipse(p.x+1.3*zoom,p.y-2.3*zoom,2.6*zoom,1.5*zoom,.55,0,Math.PI*2);ctx.fill();
      }
    }
    // Low split-rail fence: a few posts, not a high wall that hides buildings.
    for (const [ax,ay,bx,by] of [[x,y,x+1,y],[x+1,y,x+1,y+1],[x+1,y+1,x,y+1]]) {
      const a=point(ax,ay),b=point(bx,by),lift=5*zoom;
      ctx.strokeStyle='rgba(55,38,22,.66)';ctx.lineWidth=Math.max(.8,2.4*zoom);
      ctx.beginPath();ctx.moveTo(a.x,a.y-lift);ctx.lineTo(b.x,b.y-lift);ctx.stroke();
      ctx.strokeStyle='#977650';ctx.lineWidth=Math.max(.7,1.5*zoom);
      for(const p of [a,b]){ctx.beginPath();ctx.moveTo(p.x,p.y+1.5*zoom);ctx.lineTo(p.x,p.y-9*zoom);ctx.stroke()}
    }
  }
  ctx.restore();
  return plots.length;
}
