// Native-density meadow: no enlarged photograph beneath sharp sprite artwork.
// 2048-pixel tile keeps fine blades crisp when a 2x-density phone zooms in.
export const GROUND_SIZE=512,GROUND_DENSITY=4;
export function createMeadow(document,texture){
 if(texture?.complete&&texture.naturalWidth>=1024&&texture.naturalHeight>=1024){
  // Use every source pixel. The material stays at four image pixels per world pixel.
  const tile=document.createElement('canvas');tile.width=texture.naturalWidth;tile.height=texture.naturalHeight;
  const g=tile.getContext('2d');g.drawImage(texture,0,0);
  return tile;
 }
 const tile=document.createElement('canvas');tile.width=tile.height=GROUND_SIZE*GROUND_DENSITY;
 const g=tile.getContext('2d');g.scale(GROUND_DENSITY,GROUND_DENSITY);
 let seed=62137;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 g.fillStyle='#b5cd78';g.fillRect(0,0,GROUND_SIZE,GROUND_SIZE);
 // Seamless broad tones, then thousands of individually drawn blades and seed heads.
 for(let i=0;i<58;i++){
  const x=random()*GROUND_SIZE,y=random()*GROUND_SIZE,r=18+random()*62;
  const dark=i%3===0,color=dark?'114,146,69':'220,218,124';
  for(const dx of [-GROUND_SIZE,0,GROUND_SIZE])for(const dy of [-GROUND_SIZE,0,GROUND_SIZE]){
   if(x+dx+r<0||x+dx-r>GROUND_SIZE||y+dy+r<0||y+dy-r>GROUND_SIZE)continue;
   const grad=g.createRadialGradient(x+dx,y+dy,0,x+dx,y+dy,r);
   grad.addColorStop(0,`rgba(${color},.25)`);grad.addColorStop(1,`rgba(${color},0)`);
   g.fillStyle=grad;g.fillRect(x+dx-r,y+dy-r,r*2,r*2);
  }
 }
 const greens=['#7c9d4e','#90ad59','#a7bd64','#c6d78c','#d4d798','#98b364'];
 for(let i=0;i<11500;i++){
  const x=random()*GROUND_SIZE,y=random()*GROUND_SIZE,length=.8+random()*2.6,bend=(random()-.5)*2.1;
  g.strokeStyle=greens[Math.floor(random()*greens.length)];g.lineWidth=.3+random()*.4;
  g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+bend*.15,y-length*.55,x+bend,y-length);g.stroke();
  if(i%4===0){g.fillStyle='#e1dfa8';g.fillRect(x+bend,y-length,.55,.55);}
 }
 return tile;
}

export function fillMeadow(ctx,tile,view,camera,origin){
 const pattern=ctx.createPattern(tile,'repeat');if(!pattern)return;
 pattern.setTransform({a:1/GROUND_DENSITY,b:0,c:0,d:1/GROUND_DENSITY,e:0,f:0});
 const x=origin.x+camera.pan.x,y=origin.y+camera.pan.y;
 ctx.save();ctx.translate(x,y);ctx.scale(camera.zoom,camera.zoom);ctx.fillStyle=pattern;
 ctx.fillRect(-x/camera.zoom,-y/camera.zoom,view.width/camera.zoom,view.height/camera.zoom);ctx.restore();
}
