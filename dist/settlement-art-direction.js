// Single camera/material family; logical building levels remain unchanged.
export const COHERENT_KEYS=['home1','home2','home3','home4','lumber1','factory1','lab1','ranch1','lumber2','factory2','lab2','ranch2','school1','school2','granary1','granary2'];
export function coherentKey(b){
 if(!b)return null;
 if(b.type==='house')return 'home'+(b.level>=5?4:b.level>=3?3:b.level===2?2:1);
 if(b.type==='factory')return 'factory'+(b.level>=3?2:1);
 if(['lumber','ranch','school','granary'].includes(b.type))return b.type+(b.level>=3?2:1);
 return null;
}
