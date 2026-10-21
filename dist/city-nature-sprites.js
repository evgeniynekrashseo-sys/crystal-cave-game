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
 out.getContext('2d').drawImage(c,l,t,out.width,out.height,0,0,out.width,out.height);return out;
}
export const extractTrees=image=>[0,1,2].map(i=>cropNatureSprite(image,i));
