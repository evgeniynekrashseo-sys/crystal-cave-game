import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import * as camera from '../dist/settlement-camera.js';
import {createMeadow,fillMeadow,GROUND_SIZE,GROUND_DENSITY} from '../dist/settlement-ground.js';
const near=(a,b)=>assert(Math.abs(a-b)<1e-7,`${a} !== ${b}`);
function context(){
 let matrix=[1,0,0,1,0,0];const stack=[],images=[],translations=[],scales=[];let strokes=0;
 const ctx={images,translations,scales,save(){stack.push([...matrix]);},restore(){matrix=stack.pop();},translate(x,y){translations.push([x,y]);matrix[4]+=matrix[0]*x+matrix[2]*y;matrix[5]+=matrix[1]*x+matrix[3]*y;},scale(x,y){scales.push([x,y]);matrix[0]*=x;matrix[1]*=x;matrix[2]*=y;matrix[3]*=y;},rotate(){},drawImage(image,...args){const [x,y,w,h]=args.length===2?[...args,image.width,image.height]:args.length===4?args:args.slice(4);const px=x+w/2,py=y+h;images.push({id:image.id,args,bottom:{x:matrix[0]*px+matrix[2]*py+matrix[4],y:matrix[1]*px+matrix[3]*py+matrix[5]},width:Math.abs(matrix[0]*w)});},createPattern(){return {setTransform(m){ctx.patternMatrix=m;}};},createLinearGradient(){return {addColorStop(){}};},createRadialGradient(){return {addColorStop(){}};},getImageData(x,y,w,h){const data=new Uint8ClampedArray(w*h*4);for(let i=3;i<data.length;i+=4)data[i]=255;return {data};},stroke(){strokes++;},get strokes(){return strokes;}};
 for(const name of ['clearRect','fillRect','beginPath','moveTo','lineTo','closePath','fill','ellipse','arc','quadraticCurveTo','strokeText','fillText'])ctx[name]=()=>{};
 return ctx;
}
function renderer(){
 let id=0;
 const document={createElement:()=>({id:id++,width:0,height:0,getContext:()=>context()})};
 class Image{width=128;height=128;complete=true;naturalWidth=128;}
 const sandbox={Image,URL,document,...camera,createMeadow:()=>({}),fillMeadow};
 const source=readFileSync(new URL('../dist/settlement-renderer.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'').replaceAll('import.meta.url',JSON.stringify('https://unit.test/renderer.js')).replaceAll('export function','function');
 vm.runInNewContext(source+'\nthis.scene={drawSettlement,mapTile};',sandbox);return sandbox.scene;
}
const sceneCity={extent:10,roads:[],buildings:[{id:1,type:'house',x:3,y:4,level:1}],agents:[],seconds:0,tech:[]};
const canvas={clientWidth:430,clientHeight:936};
const view={width:430,height:936};

test('river and bridge use exactly the same world-camera transform as buildings',()=>{
 const scene=renderer(),first=context(),second=context(),a={zoom:1,pan:{x:0,y:0}},b={zoom:1.8,pan:{x:-150,y:100}};
 scene.drawSettlement(first,canvas,sceneCity,{...a,selected:null,tool:null,time:0,reduced:true});
 scene.drawSettlement(second,canvas,sceneCity,{...b,selected:null,tool:null,time:0,reduced:true});
 // Sprite 35 is the bridge (16 building cells, then detail cell 1, two canvases per cell).
 const before=first.images.find(i=>i.id===35),after=second.images.find(i=>i.id===35);assert(before&&after);
 const o=camera.originFor(view);near(after.bottom.x,o.x+(before.bottom.x-o.x)*b.zoom+b.pan.x);near(after.bottom.y,o.y+(before.bottom.y-o.y)*b.zoom+b.pan.y);near(after.width,before.width*b.zoom);
});
test('building floors are anchored to the front of their own grid square, not floating over its centre',()=>{
 const scene=renderer(),ctx=context(),c={zoom:1.7,pan:{x:78,y:-44}};
 const hits=scene.drawSettlement(ctx,canvas,sceneCity,{...c,selected:null,tool:null,time:0,reduced:true});
 const house=hits.find(h=>!h.lab),front=camera.projectPoint(view,c,3.98,4.98);assert(house);
 near(house.left+house.width/2,front.x);near(house.top+house.height,front.y);assert(house.width<camera.unitFor(view.width)*c.zoom*2);
 const picked=scene.mapTile(canvas,c.zoom,c.pan,...Object.values(camera.projectPoint(view,c,3.5,4.5)));assert.equal(picked.x,3);assert.equal(picked.y,4);
});
test('meadow is drawn at native 4x density with individual blades and follows the world camera',()=>{
 const ctx=context(),tile=createMeadow({createElement:()=>({getContext:()=>ctx})});
 assert.equal(tile.width,GROUND_SIZE*GROUND_DENSITY);assert.equal(tile.height,GROUND_SIZE*GROUND_DENSITY);assert(ctx.strokes>=11500);assert.equal(ctx.images.length,0);
 const output=context(),c={zoom:1.6,pan:{x:-70,y:88}},o=camera.originFor(view);fillMeadow(output,tile,view,c,o);
 assert.deepEqual(output.translations,[[o.x+c.pan.x,o.y+c.pan.y]]);assert.deepEqual(output.scales,[[c.zoom,c.zoom]]);assert.equal(output.patternMatrix.a,1/GROUND_DENSITY);
});
test('production meadow keeps every original high-resolution pixel and rejects small blurred crops',()=>{
 const ctx=context(),document={createElement:()=>({getContext:()=>ctx})};
 const texture={id:'material',complete:true,naturalWidth:2048,naturalHeight:2048};
 const tile=createMeadow(document,texture);assert.equal(tile.width,2048);assert.equal(tile.height,2048);
 assert.equal(ctx.images.length,1);assert.deepEqual(ctx.images[0].args,[0,0]);assert.equal(ctx.strokes,0);
 const fallback=context();createMeadow({createElement:()=>({getContext:()=>fallback})},{complete:true,naturalWidth:210,naturalHeight:105});
 assert.equal(fallback.images.length,0);assert(fallback.strokes>=11500);
});
