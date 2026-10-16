// Saved simulation state, independent of frame rate and visual animation.
export const CROP_STAGES = [
  {id:'soil',label:'Підготовка землі',seconds:12,work:true},
  {id:'sowing',label:'Посів',seconds:18,work:true},
  {id:'green',label:'Зелені сходи',seconds:60,work:false},
  {id:'ripening',label:'Дозрівання',seconds:45,work:false},
  {id:'ripe',label:'Готове до жнив',seconds:8,work:true},
  {id:'harvesting',label:'Жнива',seconds:24,work:true}
];
export function cropState(b){
 const raw=b.crop||{};
 const stage=Number.isInteger(raw.stage)&&raw.stage>=0&&raw.stage<CROP_STAGES.length?raw.stage:0;
 return {stage,elapsed:Math.max(0,Math.min(CROP_STAGES[stage].seconds,Number(raw.elapsed)||0)),cycles:Math.max(0,Math.floor(Number(raw.cycles)||0))};
}
export function advanceCrop(b,dt,working=false){
 const s=cropState(b),phase=CROP_STAGES[s.stage];b.crop=s;
 if(phase.work&&!working)return false;
 s.elapsed+=Math.max(0,Math.min(1,Number(dt)||0));
 if(s.elapsed<phase.seconds)return false;
 s.elapsed=0;s.stage++;
 if(s.stage<CROP_STAGES.length)return false;
 s.stage=0;s.cycles++;return true;
}
export function cropVisual(b){
 const s=cropState(b),phase=CROP_STAGES[s.stage];
 return {...s,id:phase.id,label:phase.label,progress:s.elapsed/phase.seconds};
}
