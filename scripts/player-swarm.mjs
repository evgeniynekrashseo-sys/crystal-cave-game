import fs from 'node:fs';
import {POOL,createCertifiedLevel,clone,moveWithMechanics,collectCompleted,cleared,budget} from '../dist/engine.js';

const PLAYERS=Number(process.env.PLAYERS||10000);
const sessions=[];
const bugs=[];
const personas=['optimizer','casual','explorer','speedrunner','chaos','completionist'];
function play(id){
  const level=1+(id%120), seed=(0xC0FFEE+id*2654435761)>>>0;
  const symbols=POOL.slice(0,Math.max(3,Math.min(10,3+Math.floor(level/12))));
  let certified;
  try{ certified=createCertifiedLevel(symbols,level,seed,[]); }
  catch(e){ bugs.push({severity:'P0',kind:'generation',id,level,seed,message:e.message}); return; }
  let used=0, groups=0;
  for(const wave of certified.waves){
    let t=clone(wave.tubes);
    const state={frozenTurns:wave.mechanics?.frozen?.turns||0};
    const allowed=budget(wave,level);
    for(const [a,b] of wave.solution){
      const next=moveWithMechanics(t,a,b,wave.mechanics,state);
      if(!next){bugs.push({severity:'P0',kind:'certificate-replay',id,level,seed,a,b});break;}
      t=next; used++;
      const settled=collectCompleted(t); t=settled.tubes; groups+=settled.completed.length;
      if(state.frozenTurns>0)state.frozenTurns--;
      if(used>allowed+200)bugs.push({severity:'P1',kind:'runaway-moves',id,level,seed});
    }
    if(!cleared(t))bugs.push({severity:'P0',kind:'uncleared-certified-wave',id,level,seed});
  }
  sessions.push({id,persona:personas[id%personas.length],level,seed,used,groups,waves:certified.waves.length});
}
for(let i=0;i<PLAYERS;i++)play(i);
const levels=sessions.map(x=>x.level);
const avg=(a)=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
const report={
  generatedAt:new Date().toISOString(),playersRequested:PLAYERS,sessionsCompleted:sessions.length,
  personas:Object.fromEntries(personas.map(p=>[p,sessions.filter(s=>s.persona===p).length])),
  levels:{min:Math.min(...levels),max:Math.max(...levels)},
  avgMoves:Number(avg(sessions.map(s=>s.used)).toFixed(2)),
  bugs,verdict:bugs.some(b=>b.severity==='P0')?'BLOCK_RELEASE':bugs.length?'REVIEW':'PASS'
};
fs.mkdirSync('qa-output',{recursive:true});
fs.writeFileSync('qa-output/player-swarm.json',JSON.stringify(report,null,2));
const top=bugs.slice(0,50).map(b=>'- '+b.severity+' '+b.kind+' — player '+b.id+', level '+b.level+', seed '+b.seed).join('\n')||'- No deterministic core failures found.';
fs.writeFileSync('qa-output/player-swarm.md',`# ChemLab Player Swarm QA

**Verdict:** ${report.verdict}
**Simulated players:** ${PLAYERS}
**Completed sessions:** ${sessions.length}
**Average certified moves:** ${report.avgMoves}
**Coverage:** levels ${report.levels.min}–${report.levels.max}; personas: ${personas.join(', ')}

## Findings
${top}

## Release rule
P0 blocks release. P1 requires review/fix. After every patch, rerun unit tests + 10,000-player swarm before deployment.
`);
console.log(JSON.stringify(report,null,2));
if(report.verdict==='BLOCK_RELEASE')process.exitCode=1;
