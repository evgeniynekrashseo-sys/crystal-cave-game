(()=>{
'use strict';
try{
  const xhr=new XMLHttpRequest();
  xhr.open('GET','game-v40-loader.js?v=41',false);
  xhr.send(null);
  if(xhr.status<200||xhr.status>=300)throw new Error('v40 loader '+xhr.status);
  let src=xhr.responseText;
  const oldCurve="function pool(){const d=DISCOVERY.filter(s=>discovered.has(s));let need=3+Math.floor(Math.max(0,S.level-1)/2);if(typeInfo()[1]==='boss')need++;need=Math.min(8,d.length,need);";
  const newCurve="function pool(){const d=DISCOVERY.filter(s=>discovered.has(s));let need=S.level<=3?3:(S.level<=7?4:(S.level<=14?5:6));if(typeInfo()[1]==='boss'&&S.level>=15)need=Math.min(6,need+1);need=Math.min(6,d.length,need);";
  if(!src.includes(oldCurve))throw new Error('V41 curve patch target missing');
  src=src.replace(oldCurve,newCurve).replaceAll('?v=40','?v=41').replace('game-v40-core.js','game-v41-core.js');
  (0,eval)(src+'\n//# sourceURL=game-v41-loader-core.js');
}catch(err){
  console.error('[ChemLab V41]',err);
  const t=document.getElementById('toast');if(t){t.textContent='Помилка завантаження V41';t.classList.add('show')}
}
})();