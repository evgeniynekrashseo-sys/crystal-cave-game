const CACHE='chemlab-release-15-cdn-safe';
const ASSETS=['./','index.html','style.css?v=15','app.js?v=15','liquid.js?v=15','expansion.js?v=15','progression.js?v=15','engine.js?v=15','city.js?v=15','settlement-model.js?v=15','settlement.css?v=15','settlement-renderer.js?v=15','settlement-art.png','mission.js?v=15','settlement-sprites.png','elements-data.js?v=15','element-learning.js?v=15','city-research.js?v=15','lab.webp','tube-glass.webp','manifest.webmanifest','icon.svg'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key.startsWith('chemlab-release-')&&key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  event.respondWith(fetch(event.request).catch(()=>caches.match(event.request).then(response=>response||Response.error())));
});
