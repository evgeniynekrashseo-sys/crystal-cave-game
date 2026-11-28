import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LiquidRenderer,surface} from '../dist/liquid.js';
import {normalizePreferences} from '../dist/preferences.js';

test('liquid keeps waves and bubbles in full mode, resumes after motion changes and app return, and animates pours',async()=>{
 const names=['document','window','matchMedia','requestAnimationFrame','cancelAnimationFrame','innerWidth','innerHeight','devicePixelRatio'];
 const old=Object.fromEntries(names.map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
 const frames=new Map(),events={},mediaEvents={};let id=0,animations=0,cancelled=0,removed=0;
 const media={matches:true,addEventListener:(name,fn)=>mediaEvents[name]=fn};
 const tube={classList:{add(){},remove(){}},getBoundingClientRect:()=>({left:10,top:20,width:50,height:150}),animate(){animations++;return {cancel(){cancelled++}}}};
 try{
  Object.assign(globalThis,{document:{hidden:false,addEventListener:(name,fn)=>events[name]=fn,getElementById:()=>({hidden:false}),querySelector:()=>tube,createElement:()=>({getContext:()=>null,remove(){removed++}}),body:{append(){}}},window:{addEventListener:(name,fn)=>events[name]=fn},matchMedia:()=>media,requestAnimationFrame:fn=>{frames.set(++id,fn);return id},cancelAnimationFrame:key=>frames.delete(key),innerWidth:390,innerHeight:844,devicePixelRatio:2});
  const renderer=new LiquidRenderer(normalizePreferences(null).liquidMotion);
  renderer.draw=()=>{};
  renderer.items=[{tokens:['Na'],wave:surface(),bubbles:[],spawn:1,phase:0,w:50,h:150,unit:34},{tokens:[],wave:surface(),bubbles:[],spawn:0,phase:0,w:50,h:150,unit:34}];
  function frame(now){const entry=frames.entries().next().value;assert(entry,'animation must be scheduled');frames.delete(entry[0]);entry[1](now);}
  renderer.start();frame(100);
  assert.equal(renderer.reduced.matches,false,'explicit full mode remains animated even if OS requests reduced motion');
  assert(renderer.items[0].phase>0);assert.equal(renderer.items[0].bubbles.length,1);
  renderer.setMotion('system');frame(200);assert.equal(frames.size,0,'system reduced motion may sleep');
  media.matches=false;mediaEvents.change();assert(frames.size>0);frame(300);assert(frames.size>0);
  document.hidden=true;events.visibilitychange();assert.equal(frames.size,0);
  document.hidden=false;events.visibilitychange();assert(frames.size>0);
  let sound=0;renderer.setMotion('full');
  const pour=renderer.pour(0,1,[[],['Na']],()=>sound++);
  for(const [key,fn] of [...frames]){frames.delete(key);fn(performance.now()+2000);}
  await pour;
  assert.equal(animations,1);assert.equal(cancelled,1);assert.equal(removed,1);assert.equal(sound,1);
  assert.equal(renderer.items[0].weights,null);assert.equal(renderer.items[1].weights,null);
  renderer.setMotion('reduced');await renderer.pour(0,1,[[],['Na']],()=>sound++);
  assert.equal(animations,1,'reduced mode skips tube travel');assert.equal(sound,2);
  for(const key of frames.keys())frames.delete(key);
  renderer.raf=0;events.pageshow();assert(frames.size>0,'returning from page cache restarts rendering');
 }finally{for(const key of names){if(old[key])Object.defineProperty(globalThis,key,old[key]);else delete globalThis[key]}}
});

test('liquid animation preference survives reload independently of calm city animation',()=>{
 for(const liquidMotion of ['full','reduced','system'])assert.equal(normalizePreferences(JSON.parse(JSON.stringify({liquidMotion,calm:true}))).liquidMotion,liquidMotion);
 assert.equal(normalizePreferences({liquidMotion:'invalid'}).liquidMotion,'full');
});
