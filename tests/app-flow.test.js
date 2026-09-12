import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import vm from 'node:vm';
import * as engine from '../dist/engine.js';import * as missions from '../dist/mission.js';
test('real app finishes sorting, formula delivery, undo and next experiment without empty-board lock',async()=>{
 const elements=new Map();class Element{constructor(){this.listeners={};this.classList={add(){},remove(){},toggle(){}};this.style={};this.dataset={};this.open=false;}set innerHTML(v){this.html=v;}get innerHTML(){return this.html||'';}addEventListener(k,fn){this.listeners[k]=fn;}close(){this.open=false;}showModal(){this.open=true;}scrollTop=0;append(){}remove(){}getBoundingClientRect(){return{left:0,top:0,width:50,height:150}}}
 const get=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id)};
 const storage=new Map([['chemlab_v50',JSON.stringify({level:5,gold:0,discovered:['Na','Cl','Fe','O','C','H']})],['chemlab_tutorial_v1','1'],['chemlab_sound','false']]);let generated;const delivered=[];
 const sandbox={console,structuredClone,document:{getElementById:get,querySelector:()=>new Element(),querySelectorAll:()=>[],createElement:()=>new Element(),body:new Element()},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},navigator:{vibrate(){}},matchMedia:()=>({matches:true}),setTimeout:fn=>{fn();return 1},crypto:{getRandomValues:a=>{a[0]=72;return a}},window:{},__deps:{...engine,...missions,LiquidRenderer:class{sync(){}async pour(){}},bubblingSound(){},tint:()=> '#00ffcc',NAMES:{},initCity:()=>({open(){},won(){},discover:id=>delivered.push(id)}),initExpansion:api=>({symbols:()=>api.core().discovered.slice(0,4),onStart(){},onMove(){},onWin(){return null},atlas(){}}),createCertifiedLevel:(...args)=>{generated=engine.createCertifiedLevel(...args);return generated;}}};
 const source=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
 vm.runInNewContext('const {'+Object.keys(sandbox.__deps).join(',')+'}=__deps;\n'+source,sandbox);
 const click=async index=>get('board').listeners.click({target:{closest:()=>({dataset:{tube:String(index)}})}});
 for(const [a,b]of generated.waves[0].solution){await click(a);await click(b);}
 assert.match(get('objective').textContent,/склад речовини/);assert.match(get('formula-quest').innerHTML,/NaCl/);
 const q=missions.missionsFor(5,['Na','Cl','Fe','O','C','H'])[0];let t=missions.createMission(q,5,['Na','Cl','Fe','O','C','H']).tubes;
 // Formula input and undo use actual app handlers, so currency/state are rolled back together.
 let a=t.findIndex((v,i)=>i>0&&missions.formulaMove(t,i,0,q));await click(a);await click(0);get('undo').onclick();assert.equal(delivered.length,0);
 let claimed=false;
 while(!claimed){a=t.findIndex((v,i)=>i>0&&missions.formulaMove(t,i,0,q));await click(a);await click(0);const r=missions.settleMission(missions.formulaMove(t,a,0,q),q,claimed);t=r.tubes;claimed ||=r.formula;}
 assert.equal(delivered.length,0,'no city bonus until the remaining impurities are cleared');
 for(a=1;a<t.length;a++)for(let b=1;b<t.length;b++){if(!t[b].length)continue;const next=missions.formulaMove(t,a,b,q);if(!next)continue;await click(a);await click(b);t=missions.settleMission(next,q,true).tubes;}
 assert.deepEqual(delivered,['salt']);assert.equal(JSON.parse(storage.get('chemlab_v50')).level,6);assert.match(get('modalbody').innerHTML,/Експеримент 6/);get('next').onclick();assert.match(get('objective').textContent,/4 однакові/);assert.equal(get('modal').open,false);assert.match(get('board').innerHTML,/data-tube/);assert.equal(delivered.length,1);
});
