(()=>{
  const KEY='cl9_unlock';
  const MIG='cl14_progression_migrated';
  const start=['ruby','emerald','citrine'];
  let unlocked=[];
  try{unlocked=JSON.parse(localStorage.getItem(KEY)||'[]')}catch{}
  if(!Array.isArray(unlocked)||!unlocked.length){
    localStorage.setItem(KEY,JSON.stringify(start));
    return;
  }
  if(!localStorage.getItem(MIG)){
    const all=['ruby','emerald','citrine','sapphire','amethyst','frost','rose'];
    const wasForced=all.every(x=>unlocked.includes(x));
    if(wasForced)localStorage.setItem(KEY,JSON.stringify(start));
    localStorage.setItem(MIG,'1');
  }
})();
