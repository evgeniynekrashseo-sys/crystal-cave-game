// Deterministic simulation shared by the map renderer and regression tests.
export const SIZE=20;
export const LABELS={wood:'Деревина',stone:'Камінь',food:'Їжа',ore:'Руда',metal:'Метал',goods:'Товари',power:'Енергія',research:'Дослідження'};
export const TECH=[
 {id:'water',name:'Знезараження води',era:'Санітарія',elements:['Cl'],cost:2,after:[],text:'Хлорвмісні засоби знезаражують воду. Водогін зменшує ризик кишкових інфекцій. Історичний орієнтир: муніципальне хлорування у США з 1908 року.'},
 {id:'preserve',name:'Збереження їжі',era:'Ремесла',elements:['Na','Cl'],cost:2,after:[],text:'Сіль NaCl допомагає зберігати харчі. Комора скорочує втрати їжі. Соління відоме з давнини.'},
 {id:'steel',name:'Металургія',era:'Промисловість',elements:['Fe','C'],cost:3,after:[],text:'Залізо й вуглець — основа сталей. Плавильня перетворює руду на метал; завод — метал на товари.'},
 {id:'fertilizer',name:'Азотні добрива',era:'Агрохімія',elements:['N','H'],cost:4,after:['water'],text:'Синтез аміаку став основою промислового виробництва азотних добрив у XX столітті. У грі врожайність полів подвоюється.'},
 {id:'veterinary',name:'Ветеринарна служба',era:'Здоров’я',elements:['O','C','N'],cost:3,after:['water'],text:'Ветеринарія спирається на санітарію, біологію й препарати. Саме відкриття елемента не лікує тварин; дослідження відкриває службу догляду.'},
 {id:'motor',name:'Механізація',era:'Індустріальне місто',elements:['Fe','C'],cost:5,after:['steel'],text:'Машинобудування прискорює перевезення. Завод відкриває вантажівки, які доставляють продукцію дорогами.'},
 {id:'battery',name:'Літій-іонні батареї',era:'Сучасність',elements:['Li','C'],cost:6,after:['motor'],text:'Літій-іонні акумулятори вийшли на ринок у 1991 році. Енергоцентр накопичує та постачає енергію міським виробництвам.'},
 {id:'automation',name:'Автоматизація',era:'Сучасність',elements:['Si'],cost:7,after:['battery'],text:'Кремнієва електроніка керує виробництвами. Автоматизований завод витрачає енергію та виробляє більше товарів.'}
];
export const TYPES={
 house:{name:'Будинок',cost:{wood:12,stone:4},color:'#dfb97e',workers:0,desc:'4 місця для мешканців за рівень'},
 lumber:{name:'Лісництво',cost:{wood:8},color:'#ad845e',workers:1,out:{wood:5},desc:'Відновлюване лісове господарство: +5 деревини за рейс'},
 quarry:{name:'Каменярня',cost:{wood:12},color:'#a6b7bb',workers:1,out:{stone:4},terrain:'rock',desc:'Видобуток каменю: +4 за рейс'},
 farm:{name:'Поле',cost:{wood:10,stone:2},color:'#d7ad48',workers:1,out:{food:6},desc:'Урожай: +6 їжі; добрива подвоюють збір'},
 ranch:{name:'Тваринницька ферма',cost:{wood:22,stone:8},color:'#bb755a',workers:1,input:{food:2},out:{food:7},desc:'Догляд за худобою. Ветеринарія підвищує продуктивність'},
 well:{name:'Водогін',cost:{wood:15,stone:20},color:'#72bdcb',workers:1,tech:'water',out:{},desc:'За наявності працівника покращує санітарію'},
 clinic:{name:'Амбулаторія',cost:{wood:25,stone:20},color:'#e0ded0',workers:1,tech:'water',out:{},desc:'Працююча амбулаторія підвищує здоров’я'},
 granary:{name:'Комора',cost:{wood:20,stone:8},color:'#d5bd85',workers:0,tech:'preserve',desc:'Зменшує псування запасів їжі'},
 mine:{name:'Шахта',cost:{wood:20,stone:15},color:'#797c97',workers:1,terrain:'ore',out:{ore:4},desc:'Розвідане родовище: +4 руди за рейс'},
 smelter:{name:'Плавильня',cost:{wood:25,stone:25},color:'#ab6751',workers:1,tech:'steel',input:{ore:3,wood:2},out:{metal:3},desc:'3 руди + 2 деревини → 3 металу'},
 factory:{name:'Завод',cost:{wood:30,stone:25,metal:12},color:'#869fae',workers:2,tech:'steel',input:{metal:2},out:{goods:4},desc:'2 металу → 4 товари. Автоматизація: +4 товари за 1 енергію'},
 energy:{name:'Енергоцентр',cost:{stone:30,metal:20,goods:12},color:'#62c6bd',workers:1,tech:'battery',out:{power:5},desc:'Міська енергосистема: +5 енергії за цикл'},
 school:{name:'Школа',cost:{wood:25,stone:18},color:'#e9d5ad',workers:1,input:{food:1},out:{research:1},desc:'Учитель і учні створюють дослідження. Освіта підвищує продуктивність усього міста'},
 fishery:{name:'Рибальня',cost:{wood:18,stone:6},color:'#78bdd0',workers:1,out:{food:8},coastal:true,desc:'На північному узбережжі: рибалки доставляють +8 їжі за рейс і рівень'},
 harbor:{name:'Пристань',cost:{wood:35,stone:15},color:'#79a8b3',workers:1,tech:'preserve',coastal:true,out:{},desc:'Морські контракти, монети та розвідка. Соління допомагає зберігати провізію'},
 road:{name:'Дорога',cost:{stone:1},color:'#c3af89',workers:0,desc:'Дорожня мережа для мешканців і вантажівок'}
};
const num=(v,d=0)=>Number.isFinite(v)?Math.max(0,v):d;
export const terrain=(x,y)=> y<0?'sea':x===14||x===15&&y>7?'water':(x*7+y*11)%29===0?'ore':(x*11+y*3)%19===0?'rock':(x*13+y*7)%9<2?'forest':'grass';
export function freshCity(level=1){return {version:1,voyages:[],completedVoyages:0,pendingCoins:0,claimedGoals:[],mapRevision:0,extent:10,population:6,resources:{wood:65,stone:45,food:55,ore:0,metal:0,goods:0,power:0,research:2},tech:[],discoveries:[],buildings:[{id:1,type:'house',x:3,y:4,level:1},{id:2,type:'house',x:5,y:4,level:1},{id:3,type:'lumber',x:3,y:6,level:1},{id:4,type:'farm',x:5,y:6,level:1}],roads:[{x:4,y:4},{x:4,y:5},{x:4,y:6}],agents:[],seconds:0,lastLevel:level,nextId:5,births:0,arrivals:0,events:['Шість мешканців заснували долину. Побудуй каменярню та досліди чисту воду.']};}
export function normalizeCity(raw,level=1){if(!raw||raw.version!==1)return freshCity(level);const c=freshCity(level);c.extent=Math.min(SIZE,Math.max(10,Math.floor(num(raw.extent,10))));c.population=Math.min(60,Math.max(6,Math.floor(num(raw.population,6))));for(const k in c.resources)c.resources[k]=num(raw.resources?.[k],c.resources[k]);c.tech=TECH.filter(t=>raw.tech?.includes(t.id)).map(t=>t.id);const coords=new Set();c.buildings=Array.isArray(raw.buildings)?raw.buildings.filter(b=>TYPES[b.type]&&b.type!=='road'&&Number.isInteger(b.x)&&Number.isInteger(b.y)&&b.x>=0&&b.y>=0&&b.x<c.extent&&b.y<c.extent&&!coords.has(`${b.x},${b.y}`)&&coords.add(`${b.x},${b.y}`)).map((b,i)=>({...b,id:i+1,level:Math.min(5,Math.max(1,Math.floor(num(b.level,1)))),ready:num(b.ready)})):c.buildings;c.discoveries=Array.isArray(raw.discoveries)?[...new Set(raw.discoveries.filter(x=>['salt','water','greenhouse','ammonia','glass'].includes(x)))]:[];c.nextId=c.buildings.length+1;c.completedVoyages=Math.floor(num(raw.completedVoyages));c.pendingCoins=Math.floor(num(raw.pendingCoins));c.claimedGoals=Array.isArray(raw.claimedGoals)?[...new Set(raw.claimedGoals.filter(id=>CITY_GOALS.some(g=>g.id===id)))]:[];c.voyages=Array.isArray(raw.voyages)?raw.voyages.filter(v=>Object.hasOwn(VOYAGES,v.kind)&&Number.isInteger(v.x)&&Number.isInteger(v.y)&&c.buildings.some(b=>b.type==="harbor"&&b.x===v.x&&b.y===v.y)).filter((v,i,list)=>list.findIndex(o=>o.x===v.x&&o.y===v.y)===i).map(v=>({kind:v.kind,x:v.x,y:v.y,elapsed:Math.min(VOYAGES[v.kind].duration,num(v.elapsed)),level:Math.min(5,Math.max(1,Math.floor(num(v.level,1))))})):[];for(const a of Array.isArray(raw.agents)?raw.agents:[]){if(a.state==='return'){for(const k in c.resources)c.resources[k]+=num(a.cargo?.[k]);}else if(a.state==='work'){const b=raw.buildings?.find(b=>b.id===a.job);for(const [k,v]of Object.entries(TYPES[b?.type]?.input||{}))c.resources[k]+=v;}}c.roads=Array.isArray(raw.roads)?raw.roads.filter(b=>Number.isInteger(b.x)&&Number.isInteger(b.y)&&b.x>=0&&b.y>=0&&b.x<c.extent&&b.y<c.extent):c.roads;c.lastLevel=num(raw.lastLevel,level);c.seconds=num(raw.seconds);c.births=num(raw.births);c.arrivals=num(raw.arrivals);c.events=Array.isArray(raw.events)?raw.events.filter(x=>typeof x==='string').slice(-8):c.events;return c;}
export const affordable=(c,cost)=>Object.entries(cost).every(([k,v])=>c.resources[k]>=v);
const debit=(c,cost)=>{for(const k in cost)c.resources[k]-=cost[k]};
export function log(c,msg){c.events.push(msg);c.events=c.events.slice(-8)}
export function onChemistryWin(c,level){if(level<=c.lastLevel)return false;const delta=level-c.lastLevel;c.lastLevel=level;c.resources.research+=delta*(c.discoveries.includes('glass')?3:2);c.resources.wood+=delta*8;c.resources.stone+=delta*5;c.resources.food+=delta*8;const room=stats(c).housing-c.population;if(room>0){const n=Math.min(room,delta);c.population+=n;c.arrivals+=n;log(c,`Приїхало ${n} поселенців після новин про лабораторію.`)}log(c,`Експерименти: +${delta*2} дослідження, +${delta*8} деревини, +${delta*5} каменю.`);return true;}
export function research(c,id,discovered){const t=TECH.find(t=>t.id===id);if(!t||c.tech.includes(id)||!t.elements.every(x=>discovered.includes(x))||!t.after.every(x=>c.tech.includes(x))||c.resources.research<t.cost)return false;c.resources.research-=t.cost;c.tech.push(id);log(c,`Впроваджено: ${t.name}.`);return true;}
export function canPlace(c,type,x,y){const t=TYPES[type];if(!t||!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x>=c.extent||y>=c.extent)return 'Ділянка за межами розвіданої території';if(t.coastal&&y!==0)return "Обери північний берег моря: ряд 1. Кнопка «Узбережжя» покаже його";if(t.tech&&!c.tech.includes(t.tech))return 'Спочатку впровадь технологію у «Відкриттях»';if(x===4&&y===5)return 'Це центральна площа для доставки';if(x===4&&y===2)return 'Це головна лабораторія';if(c.buildings.some(b=>b.x===x&&b.y===y)||c.roads.some(b=>b.x===x&&b.y===y))return 'Ділянка вже зайнята';const land=terrain(x,y);if(land==='water')return 'Будівництво у річці недоступне';if(t.terrain&&land!==t.terrain)return t.terrain==='ore'?'Шахта потребує родовища руди':'Каменярня потребує кам’янистої ділянки';if(!t.terrain&&['ore','rock'].includes(land))return 'Залиш родовище для видобутку';if(!affordable(c,t.cost))return 'Недостатньо ресурсів';return '';}
export function build(c,type,x,y){const error=canPlace(c,type,x,y);if(error)return error;debit(c,TYPES[type].cost);c.mapRevision++;if(type==='road')c.roads.push({x,y});else{c.buildings.push({id:c.nextId++,type,x,y,level:1,ready:c.seconds+6});log(c,`Будується: ${TYPES[type].name}.`)}return '';}
export function upgradeCost(b){return Object.fromEntries(Object.entries(TYPES[b.type].cost).map(([k,v])=>[k,Math.ceil(v*(b.level+1)*.65)]))}
export function upgrade(c,id){const b=c.buildings.find(b=>b.id===id);if(!b||b.level>=5||b.ready>c.seconds||!affordable(c,upgradeCost(b)))return false;debit(c,upgradeCost(b));b.level++;b.ready=c.seconds+8;log(c,`${TYPES[b.type].name}: модернізація до рівня ${b.level}.`);return true;}
export function expand(c){const cost={wood:c.extent*3,stone:c.extent*2,research:1};if(c.extent>=SIZE||!affordable(c,cost))return false;debit(c,cost);c.extent=Math.min(SIZE,c.extent+2);log(c,'Розвідано нові землі та родовища.');return true;}
export function stats(c){const jobs=c.buildings.filter(b=>b.ready<=c.seconds||!b.ready);const staffed=type=>jobs.some(b=>b.type===type&&c.agents.some(a=>a.job===b.id));const housing=jobs.filter(b=>b.type==='house').reduce((n,b)=>n+b.level*4,0);const water=staffed('well');const health=Math.min(98,45+(c.discoveries.includes('water')?5:0)+(water?30:0)+(staffed('clinic')?18:0)+(c.resources.food>5?5:-15));const education=Math.min(100,jobs.filter(b=>b.type==="school"&&c.agents.some(a=>a.job===b.id)).reduce((n,b)=>n+b.level*20,0));return {housing,health,education,students:Math.min(c.population,jobs.filter(b=>b.type==="school"&&c.agents.some(a=>a.job===b.id)).reduce((n,b)=>n+b.level*8,0)),sick:Math.round(c.population*(100-health)/250),happiness:Math.round((health+(c.resources.food>10?90:25)+Math.min(100,housing/c.population*85))/3),workers:c.agents.filter(a=>a.job).length,era:c.tech.includes('automation')?'Сучасне місто':c.tech.includes('motor')?'Механізація':c.tech.includes('steel')?'Промислове місто':'Поселення'};}
// Four-neighbour BFS: workers travel around buildings and water, trucks use roads.
export function route(c,from,to,roadOnly=false){const key=(x,y)=>x+','+y,start=key(from.x,from.y),queue=[from],prev=new Map([[start,null]]);for(let i=0;i<queue.length;i++){const p=queue[i];if(p.x===to.x&&p.y===to.y){const out=[];let k=key(p.x,p.y);while(prev.get(k)){const [x,y]=k.split(',').map(Number);out.unshift({x,y});k=prev.get(k)}return out}for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const x=p.x+dx,y=p.y+dy,k=key(x,y);if(x<0||y<0||x>=c.extent||y>=c.extent||prev.has(k)||terrain(x,y)==='water')continue;if(c.buildings.some(b=>b.x===x&&b.y===y))continue;if(roadOnly&&!c.roads.some(r=>r.x===x&&r.y===y))continue;prev.set(k,key(p.x,p.y));queue.push({x,y})}}return null;}
const accessCache=new WeakMap();
function access(c,b){
 const stamp=c.buildings.length+':'+c.extent+':'+c.mapRevision;let memo=accessCache.get(c);
 if(!memo||memo.stamp!==stamp){memo={stamp,points:new Map()};accessCache.set(c,memo)}
 if(memo.points.has(b.id))return memo.points.get(b.id);
 const points=[[b.x,b.y+1],[b.x+1,b.y],[b.x-1,b.y],[b.x,b.y-1]].map(([x,y])=>({x,y})).filter(p=>p.x>=0&&p.y>=0&&p.x<c.extent&&p.y<c.extent&&terrain(p.x,p.y)!=='water'&&!c.buildings.some(v=>v.x===p.x&&v.y===p.y)&&route(c,{x:4,y:5},p)!==null);
 // A connected road entrance lets the truck use the actual network rather than an arbitrary side.
 const result=points.find(p=>route(c,{x:4,y:5},p,true)!==null)||points[0];memo.points.set(b.id,result);return result;
}
function assign(c){const jobs=c.buildings.filter(b=>(!b.ready||b.ready<=c.seconds)&&TYPES[b.type].workers).flatMap(b=>Array(TYPES[b.type].workers).fill(b));for(let i=0;i<c.population;i++){let a=c.agents[i];if(!a)c.agents.push(a={id:i,x:4,y:5,job:null,path:[],state:'idle',timer:0,cargo:{},truck:false});const b=jobs[i];if(a.job!==(b?.id||null)){// Preserve goods already produced when a job disappears.
for(const k in a.cargo)c.resources[k]+=a.cargo[k];Object.assign(a,{job:b?.id||null,x:4,y:5,path:[],state:'idle',cargo:{},timer:0});}}}
export function step(c,dt){dt=Math.min(1,Math.max(0,dt));const before=c.seconds;c.seconds+=dt;assign(c);stepVoyages(c,dt);for(const a of c.agents){const b=c.buildings.find(b=>b.id===a.job);if(!b){a.state='відпочиває';a.timer-=dt;if(a.path.length){const p=a.path[0],d=Math.hypot(p.x-a.x,p.y-a.y),speed=.65*dt;if(d<=speed){a.x=p.x;a.y=p.y;a.path.shift()}else{a.x+=(p.x-a.x)/d*speed;a.y+=(p.y-a.y)/d*speed}}else if(a.timer<=0){const school=c.buildings.find(b=>b.type==='school'&&(!b.ready||b.ready<=c.seconds));const dest=school&&a.id%3===0?access(c,school)||{x:4,y:5}:{x:2+(a.id+Math.floor(c.seconds/8))%5,y:3+(a.id*2+Math.floor(c.seconds/11))%5};a.path=route(c,{x:Math.round(a.x),y:Math.round(a.y)},dest)||[];a.timer=5+a.id%4;}continue}const type=TYPES[b.type],target=access(c,b);if(a.state==="немає шляху"&&target)a.state="idle";if(!target){a.state='немає шляху';continue}if(a.path.length){const p=a.path[0],d=Math.hypot(p.x-a.x,p.y-a.y),speed=(a.truck?3.5:1.5)*dt;if(d<=speed){a.x=p.x;a.y=p.y;a.path.shift()}else{a.x+=(p.x-a.x)/d*speed;a.y+=(p.y-a.y)/d*speed}continue}if(a.state==='return'){for(const k in a.cargo)c.resources[k]=Math.min(9999,c.resources[k]+a.cargo[k]);a.cargo={};a.state='idle';a.truck=false}if(a.state==='idle'){const roadRoute=c.tech.includes('motor')&&c.buildings.some(v=>v.type==='factory')?route(c,{x:4,y:5},target,true):null;a.truck=!!roadRoute?.length;a.path=roadRoute||route(c,{x:4,y:5},target)||[];a.state='out';continue}if(a.state==='out'){if(!affordable(c,type.input||{})){a.state='очікує сировину';continue}debit(c,type.input||{});a.timer=6;a.state='work';continue}if(a.state==='очікує сировину'){a.state='out';continue}if(a.state==='work'){a.timer-=dt;if(a.timer>0)continue;const multi=b.level*(1+stats(c).education/250)*(b.type==='farm'&&c.tech.includes('fertilizer')?2:b.type==='ranch'&&c.tech.includes('veterinary')?1.5:1);a.cargo=Object.fromEntries(Object.entries(type.out||{}).map(([k,v])=>[k,Math.floor(v*multi*(k==='food'?1+(c.discoveries.includes('salt')?.2:0)+(b.type==='farm'&&c.discoveries.includes('greenhouse')?.2:0)+(b.type==='farm'&&c.discoveries.includes('ammonia')?.3:0):1))]));if(b.type==='factory'&&c.tech.includes('automation')&&c.resources.power>=1){c.resources.power--;a.cargo.goods+=4*b.level}a.path=route(c,target,{x:4,y:5},a.truck)||route(c,target,{x:4,y:5})||[];a.state='return'}}
if(Math.floor(before/20)!==Math.floor(c.seconds/20)){const store=c.buildings.some(b=>b.type==='granary'&&(!b.ready||b.ready<=c.seconds));c.resources.food=Math.max(0,c.resources.food-Math.ceil(c.population/3)-(store?0:1))}
if(Math.floor(before/120)!==Math.floor(c.seconds/120)){const s=stats(c);if(c.population<60&&s.housing>c.population&&s.health>=75&&c.resources.food>=15){c.population++;c.births++;c.resources.food-=5;log(c,'У поселенні народилася дитина. Родина забезпечена водою та їжею.')}}
}

export function deliverDiscovery(c,id){if(!['salt','water','greenhouse','ammonia','glass'].includes(id)||c.discoveries.includes(id))return false;c.discoveries.push(id);log(c,'Лабораторія доставила нове відкриття: '+({salt:'NaCl',water:'H₂O',greenhouse:'CO₂',ammonia:'NH₃',glass:'SiO₂'}[id]));return true;}

export const VOYAGES={
 market:{name:'Торгівля з островами',duration:45,cost:{wood:20,food:8},reward:{stone:12,research:1},coins:15},
 explore:{name:'Розвідка морських покладів',duration:65,cost:{wood:15,food:15},reward:{stone:18,ore:8,research:3},coins:10},
 industry:{name:'Експорт міських товарів',duration:70,cost:{goods:6,food:10},reward:{metal:8,research:2},coins:45,tech:'steel'}
};
export function voyageError(c,b,kind){
 const v=VOYAGES[kind];
 if(!b||b.type!=='harbor'||!v)return 'Обери пристань';
 if(b.ready>c.seconds)return 'Дочекайся завершення будівництва';
 if(!c.agents.some(a=>a.job===b.id))return 'Пристань потребує вільного працівника. Додай житло та мешканців';
 if(c.voyages.some(o=>o.x===b.x&&o.y===b.y))return 'Корабель уже в рейсі';
 if(v.tech&&!c.tech.includes(v.tech))return 'Спочатку впровадь металургію';
 if(!affordable(c,v.cost))return 'Недостатньо провізії або вантажу';
 return '';
}
export function dispatchVoyage(c,id,kind){
 const b=c.buildings.find(b=>b.id===id),error=voyageError(c,b,kind);if(error)return error;
 debit(c,VOYAGES[kind].cost);c.voyages.push({x:b.x,y:b.y,kind,level:b.level,elapsed:0});
 log(c,`Корабель вирушив: ${VOYAGES[kind].name}.`);return '';
}
function stepVoyages(c,dt){
 for(const v of c.voyages){v.elapsed+=dt;const contract=VOYAGES[v.kind];if(v.elapsed<contract.duration)continue;
  for(const [k,n]of Object.entries(contract.reward))c.resources[k]=Math.min(9999,c.resources[k]+n*v.level);
  c.pendingCoins+=contract.coins*v.level;c.completedVoyages++;
  log(c,`${contract.name}: корабель повернувся. +${contract.coins*v.level} монет.`);
 }
 c.voyages=c.voyages.filter(v=>v.elapsed<VOYAGES[v.kind].duration);
}
export function claimCityCoins(c){const n=c.pendingCoins;c.pendingCoins=0;return n;}

export const CITY_GOALS=[
 {id:'stone',name:'Камінь для майбутнього',hint:'Побудуй каменярню на родовищі',test:c=>c.buildings.some(b=>b.type==='quarry'&&(!b.ready||b.ready<=c.seconds)),reward:{wood:15,research:1},coins:10},
 {id:'school',name:'Перший урок',hint:'Побудуй школу та забезпеч учителя роботою',test:c=>stats(c).education>=20,reward:{food:20,research:2},coins:15},
 {id:'ranch',name:'Живе господарство',hint:'Запусти тваринницьку ферму',test:c=>c.buildings.some(b=>b.type==='ranch'&&b.ready<=c.seconds)&&c.agents.some(a=>c.buildings.some(b=>b.id===a.job&&b.type==='ranch')),reward:{food:20,stone:8},coins:15},
 {id:'fishery',name:'Дар моря',hint:'Побудуй рибальню на північному березі',test:c=>c.buildings.some(b=>b.type==='fishery'&&b.ready<=c.seconds)&&c.agents.some(a=>c.buildings.some(b=>b.id===a.job&&b.type==='fishery')),reward:{wood:15,research:1},coins:15},
 {id:'voyage',name:'За горизонт',hint:'Відкрий збереження їжі, побудуй пристань і заверши рейс',test:c=>c.completedVoyages>=1,reward:{stone:20,research:3},coins:25},
 {id:'upgrade',name:'Майстерність будівничих',hint:'Покращи будь-яку будівлю до рівня 3',test:c=>c.buildings.some(b=>b.level>=3&&b.ready<=c.seconds),reward:{wood:25,stone:15},coins:20}
];
export function cityGoal(c){return CITY_GOALS.find(g=>!c.claimedGoals.includes(g.id));}
export function claimCityGoal(c){const g=cityGoal(c);if(!g||!g.test(c))return false;for(const [k,n]of Object.entries(g.reward))c.resources[k]+=n;c.pendingCoins+=g.coins;c.claimedGoals.push(g.id);log(c,`Місію завершено: ${g.name}. +${g.coins} монет.`);return true;}

export function demolitionRefund(b){return Object.fromEntries(Object.entries(TYPES[b.type].cost).map(([k,n])=>[k,Math.floor(n*b.level*.3)]));}
export function demolish(c,x,y){
 const b=c.buildings.find(b=>b.x===x&&b.y===y);
 if(b){
  if(c.voyages.some(v=>v.x===x&&v.y===y))return 'Спочатку дочекайся повернення корабля';
  for(const a of c.agents.filter(a=>a.job===b.id)){
   for(const [k,n]of Object.entries(a.cargo))c.resources[k]+=n;
   if(a.state==='work')for(const [k,n]of Object.entries(TYPES[b.type].input||{}))c.resources[k]+=n;
   Object.assign(a,{job:null,path:[],cargo:{},state:'idle',timer:0});
  }
  for(const [k,n]of Object.entries(demolitionRefund(b)))c.resources[k]+=n;
  c.buildings=c.buildings.filter(o=>o!==b);log(c,`Знесено: ${TYPES[b.type].name}. Частину матеріалів повернуто.`);
 }else if(c.roads.some(r=>r.x===x&&r.y===y)){c.roads=c.roads.filter(r=>r.x!==x||r.y!==y);log(c,'Дорожню ділянку прибрано.');}
 else return 'На цій ділянці немає будівлі чи дороги';
 c.mapRevision++;accessCache.delete(c);
 // Re-route remaining walkers/trucks without discarding their cargo or work timer.
 for(const a of c.agents){if(!a.path.length)continue;const destination=a.path.at(-1),from={x:Math.round(a.x),y:Math.round(a.y)};
  const truckRoute=a.truck?route(c,from,destination,true):null;a.truck=!!truckRoute?.length;
  a.path=truckRoute||route(c,from,destination)||[];
 }
 return '';
}
export function roadConnections(c,r){return [[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy])=>c.roads.some(o=>o.x===r.x+dx&&o.y===r.y+dy));}
