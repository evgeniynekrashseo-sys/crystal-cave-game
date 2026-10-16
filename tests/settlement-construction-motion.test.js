import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assemblySections,constructionCrew,drawConstruction} from '../dist/settlement-construction.js';
import {fieldWorkPoint,fieldCellProgress} from '../dist/settlement-field-layout.js';
import {actorPose} from '../dist/settlement-motion.js';
import {freshCity,upgrade,normalizeCity} from '../dist/settlement-model.js';
test('construction has discrete stationary sections instead of a continuously rising image',()=>{
 assert.equal(assemblySections(.2).length,0);assert.equal(assemblySections(.96).length,12);
 const b={id:1,type:'house',x:0,y:0,level:1,started:0,ready:100,footprint:[1,1]},draws=[];
 const ctx=new Proxy({drawImage:(...v)=>draws.push(v)}, {get:(o,k)=>o[k]||(()=>{})}),image={width:100,height:120};
 for(const t of [45,65,90])drawConstruction(ctx,b,t,(x,y)=>({x:(x-y)*50,y:(x+y)*28}),50,image,null,70,true);
 assert.equal(draws.length,3);for(const d of draws.slice(1))assert.deepEqual(d,draws[0]);
});
test('construction crew carries materials, works, walks back, stays in plot and stops when complete',()=>{
 const b={type:'factory',x:3,y:4,level:2,started:0,ready:100,footprint:[2,2]};
 assert(constructionCrew(b,1)[0].carrying);assert(constructionCrew(b,5)[0].working);assert(constructionCrew(b,9)[0].pose.moving);
 for(let t=0;t<100;t++)for(const p of constructionCrew(b,t)){assert(p.x+.5>=3&&p.x+.5<=5);assert(p.y+.62>=4&&p.y+.62<=6);}
 assert.deepEqual(constructionCrew(b,100),[]);
 assert.deepEqual(constructionCrew(b,1,true),constructionCrew(b,50,true));
});
test('field workers follow Y-aligned beds with continuous row turns and correct tile progress',()=>{
 const b={type:'farm',x:2,y:3,level:1,footprint:[2,2]};
 const p=fieldWorkPoint(b,.1/24),q=fieldWorkPoint(b,.5/24);
 assert.equal(p.x,q.x);assert(q.y>p.y);assert.deepEqual(q.heading,{x:0,y:1});
 const last=fieldWorkPoint(b,.999999);assert(last.x<4&&last.y<5);
 assert.equal(fieldCellProgress(b,0,.75),1);assert.equal(fieldCellProgress(b,1,.75),.5);
});
test('field worker pose is located on the shared beds and points along them',()=>{
 const b={id:1,type:'farm',x:5,y:6,footprint:[2,2],crop:{stage:5,elapsed:12,cycles:0}};
 const a={x:4,y:6,state:'work',path:[],truck:false,distance:0};
 const p=actorPose(a,b,a,1,false);assert.equal(p.farming,'harvesting');
 const q=fieldWorkPoint(b,.5);assert(Math.abs(p.x+.5-q.x)<1e-8);assert(Math.abs(p.y+.62-q.y)<1e-8);
});
test('upgrade persists the original footprint for rendering old architecture during expansion',()=>{
 const c=freshCity();c.buildings=[{id:1,type:'factory',x:6,y:4,level:1,footprint:[2,1],ready:0}];c.roads=[];for(const k in c.resources)c.resources[k]=5000;
 assert(upgrade(c,1));assert.deepEqual(c.buildings[0].constructionFrom,{level:1,footprint:[2,1]});
 assert.deepEqual(normalizeCity(c).buildings[0].constructionFrom,c.buildings[0].constructionFrom);
});

