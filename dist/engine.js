const BASE_POOL=['Na','Cl','Fe','O','C','H','Au','Li','He','Be','B','N','F','Ne','Mg','Al','Si','P','S'];
export const POOL=[...BASE_POOL,...'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'.split(' ').filter(s=>!BASE_POOL.includes(s))];

export const clone=x=>x.map(t=>[...t]);
export const solved=t=>t.every(a=>!a.length||(a.length===4&&a.every(v=>v===a[0])));
export const cleared=t=>t.every(a=>!a.length);
export const completeTube=a=>a.length===4&&a.every(v=>v===a[0]);

export function collectCompleted(t){
  const completed=[];
  const tubes=t.map((tube,index)=>{
    if(!completeTube(tube))return [...tube];
    completed.push({index,symbol:tube[0]});
    return [];
  });
  return {tubes,completed};
}

export const completionReward=(level,count=1)=>Math.max(0,Math.floor(count))*(12+Math.min(28,Math.floor((Math.max(1,level)-1)/3)*2));

export function move(t,a,b){
  if(a===b||!t[a]?.length||!t[b]||t[b].length===4)return null;
  const x=t[a].at(-1);
  if(t[b].length&&t[b].at(-1)!==x)return null;
  let n=0;
  for(let i=t[a].length-1;i>=0&&t[a][i]===x;i--)n++;
  n=Math.min(n,4-t[b].length);
  const out=clone(t);
  out[b].push(...out[a].splice(-n));
  return out;
}

const key=t=>t.map(a=>a.join(',')).join('|');
function rng(seed){
  let a=seed>>>0;
  return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};
}

export const symbolCount=level=>level<4?3:level<8?4:level<15?5:level<25?6:level<45?7:8;
export const waveCount=level=>level<15?1:level<25?2:level<45?3:4;

export function difficultyProfile(level){
  const l=Math.max(1,Math.floor(level));
  const symbols=symbolCount(l);
  const moveSlack=Math.max(1,7-Math.floor((l-1)/3));
  const scrambleSteps=Math.min(18+symbols*7,3+symbols+Math.ceil(l*.75));
  let frostTurns=0,catalyst=false,stabilizer=false;

  if(l>=4&&l<8)frostTurns=1;
  else if(l>=8&&l<15){
    catalyst=true;
    frostTurns=l%2===0?1:0;
  }else if(l>=15){
    const mode=(l-15)%4;
    stabilizer=mode===0||mode===3;
    frostTurns=mode===1||mode===3?(l>=30?2:1):0;
    catalyst=mode===2||mode===3;
  }

  return {
    symbols,
    waves:waveCount(l),
    maxTubes:7,
    moveSlack,
    scrambleSteps,
    frostTurns,
    catalyst,
    stabilizer,
    rank:l<4?1:l<8?2:l<15?3:l<25?4:l<45?5:6
  };
}

function certifiedMechanics(start,solution,symbols,level,seed){
  const profile=difficultyProfile(level);
  const incoming=Array.from({length:start.length},()=>new Set());
  let check=clone(start);
  for(const [a,b] of solution){
    incoming[b].add(check[a].at(-1));
    check=move(check,a,b);
    if(!check)return null;
  }
  if(!solved(check))return null;

  const finalTargets=check.map(t=>t.length===4&&t.every(s=>s===t[0])?t[0]:null);
  const mechanics={};
  const random=rng(seed^0x9E3779B9);

  if(profile.frostTurns){
    const untouched=new Set(solution.slice(0,profile.frostTurns).flat());
    const available=start.map((_,i)=>i).filter(i=>!untouched.has(i));
    const meaningful=available.filter(i=>!(start[i].length===4&&start[i].every(symbol=>symbol===start[i][0])));
    const candidates=meaningful.length?meaningful:available;
    if(!candidates.length)return null;
    mechanics.frozen={tube:candidates[Math.floor(random()*candidates.length)],turns:profile.frostTurns};
  }

  if(profile.stabilizer){
    const candidates=finalTargets.map((target,i)=>({tube:i,target}))
      .filter(({tube,target})=>target&&tube!==mechanics.frozen?.tube&&!(start[tube].length===4&&start[tube].every(symbol=>symbol===target))&&[...incoming[tube]].every(symbol=>symbol===target));
    if(!candidates.length)return null;
    mechanics.stabilizer=candidates[Math.floor(random()*candidates.length)];
  }

  if(profile.catalyst){
    const occupied=finalTargets.map((target,i)=>({tube:i,target}))
      .filter(({tube,target})=>target&&!(start[tube].length===4&&start[tube].every(symbol=>symbol===target)));
    const separate=occupied.filter(({tube})=>tube!==mechanics.stabilizer?.tube&&tube!==mechanics.frozen?.tube);
    const candidates=separate.length?separate:occupied;
    const selected=candidates[Math.floor(random()*candidates.length)];
    if(selected)mechanics.catalyst={...selected,bonus:2};
  }

  return mechanics;
}

function certifyClearingPath(start,solution,mechanics,symbols){
  let check=clone(start);
  const state={frozenTurns:mechanics.frozen?.turns||0};
  const clearingSolution=[];
  let collected=0;

  for(const [a,b] of solution){
    const next=moveWithMechanics(check,a,b,mechanics,state);
    // A source can already be empty because its completed element was synthesized.
    if(!next){
      if(!check[a]?.length)continue;
      return null;
    }
    check=next;
    clearingSolution.push([a,b]);
    const settled=collectCompleted(check);
    check=settled.tubes;
    collected+=settled.completed.length;
    if(state.frozenTurns>0)state.frozenTurns--;
  }

  return cleared(check)&&collected===symbols.length?clearingSolution:null;
}

export function createCertifiedPuzzle(symbols,level,seed,recent=[]){
  const profile=difficultyProfile(level);
  for(let attempt=0;attempt<40;attempt++){
    const r=rng(seed+attempt*7919);
    let t=symbols.map(s=>[s,s,s,s]);
    t.push([],[]);
    const solution=[];
    const seen=new Set([key(t)]);

    for(let step=0;step<profile.scrambleSteps;step++){
      const candidates=[];
      for(let a=0;a<t.length;a++)for(let b=0;b<t.length;b++){
        if(a===b||!t[a].length||t[b].length===4)continue;
        const x=t[a].at(-1);
        let run=0;
        for(let i=t[a].length-1;i>=0&&t[a][i]===x;i--)run++;
        for(let n=1;n<=Math.min(run,4-t[b].length);n++){
          const next=clone(t);
          next[b].push(...next[a].splice(-n));
          const back=move(next,b,a);
          if(back&&key(back)===key(t)&&!seen.has(key(next)))candidates.push({next,rev:[b,a]});
        }
      }
      if(!candidates.length)break;
      const selected=candidates[Math.floor(r()*candidates.length)];
      t=selected.next;
      solution.unshift(selected.rev);
      seen.add(key(t));
    }

    if(solved(t)||t.some(completeTube))continue;
    const puzzleKey=key(t);
    if(recent.includes(puzzleKey)&&attempt<39)continue;
    const mechanics=certifiedMechanics(t,solution,symbols,level,seed+attempt*7919);
    if(!mechanics)continue;
    const clearingSolution=certifyClearingPath(t,solution,mechanics,symbols);
    if(!clearingSolution)continue;
    return {tubes:t,solution:clearingSolution,key:puzzleKey,seed,level,mechanics,profile};
  }
  throw Error('No certified puzzle');
}

export function createCertifiedLevel(symbols,level,seed,recent=[]){
  const count=waveCount(level);
  const batchSize=Math.min(5,symbols.length);
  const waves=[];
  for(let i=0;i<count;i++){
    const offset=(i*2)%symbols.length;
    const batch=Array.from({length:batchSize},(_,j)=>symbols[(offset+j)%symbols.length]);
    waves.push(createCertifiedPuzzle(batch,level,(seed+i*0x9E3779B9)>>>0,i===0?recent:[]));
  }
  return {
    level,seed,waves,
    totalGroups:waves.reduce((sum,wave)=>sum+new Set(wave.tubes.flat()).size,0),
    key:waves.map(wave=>wave.key).join('::')
  };
}

export function mechanicBlock(t,a,b,mechanics={},state={}){
  if(state.crossFrozenTurns>0&&(a===state.crossFrozenTube||b===state.crossFrozenTube))return 'cross-frozen';
  if(mechanics.frozen&&state.frozenTurns>0&&(a===mechanics.frozen.tube||b===mechanics.frozen.tube))return 'frozen';
  if(mechanics.stabilizer&&b===mechanics.stabilizer.tube&&t[a]?.at(-1)!==mechanics.stabilizer.target)return 'stabilizer';
  return null;
}

export function moveWithMechanics(t,a,b,mechanics={},state={}){
  return mechanicBlock(t,a,b,mechanics,state)?null:move(t,a,b);
}

export const budget=(p,level)=>Math.max(9,p.solution.length+(p.profile?.moveSlack??difficultyProfile(level).moveSlack));

export const defaults=()=>({
  level:1,gold:0,nug:0,xp:0,score:0,
  discovered:POOL.slice(0,3),
  streak:0,bestStreak:0,recentPuzzles:[]
});

export function normalize(raw){
  const d=defaults();
  if(!raw||typeof raw!=='object')return d;
  for(const k of ['level','gold','nug','xp','score','streak','bestStreak']){
    if(Number.isFinite(raw[k]))d[k]=Math.max(k==='level'?1:0,Math.floor(raw[k]));
  }
  d.discovered=[...new Set([...d.discovered,...(Array.isArray(raw.discovered)?raw.discovered.filter(s=>POOL.includes(s)):[])])];
  d.recentPuzzles=Array.isArray(raw.recentPuzzles)?raw.recentPuzzles.filter(s=>typeof s==='string').slice(-3):[];
  return d;
}
