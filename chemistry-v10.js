(()=>{
  const REACTIONS=[
    {id:'nacl',name:'Хлорид натрію',formula:'NaCl',equation:'2Na + Cl₂ → 2NaCl',need:['Na','Cl']},
    {id:'h2o',name:'Вода',formula:'H₂O',equation:'2H₂ + O₂ → 2H₂O',need:['H','O']},
    {id:'fe2o3',name:'Оксид заліза(III)',formula:'Fe₂O₃',equation:'4Fe + 3O₂ → 2Fe₂O₃',need:['Fe','O']},
    {id:'co2',name:'Діоксид карбону',formula:'CO₂',equation:'C + O₂ → CO₂',need:['C','O']}
  ];
  const KEY='cl10_chemistry';
  let state;
  try{state=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
  if(!state||typeof state!=='object')state={reaction:0,step:0,products:[]};
  const $=id=>document.getElementById(id);
  const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
  const toast=t=>{const el=$('toast');if(!el)return;el.textContent=t;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),1700)};
  function current(){return REACTIONS[state.reaction%REACTIONS.length]}
  function render(){
    const title=document.querySelector('.station-title');
    const recipe=$('recipe'),text=$('stationText');
    if(title)title.textContent='СТАНЦІЯ СИНТЕЗУ';
    if(!recipe||!text)return;
    const r=current();recipe.innerHTML='';
    r.need.forEach((sym,i)=>{
      if(i){const a=document.createElement('span');a.className='arrow';a.textContent='+';recipe.appendChild(a)}
      const s=document.createElement('div');s.className='slot '+(i<state.step?'done':i===state.step?'next':'');s.textContent=sym;recipe.appendChild(s)
    });
    const arrow=document.createElement('span');arrow.className='arrow';arrow.textContent='→';recipe.appendChild(arrow);
    const product=document.createElement('div');product.className='slot product';product.textContent=r.formula;recipe.appendChild(product);
    text.innerHTML=`${r.equation}<br><span style="opacity:.72">Продукт: ${r.name}</span>`;
  }
  function selectedSymbol(){
    const tube=document.querySelector('.tube.selected');
    if(!tube)return null;
    const layers=[...tube.querySelectorAll('.layer')];
    return layers.length?layers.at(-1).textContent.trim():null;
  }
  function deselect(){const tube=document.querySelector('.tube.selected');if(tube)setTimeout(()=>tube.click(),0)}
  function handleStation(e){
    const station=e.target.closest?.('#station');if(!station)return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.();
    const r=current(),sym=selectedSymbol(),need=r.need[state.step];
    if(!sym)return toast(`Обери зразок ${need}`);
    if(sym!==need){deselect();return toast(`Для ${r.formula} зараз потрібен ${need}`)}
    state.step++;
    if(state.step>=r.need.length){
      if(!state.products.includes(r.id))state.products.push(r.id);
      toast(`Синтезовано ${r.formula} · ${r.name}`);
      state.step=0;state.reaction=(state.reaction+1)%REACTIONS.length;
    } else toast(`${sym} додано до реакції`);
    save();deselect();setTimeout(render,30);
  }
  document.addEventListener('click',handleStation,true);
  const obs=new MutationObserver(render);
  const start=()=>{render();const s=$('station');if(s)obs.observe(s,{childList:true,subtree:true})};
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start):start();
})();
