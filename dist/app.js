import {LiquidRenderer,bubblingSound} from './liquid.js';
import {initExpansion} from './expansion.js';
import {tint,NAMES} from './progression.js';
import {clone,cleared,collectCompleted,completionReward,createCertifiedLevel,budget,normalize,mechanicBlock,moveWithMechanics} from './engine.js';
const $=id=>document.getElementById(id);let save;try{save=normalize(JSON.parse(localStorage.getItem('chemlab_v50')))}catch{save=normalize(null)}
const liquid=new LiquidRenderer();
let world;let levelRun,puzzle,waveIndex=0,tubes,moves,history=[],selected=-1,assisted=false,reserve=false,locked=false,ended=false,seed=0,sound=true,ctx,storageWarn=false,mechanicState={frozenTurns:0,catalystClaimed:false,completed:0,crossFrozenTurns:0,crossFrozenTube:-1};
const persist=()=>{try{localStorage.setItem('chemlab_v50',JSON.stringify(save))}catch{storageWarn=true;}};
const say=s=>$('feedback').textContent=s;
function tone(f=500){if(!sound)return;try{ctx??=new (window.AudioContext||window.webkitAudioContext)();ctx.resume();const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(f,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(f*.55,ctx.currentTime+.15);g.gain.setValueAtTime(.045,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.2);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+.21)}catch{}}
function gurgle(){if(!sound)return;try{ctx??=new (window.AudioContext||window.webkitAudioContext)();ctx.resume().catch(()=>{});bubblingSound(ctx)}catch{}}
function newSeed(){return crypto.getRandomValues(new Uint32Array(1))[0]}
function waveState(completed=mechanicState.completed||0){return{frozenTurns:puzzle.mechanics.frozen?.turns||0,catalystClaimed:false,completed,crossFrozenTurns:0,crossFrozenTube:-1};}
function start(exact=false){if(locked)return;seed=exact?seed:newSeed();const symbols=world.symbols();if(!exact||!levelRun||levelRun.level!==save.level)levelRun=createCertifiedLevel(symbols,save.level,seed,exact?[]:save.recentPuzzles);waveIndex=0;puzzle=levelRun.waves[waveIndex];tubes=clone(puzzle.tubes);moves=levelRun.waves.reduce((sum,wave)=>sum+budget(wave,save.level),0);history=[];selected=-1;assisted=false;reserve=false;ended=false;mechanicState={frozenTurns:puzzle.mechanics.frozen?.turns||0,catalystClaimed:false,completed:0,crossFrozenTurns:0,crossFrozenTube:-1};save.recentPuzzles=[...save.recentPuzzles.filter(k=>k!==levelRun.key),levelRun.key].slice(-3);persist();world.onStart();$('modal').close();render();say(storageWarn?'Збереження недоступне у цьому браузері':'Торкнись колби, потім обери, куди перелити');}
function mechanicTags(){
 const tags=[`Складність ${'◆'.repeat(puzzle.profile.rank)}`];
 if(levelRun.waves.length>1)tags.push(`Хвиля ${waveIndex+1} / ${levelRun.waves.length}`);
 if(puzzle.mechanics.frozen)tags.push(mechanicState.frozenTurns?`❄ Кріо-замок · ${mechanicState.frozenTurns} ${mechanicState.frozenTurns===1?'хід':'ходи'}`:'✓ Кріо-замок відкрито');
 if(puzzle.mechanics.catalyst)tags.push(`✦ Каталізатор ${puzzle.mechanics.catalyst.target} · +${puzzle.mechanics.catalyst.bonus} ходи`);
 if(puzzle.mechanics.stabilizer)tags.push(`⇣ Стабілізатор приймає лише ${puzzle.mechanics.stabilizer.target}`);
 return tags;
}
function advanceMechanics(){
 const notices=[];
 if(mechanicState.frozenTurns>0){
   mechanicState.frozenTurns--;
   if(!mechanicState.frozenTurns)notices.push('❄ Кріо-замок відкрито');
 }
 if(mechanicState.crossFrozenTurns>0){
   mechanicState.crossFrozenTurns--;
   if(!mechanicState.crossFrozenTurns){notices.push('❄ Реакційний лід розтанув');mechanicState.crossFrozenTube=-1;}
 }
 const catalyst=puzzle.mechanics.catalyst;
 if(catalyst&&!mechanicState.catalystClaimed){
   const tube=tubes[catalyst.tube];
   if(tube?.length===4&&tube.every(s=>s===catalyst.target)){
     mechanicState.catalystClaimed=true;
     moves+=catalyst.bonus;
     notices.push(`✦ Каталізатор: +${catalyst.bonus} ходи`);
     tone(720);
   }
 }
 return notices.join(' · ');
}
async function synthesisFx(completed,rewardEach){
 const duration=matchMedia('(prefers-reduced-motion: reduce)').matches?160:760;
 for(const {index,symbol} of completed){
   const tube=document.querySelector(`[data-tube="${index}"]`);
   if(!tube)continue;
   tube.classList.add('synthesizing');
   const rect=tube.getBoundingClientRect(),fx=document.createElement('div');
   fx.className='synthesis-reward';
   fx.style.left=`${rect.left+rect.width/2}px`;
   fx.style.top=`${rect.top+rect.height*.38}px`;
   fx.innerHTML=`<b>+${rewardEach} ✦</b><small>${symbol} · СИНТЕЗ</small>`;
   document.body.append(fx);
   setTimeout(()=>fx.remove(),duration+180);
 }
 navigator.vibrate?.([18,35,28]);
 tone(940);
 await new Promise(resolve=>setTimeout(resolve,duration));
}
async function refillWave(){
 const completed=mechanicState.completed;
 waveIndex++;
 puzzle=levelRun.waves[waveIndex];
 tubes=clone(puzzle.tubes);
 if(reserve)tubes.push([]);
 mechanicState=waveState(completed);
 selected=-1;
 render();
 $('board').classList.add('refilling');
 tone(610);
 await new Promise(resolve=>setTimeout(resolve,matchMedia('(prefers-reduced-motion: reduce)').matches?120:620));
 $('board').classList.remove('refilling');
 render();
}
function render(){
 const complete=mechanicState.completed||0;
 $('gold').textContent=save.gold;
 $('level').textContent=String(save.level).padStart(2,'0');
 $('moves').textContent=moves;
 $('completed').textContent=`${complete} / ${levelRun.totalGroups}`;
 $('mastery').textContent=save.nug;
 $('discovered').textContent=`${save.discovered.length} / 118`;
 $('chapter').textContent=save.level<4?'РОЗДІЛ I · ПЕРШЕ СВІТЛО':save.level<8?'РОЗДІЛ II · СПЕКТР':save.level<15?'РОЗДІЛ III · РЕЗОНАНС':save.level<25?'РОЗДІЛ IV · ВЕЛИКИЙ СИНТЕЗ':save.level<45?'РОЗДІЛ V · ЛАНЦЮГОВА РЕАКЦІЯ':'РОЗДІЛ VI · КВАНТОВИЙ РУБІЖ';
 $('level-modifier').innerHTML=mechanicTags().map(tag=>`<span>${tag}</span>`).join('');
 $('game').dataset.density=tubes.length>=9?'dense':'normal';
 $('undo').disabled=!history.length||locked||ended;
 $('reserve').disabled=reserve||locked||ended;
 $('hint').disabled=locked||ended;
 $('restart').disabled=locked;
 $('board').innerHTML=tubes.map((t,i)=>{
   const done=t.length===4&&t.every(s=>s===t[0]);
   const frozen=(puzzle.mechanics.frozen?.tube===i&&mechanicState.frozenTurns>0)||(mechanicState.crossFrozenTube===i&&mechanicState.crossFrozenTurns>0);
   const catalyst=puzzle.mechanics.catalyst?.tube===i&&!mechanicState.catalystClaimed;
   const gate=puzzle.mechanics.stabilizer?.tube===i;
   const badge=frozen?'❄':gate?`⇣${puzzle.mechanics.stabilizer.target}`:catalyst?`✦${puzzle.mechanics.catalyst.target}`:'';
   const note=frozen?', кріо-замок':gate?`, стабілізатор лише для ${puzzle.mechanics.stabilizer.target}`:catalyst?', каталізатор':'';
   return `<button class="tube-wrap ${selected===i?'selected':''} ${done?'done':''} ${frozen?'frozen-tube':''} ${catalyst?'catalyst-tube':''} ${gate?'gate-tube':''}" data-tube="${i}" aria-label="Колба ${i+1}: ${t.length?t.join(', '):'порожня'}${note}" aria-pressed="${selected===i}" ${frozen?'aria-disabled="true"':''}><span class="rim"></span><span class="tube"><canvas class="liquid-canvas" aria-hidden="true"></canvas>${t.map(s=>`<span class="token" style="--c:${tint(s)}">${s}</span>`).join('')}</span>${badge?`<span class="tube-badge">${badge}</span>`:''}<span class="tube-number">${done?'✓':String(i+1).padStart(2,'0')}</span></button>`;
 }).join('');
 liquid.sync(tubes,selected);
}
$('board').addEventListener('click',async e=>{
 const button=e.target.closest('[data-tube]');
 if(!button||locked||ended)return;
 const b=Number(button.dataset.tube);
 const frozen=(puzzle.mechanics.frozen?.tube===b&&mechanicState.frozenTurns>0)||(mechanicState.crossFrozenTube===b&&mechanicState.crossFrozenTurns>0);
 if(selected<0){
   if(frozen){const turns=mechanicState.crossFrozenTube===b?mechanicState.crossFrozenTurns:mechanicState.frozenTurns;say(`❄ Колба ${b+1} відкриється через ${turns} ${turns===1?'успішний хід':'успішні ходи'}`);tone(190);return;}
   if(tubes[b].length){selected=b;tone(420);render();say(`Колба ${b+1} обрана · обери колбу з ${tubes[b].at(-1)} або порожню`);}
   return;
 }
 if(selected===b){selected=-1;render();return;}
 const a=selected,block=mechanicBlock(tubes,a,b,puzzle.mechanics,mechanicState);
 const next=moveWithMechanics(tubes,a,b,puzzle.mechanics,mechanicState);
 if(!next){
   const sourceSymbol=tubes[a]?.at(-1),targetSymbol=tubes[b]?.at(-1);
   if(!['frozen','cross-frozen'].includes(block)&&sourceSymbol&&targetSymbol&&sourceSymbol!==targetSymbol){
     const reaction=world.crossReaction(sourceSymbol,targetSymbol);
     if(reaction){
       selected=-1;
       if(reaction.recipe.type==='freeze'){mechanicState.crossFrozenTube=b;mechanicState.crossFrozenTurns=1;}
       if(reaction.recipe.type==='blast')moves++;
       render();
       say(`⚗ Крос-реакція: ${reaction.text}${reaction.recipe.type==='blast'?' · +1 хід':''}${reaction.recipe.type==='freeze'?' · колбу заморожено на 1 хід':''}`);
       return;
     }
   }
   if(block==='frozen')say(`❄ Кріо-замок ще активний: ${mechanicState.frozenTurns} ${mechanicState.frozenTurns===1?'хід':'ходи'}`);
   else if(block==='cross-frozen')say('❄ Колба заморожена крос-реакцією до наступного успішного ходу');
   else if(block==='stabilizer')say(`⇣ Стабілізатор цієї колби приймає лише ${puzzle.mechanics.stabilizer.target}`);
   else{
     if(tubes[b].length&&!frozen)selected=b;
     say('Переливай на такий самий елемент або в порожню колбу');
   }
   render();tone(160);return;
 }
 locked=true;
 history.push({tubes:clone(tubes),moves,gold:save.gold,waveIndex,mechanicState:{...mechanicState}});
 navigator.vibrate?.(12);
 try{await liquid.pour(a,b,next,gurgle)}catch{gurgle();}
 tubes=next;
 moves--;
 selected=-1;
 const mechanicNotice=advanceMechanics();
 const synthesis=collectCompleted(tubes);
 let synthesisNotice='';
 if(synthesis.completed.length){
   const rewardEach=completionReward(save.level);
   render();
   await synthesisFx(synthesis.completed,rewardEach);
   tubes=synthesis.tubes;
   mechanicState.completed+=synthesis.completed.length;
   const reward=completionReward(save.level,synthesis.completed.length);
   save.gold+=reward;
   persist();
   synthesisNotice=`⚗ Чистий синтез: +${reward} монет`;
 }
 world.onMove();
 if(cleared(tubes)&&waveIndex<levelRun.waves.length-1){
   await refillWave();
   locked=false;
   render();
   say(`Нова хвиля ${waveIndex+1} / ${levelRun.waves.length} · у колбах з’явилися нові елементи`);
   return;
 }
 locked=false;
 render();
 if(cleared(tubes))win();
 else if(moves<=0)lose();
 else say([synthesisNotice,mechanicNotice].filter(Boolean).join(' · ')||'Добре! Продовжуй збирати однакові елементи');
});
function modal(html){$('modal').classList.remove('wide');$('modalbody').innerHTML=html;if(!$('modal').open)$('modal').showModal();$('modal').scrollTop=0;}
$('close').onclick=()=>$('modal').close();
function win(){if(ended)return;ended=true;const l=save.level,reward=50+l*5+Math.min(30,moves*2);save.gold+=reward;save.xp+=25+l*2;save.score+=100+l*10+moves*5;save.streak++;save.bestStreak=Math.max(save.streak,save.bestStreak);if(!assisted)save.nug++;save.level++;const unlocked=world.onWin(!assisted);persist();render();$('level').textContent=String(l).padStart(2,'0');tone(880);modal(`<div class="eyebrow">${unlocked?'НОВИЙ ЕЛЕМЕНТ ПЕРІОДИЧНОЇ ТАБЛИЦІ':'ЕКСПЕРИМЕНТ '+l+' ЗАВЕРШЕНО'}</div>${unlocked?`<div class="unlock-orbit" style="--el:${tint(unlocked)}"><small>${save.discovered.length}</small><b>${unlocked}</b></div><h2>Відкрито ${NAMES[unlocked]||unlocked}</h2><p>Елемент ${unlocked} додано до періодичної таблиці та наступних експериментів · +3 ◈</p><button class="primary" id="open-map">Відкрити у таблиці →</button>`:`<div class="reward">✦</div><h2>Чистий синтез!</h2>`}<p>+${reward} монет · +${25+l*2} XP<br>${assisted?'Експеримент із підтримкою':'+1 кристал майстерності'} · Серія ${save.streak}</p><button class="secondary" id="next">Експеримент ${save.level} →</button>`);if(unlocked)$('open-map').onclick=()=>world.atlas(unlocked);$('next').onclick=()=>start();}
function lose(){ended=true;save.streak=0;persist();render();modal('<div class="reward">↻</div><h2>Спробуй інший шлях</h2><p>Ходи закінчилися. Цей експеримент має розв’язок. Почни ще раз або візьми нову комбінацію.</p><button class="primary" id="retry">Повторити цей рівень</button><button class="secondary" id="shuffle">Нова комбінація</button>');$('retry').onclick=()=>start(true);$('shuffle').onclick=()=>start();}
$('undo').onclick=()=>{if(locked||ended||!history.length)return;const h=history.pop();waveIndex=h.waveIndex;puzzle=levelRun.waves[waveIndex];tubes=h.tubes;moves=h.moves;save.gold=h.gold;mechanicState=h.mechanicState;assisted=true;selected=-1;persist();render();say('Хід скасовано · монети за синтез повернено');};
$('hint').onclick=()=>{if(locked||ended)return;assisted=true;for(let a=0;a<tubes.length;a++)for(let b=0;b<tubes.length;b++)if(moveWithMechanics(tubes,a,b,puzzle.mechanics,mechanicState)){selected=a;render();for(const i of [a,b])document.querySelector(`[data-tube="${i}"]`).classList.add('hinted');say(`Можливий хід: колба ${a+1} → колба ${b+1}`);return}say('Немає доступних ходів. Скасуй хід або додай колбу');};
$('reserve').onclick=()=>{if(reserve||locked||ended)return;reserve=true;assisted=true;tubes.push([]);selected=-1;render();say('Резервна колба готова · використано допомогу');};
$('restart').onclick=()=>{if(locked)return;modal('<h2>Почати заново?</h2><p>Поточні ходи буде скинуто. Монети та відкриття збережуться.</p><button class="primary" id="same">Та сама комбінація</button><button class="secondary" id="new">Нова комбінація</button>');$('same').onclick=()=>start(true);$('new').onclick=()=>start();};
$('collection').onclick=()=>world.atlas();
$('settings').onclick=()=>{modal(`<h2>Лабораторія</h2><p>Збери 4 однакові символи в одній колбі. Завершена речовина синтезується, зникає та приносить монети. Переноситься верхня група однакових символів. Перемога без допомоги дає кристал майстерності.</p><button class="secondary" id="sound">Звук: ${sound?'увімкнено':'вимкнено'}</button><p>Оформлення колб · ${save.nug} кристалів</p><div class="skins">${[['default',0,'Класичне скло'],['neon',3,'Неонове скло'],['violet',6,'Фіолетове скло'],['gold',10,'Золоте скло']].map(([s,n,title])=>`<button data-skin="${s}" ${save.nug<n?'disabled':''}>${title} ${n?'· '+n+' ✦':''}</button>`).join('')}</div><p>Рекордна серія: ${save.bestStreak} · Рахунок: ${save.score}<br>Прогрес зберігається на цьому пристрої</p>`);$('sound').onclick=()=>{sound=!sound;$('sound').textContent=`Звук: ${sound?'увімкнено':'вимкнено'}`;try{localStorage.setItem('chemlab_sound',String(sound))}catch{}};document.querySelectorAll('[data-skin]').forEach(b=>{if(b.tagName==='BUTTON')b.onclick=()=>{const s=b.dataset.skin;$('game').dataset.skin=s;try{localStorage.setItem('chemlab_cosmetic',s)}catch{};b.textContent+=' ✓';}});};
try{sound=localStorage.getItem('chemlab_sound')!=='false';const s=localStorage.getItem('chemlab_cosmetic');const thresholds={default:0,neon:3,violet:6,gold:10};if(s in thresholds&&save.nug>=thresholds[s])$('game').dataset.skin=s}catch{}
world=initExpansion({core:()=>save,persist,render,modal,say,tone,attempt:()=>({ended,locked})});
start();if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
