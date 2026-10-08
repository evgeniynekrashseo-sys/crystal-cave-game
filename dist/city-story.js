// Persistent, deterministic story progression. No wall-clock rewards or random losses.
export const PATHS={
 science:{name:'Місто знань',icon:'✧',text:'Школи й університети виробляють на 25% більше. Досліджуй таємницю обсерваторії.'},
 garden:{name:'Жива долина',icon:'❧',text:'Поля й ферми виробляють на 25% більше. Віднови ботанічний сад.'},
 trade:{name:'Вільна гавань',icon:'⚓',text:'Морські рейси приносять на 25% більше монет. Збери карту мандрівників.'}
};
export const CHARACTERS={
 mira:{name:'Міра',role:'Дослідниця',art:0,line:'У кожній формулі — відповідь на чиєсь запитання.'},
 taras:{name:'Тарас',role:'Інженер',art:1,line:'Спочатку вода й дороги. Потім побудуємо неможливе.'},
 lada:{name:'Лада',role:'Ботанік',art:2,line:'Місто живе, коли в ньому росте щось більше за будинки.'},
 orion:{name:'Оріон',role:'Капітан',art:3,line:'На старій карті є берег, якого ніхто не бачив.'}
};
const ready=(c,type)=>c.buildings.some(b=>b.type===type&&(!b.ready||b.ready<=c.seconds));
export const STORIES=[
 {id:'welcome',chapter:1,who:'mira',name:'Лист із долини',text:'Лабораторія прокинулась. Заверши третій експеримент, щоб розібрати перший запис.',hint:'Досягни лабораторного рівня 4.',test:c=>c.lastLevel>=4,reward:{wood:18,research:2},coins:20},
 {id:'foundation',chapter:1,who:'taras',name:'Не просто каміння',text:'Під долиною ховається давній фундамент. Нам потрібні інструменти каменярів.',hint:'Заверши будівництво каменярні.',test:c=>ready(c,'quarry'),reward:{stone:20,food:12},coins:25},
 {id:'well',chapter:1,who:'lada',name:'Джерело довіри',text:'Старе джерело приховує знак першого поселенця.',hint:'Відкрий очищення води та побудуй водогін.',test:c=>c.tech.includes('water')&&ready(c,'well'),reward:{research:3,food:20},coins:35},
 {id:'school',chapter:1,who:'mira',name:'Дім для запитань',text:'Діти знайшли фрагмент небесної карти. Побудуй місце, де її розшифрують.',hint:'Заверши будівництво школи.',test:c=>ready(c,'school'),reward:{wood:25,research:3},coins:40},
 {id:'path',chapter:2,who:'taras',name:'Три дороги',text:'Рада довірила тобі майбутнє долини. Знання, природа чи торгівля?',hint:'Обери напрям розвитку вище.',test:c=>!!c.story?.path,reward:{stone:25,wood:25},coins:35},
 {id:'formula',chapter:2,who:'mira',name:'Мова матерії',text:'Розшифруй три формули. Їхні знаки збігаються з написами на руїнах.',hint:'Достав три різні лабораторні відкриття.',test:c=>c.discoveries.length>=3,reward:{research:5,goods:3},coins:50},
 {id:'coast',chapter:2,who:'orion',name:'Лист у пляшці',text:'За скелями є забута експедиція. Підготуй команду на узбережжі.',hint:'Побудуй рибальню або пристань.',test:c=>ready(c,'fishery')||ready(c,'harbor'),reward:{food:35,wood:20},coins:40},
 {id:'expedition',chapter:2,who:'orion',name:'Повернення команди',text:'Експедиція привезе першу підказку до колекції артефактів.',hint:'Заверши одну експедицію.',test:c=>c.completedExpeditions>=1,reward:{research:5,metal:5},coins:55},
 {id:'specialist',chapter:3,who:'lada',name:'Характер міста',text:'Тепер доведи, що обраний шлях приносить користь мешканцям.',hint:'Знання: університет. Долина: ферма рівня 3. Гавань: 3 морські рейси.',test:c=>c.story?.path==='science'?ready(c,'university'):c.story?.path==='garden'?c.buildings.some(b=>b.type==='ranch'&&b.level>=3&&b.ready<=c.seconds):c.story?.path==='trade'&&c.completedVoyages>=3,reward:{research:8,goods:8},coins:80},
 {id:'relics',chapter:3,who:'mira',name:'Три частини відповіді',text:'Артефакти утворюють схему. Шукай світні знаки на мапі та перевіряй умови в колекції.',hint:'Знайди три артефакти.',test:c=>(c.story?.artifacts.length||0)>=3,reward:{research:8,stone:35},coins:90},
 {id:'horizon',chapter:3,who:'orion',name:'Новий горизонт',text:'Долина стала затісною. Розвідники готові відкрити далекі райони.',hint:'Розшир територію до 14 × 14.',test:c=>c.extent>=14,reward:{wood:45,food:45},coins:100},
 {id:'beacon',chapter:3,who:'taras',name:'Світло для всіх',text:'Енергоцентр і п’ять формул оживлять старий маяк. Це початок нової епохи.',hint:'Побудуй енергоцентр і достав п’ять різних формул.',test:c=>ready(c,'energy')&&c.discoveries.length>=5,reward:{research:15,goods:20},coins:150}
];
export const ARTIFACTS=[
 {id:'compass',name:'Компас засновника',mark:'◇',x:2,y:4,hint:'Заверши перший сюжетний квест.',test:c=>c.story?.claimed.includes('welcome'),reward:{research:2}},
 {id:'seed',name:'Бурштинове зерно',mark:'❧',x:7,y:7,hint:'Побудуй ферму та збери 60 їжі.',test:c=>ready(c,'ranch')&&c.resources.food>=60,reward:{food:30}},
 {id:'prism',name:'Призма дослідниці',mark:'△',x:6,y:2,hint:'Відкрий три різні формули.',test:c=>c.discoveries.length>=3,reward:{research:4}},
 {id:'map',name:'Карта без берегів',mark:'⌁',x:8,y:0,hint:'Заверши дві експедиції.',test:c=>c.completedExpeditions>=2,reward:{goods:5}},
 {id:'heart',name:'Серце обсерваторії',mark:'✧',x:11,y:6,hint:'Розшир місто та побудуй університет.',test:c=>ready(c,'university'),reward:{research:8}},
 {id:'beacon',name:'Лінза світанку',mark:'☼',x:12,y:10,hint:'Побудуй енергоцентр і знайди решту п’ять артефактів.',test:c=>ready(c,'energy')&&c.story?.artifacts.length>=5,reward:{research:12,goods:15}}
];
export function normalizeStory(raw){return {path:Object.hasOwn(PATHS,raw?.path)?raw.path:null,claimed:STORIES.filter(q=>raw?.claimed?.includes?.(q.id)).map(q=>q.id),artifacts:ARTIFACTS.filter(a=>raw?.artifacts?.includes?.(a.id)).map(a=>a.id)};}
export function ensureStory(c){if(!c.story)c.story=normalizeStory();return c.story;}
export function currentStory(c){const s=ensureStory(c);return STORIES.find(q=>!s.claimed.includes(q.id));}
function award(c,reward,coins=0){for(const [k,v]of Object.entries(reward))c.resources[k]=Math.min(9999,(c.resources[k]||0)+v);c.pendingCoins=(c.pendingCoins||0)+coins;}
export function choosePath(c,id){const s=ensureStory(c);if(s.path||!Object.hasOwn(PATHS,id))return false;s.path=id;return true;}
export function claimStory(c){const q=currentStory(c);if(!q||!q.test(c))return false;c.story.claimed.push(q.id);award(c,q.reward,q.coins);return q;}
export function artifactError(c,id){ensureStory(c);const a=ARTIFACTS.find(a=>a.id===id);if(!a)return 'Невідомий артефакт';if(c.story.artifacts.includes(id))return 'Уже в колекції';if(a.x>=c.extent||a.y>=c.extent)return 'Спочатку розвідай цю територію';if(!a.test(c))return a.hint;return '';}
export function collectArtifact(c,id){if(artifactError(c,id))return false;const a=ARTIFACTS.find(a=>a.id===id);c.story.artifacts.push(id);award(c,a.reward,25);return a;}
export function storyProduction(c,b){return c.story?.path==='science'&&['school','university','observatory'].includes(b.type)||c.story?.path==='garden'&&['farm','ranch','greenhouse'].includes(b.type)?1.25:1;}
export function storyPanel(c){const s=ensureStory(c),q=currentStory(c),who=q&&CHARACTERS[q.who];return `<div class="chronicle-heading"><small>ХРОНІКИ ДОЛИНИ · ${s.claimed.length}/${STORIES.length}</small><h2>${q?'Розділ '+q.chapter:'Маяк пробуджено'}</h2><p>Твої дослідження змінюють долю цього місця.</p></div>${q?`<article class="story-card"><div class="story-person"><i class="story-avatar" style="--portrait-x:${who.art%4*100/3}%;--portrait-y:${Math.floor(who.art/4)*100/3}%"></i><div><b>${who.name}</b><small>${who.role}</small></div></div><h3>${q.name}</h3><p>${q.text}</p><p class="story-hint">${q.hint}</p><small>+${q.coins} монет · ${Object.entries(q.reward).map(([k,v])=>`${v} ${{wood:'деревини',stone:'каменю',food:'їжі',research:'досліджень',metal:'металу',goods:'товарів'}[k]}`).join(' · ')}</small><button id="story-claim" ${q.test(c)?'':'disabled'}>${q.test(c)?'Отримати нагороду':'Завдання триває'}</button></article>`:'<article><h3>Долина має майбутнє</h3><p>Історію маяка завершено. Продовжуй досліджувати формули та збирати колекцію.</p></article>'}<article><h3>Шлях розвитку</h3><p>${s.path?'Твій вибір: '+PATHS[s.path].name:'Обери постійний напрям цієї долини. Бонус діє відразу.'}</p><div class="story-paths">${Object.entries(PATHS).map(([id,p])=>`<button data-path="${id}" ${s.path?'disabled':''} class="${s.path===id?'chosen':''}"><b>${p.icon} ${p.name}</b><span>${p.text}</span></button>`).join('')}</div></article><article><h3>Кабінет артефактів <small>${s.artifacts.length}/6</small></h3><p>Знайди знак на мапі або відкрий артефакт тут, коли виконаєш його умови.</p><div class="artifact-grid">${ARTIFACTS.map(a=>`<button data-artifact="${a.id}" class="artifact ${s.artifacts.includes(a.id)?'collected':''}" ${artifactError(c,a.id)?'disabled':''}><i class="relic-art relic-${a.id}"></i><b>${a.name}</b><span>${s.artifacts.includes(a.id)?'Знайдено · бонус отримано':artifactError(c,a.id)||'Відкрити · +25 монет'}</span></button>`).join('')}</div></article><details class="story-history"><summary>Щоденник завершених завдань</summary>${STORIES.filter(q=>s.claimed.includes(q.id)).map(q=>`<p>✓ ${q.name}</p>`).join('')||'<p>Перша сторінка ще чекає на тебе.</p>'}</details>`;}
