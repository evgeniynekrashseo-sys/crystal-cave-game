// CSS-pixel camera shared by hit testing, the scene and all input methods.
export const MIN_ZOOM=.45,MAX_ZOOM=2.4;
export const unitFor=width=>Math.max(49,Math.min(58,width*.135));
export const originFor=({width,height})=>({x:width/2,y:height*.49});
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const copy=c=>({zoom:c.zoom,pan:{...c.pan}});

export function projectPoint(view,c,x,y){
 const o=originFor(view),u=unitFor(view.width)*c.zoom;
 return {x:o.x+(x-y)*u+c.pan.x,y:o.y+(x+y-10)*u*.56+c.pan.y};
}
export function worldPoint(view,c,p){
 const o=originFor(view),u=unitFor(view.width)*c.zoom;
 const a=(p.x-o.x-c.pan.x)/u,b=(p.y-o.y-c.pan.y)/(u*.56)+10;
 return {x:(a+b)/2,y:(b-a)/2};
}
export function tileAt(view,c,p){const q=worldPoint(view,c,p);return {x:Math.floor(q.x),y:Math.floor(q.y)};}
export function zoomAt(view,c,zoom,from=originFor(view),to=from){
 zoom=clamp(zoom,MIN_ZOOM,MAX_ZOOM);
 const o=originFor(view),ratio=zoom/c.zoom;
 return {zoom,pan:{x:to.x-o.x-(from.x-o.x-c.pan.x)*ratio,y:to.y-o.y-(from.y-o.y-c.pan.y)*ratio}};
}
export function boundCamera(view,c,extent){
 const o=originFor(view),u=unitFor(view.width)*c.zoom;
 // Keep some explored land reachable, with equal freedom on both horizontal sides.
 const marginX=Math.min(90,view.width*.2),marginY=Math.min(150,view.height*.2);
 return {zoom:c.zoom,pan:{
  x:clamp(c.pan.x,marginX-(o.x+extent*u),view.width-marginX-(o.x-extent*u)),
  y:clamp(c.pan.y,marginY-(o.y+(extent*2-10)*u*.56),view.height-marginY-(o.y-10*u*.56))
 }};
}

export class MapGesture{
 constructor({view,camera,change,tap,bounds=c=>c}){Object.assign(this,{view,camera,change,tap,bounds});this.points=new Map();this.suppressed=false;}
 rebase(){
  const points=[...this.points.values()];
  if(!points.length){this.phase=null;this.suppressed=false;return;}
  const camera=copy(this.camera());
  if(points.length===1)this.phase={kind:'pan',point:{...points[0]},camera};
  else {const [a,b]=points;this.suppressed=true;this.phase={kind:'pinch',point:{x:(a.x+b.x)/2,y:(a.y+b.y)/2},distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),camera};}
 }
 down(id,p){this.points.set(id,{...p});this.rebase();}
 move(id,p){
  if(!this.points.has(id))return;
  this.points.set(id,{...p});const phase=this.phase;
  if(phase.kind==='pan'){
   const dx=p.x-phase.point.x,dy=p.y-phase.point.y;
   if(Math.hypot(dx,dy)>6)this.suppressed=true;
   if(this.suppressed){
    this.change(this.bounds({zoom:phase.camera.zoom,pan:{x:phase.camera.pan.x+dx,y:phase.camera.pan.y+dy}}));
    // Discard movement beyond the map edge so reversing responds immediately.
    this.rebase();
   }
  }else{
   const [a,b]=[...this.points.values()],middle={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
   const distance=Math.hypot(a.x-b.x,a.y-b.y);
   this.change(this.bounds(zoomAt(this.view(),phase.camera,phase.camera.zoom*distance/phase.distance,phase.point,middle)));
   // Rebase at the actual zoom, including when a zoom/pan limit was reached.
   this.rebase();
  }
 }
 up(id,p){
  if(!this.points.has(id))return;
  const tap=this.points.size===1&&!this.suppressed&&Math.hypot(p.x-this.phase.point.x,p.y-this.phase.point.y)<=6;
  this.points.delete(id);this.rebase();if(tap)this.tap(p);
 }
 cancel(id){if(!this.points.has(id))return;this.suppressed=true;this.points.delete(id);this.rebase();}
 reset(){this.points.clear();this.rebase();}
}

export function bindMapControls(canvas,{view,camera,change,tap,extent}){
 const bounded=c=>boundCamera(view(),c,extent());
 const gesture=new MapGesture({view,camera,change,tap,bounds:bounded});
 const point=e=>{const r=canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};};
 const prevent=e=>{if(e.cancelable)e.preventDefault();};
 const handlers={
  pointerdown:e=>{if(e.pointerType==='mouse'&&e.button!==0)return;prevent(e);canvas.setPointerCapture(e.pointerId);gesture.down(e.pointerId,point(e));},
  pointermove:e=>{if(gesture.points.has(e.pointerId)){prevent(e);gesture.move(e.pointerId,point(e));}},
  pointerup:e=>{prevent(e);gesture.up(e.pointerId,point(e));},
  pointercancel:e=>gesture.cancel(e.pointerId),
  lostpointercapture:e=>gesture.cancel(e.pointerId),
  wheel:e=>{
   prevent(e);gesture.reset();const factor=e.deltaMode===1?16:e.deltaMode===2?view().height:1,c=camera();
   if(e.ctrlKey||e.metaKey)change(bounded(zoomAt(view(),c,c.zoom*Math.exp(-e.deltaY*factor*.003),point(e))));
   else change(bounded({zoom:c.zoom,pan:{x:c.pan.x-e.deltaX*factor,y:c.pan.y-e.deltaY*factor}}));
  }
 };
 for(const [name,fn]of Object.entries(handlers))canvas.addEventListener(name,fn,{passive:false});
 return {
  zoom(delta){gesture.reset();const c=camera();change(bounded(zoomAt(view(),c,c.zoom+delta)));},
  center(){gesture.reset();change({zoom:1,pan:{x:0,y:0}});},
  cancel(){gesture.reset();},
  destroy(){gesture.reset();for(const [name,fn]of Object.entries(handlers))canvas.removeEventListener(name,fn);}
 };
}
