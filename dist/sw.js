const CACHE='chemlab-release-18-meadow-bank-details';
const ASSETS=['./','index.html','style.css?v=18','app.js?v=18','liquid.js?v=18','expansion.js?v=18','progression.js?v=18','engine.js?v=18','city.js?v=18','city-hud.js?v=18','settlement-model.js?v=18','settlement.css?v=18','settlement-renderer.js?v=18','settlement-camera.js?v=18','settlement-ground.js?v=18','settlement-meadow-v18.png','mission.js?v=18','settlement-sprites-alpha.png','settlement-details-alpha.png','resource-wood-v16.png','resource-food-v16.png','resource-coin-v16.png','elements-data.js?v=18','element-learning.js?v=18','city-research.js?v=18','lab.webp','tube-glass.webp','manifest.webmanifest','icon.svg','icons/people.svg','icons/water.svg','icons/chemistry.svg','icons/build.svg','icons/discoveries.svg','icons/city.svg','icons/zoom-in.svg','icons/zoom-out.svg','icons/center.svg'];
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
