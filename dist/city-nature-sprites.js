// Fixed-column atlas crops can clip a tree crown at a perfectly vertical edge.
// Fade only a sustained opaque border; transparent silhouettes stay unchanged.
export function featherClippedSpriteEdges(pixels,width,height){
 if(width<8||height<8)return {left:false,right:false};
 const countOpaqueEdge=x=>{
  let count=0;
  for(let y=0;y<height;y++)if(pixels[(y*width+x)*4+3]>80)count++;
  return count;
 };
 const minRows=Math.max(4,Math.ceil(height*.18));
 const left=countOpaqueEdge(0)>=minRows;
 const right=countOpaqueEdge(width-1)>=minRows;
 if(!left&&!right)return {left:false,right:false};
 const band=Math.max(3,Math.min(Math.round(width*.16),64,Math.floor(width/3)));
 for(let y=0;y<height;y++)for(let i=0;i<band;i++){
  const t=i/(band-1),opacity=t*t*(3-2*t);
  if(left){const at=(y*width+i)*4+3;pixels[at]=Math.round(pixels[at]*opacity);}
  if(right){const at=(y*width+width-1-i)*4+3;pixels[at]=Math.round(pixels[at]*opacity);}
 }
 return {left,right};
}

export function cropNatureSprite(image,column){
 if(!image.complete||!image.naturalWidth)return null;
 const x=Math.round(column*image.naturalWidth/4),r=Math.round((column+1)*image.naturalWidth/4);
 const y=0,b=Math.round(image.naturalHeight*.295),w=r-x,h=b-y;
 const c=document.createElement('canvas');c.width=w;c.height=h;
 const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(image,x,y,w,h,0,0,w,h);
 const a=g.getImageData(0,0,w,h).data;let l=w,t=h,rr=-1,bb=-1,clear=0;
 for(let i=0;i<a.length;i+=4){if(a[i+3]<18){clear++;continue;}
 const px=(i/4)%w,py=Math.floor(i/4/w);
 l=Math.min(l,px);t=Math.min(t,py);rr=Math.max(rr,px);bb=Math.max(bb,py);}
 if(rr<l||bb<t||clear<a.length/4*.02)return null;
 const out=document.createElement('canvas');out.width=rr-l+1;out.height=bb-t+1;
 const og=out.getContext('2d',{willReadFrequently:true});
 og.drawImage(c,l,t,out.width,out.height,0,0,out.width,out.height);
 const cutout=og.getImageData(0,0,out.width,out.height);
 const softened=featherClippedSpriteEdges(cutout.data,out.width,out.height);
 if(softened.left||softened.right)og.putImageData(cutout,0,0);
 return out;
}
export const extractTrees=image=>[0,1,2].map(i=>cropNatureSprite(image,i));
