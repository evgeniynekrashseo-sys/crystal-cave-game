// Mobile-friendly deterministic terrain texture. Drawn once and cached; no rectangular sprite cutouts.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const hash=(x,y,s=0)=>{let n=Math.imul((x*374761393+y*668265263+s*1442695041)|0,1274126177);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295};
export function makeGroundPattern(){
 const c=document.createElement('canvas');c.width=c.height=512;
 const g=c.getContext('2d',{alpha:false});g.fillStyle='#64704c';g.fillRect(0,0,512,512);
 // Multi-scale vegetation patches without square terrain tile edges.
 for(let layer=0;layer<3;layer++){
  const step=[34,15,5][layer];
  for(let y=0;y<512;y+=step)for(let x=0;x<512;x+=step){
   const v=hash(x/step|0,y/step|0,layer);
   const px=x+(hash(x,y,4)-.5)*step,py=y+(hash(y,x,5)-.5)*step;
   g.fillStyle=layer===0?(v>.48?'rgba(38,62,32,.13)':'rgba(171,153,102,.12)'):layer===1?(v>.5?'rgba(31,60,31,.15)':'rgba(190,165,105,.12)'):(v>.6?'rgba(32,49,28,.22)':'rgba(175,156,107,.14)');
   g.beginPath();g.ellipse(px,py,step*(.3+v*.7),step*(.15+v*.35),v*3,0,7);g.fill();
  }
 }
 for(let i=0;i<5500;i++){
  const x=hash(i,11)*512,y=hash(i,19)*512,v=hash(i,23);
  g.strokeStyle=v>.7?'rgba(206,186,125,.22)':'rgba(35,61,29,.25)';
  g.lineWidth=.5+v*.7;g.beginPath();g.moveTo(x,y);g.lineTo(x+(v-.5)*3,y-1-v*3);g.stroke();
 }
 for(let i=0;i<160;i++){
  const x=hash(i,31)*512,y=hash(i,37)*512,v=hash(i,41);
  g.fillStyle=v>.5?'#8e8a77':'#575b4d';g.beginPath();g.ellipse(x,y,.6+v*1.7,.4+v,hash(i,43)*3,0,7);g.fill();
 }
 return c;
}
export function paintGround(ctx,pattern,w,h,panX,panY,zoom){
 const tile=Math.max(340,Math.min(720,512*zoom));
 ctx.save();ctx.globalAlpha=1;
 const ox=((panX*.25)%tile+tile)%tile-tile,oy=((panY*.25)%tile+tile)%tile-tile;
 for(let y=oy;y<h+tile;y+=tile)for(let x=ox;x<w+tile;x+=tile)ctx.drawImage(pattern,x,y,tile+1,tile+1);
 ctx.restore();
}
