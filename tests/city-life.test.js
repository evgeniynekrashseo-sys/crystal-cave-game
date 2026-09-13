import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freshCity,normalizeCity,build,stats,step,dispatchVoyage,claimCityCoins,demolish,demolitionRefund,cityGoal,claimCityGoal,roadConnections,route} from '../dist/settlement-model.js';
import {animalPose,boatPose,drawRoadNetwork,drawSea} from '../dist/settlement-life.js';
const run=(c,seconds)=>{for(let i=0;i<seconds*10;i++)step(c,.1);};
const rich=()=>{const c=freshCity();for(const k in c.resources)c.resources[k]=500;return c;};

test('school needs a teacher, produces research and increases the real farm output',()=>{
 const plain=rich(),educated=rich();assert.equal(build(educated,'school',6,5),'');
 assert.equal(stats(educated).education,0);run(educated,8);assert.equal(stats(educated).education,20);assert(stats(educated).students>0);
 const before=educated.resources.research;run(educated,60);run(plain,68);
 assert(educated.resources.research>before);assert(educated.resources.food>plain.resources.food-20);
 educated.buildings=educated.buildings.filter(b=>b.type!=='school');assert.equal(stats(educated).education,0);
});

test('coastal fishing requires the shore and workers deliver actual food',()=>{
 const c=rich();const original=JSON.stringify(c);assert.match(build(c,'fishery',6,5),/берег/);assert.equal(JSON.stringify(c),original);
 assert.equal(build(c,'fishery',5,0),'');const food=c.resources.food;run(c,70);assert(c.resources.food>food);
 assert(c.agents.some(a=>c.buildings.some(b=>b.id===a.job&&b.type==='fishery')));
});

test('voyage cargo is charged once, survives reload and awards a single return',()=>{
 let c=rich();c.tech=['preserve'];assert.equal(build(c,'harbor',5,0),'');run(c,8);
 const port=c.buildings.find(b=>b.type==='harbor'),stone=c.resources.stone;
 assert.equal(dispatchVoyage(c,port.id,'market'),'');const sent=JSON.stringify(c);assert(dispatchVoyage(c,port.id,'market'));assert.equal(JSON.stringify(c),sent);
 assert.match(demolish(c,port.x,port.y),/корабля/);run(c,20);c=normalizeCity(JSON.parse(JSON.stringify(c)));assert.equal(c.voyages.length,1);run(c,26);
 assert.equal(c.resources.stone,stone+12);assert.equal(c.completedVoyages,1);assert.equal(c.voyages.length,0);
 assert.equal(claimCityCoins(c),15);assert.equal(claimCityCoins(c),0);
 c=normalizeCity(c);run(c,60);assert.equal(c.completedVoyages,1);assert.equal(claimCityCoins(c),0);
});

test('demolition keeps residents and returns materials plus cargo and reserved inputs',()=>{
 const c=rich();assert.equal(build(c,'ranch',6,5),'');const b=c.buildings.at(-1),refund=demolitionRefund(b),food=c.resources.food,wood=c.resources.wood;
 c.agents=[{id:0,job:b.id,state:'work',path:[],cargo:{stone:3},x:6,y:6,timer:2}];
 assert.equal(demolish(c,b.x,b.y),'');assert.equal(c.resources.food,food+2);assert.equal(c.resources.wood,wood+refund.wood);
 assert.equal(c.agents[0].job,null);assert.equal(c.buildings.some(v=>v.id===b.id),false);assert.equal(c.population,6);
 const current=JSON.stringify(c);assert(demolish(c,b.x,b.y));assert.equal(JSON.stringify(c),current);
 assert.equal(demolish(c,3,4),'');assert.equal(stats(c).housing,4);assert.equal(c.population,6);
});

test('removing a road breaks truck connectivity and reroutes the vehicle as a walker',()=>{
 const c=rich();c.roads=[{x:4,y:5},{x:5,y:5},{x:6,y:5}];c.agents=[{id:0,job:null,x:4,y:5,state:'return',timer:0,truck:true,cargo:{goods:4},path:[{x:5,y:5},{x:6,y:5}]}];
 assert(route(c,{x:4,y:5},{x:6,y:5},true));assert.equal(demolish(c,5,5),'');assert.equal(route(c,{x:4,y:5},{x:6,y:5},true),null);
 assert.equal(c.agents[0].truck,false);assert.equal(c.agents[0].cargo.goods,4);assert(c.agents[0].path.length);
});

test('road turns and junctions meet at the same projected tile edge',()=>{
 const c=rich();c.roads=[{x:4,y:5},{x:5,y:5},{x:4,y:6},{x:4,y:4},{x:3,y:5}];assert.equal(roadConnections(c,c.roads[0]).length,4);
 const lines=[];let start;const ctx={save(){},restore(){},beginPath(){},moveTo(x,y){start={x,y};},lineTo(x,y){lines.push({start,end:{x,y}});},stroke(){},ellipse(){},fill(){}};
 const project=(x,y)=>({x:(x-y)*58,y:(x+y)*32.48});drawRoadNetwork(ctx,c,project,58);
 const midpoint=project(5,5.5),left=project(4.5,5.5),right=project(5.5,5.5);
 assert(lines.some(l=>l.start.x===left.x&&l.end.x===midpoint.x&&l.end.y===midpoint.y));
 assert(lines.some(l=>l.start.x===right.x&&l.end.x===midpoint.x&&l.end.y===midpoint.y));
});

test('animals stay in the paddock, boats stay at sea and reduced motion is stable',()=>{
 const b={id:5,x:6,y:5};for(let t=0;t<200;t+=.7)for(let i=0;i<8;i++){const a=animalPose(b,i,t,false);assert(a.x>=6.24-1e-9&&a.x<=6.76+1e-9);assert(a.y>=5.32-1e-9&&a.y<=5.79+1e-9);}
 assert.deepEqual(animalPose(b,2,0,true),animalPose(b,2,100,true));
 const first=boatPose({x:5,elapsed:0},45),last=boatPose({x:5,elapsed:45},45);assert(Math.abs(first.x-last.x)<1e-10);
 for(let elapsed=0;elapsed<=45;elapsed++){const p=boatPose({x:5,elapsed},45);assert(p.y<0);assert(p.progress>=0&&p.progress<=1);}
});

test('city goals are ordered, reward once and stay claimed after reload',()=>{
 const c=rich();assert.equal(cityGoal(c).id,'stone');assert.equal(claimCityGoal(c),false);
 let site;for(let x=0;x<10&&!site;x++)for(let y=0;y<10&&!site;y++)if(build(c,'quarry',x,y)==='')site={x,y};
 assert(site);run(c,8);assert(claimCityGoal(c));assert.equal(cityGoal(c).id,'school');assert.equal(claimCityCoins(c),10);
 assert(!claimCityGoal(c));const restored=normalizeCity(c);assert.equal(cityGoal(restored).id,'school');assert.equal(claimCityCoins(restored),0);
 const malformed=normalizeCity({...c,voyages:[{kind:'__proto__',x:5,y:0,elapsed:99}]});assert.equal(malformed.voyages.length,0);
});

test('the shore boundary stays fixed while sea highlights animate',()=>{
 const frames=[];const project=(x,y)=>({x:(x-y)*58,y:(x+y)*32});
 for(const time of [0,100]){const points=[];const ctx={save(){},restore(){},beginPath(){},moveTo(x,y){points.push([x,y]);},lineTo(x,y){points.push([x,y]);},closePath(){},fill(){},stroke(){},quadraticCurveTo(){},createLinearGradient(){return{addColorStop(){}};}};
 drawSea(ctx,project,58,time,false,{width:430,height:936});frames.push(points.slice(-2));}
 assert.deepEqual(frames[0],frames[1]);
});
