const CACHE='chemlab-release-13-living-city';
const ASSETS=['./','index.html','style.css','app.js','liquid.js','expansion.js','progression.js','engine.js','city.js','settlement-model.js','settlement.css','settlement-renderer.js','settlement-art.png','mission.js','lab.webp','tube-glass.webp','manifest.webmanifest','icon.svg'];
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
