import {WorldRenderer} from './renderer.js';
// Read-only save adapter. This workshop must never overwrite the playable city.
const fixture={extent:16,seconds:120,roads:[],buildings:[],agents:[]};
for(let y=2;y<12;y++)fixture.roads.push({x:5,y,level:y>7?2:1});
for(let x=2;x<11;x++)fixture.roads.push({x,y:6,level:1});
[['house',4,3,1],['house',6,4,3],['lumber',4,5,1],['ranch',7,5,1],['farm',8,7,1],['granary',6,8,2],['school',4,8,3],['house',4,10,2],['park',6,10,1]].forEach(([type,x,y,level],id)=>fixture.buildings.push({id,type,x,y,level,ready:0}));
let saved;try{saved=JSON.parse(localStorage.getItem('chemlab_settlement_v2'));}catch{}
const data=saved?.buildings?.length&&new URLSearchParams(location.search).get('save')==='1'?saved:fixture;
const canvas=document.querySelector('canvas');
try{
 const world=new WorldRenderer(canvas,data);window.worldPreview=world;let previous,raf,stopped=false,dirty=true;
 document.querySelector('#status').textContent='Перетягування — огляд · моделі ще в роботі';
 canvas.addEventListener('pointerdown',e=>{previous={x:e.clientX,y:e.clientY,id:e.pointerId};canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(previous?.id!==e.pointerId)return;world.pan(e.clientX-previous.x,e.clientY-previous.y);dirty=true;previous={x:e.clientX,y:e.clientY,id:e.pointerId};});
 const end=()=>previous=null;canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
 canvas.addEventListener('wheel',e=>{e.preventDefault();world.zoom(Math.exp(e.deltaY*.001));dirty=true;},{passive:false});
 document.querySelector('#left').onclick=()=>{world.orbit(-Math.PI/8);dirty=true;};document.querySelector('#right').onclick=()=>{world.orbit(Math.PI/8);dirty=true;};document.querySelector('#in').onclick=()=>{world.zoom(.8);dirty=true;};document.querySelector('#out').onclick=()=>{world.zoom(1.25);dirty=true;};
 addEventListener('resize',()=>{world.resize();dirty=true;});
 function frame(t){if(stopped)return;if(dirty||world.dirty){world.render(t*.001);dirty=false;world.dirty=false;}raf=requestAnimationFrame(frame);}raf=requestAnimationFrame(frame);
 addEventListener('pagehide',()=>{stopped=true;cancelAnimationFrame(raf);world.dispose();},{once:true});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();stopped=true;document.querySelector('#status').textContent='Графічний контекст втрачено. Перезавантаж сторінку.';});
}catch(error){const el=document.querySelector('#error');el.style.display='block';el.textContent='Не вдалося запустити 3D-сцену: '+error.message;throw error;}
