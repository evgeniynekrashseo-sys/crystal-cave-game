import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MIN_ZOOM,MAX_ZOOM,MapGesture,bindMapControls,boundCamera,projectPoint,worldPoint,tileAt,zoomAt} from '../dist/settlement-camera.js';
const view={width:430,height:936};
const close=(a,b)=>assert(Math.abs(a-b)<1e-8,`${a} !== ${b}`);
const same=(a,b)=>{close(a.x,b.x);close(a.y,b.y);};
function fixture(){let camera={zoom:1,pan:{x:0,y:0}};const taps=[];const gesture=new MapGesture({view:()=>view,camera:()=>camera,change:c=>camera=c,tap:p=>taps.push(p)});return {gesture,taps,get camera(){return camera;}};}

test('projection and hit testing share coordinates at every zoom and mobile width',()=>{
 for(const width of [375,390,430,768,1440])for(const zoom of [MIN_ZOOM,1,MAX_ZOOM]){
  const v={width,height:844},c={zoom,pan:{x:-171,y:204}},p={x:7.2,y:4.8};
  const screen=projectPoint(v,c,p.x,p.y);same(worldPoint(v,c,screen),p);assert.deepEqual(tileAt(v,c,screen),{x:7,y:4});
 }
});
test('zoom preserves the world point under the fingers, including a moving centroid',()=>{
 const c={zoom:.8,pan:{x:47,y:-88}},from={x:102,y:340},to={x:151,y:361};
 for(const zoom of [.1,.6,1.9,10]){
  const next=zoomAt(view,c,zoom,from,to);same(worldPoint(view,c,from),worldPoint(view,next,to));
  assert(next.zoom>=MIN_ZOOM&&next.zoom<=MAX_ZOOM);
 }
});
test('one pointer pans in all four directions and a drag never selects a building',()=>{
 for(const delta of [{x:90,y:0},{x:-90,y:0},{x:0,y:90},{x:0,y:-90}]){
  const f=fixture(),start={x:200,y:400},end={x:200+delta.x,y:400+delta.y};
  f.gesture.down(1,start);f.gesture.move(1,end);same(f.camera.pan,delta);f.gesture.up(1,end);assert.equal(f.taps.length,0);
 }
});
test('two independent pointers pinch without losing the first pointer or creating a tap',()=>{
 const f=fixture(),middle={x:150,y:300},world=worldPoint(view,f.camera,middle);
 f.gesture.down(1,{x:100,y:300});f.gesture.down(2,{x:200,y:300});
 f.gesture.move(1,{x:50,y:300});f.gesture.move(2,{x:250,y:300});
 close(f.camera.zoom,2);same(worldPoint(view,f.camera,middle),world);
 const pan={...f.camera.pan};f.gesture.up(2,{x:250,y:300});f.gesture.move(1,{x:70,y:310});
 same(f.camera.pan,{x:pan.x+20,y:pan.y+10});f.gesture.up(1,{x:70,y:310});assert.equal(f.taps.length,0);
 f.gesture.down(3,middle);f.gesture.up(3,middle);assert.equal(f.taps.length,1);
});
test('pinch limits, cancellation and lost capture leave no stuck drag or accidental selection',()=>{
 const f=fixture();f.gesture.down(1,{x:100,y:300});f.gesture.down(2,{x:200,y:300});
 f.gesture.move(1,{x:199,y:300});close(f.camera.zoom,MIN_ZOOM);
 f.gesture.move(1,{x:-1000,y:300});close(f.camera.zoom,MAX_ZOOM);
 f.gesture.cancel(2);const pan={...f.camera.pan};f.gesture.cancel(2);
 f.gesture.move(1,{x:-990,y:310});same(f.camera.pan,{x:pan.x+10,y:pan.y+10});
 f.gesture.up(1,{x:-990,y:310});assert.equal(f.taps.length,0);
 f.gesture.down(4,{x:100,y:400});f.gesture.reset();f.gesture.move(4,{x:600,y:600});f.gesture.up(4,{x:600,y:600});assert.equal(f.taps.length,0);
});
test('camera bounds are symmetric horizontally and permit both vertical directions',()=>{
 for(const zoom of [MIN_ZOOM,1,MAX_ZOOM])for(const extent of [10,20]){
  const left=boundCamera(view,{zoom,pan:{x:-1e9,y:-1e9}},extent),right=boundCamera(view,{zoom,pan:{x:1e9,y:1e9}},extent);
  close(left.pan.x,-right.pan.x);assert(left.pan.y<0&&right.pan.y>0);
 }
});

function boundFixture(){
 let camera={zoom:1,pan:{x:0,y:0}};const handlers=new Map(),taps=[];
 const canvas={getBoundingClientRect:()=>({left:466,top:0}),setPointerCapture(){},addEventListener:(name,fn,options)=>{assert.equal(options.passive,false);handlers.set(name,fn);},removeEventListener:name=>handlers.delete(name)};
 const controls=bindMapControls(canvas,{view:()=>view,camera:()=>camera,change:c=>camera=c,tap:p=>taps.push(p),extent:()=>20});
 let prevented=0;const send=(name,data)=>handlers.get(name)({cancelable:true,preventDefault(){prevented++;},clientX:666,clientY:400,pointerId:1,pointerType:'touch',button:0,deltaMode:0,deltaX:0,deltaY:0,...data});
 return {controls,send,handlers,taps,get camera(){return camera;},get prevented(){return prevented;}};
}
test('native pointer binding uses canvas-local CSS pixels and ignores unrelated pointer movement',()=>{
 const f=boundFixture();f.send('pointerdown',{});f.send('pointermove',{pointerId:7,clientX:1200});same(f.camera.pan,{x:0,y:0});
 f.send('pointermove',{clientX:726,clientY:430});same(f.camera.pan,{x:60,y:30});f.send('pointerup',{clientX:726,clientY:430});assert.equal(f.taps.length,0);
 f.send('pointerdown',{});f.send('pointerup',{});assert.deepEqual(f.taps,[{x:200,y:400}]);assert(f.prevented>0);
});
test('wheel/trackpad pan both axes while ctrl-wheel pinches around the cursor',()=>{
 const f=boundFixture();f.send('wheel',{deltaX:60,deltaY:-40});same(f.camera.pan,{x:-60,y:40});
 f.send('wheel',{deltaX:-60,deltaY:40});same(f.camera.pan,{x:0,y:0});
 const point={x:200,y:400},world=worldPoint(view,f.camera,point);
 f.send('wheel',{ctrlKey:true,deltaY:-80});assert(f.camera.zoom>1);same(worldPoint(view,f.camera,point),world);
});
test('zoom controls interrupt stale gestures and destruction removes every event listener',()=>{
 const f=boundFixture();f.send('pointerdown',{});f.controls.zoom(.2);close(f.camera.zoom,1.2);
 f.send('pointermove',{clientX:1200});same(f.camera.pan,{x:0,y:0});f.send('pointerup',{});assert.equal(f.taps.length,0);
 f.controls.center();assert.deepEqual(f.camera,{zoom:1,pan:{x:0,y:0}});f.controls.destroy();assert.equal(f.handlers.size,0);
});
