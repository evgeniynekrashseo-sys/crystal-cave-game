import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
  POOL,move,cleared,collectCompleted,completionReward,levelOutcome,createCertifiedPuzzle,createCertifiedLevel,budget,symbolCount,waveCount,normalize,
  difficultyProfile,mechanicBlock,moveWithMechanics
} from '../dist/engine.js';

test('production puzzles are certified, deterministic and preserve tokens',()=>{
  for(const level of [1,4,8,15,25,45,80])for(let seed=0;seed<50;seed++){
    const p=createCertifiedPuzzle(POOL.slice(0,symbolCount(level)),level,seed);
    let t=p.tubes,collected=0;
    const state={frozenTurns:p.mechanics.frozen?.turns||0};
    assert(!cleared(t));
    assert.equal(t.some(a=>a.length===4&&a.every(v=>v===a[0])),false);
    const inventory=t.flat().sort();
    assert.equal(inventory.length,symbolCount(level)*4);
    for(const [a,b] of p.solution){
      t=moveWithMechanics(t,a,b,p.mechanics,state);
      assert(t,'the certified path must respect its level modifiers');
      if(state.frozenTurns>0)state.frozenTurns--;
      assert(t.every(a=>a.length<=4));
      const result=collectCompleted(t);
      collected+=result.completed.length;
      t=result.tubes;
      assert.equal(t.flat().length,inventory.length-collected*4);
    }
    assert(cleared(t));
    assert.equal(collected,symbolCount(level));
    assert(budget(p,level)>p.solution.length);
    assert.deepEqual(p,createCertifiedPuzzle(POOL.slice(0,symbolCount(level)),level,seed));
  }
});

test('completed elements disappear and award level-scaled coins',()=>{
  const input=[['Na','Na','Na','Na'],['Cl','Fe'],['Cl','Cl','Cl','Cl'],[]];
  const result=collectCompleted(input);
  assert.deepEqual(result.completed,[{index:0,symbol:'Na'},{index:2,symbol:'Cl'}]);
  assert.deepEqual(result.tubes,[[],['Cl','Fe'],[],[]]);
  assert.deepEqual(input,[['Na','Na','Na','Na'],['Cl','Fe'],['Cl','Cl','Cl','Cl'],[]]);
  assert.equal(completionReward(1,2),28);
  assert(completionReward(25)>completionReward(1));
});

test('advanced levels add waves without adding more than seven tubes',()=>{
  for(const level of [1,15,25,45]){
    const symbols=POOL.slice(0,symbolCount(level));
    const run=createCertifiedLevel(symbols,level,90210);
    assert.equal(run.waves.length,waveCount(level));
    assert(run.waves.every(wave=>wave.tubes.length<=7));
    assert.equal(run.totalGroups,run.waves.reduce((sum,wave)=>sum+new Set(wave.tubes.flat()).size,0));
    assert.deepEqual(run,createCertifiedLevel(symbols,level,90210));
  }
});

test('an empty rack always advances a wave or completes the level',()=>{
  assert.equal(levelOutcome([[],[]],0,1),'win');
  assert.equal(levelOutcome([[],[]],0,3),'wave');
  assert.equal(levelOutcome([[],[]],2,3),'win');
  assert.equal(levelOutcome([['Na'],[]],0,1),'continue');
});

test('difficulty grows instead of plateauing after level 15',()=>{
  const early=difficultyProfile(1),mid=difficultyProfile(15),late=difficultyProfile(45);
  assert.equal(early.symbols,3);
  assert.equal(mid.symbols,6);
  assert.equal(late.symbols,8);
  assert.equal(early.waves,1);
  assert.equal(mid.waves,2);
  assert.equal(late.waves,4);
  assert.equal(late.maxTubes,7);
  assert(early.scrambleSteps<mid.scrambleSteps);
  assert(mid.scrambleSteps<late.scrambleSteps);
  assert(early.moveSlack>mid.moveSlack);
  assert(mid.moveSlack>late.moveSlack);
  assert(difficultyProfile(4).frostTurns>0);
  assert(difficultyProfile(8).catalyst);
  assert(difficultyProfile(15).stabilizer);
  const combined=difficultyProfile(18);
  assert(combined.frostTurns&&combined.catalyst&&combined.stabilizer);
  assert.equal(symbolCount(95),10);
  assert.equal(waveCount(95),6);
  assert(completionReward(45)>completionReward(1));
});

test('level modifiers block only their declared moves',()=>{
  const tubes=[['Na'],['Cl'],[]];
  const mechanics={frozen:{tube:2,turns:1},stabilizer:{tube:1,target:'Cl'}};
  assert.equal(mechanicBlock(tubes,0,2,mechanics,{frozenTurns:1}),'frozen');
  assert.equal(mechanicBlock(tubes,0,1,mechanics,{frozenTurns:0}),'stabilizer');
  assert.equal(mechanicBlock(tubes,1,2,mechanics,{frozenTurns:0}),null);
  assert.deepEqual(moveWithMechanics(tubes,1,2,mechanics,{frozenTurns:0}),[['Na'],[],['Cl']]);
});

test('moves transfer the maximal matching run, reject illegal actions, never mutate',()=>{
  const t=[['Na','Cl','Cl'],['Cl','Cl','Cl'],[]];
  assert.deepEqual(move(t,0,1),[['Na','Cl'],['Cl','Cl','Cl','Cl'],[]]);
  assert.deepEqual(move(t,0,2),[['Na'],['Cl','Cl','Cl'],['Cl','Cl']]);
  assert.equal(move(t,0,0),null);
  assert.equal(move(t,2,1),null);
  assert.equal(move([['Na'],['Cl']],0,1),null);
  assert.deepEqual(t,[['Na','Cl','Cl'],['Cl','Cl','Cl'],[]]);
});

test('legacy saves preserve progression and normalize bad fields',()=>{
  assert.equal(normalize({level:20,gold:930,nug:9,xp:120,score:1000,discovered:['Au','Na']}).gold,930);
  assert.equal(normalize({level:-1}).level,1);
  assert.deepEqual(normalize({discovered:['bad']}).discovered,['Na','Cl','Fe']);
});

test('anti repeat and exact retry',()=>{
  const p=createCertifiedPuzzle(POOL.slice(0,3),1,48);
  const q=createCertifiedPuzzle(POOL.slice(0,3),1,48,[p.key]);
  assert.notEqual(p.key,q.key);
  assert.deepEqual(p,createCertifiedPuzzle(POOL.slice(0,3),1,48));
});
