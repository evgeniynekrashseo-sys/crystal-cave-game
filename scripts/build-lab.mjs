import {readFile,writeFile,mkdir,rm,copyFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
const root=resolve(import.meta.dirname,'..'),source=resolve(root,'dist'),out=resolve(root,'dist/lab');
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
const files=new Map();
function replace(text,from,to){if(!text.includes(from))throw Error('Standalone build anchor missing: '+from.slice(0,90));return text.replace(from,to)}
let app=await readFile(resolve(source,'app.js'),'utf8');
app=app.replace(/^import \{initCity\}.*\n/m,'');
app=replace(app,'const prefs=readPreferences();','const prefs={...readPreferences(),cityEnabled:false};');
app=replace(app,"document.querySelectorAll('#city-button,#lab-button').forEach(el=>el.hidden=!prefs.cityEnabled);",'');
app=app.replace(/^settlement=initCity\(.*\n/m,'').replace(/^\$\('city-button'\).*\n/m,'').replace(/^\$\('lab-button'\).*\n/m,'');
const settingsStart=app.indexOf('<button class="secondary" id="city-toggle"'),settingsEnd=app.indexOf('<button class="secondary" id="backup-export"',settingsStart);
if(settingsStart<0||settingsEnd<0)throw Error('Settings anchors missing');
app=app.slice(0,settingsStart)+app.slice(settingsEnd);
app=app.replace(/\$\('city-toggle'\)\.onclick=\(\)=>\{.*?\};\n/,'').replace(/ \$\('calm-toggle'\)\.onclick=.*?\};\n/,'');
for(const [a,b]of [
 ['Синтезуй речовини, щоб покращити поселення','Збирай формули, отримуй монети та відкривай нові елементи'],
 ['Замовлення міста:','Дослідницький цикл:'],['щоб доставити відкриття місту','щоб завершити дослідницький цикл'],
 ['Відкриття для міста:','Зібрані формули:'],['Покращення вже діють у поселенні.','Нагороди за синтез уже додано до балансу.'],
 ['Твоя ціль — місто відкриттів','Твоя ціль — відкрити 118 елементів'],['проводь реакції та розвивай Місто','проводь реакції та вдосконалюй лабораторію']
])app=replace(app,a,b);
files.set('app.js',app);
let expansion=await readFile(resolve(source,'expansion.js'),'utf8');
const start=expansion.indexOf(' function lab(){'),end=expansion.indexOf(' function styles()',start);
if(start<0||end<0)throw Error('Lab modules anchor missing');
expansion=expansion.slice(0,start)+` function lab(){show('<h2>Обладнання лабораторії</h2><p>Покращуй дослідницькі модулі за зароблені монети.</p>'+UPGRADES.map(u=>\`<section class="upgrade-card"><span class="upgrade-icon">\${u.icon}</span><div><strong>\${u.name}</strong><small>Ступінь \${meta.upgrades[u.id]} / 5<br>\${u.description}</small></div><button data-upgrade="\${u.id}" \${meta.upgrades[u.id]>=5||api.core().gold<u.base*(meta.upgrades[u.id]+1)?'disabled':''}>\${meta.upgrades[u.id]>=5?'MAX':u.base*(meta.upgrades[u.id]+1)+' ✦'}</button></section>\`).join('')+'<button class="primary" id="relics">Артефакти →</button><button class="secondary" id="styles">Оформлення</button>');document.querySelectorAll('[data-upgrade]').forEach(b=>b.onclick=()=>{if(buyUpgrade(api.core(),meta,b.dataset.upgrade)){save();sync();api.render();lab();}});$('relics').onclick=relics;$('styles').onclick=styles;}\n`+expansion.slice(end);
files.set('expansion.js',expansion);
let mission=await readFile(resolve(source,'mission.js'),'utf8');
mission=mission.replace(/benefit:'[^']*'/g,"benefit:'Зібрана формула: +45 монет за синтез'").replace('Вода для поселення','Будова молекули води');files.set('mission.js',mission);
let html=await readFile(resolve(source,'index.html'),'utf8');
html=html.replace(/^.*rel="preload".*\n/gm,'').replace(/^.*href="settlement.css[^\n]*\n/gm,'').replace(/<button id="city-button">.*?<\/button>/,'').replace('⌂</span>Місто','⚙</span>Модулі').replace('crystal-cave-game/"','crystal-cave-game/lab/"');
files.set('index.html',html);
files.set('manifest.webmanifest',await readFile(resolve(source,'manifest.webmanifest'),'utf8'));
const queue=['index.html','manifest.webmanifest','privacy.html','icon.svg','icons/app-192.png','icons/app-512.png'];const visited=new Set();
while(queue.length){let p=queue.shift().split(/[?#]/)[0].replace(/^\.\//,'');if(!p||visited.has(p)||/^(https?:|data:|#)/.test(p))continue;if(p.includes('..')||/^(city|settlement|world-design)/.test(p))throw Error('City dependency in standalone build: '+p);visited.add(p);
 await mkdir(dirname(resolve(out,p)),{recursive:true});
 if(/\.(js|css|html|webmanifest)$/.test(p)){
  let text=files.get(p)??await readFile(resolve(source,p),'utf8');
  if(p.endsWith('.js'))text=text.replaceAll('chemlab_','chemlab_lab_');
  await writeFile(resolve(out,p),text);
  const patterns=p.endsWith('.js')?[/from\s*['"]([^'"]+)['"]/g,/['"]([^'"]+\.(?:webp|png|svg))['"]/g]:p.endsWith('.html')?[/\b(?:src|href)="([^"]+)"/g]:p.endsWith('.css')?[/url\(['"]?([^)'"\s]+)['"]?\)/g]:[];
  for(const re of patterns)for(const m of text.matchAll(re))queue.push(m[1]);
 }else await copyFile(resolve(source,p),resolve(out,p));
}
const assets=['./',...[...visited].sort()];
await writeFile(resolve(out,'sw.js'),`const CACHE='chemlab-lab-1';const ASSETS=${JSON.stringify(assets)};self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('chemlab-lab-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));self.addEventListener('fetch',e=>{if(e.request.method==='GET'&&new URL(e.request.url).origin===location.origin)e.respondWith(fetch(e.request).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||Response.error())))});`);
await writeFile(resolve(out,'release.json'),JSON.stringify({edition:'laboratory-only',version:'1.2.1',city:false,assets:assets.length,storagePrefix:'chemlab_lab_',signed:false},null,2));
console.log('Built laboratory-only edition:',assets.length,'files in dist/lab');
