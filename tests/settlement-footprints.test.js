import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freshCity,build,canPlace,placementError,upgrade,upgradeError,relocate,relocationError,normalizeCity,demolish,route} from '../dist/settlement-model.js';
import {plannedSize,footprintSize,footprintCells,buildingAt} from '../dist/settlement-footprints.js';
import {renderBuildingPanel} from '../dist/city-building-panel.js';
const city=()=>{const c=freshCity();c.extent=32;c.buildings=[];c.roads=[];c.tech=['steel'];for(const k in c.resources)c.resources[k]=5000;return c;};
const spot=(c,type,level=1)=>{for(let y=1;y<20;y++)for(let x=1;x<12;x++)if(!placementError(c,type,x,y,level))return {x,y};throw Error('No plot');};
test('logical areas: houses stay compact, fields add two cells per level, industry expands',()=>{
 assert.deepEqual([1,2,3,4,5].map(l=>plannedSize('farm',l).reduce((a,b)=>a*b)),[4,6,8,10,12]);
 assert.deepEqual(plannedSize('house',5),[1,1]);assert.deepEqual(plannedSize('factory',1),[2,1]);assert.deepEqual(plannedSize('factory',2),[2,2]);
});
test('future obstructions do not prevent construction; upgrade is atomic and can proceed after demolition',()=>{
 const c=city(),p=spot(c,'factory',5),blocker={id:90,type:'house',x:p.x,y:p.y+1,level:1,footprint:[1,1]};
 c.buildings.push(blocker);assert.equal(canPlace(c,'factory',p.x,p.y),'');assert.equal(build(c,'factory',p.x,p.y),'');
 const b=c.buildings.at(-1);b.ready=0;assert.equal(footprintCells(b).length,2);
 const snapshot=JSON.stringify(c);assert.match(upgradeError(c,b),/Розширення неможливе/);assert.equal(upgrade(c,b.id),false);assert.equal(JSON.stringify(c),snapshot);
 assert.equal(demolish(c,blocker.x,blocker.y),'');assert.equal(upgrade(c,b.id),true);assert.equal(footprintCells(b).length,4);
});
test('every occupied cell rejects construction and routing and selects the same building',()=>{
 const c=city(),p=spot(c,'farm');assert.equal(build(c,'farm',p.x,p.y),'');const b=c.buildings.at(-1);
 for(const q of footprintCells(b)){assert.equal(buildingAt(c,q.x,q.y),b);assert(canPlace(c,'road',q.x,q.y));assert.equal(route(c,{x:4,y:5},q),null);}
 const corner=footprintCells(b).at(-1);assert.equal(demolish(c,corner.x,corner.y),'');assert.equal(c.buildings.length,0);
});
test('legacy saves remain compact and relocation retains identity, level and crops',()=>{
 const old=freshCity();delete old.footprintVersion;old.buildings.forEach(b=>delete b.footprint);
 const c=normalizeCity(old);assert(c.buildings.every(b=>footprintCells(b).length===1));
 c.extent=32;const b=c.buildings.find(b=>b.type==='farm');b.crop={stage:3,elapsed:17,cycles:2};const id=b.id,p=spot(c,'farm');
 assert.equal(relocate(c,id,p.x,p.y),'');assert.equal(b.id,id);assert.deepEqual(b.crop,{stage:3,elapsed:17,cycles:2});assert.equal(footprintCells(b).length,4);
 const restored=normalizeCity(JSON.parse(JSON.stringify(c)));assert.deepEqual(footprintSize(restored.buildings.find(v=>v.type==='farm')),[2,2]);
});
test('expansion checks every edge against map bounds, roads, water and reserved lab cells',()=>{
 const c=city();assert(placementError(c,'farm',31,31));
 assert(placementError(c,'factory',13,4));assert(placementError(c,'factory',3,2));
 const p=spot(c,'farm');c.roads.push({x:p.x+1,y:p.y+1});assert.match(placementError(c,'farm',p.x,p.y),/зайнята/);
});
test('relocation failure and active voyages leave the complete save unchanged',()=>{
 const c=city(),p=spot(c,'factory');build(c,'factory',p.x,p.y);const b=c.buildings.at(-1);b.ready=0;
 const before=JSON.stringify(c);assert(relocate(c,b.id,31,31));assert.equal(JSON.stringify(c),before);
 b.type='harbor';c.voyages=[{x:b.x,y:b.y}];assert.match(relocationError(c,b,8,0),/морської/);
});
test('panel explains sizes, future obstruction and relocation without disabling valid initial construction',()=>{
 const c=city(),p=spot(c,'factory',5);c.buildings.push({id:9,type:'house',x:p.x,y:p.y+1,level:1});
 const html=renderBuildingPanel(c,{selected:p,tool:'factory'},()=> 'ціна');
 assert(html.includes('2 × 1'));assert(html.includes('4 × 3'));assert(html.includes('не резервується'));
 assert(!/id="city-place" disabled/.test(html));
});

