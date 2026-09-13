import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {inflateSync} from 'node:zlib';
import vm from 'node:vm';
const table=Array.from({length:256},(_,value)=>{for(let i=0;i<8;i++)value=(value&1)?0xedb88320^(value>>>1):value>>>1;return value>>>0;});
const crc=bytes=>{let value=0xffffffff;for(const b of bytes)value=table[(value^b)&255]^(value>>>8);return(value^0xffffffff)>>>0;};
test('every cached PNG has complete chunks, valid CRCs and a fully decodable pixel stream',()=>{
 const root=new URL('../dist/',import.meta.url),sw=readFileSync(new URL('sw.js',root),'utf8');
 const assets=vm.runInNewContext(sw.match(/const ASSETS=(\[[\s\S]*?\]);/)[1]).filter(path=>path.endsWith('.png'));
 for(const asset of assets){
  const bytes=readFileSync(new URL(asset,root));assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a',asset);
  let p=8,ended=false;const data=[];
  while(p<bytes.length){
   assert(p+12<=bytes.length,`${asset}: truncated chunk header`);const length=bytes.readUInt32BE(p),name=bytes.toString('ascii',p+4,p+8);
   assert(p+length+12<=bytes.length,`${asset}: incomplete ${name} chunk`);
   assert.equal(crc(bytes.subarray(p+4,p+8+length)),bytes.readUInt32BE(p+8+length),`${asset}: corrupt ${name} CRC`);
   if(name==='IDAT')data.push(bytes.subarray(p+8,p+8+length));if(name==='IEND'){ended=true;assert.equal(length,0);}p+=length+12;
  }
  assert(ended,`${asset}: missing IEND`);const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20),depth=bytes[24],channels={0:1,2:3,3:1,4:2,6:4}[bytes[25]];
  assert.equal(bytes[28],0,`${asset}: add an Adam7 size validator before accepting interlaced art`);
  assert.equal(inflateSync(Buffer.concat(data)).length,height*(Math.ceil(width*channels*depth/8)+1),`${asset}: incomplete pixels`);
 }
});
