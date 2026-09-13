// Mechanical PNG repair: retain decoded release-16 pixels, recover the missing
// bottom rows from the original atlas, and re-encode a complete checked PNG.
// Usage: node scripts/restore-city-atlases.mjs /absolute/path/to/details-original.png
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {inflateSync,constants} from 'node:zlib';
import {resolve} from 'node:path';

function chunks(bytes){
 const data=[];let p=8;
 while(p+8<=bytes.length){const n=bytes.readUInt32BE(p),name=bytes.toString('ascii',p+4,p+8);if(name==='IDAT')data.push(bytes.subarray(p+8,Math.min(p+8+n,bytes.length)));p+=n+12;}
 return Buffer.concat(data);
}
const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
function unfilter(raw,width,rows){
 const stride=width*4,out=Buffer.alloc(stride*rows);
 for(let y=0;y<rows;y++){
  const filter=raw[y*(stride+1)];
  if(filter>4)throw Error('Unsupported PNG row filter');
  for(let x=0;x<stride;x++){
   const i=y*stride+x,a=x>=4?out[i-4]:0,b=y?out[i-stride]:0,c=y&&x>=4?out[i-stride-4]:0;
   const predictor=[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][filter];
   out[i]=(raw[y*(stride+1)+x+1]+predictor)&255;
  }
 }
 return out;
}
function restore(target,source){
 const before=readFileSync(target);
 const width=before.readUInt32BE(16),height=before.readUInt32BE(20),stride=width*4+1;
 if(before[24]!==8||before[25]!==6||before[28]!==0)throw Error('Expected non-interlaced 8-bit RGBA atlas');
 try{if(inflateSync(chunks(before)).length===stride*height&&before.subarray(-8,-4).toString()==='IEND'){console.log(`${target}: already complete`);return;}}catch{}
 const original=readFileSync(source);
 if(original.readUInt32BE(16)!==width||original.readUInt32BE(20)!==height)throw Error('Original and damaged atlas dimensions differ');
 const partial=inflateSync(chunks(before),{finishFlush:constants.Z_SYNC_FLUSH});
 const preserved=Math.floor(partial.length/stride);
 const pixels=execFileSync('convert',[source,'-depth','8','rgba:-'],{maxBuffer:32*1024*1024});
 if(pixels.length!==width*height*4)throw Error('Original atlas failed full decode');
 // Only recovered rows need the original magenta matte removed.
 for(let p=preserved*width*4;p<pixels.length;p+=4){
  const r=pixels[p],g=pixels[p+1],b=pixels[p+2];
  if(r>205&&b>205&&g<70)pixels[p+3]=0;
  else if(Math.min(r,b)-g>110&&r>170&&b>170){pixels[p+3]=Math.min(255,Math.max(0,g*4));pixels[p]=Math.max(g,r-70);pixels[p+2]=Math.max(g,b-70);}
 }
 unfilter(partial,width,preserved).copy(pixels,0);
 const encoded=execFileSync('convert',['-size',`${width}x${height}`,'-depth','8','rgba:-','-define','png:color-type=6','-define','png:exclude-chunks=date,time','png:-'],{input:pixels,maxBuffer:32*1024*1024});
 if(inflateSync(chunks(encoded)).length!==stride*height||encoded.subarray(-8,-4).toString()!=='IEND')throw Error('Repair failed full PNG validation');
 writeFileSync(target,encoded);
 console.log(`${target}: ${preserved} existing rows retained exactly; ${height-preserved} recovered; complete PNG (${encoded.length} bytes)`);
}
if(!process.argv[2])throw Error('Pass the original details atlas path; no files were changed');
restore(resolve('dist/settlement-sprites-alpha.png'),resolve('dist/settlement-sprites.png'));
restore(resolve('dist/settlement-details-alpha.png'),resolve(process.argv[2]));
