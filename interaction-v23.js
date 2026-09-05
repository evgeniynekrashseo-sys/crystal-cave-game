(()=>{
  const lastPointer=new WeakMap();
  function fire(wrap){
    if(!wrap)return;
    const ev=new Event('pointerup',{bubbles:false,cancelable:true});
    wrap.dispatchEvent(ev);
  }
  document.addEventListener('pointerup',e=>{
    const wrap=e.target.closest?.('.tube-wrap');
    if(wrap)lastPointer.set(wrap,performance.now());
  },true);
  document.addEventListener('touchend',e=>{
    const wrap=e.target.closest?.('.tube-wrap');
    if(!wrap)return;
    const last=lastPointer.get(wrap)||0;
    if(performance.now()-last>120){
      e.preventDefault();
      fire(wrap);
      lastPointer.set(wrap,performance.now());
    }
  },{capture:true,passive:false});
  document.addEventListener('click',e=>{
    const wrap=e.target.closest?.('.tube-wrap');
    if(!wrap)return;
    const last=lastPointer.get(wrap)||0;
    if(performance.now()-last>350){
      e.preventDefault();
      fire(wrap);
      lastPointer.set(wrap,performance.now());
    }
  },true);
})();
