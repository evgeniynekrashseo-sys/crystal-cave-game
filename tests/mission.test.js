import {test} from 'node:test';import assert from 'node:assert/strict';
import {SUBSTANCES,missionsFor,createMission,formulaMove,settleMission,formulaMatches} from '../dist/mission.js';
import {POOL,normalize} from '../dist/engine.js';
test('completed formulas never return; the next eligible discovery is offered in order',()=>{
 assert.deepEqual(missionsFor(6,POOL,['salt']),[]);
 assert.deepEqual(missionsFor(10,POOL,['salt']).map(q=>q.id),['water']);
 const completed=[];
 for(let level=5;level<=100;level++){
  const quests=missionsFor(level,POOL,completed);
  for(const q of quests){assert(!completed.includes(q.id));completed.push(q.id);}
 }
 assert.deepEqual(completed,SUBSTANCES.map(q=>q.id));
 assert.deepEqual(missionsFor(100,POOL,completed),[]);
 assert.deepEqual(missionsFor(10,['Na','Cl','Fe'],['salt']),[]);
});
test('mission completion survives saves and migrates only the guaranteed legacy salt milestone',()=>{
 const old={level:8,gold:930,discovered:['Na','Cl','Fe','Au']};
 const migrated=normalize(old);
 assert.deepEqual(migrated.completedMissions,['salt']);
 assert.equal(migrated.gold,930);assert(migrated.discovered.includes('Au'));
 assert.deepEqual(normalize({level:5}).completedMissions,[]);
 assert.deepEqual(normalize({level:40}).completedMissions,['salt']);
 assert.deepEqual(normalize({level:40,completedMissions:[]}).completedMissions,[]);
 const saved=normalize({level:12,completedMissions:['salt','water','salt','invalid']});
 assert.deepEqual(saved.completedMissions,['salt','water']);
 assert.deepEqual(normalize(JSON.parse(JSON.stringify(saved))),saved);
});
test('formula quests require discovered elements and grow in number',()=>{assert.equal(missionsFor(4,POOL).length,0);assert.equal(missionsFor(5,['Na','Cl','Fe']).length,1);assert.equal(missionsFor(40,POOL).length,3);assert(missionsFor(50,['Na','Cl']).every(q=>q.id==='salt'))});
test('all quest layouts have a legal clearing solution within budget and seven tubes',()=>{for(let level=5;level<=100;level++)for(const q of missionsFor(level,POOL)){const stage=createMission(q,level,POOL);let t=stage.tubes,claimed=false,n=0;while(!claimed){let moved=false;for(let a=1;a<t.length;a++){const next=formulaMove(t,a,0,q);if(!next)continue;const r=settleMission(next,q,claimed);t=r.tubes;claimed ||=r.formula;n++;moved=true;break;}assert(moved,'recipe atoms must be reachable');}while(t.some(x=>x.length)){let moved=false;for(let a=1;a<t.length&&!moved;a++)for(let b=1;b<t.length;b++){if(!t[b].length)continue;const next=formulaMove(t,a,b,q);if(!next)continue;const r=settleMission(next,q,claimed);t=r.tubes;n++;moved=true;break;}assert(moved,'impurities must clear');}assert(n<=stage.moves);assert.equal(t.length,7);}});
test('reactor rejects excess atoms and wrong elements, and transfers only one atom',()=>{const q=SUBSTANCES.find(q=>q.id==='water');assert.deepEqual(formulaMove([[],['H','H'],['O']],1,0,q),[['H'],['H'],['O']]);assert.equal(formulaMove([['H','H'],['H'],[]],1,0,q),null);assert.equal(formulaMove([[],['Na'],[]],1,0,q),null);assert(formulaMatches(['O','H','H'],q));assert(!formulaMatches(['O','O','H'],q));assert(!settleMission([[],[],[]],q,false).done);});
