import test from 'node:test';
import assert from 'node:assert/strict';
import {planHomesteadGardens,drawHomesteadGardens} from '../dist/city-homestead-details.js';

const houses=[{type:'house',x:5,y:5},{type:'house',x:9,y:7},{type:'house',x:4,y:10}];
const roads=Array.from({length:14},(_,i)=>({x:8,y:i+3}));

test('gardens are deterministic and do not overlap houses, roads or one another',()=>{
 const original=JSON.stringify(houses);
 const a=planHomesteadGardens(houses,roads);
 assert.deepEqual(a,planHomesteadGardens(houses,roads));
 assert.ok(a.length>=2);
 assert.equal(JSON.stringify(houses),original);
 for(const p of a){
  assert.ok(p.x>=1 && p.y>=1 && p.x<19 && p.y<19);
  assert.ok(houses.every(h=>Math.abs(h.x-p.x)>=1.45 || Math.abs(h.y-p.y)>=1.45));
  assert.ok(roads.every(r=>Math.abs(r.x-p.x)>=1.05 || Math.abs(r.y-p.y)>=1.05));
 }
 for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)
  assert.ok(Math.abs(a[i].x-a[j].x)>=1.6 || Math.abs(a[i].y-a[j].y)>=1.6);
});

test('gardens avoid trees, construction sites and invalid inputs',()=>{
 const objects=[{type:'house',x:5,y:5},{type:'tree',x:7,y:5},{type:'site',x:5,y:7}];
 const a=planHomesteadGardens(objects,[]);
 assert.ok(a.every(p=>!(p.x===7&&p.y===5)&&!(p.x===5&&p.y===7)));
 assert.deepEqual(planHomesteadGardens(null,[]),[]);
 assert.deepEqual(planHomesteadGardens([],[],0),[]);
});

test('garden drawing is canvas-state balanced and visual-only',()=>{
 const calls=[];
 const ctx=new Proxy({}, {get:(target,key)=>{
   if(key in target)return target[key];
   return (...args)=>calls.push([key,...args]);
 },set:(target,key,value)=>{target[key]=value;return true}});
 const before=JSON.stringify(houses);
 const count=drawHomesteadGardens(ctx,(x,y)=>({x:x*20-y*20,y:(x+y)*10}),houses,roads,.8);
 assert.ok(count>=2);
 assert.equal(calls.filter(c=>c[0]==='save').length,1);
 assert.equal(calls.filter(c=>c[0]==='restore').length,1);
 assert.equal(JSON.stringify(houses),before);
 assert.equal(drawHomesteadGardens(null,()=>({x:0,y:0}),houses,roads,.8),0);
});
