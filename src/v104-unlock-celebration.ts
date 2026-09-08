const ACK_KEY='chemlab_ui_v104_unlock_ack';
const CORE_KEY='chemlab_v50';
const unlocks=[{target:3,name:'ION CHROME'},{target:6,name:'VIOLET PHASE'},{target:10,name:'AURUM CORE'}] as const;
type Save={nug?:number};
const readMastery=()=>{try{const save=JSON.parse(localStorage.getItem(CORE_KEY)||'{}') as Save;return Math.max(0,Number(save.nug??0)||0)}catch{return 0}};
const readAck=()=>{try{return Math.max(0,Number(localStorage.getItem(ACK_KEY)||0)||0)}catch{return 0}};
const writeAck=(value:number)=>{try{localStorage.setItem(ACK_KEY,String(value))}catch{}};
const mastery=readMastery();
const ack=readAck();
const newest=[...unlocks].reverse().find(item=>mastery>=item.target&&ack<item.target);
if(newest){
  const toast=document.querySelector<HTMLElement>('#toast');
  if(toast){
    toast.textContent=`COSMETIC UNLOCKED · ${newest.name}`;
    toast.classList.add('show');
    window.setTimeout(()=>toast.classList.remove('show'),3200);
  }
  writeAck(newest.target);
}
export {};
