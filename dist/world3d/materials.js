import * as T from '../vendor/three/three.module.js';
import {random} from './world-space.js';
// Procedural material placeholders: all surfaces share lighting and metre scale.
// Replace maps with authored PBR sets, without changing simulation or meshes.
function texture(kind,base){
 const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d'),rng=random(182);
 ctx.fillStyle=base;ctx.fillRect(0,0,256,256);
 for(let i=0;i<9000;i++){const v=rng();ctx.fillStyle=v>.5?'rgba(255,234,195,.09)':'rgba(16,23,17,.12)';const x=rng()*256,y=rng()*256;ctx.fillRect(x,y,kind==='wood'?1:rng()*4,kind==='wood'?10+rng()*70:rng()*4);}
 if(kind==='stone'){ctx.strokeStyle='#292d2855';ctx.lineWidth=2;for(let y=0;y<256;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(256,y);ctx.stroke();for(let x=(y%64?0:32);x<256;x+=64){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+32);ctx.stroke();}}}
 const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=4;return map;
}
export function materials(invalidate=()=>{}){
 const make=(kind,color)=>new T.MeshStandardMaterial({map:texture(kind,color),roughness:.95});
 const result={wood:make('wood','#766044'),timber:make('wood','#483b2c'),stone:make('stone','#827f70'),plaster:make('plain','#b2a68b'),roof:make('wood','#696757'),thatch:make('wood','#a28a54'),earth:make('plain','#6b6047'),leaf:new T.MeshStandardMaterial({color:0x48513a,roughness:1,side:T.DoubleSide}),glass:new T.MeshStandardMaterial({color:0x34454a,roughness:.25,metalness:.2}),metal:new T.MeshStandardMaterial({color:0x454a47,roughness:.6,metalness:.7})};
 for(const name of ['wood','timber','stone','roof','thatch'])result[name].userData.surfaceScale=.65;
 const atlas=new Image();atlas.onload=()=>{
  for(const [name,col,row]of [['wood',0,0],['timber',0,0],['stone',1,0],['roof',0,1],['thatch',1,1]]){
   const c=document.createElement('canvas'),side=Math.floor(atlas.width/2);c.width=c.height=side;const ctx=c.getContext('2d');ctx.drawImage(atlas,col*side,row*side,side,side,0,0,side,side);
   const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=8;
   const mat=result[name];mat.map.dispose();mat.map=map;mat.bumpMap=map;mat.bumpScale=name==='stone'?.025:.004;mat.color.set(name==='timber'?0x8c8473:0xffffff);mat.needsUpdate=true;
  }invalidate();
 };atlas.onerror=()=>invalidate();atlas.src=new URL('./architecture-surfaces.webp',import.meta.url).href;
 return result;
}
