import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import * as model from '../dist/settlement-model.js';
import * as camera from '../dist/settlement-camera.js';

test('real city wiring supports pinch, accurate post-zoom selection and cleanup across reopen',()=>{
 class Element{
  constructor(){this.children=new Map();this.events=new Map();this.dataset={};this.attrs={};this.classes=new Set();this.classList={add:c=>this.classes.add(c),remove:c=>this.classes.delete(c),toggle:(c,on)=>on?this.classes.add(c):this.classes.delete(c)};}
  querySelector(selector){if(!this.children.has(selector))this.children.set(selector,selector==='canvas'?new Canvas():new Element());return this.children.get(selector);}
  querySelectorAll(selector){if(selector==='[data-city-tab]'){if(!this.tabs)this.tabs=['build','tech','life'].map(cityTab=>{const e=new Element();e.dataset.cityTab=cityTab;return e;});return this.tabs;}return [];}
  setAttribute(k,v){this.attrs[k]=v;}insertAdjacentHTML(){}close(){}focus(){}remove(){this.removed=true;}
  addEventListener(k,fn){this.events.set(k,fn);}removeEventListener(k){this.events.delete(k);}
 }
 class Canvas extends Element{clientWidth=430;clientHeight=936;getContext(){return {setTransform(){}};}getBoundingClientRect(){return {left:466,top:0};}setPointerCapture(){}send(name,p){this.events.get(name)({pointerType:'touch',button:0,cancelable:true,preventDefault(){},pointerId:p.id,clientX:p.x+466,clientY:p.y});}}
 const ids=new Map(),body=new Element(),storage=new Map(),window=new Element();let root,renders=0,current;
 body.append=e=>root=e;
 const document={body,hidden:false,createElement:()=>new Element(),getElementById:id=>{if(!ids.has(id))ids.set(id,new Element());return ids.get(id);}};
 const deps={...model,...camera,CITY_RESEARCH:{},mountCityHud:()=>({update(){}}),mapTile:(canvas,zoom,pan,x,y)=>camera.tileAt({width:canvas.clientWidth,height:canvas.clientHeight},{zoom,pan},{x,y}),drawSettlement(ctx,canvas,c,options){current=structuredClone(options);const p=camera.projectPoint({width:canvas.clientWidth,height:canvas.clientHeight},options,3.5,4.5);return [{left:p.x-25,top:p.y-30,width:50,height:40,x:3,y:4}];}};
 const sandbox={...deps,document,window,performance:{now:()=>1000},devicePixelRatio:2,matchMedia:()=>({matches:true}),requestAnimationFrame:()=>1,cancelAnimationFrame(){},setTimeout:()=>1,clearTimeout(){},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)}};
 const source=readFileSync(new URL('../dist/city.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'').replace('export function initCity','function initCity');
 vm.runInNewContext(source+'\nthis.createCity=initCity;',sandbox);
 const city=sandbox.createCity({core:()=>({level:1,gold:0,discovered:['Na','Cl','Fe']}),canOpen:()=>true,render:()=>renders++,trade(){}});
 city.open();let canvas=root.querySelector('canvas');
 assert.equal(canvas.events.size,6);assert.equal(root.querySelector('#city-zoom-value').textContent,'100%');
 canvas.send('pointerdown',{id:1,x:100,y:400});canvas.send('pointerdown',{id:2,x:300,y:400});
 canvas.send('pointermove',{id:1,x:50,y:400});canvas.send('pointermove',{id:2,x:350,y:400});
 assert.equal(root.querySelector('#city-zoom-value').textContent,'150%');
 canvas.send('pointerup',{id:1,x:50,y:400});canvas.send('pointerup',{id:2,x:350,y:400});assert(!root.classes.has('panel-open'));
 // No animation frame ran: selection must rebuild hit bounds using the NEW camera.
 const view={width:430,height:936},c=camera.zoomAt(view,{zoom:1,pan:{x:0,y:0}},1.5,{x:200,y:400});
 const point=camera.projectPoint(view,c,3.5,4.5);
 canvas.send('pointerdown',{id:3,...point});canvas.send('pointerup',{id:3,...point});
 assert.equal(current.zoom,1.5);assert.match(root.querySelector('#city-panel').innerHTML,/Ділянка 4:5 · Будинок · Р1/);assert(root.classes.has('panel-open'));
 root.querySelector('#city-center').onclick();assert.equal(root.querySelector('#city-zoom-value').textContent,'100%');
 root.querySelector('#city-exit').onclick();assert.equal(canvas.events.size,0);assert(!window.events.has('resize'));assert.equal(renders,1);
 city.open();canvas=root.querySelector('canvas');assert.equal(canvas.events.size,6);root.querySelector('#city-zoom-in').onclick();assert.equal(root.querySelector('#city-zoom-value').textContent,'120%');
 root.querySelector('#city-exit').onclick();assert.equal(canvas.events.size,0);assert(storage.has('chemlab_settlement_v2'));
});
